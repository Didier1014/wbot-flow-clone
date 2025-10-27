import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { storage } from "./storage";
import { sendMessage } from "./whatsapp";

const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
});

export interface BroadcastJobData {
  broadcastId: string;
  workspaceId: string;
  contactId: string;
  phone: string;
  message: string;
  mediaUrl?: string;
}

// Create broadcast queue
export const broadcastQueue = new Queue<BroadcastJobData>("broadcast", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

// Broadcast worker - processes messages one at a time with 1 second delay
export const broadcastWorker = new Worker<BroadcastJobData>(
  "broadcast",
  async (job: Job<BroadcastJobData>) => {
    const { broadcastId, workspaceId, contactId, phone, message, mediaUrl } = job.data;

    try {
      // Check if workspace is active
      const workspace = await storage.getWorkspace(workspaceId);
      if (!workspace?.active) {
        throw new Error("Workspace is inactive");
      }

      // Send message via WhatsApp
      const success = await sendMessage(workspaceId, phone, message, mediaUrl);

      if (!success) {
        throw new Error("Failed to send message");
      }

      // Update message status
      const messages = await storage.getMessagesByBroadcastId(broadcastId);
      const messageRecord = messages.find(m => m.contactId === contactId);
      
      if (messageRecord) {
        await storage.updateMessage(messageRecord.id, {
          status: "sent",
          sentAt: new Date(),
        });
      }

      // Update broadcast stats
      const broadcast = await storage.getBroadcast(broadcastId);
      if (broadcast) {
        await storage.updateBroadcast(broadcastId, {
          sentCount: broadcast.sentCount + 1,
          deliveredCount: broadcast.deliveredCount + 1,
        });

        // Check if broadcast is complete
        const totalSent = broadcast.sentCount + 1;
        if (totalSent >= broadcast.totalContacts) {
          await storage.updateBroadcast(broadcastId, {
            status: "completed",
            completedAt: new Date(),
          });
        }
      }

      return { success: true, contactId, phone };
    } catch (error) {
      // Update message as failed
      const messages = await storage.getMessagesByBroadcastId(broadcastId);
      const messageRecord = messages.find(m => m.contactId === contactId);
      
      if (messageRecord) {
        await storage.updateMessage(messageRecord.id, {
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        });
      }

      // Update broadcast failed count
      const broadcast = await storage.getBroadcast(broadcastId);
      if (broadcast) {
        await storage.updateBroadcast(broadcastId, {
          failedCount: broadcast.failedCount + 1,
        });
      }

      throw error;
    }
  },
  {
    connection,
    concurrency: 1, // Process one message at a time
    limiter: {
      max: 1, // Maximum 1 job
      duration: 1000, // Per 1 second (1000ms)
    },
  }
);

// Handle worker events
broadcastWorker.on("completed", (job) => {
  console.log(`Message sent successfully: ${job.id}`);
});

broadcastWorker.on("failed", (job, err) => {
  console.error(`Message failed: ${job?.id}`, err.message);
});

export async function enqueueBroadcast(
  broadcastId: string,
  workspaceId: string,
  contacts: Array<{ id: string; phone: string }>,
  message: string,
  mediaUrl?: string
): Promise<void> {
  const jobs = contacts.map((contact) => ({
    name: `broadcast-${broadcastId}-${contact.id}`,
    data: {
      broadcastId,
      workspaceId,
      contactId: contact.id,
      phone: contact.phone,
      message,
      mediaUrl,
    },
  }));

  await broadcastQueue.addBulk(jobs);

  // Update broadcast status to processing
  await storage.updateBroadcast(broadcastId, {
    status: "processing",
  });
}
