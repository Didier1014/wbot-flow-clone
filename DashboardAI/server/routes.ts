import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  authMiddleware, 
  adminMiddleware, 
  workspaceMiddleware,
  activeWorkspaceMiddleware
} from "./auth";
import { initWhatsApp, getWhatsAppInstance, disconnectWhatsApp } from "./whatsapp";
import { enqueueBroadcast } from "./queue";
import { insertUserSchema, insertWorkspaceSchema, insertFlowSchema, insertContactSchema, insertBroadcastSchema, insertPaymentSchema } from "@shared/schema";

// Setup multer for file uploads
const UPLOAD_DIR = "./uploads";
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'audio/mpeg', 'audio/ogg', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, MP3, OGG, and MP4 files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static(UPLOAD_DIR));

  // ============================================
  // AUTH ROUTES
  // ============================================
  
  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password and create user
      const passwordHash = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        name: validatedData.name,
        email: validatedData.email,
        passwordHash,
      });

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      });

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        },
        token,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Registration failed" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await comparePassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      });

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        },
        token,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Login failed" });
    }
  });

  // Get current user
  app.get("/api/auth/me", authMiddleware, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // WORKSPACE ROUTES
  // ============================================

  // Get user's workspaces
  app.get("/api/workspaces", authMiddleware, async (req, res) => {
    try {
      const workspaces = await storage.getWorkspacesByUserId(req.user!.userId);
      res.json(workspaces);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create workspace
  app.post("/api/workspaces", authMiddleware, async (req, res) => {
    try {
      const validatedData = insertWorkspaceSchema.parse({
        ...req.body,
        userId: req.user!.userId,
      });

      const workspace = await storage.createWorkspace(validatedData);
      
      // Create WhatsApp session entry
      await storage.createWhatsappSession({
        workspaceId: workspace.id,
        sessionData: null,
        qrCode: null,
        status: "disconnected",
        lastConnectedAt: null,
      });

      res.json(workspace);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get workspace
  app.get("/api/workspaces/:workspaceId", authMiddleware, workspaceMiddleware, async (req, res) => {
    try {
      const workspace = await storage.getWorkspace(req.params.workspaceId);
      res.json(workspace);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update workspace
  app.patch("/api/workspaces/:workspaceId", authMiddleware, workspaceMiddleware, async (req, res) => {
    try {
      const workspace = await storage.updateWorkspace(req.params.workspaceId, req.body);
      res.json(workspace);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // WHATSAPP ROUTES
  // ============================================

  // Connect WhatsApp
  app.post("/api/whatsapp/:workspaceId/connect", authMiddleware, workspaceMiddleware, async (req, res) => {
    try {
      const qrCode = await initWhatsApp(req.params.workspaceId);
      res.json({ qrCode, status: "qr_ready" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get WhatsApp status
  app.get("/api/whatsapp/:workspaceId/status", authMiddleware, workspaceMiddleware, async (req, res) => {
    try {
      const instance = getWhatsAppInstance(req.params.workspaceId);
      const session = await storage.getWhatsappSession(req.params.workspaceId);
      
      res.json({
        status: instance?.status || session?.status || "disconnected",
        qrCode: instance?.qrCode || session?.qrCode || null,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Disconnect WhatsApp
  app.post("/api/whatsapp/:workspaceId/disconnect", authMiddleware, workspaceMiddleware, async (req, res) => {
    try {
      await disconnectWhatsApp(req.params.workspaceId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // FLOW ROUTES
  // ============================================

  // Get flows
  app.get("/api/workspaces/:workspaceId/flows", authMiddleware, workspaceMiddleware, async (req, res) => {
    try {
      const flows = await storage.getFlowsByWorkspaceId(req.params.workspaceId);
      res.json(flows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create flow
  app.post("/api/workspaces/:workspaceId/flows", authMiddleware, workspaceMiddleware, async (req, res) => {
    try {
      const validatedData = insertFlowSchema.parse({
        ...req.body,
        workspaceId: req.params.workspaceId,
      });

      const flow = await storage.createFlow(validatedData);
      res.json(flow);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get flow
  app.get("/api/flows/:flowId", authMiddleware, async (req, res) => {
    try {
      const flow = await storage.getFlow(req.params.flowId);
      if (!flow) {
        return res.status(404).json({ error: "Flow not found" });
      }
      res.json(flow);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update flow
  app.patch("/api/flows/:flowId", authMiddleware, async (req, res) => {
    try {
      const flow = await storage.updateFlow(req.params.flowId, req.body);
      res.json(flow);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete flow
  app.delete("/api/flows/:flowId", authMiddleware, async (req, res) => {
    try {
      await storage.deleteFlow(req.params.flowId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // CONTACT ROUTES
  // ============================================

  // Get contacts
  app.get("/api/workspaces/:workspaceId/contacts", authMiddleware, workspaceMiddleware, async (req, res) => {
    try {
      const contacts = await storage.getContactsByWorkspaceId(req.params.workspaceId);
      res.json(contacts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create contact
  app.post("/api/workspaces/:workspaceId/contacts", authMiddleware, workspaceMiddleware, async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse({
        ...req.body,
        workspaceId: req.params.workspaceId,
      });

      const contact = await storage.createContact(validatedData);
      res.json(contact);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update contact
  app.patch("/api/contacts/:contactId", authMiddleware, async (req, res) => {
    try {
      const contact = await storage.updateContact(req.params.contactId, req.body);
      res.json(contact);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete contact
  app.delete("/api/contacts/:contactId", authMiddleware, async (req, res) => {
    try {
      await storage.deleteContact(req.params.contactId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // BROADCAST ROUTES
  // ============================================

  // Get broadcasts
  app.get("/api/workspaces/:workspaceId/broadcasts", authMiddleware, workspaceMiddleware, async (req, res) => {
    try {
      const broadcasts = await storage.getBroadcastsByWorkspaceId(req.params.workspaceId);
      res.json(broadcasts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create broadcast
  app.post(
    "/api/workspaces/:workspaceId/broadcasts",
    authMiddleware,
    workspaceMiddleware,
    activeWorkspaceMiddleware,
    upload.single('media'),
    async (req, res) => {
      try {
        const { message, tagFilter, name } = req.body;
        const mediaFile = req.file;

        // Get contacts based on filter
        let contacts = await storage.getContactsByWorkspaceId(req.params.workspaceId);
        if (tagFilter && tagFilter !== 'all') {
          contacts = contacts.filter(c => c.tag === tagFilter);
        }

        if (contacts.length === 0) {
          return res.status(400).json({ error: "No contacts found for the selected filter" });
        }

        // Create broadcast
        const broadcast = await storage.createBroadcast({
          workspaceId: req.params.workspaceId,
          name: name || `Disparo ${new Date().toLocaleDateString()}`,
          message,
          mediaUrl: mediaFile ? `/uploads/${mediaFile.filename}` : null,
          mediaType: mediaFile ? mediaFile.mimetype : null,
          tagFilter: tagFilter || null,
          status: "pending",
          totalContacts: contacts.length,
        });

        // Create message records
        for (const contact of contacts) {
          await storage.createMessage({
            broadcastId: broadcast.id,
            contactId: contact.id,
            workspaceId: req.params.workspaceId,
            direction: "outbound",
            content: message,
            mediaUrl: broadcast.mediaUrl,
            status: "pending",
            errorMessage: null,
            whatsappMessageId: null,
          });
        }

        // Enqueue messages
        await enqueueBroadcast(
          broadcast.id,
          req.params.workspaceId,
          contacts.map(c => ({ id: c.id, phone: c.phone })),
          message,
          broadcast.mediaUrl || undefined
        );

        res.json(broadcast);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  // Get broadcast status
  app.get("/api/broadcasts/:broadcastId/status", authMiddleware, async (req, res) => {
    try {
      const broadcast = await storage.getBroadcast(req.params.broadcastId);
      if (!broadcast) {
        return res.status(404).json({ error: "Broadcast not found" });
      }

      res.json({
        status: broadcast.status,
        totalContacts: broadcast.totalContacts,
        sentCount: broadcast.sentCount,
        deliveredCount: broadcast.deliveredCount,
        failedCount: broadcast.failedCount,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // PAYMENT ROUTES
  // ============================================

  // Upload payment proof
  app.post(
    "/api/workspaces/:workspaceId/payments",
    authMiddleware,
    workspaceMiddleware,
    upload.single('proof'),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "Proof image required" });
        }

        const payment = await storage.createPayment({
          workspaceId: req.params.workspaceId,
          userId: req.user!.userId,
          amount: req.body.amount || null,
          proofImageUrl: `/uploads/${req.file.filename}`,
          status: "pending",
          notes: req.body.notes || null,
        });

        res.json(payment);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  // Get workspace payments
  app.get("/api/workspaces/:workspaceId/payments", authMiddleware, workspaceMiddleware, async (req, res) => {
    try {
      const payments = await storage.getPaymentsByWorkspaceId(req.params.workspaceId);
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Get pending payments
  app.get("/api/admin/payments", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const payments = await storage.getPendingPayments();
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Approve/Reject payment
  app.patch("/api/admin/payments/:paymentId", authMiddleware, adminMiddleware, async (req, res) => {
    try {
      const { action, notes } = req.body;
      
      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: "Action must be 'approve' or 'reject'" });
      }

      const payment = await storage.getPayment(req.params.paymentId);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      const updatedPayment = await storage.updatePayment(req.params.paymentId, {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedBy: req.user!.userId,
        reviewedAt: new Date(),
        notes: notes || payment.notes,
      });

      // If approved, activate workspace
      if (action === 'approve') {
        await storage.updateWorkspace(payment.workspaceId, { active: true });
      }

      res.json(updatedPayment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // DASHBOARD STATS ROUTES
  // ============================================

  app.get("/api/workspaces/:workspaceId/stats", authMiddleware, workspaceMiddleware, async (req, res) => {
    try {
      const contacts = await storage.getContactsByWorkspaceId(req.params.workspaceId);
      const broadcasts = await storage.getBroadcastsByWorkspaceId(req.params.workspaceId);
      
      // Calculate today's broadcasts
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayBroadcasts = broadcasts.filter(b => 
        b.createdAt && new Date(b.createdAt) >= today
      );

      const totalSentToday = todayBroadcasts.reduce((sum, b) => sum + b.sentCount, 0);
      const totalDelivered = broadcasts.reduce((sum, b) => sum + b.deliveredCount, 0);
      const totalSent = broadcasts.reduce((sum, b) => sum + b.sentCount, 0);
      const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;

      res.json({
        totalContacts: contacts.length,
        broadcastsToday: totalSentToday,
        deliveryRate: deliveryRate.toFixed(1),
        totalBroadcasts: broadcasts.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
