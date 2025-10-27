import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  proto,
  downloadMediaMessage,
  MessageUpsertType,
  WAMessage
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import QRCode from "qrcode";
import { storage } from "./storage";
import fs from "fs";
import path from "path";

interface WhatsAppInstance {
  sock: WASocket | null;
  qrCode: string | null;
  status: "disconnected" | "connecting" | "connected" | "qr_ready";
}

const instances: Map<string, WhatsAppInstance> = new Map();
const SESSIONS_DIR = "./whatsapp-sessions";

// Ensure sessions directory exists
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

export async function initWhatsApp(workspaceId: string): Promise<string | null> {
  try {
    const sessionDir = path.join(SESSIONS_DIR, workspaceId);
    
    // Create auth state
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    
    let instance: WhatsAppInstance = instances.get(workspaceId) || {
      sock: null,
      qrCode: null,
      status: "connecting"
    };
    
    // Create socket
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
    });

    instance.sock = sock;
    instance.status = "connecting";
    instances.set(workspaceId, instance);

    // Handle QR code
    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        const qrCode = await QRCode.toDataURL(qr);
        instance.qrCode = qrCode;
        instance.status = "qr_ready";
        
        // Save QR to database
        await storage.updateWhatsappSession(workspaceId, {
          qrCode,
          status: "qr_ready"
        });
      }

      if (connection === "close") {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        
        if (shouldReconnect) {
          initWhatsApp(workspaceId);
        } else {
          instance.status = "disconnected";
          await storage.updateWhatsappSession(workspaceId, {
            status: "disconnected",
            qrCode: null
          });
          
          // Clean up session files
          if (fs.existsSync(sessionDir)) {
            fs.rmSync(sessionDir, { recursive: true, force: true });
          }
        }
      }

      if (connection === "open") {
        instance.status = "connected";
        instance.qrCode = null;
        
        const phoneNumber = sock.user?.id.split(":")[0];
        
        await storage.updateWhatsappSession(workspaceId, {
          status: "connected",
          qrCode: null,
          lastConnectedAt: new Date()
        });
        
        await storage.updateWorkspace(workspaceId, {
          whatsappConnected: true,
          whatsappNumber: phoneNumber
        });
      }
    });

    // Save credentials when updated
    sock.ev.on("creds.update", saveCreds);

    // Handle incoming messages
    sock.ev.on("messages.upsert", async ({ messages, type }: { messages: WAMessage[], type: MessageUpsertType }) => {
      if (type !== "notify") return;

      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;

        const phone = msg.key.remoteJid?.replace("@s.whatsapp.net", "") || "";
        const messageText = msg.message.conversation || 
                           msg.message.extendedTextMessage?.text || "";

        // Get or create contact
        let contact = await storage.getContactByPhone(workspaceId, phone);
        
        if (!contact) {
          const name = msg.pushName || phone;
          contact = await storage.createContact({
            workspaceId,
            name,
            phone,
            tag: null,
            metadata: null,
            lastMessageAt: new Date()
          });
        } else {
          await storage.updateContact(contact.id, {
            lastMessageAt: new Date()
          });
        }

        // Save message
        await storage.createMessage({
          workspaceId,
          contactId: contact.id,
          broadcastId: null,
          direction: "inbound",
          content: messageText,
          mediaUrl: null,
          status: "delivered",
          errorMessage: null,
          whatsappMessageId: msg.key.id || null
        });
      }
    });

    return instance.qrCode;
  } catch (error) {
    console.error("Error initializing WhatsApp:", error);
    return null;
  }
}

export function getWhatsAppInstance(workspaceId: string): WhatsAppInstance | undefined {
  return instances.get(workspaceId);
}

export async function sendMessage(
  workspaceId: string, 
  phone: string, 
  message: string, 
  mediaUrl?: string
): Promise<boolean> {
  try {
    const instance = instances.get(workspaceId);
    
    if (!instance?.sock || instance.status !== "connected") {
      throw new Error("WhatsApp not connected");
    }

    const jid = `${phone}@s.whatsapp.net`;

    if (mediaUrl) {
      // TODO: Download media from URL and send
      // For now, just send text
      await instance.sock.sendMessage(jid, { text: message });
    } else {
      await instance.sock.sendMessage(jid, { text: message });
    }

    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
}

export async function disconnectWhatsApp(workspaceId: string): Promise<void> {
  const instance = instances.get(workspaceId);
  
  if (instance?.sock) {
    await instance.sock.logout();
    instance.sock.end(undefined);
  }

  instances.delete(workspaceId);
  
  const sessionDir = path.join(SESSIONS_DIR, workspaceId);
  if (fs.existsSync(sessionDir)) {
    fs.rmSync(sessionDir, { recursive: true, force: true });
  }

  await storage.updateWhatsappSession(workspaceId, {
    status: "disconnected",
    qrCode: null
  });
  
  await storage.updateWorkspace(workspaceId, {
    whatsappConnected: false,
    whatsappNumber: null
  });
}
