import { db } from "./db";
import { 
  users, workspaces, flows, flowNodes, contacts, broadcasts, messages, payments, whatsappSessions,
  type InsertUser, type User, type InsertWorkspace, type Workspace,
  type InsertFlow, type Flow, type InsertFlowNode, type FlowNode,
  type InsertContact, type Contact, type InsertBroadcast, type Broadcast,
  type InsertMessage, type Message, type InsertPayment, type Payment,
  type InsertWhatsappSession, type WhatsappSession
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<InsertUser, "isAdmin"> & { passwordHash: string }): Promise<User>;
  
  // Workspaces
  getWorkspace(id: string): Promise<Workspace | undefined>;
  getWorkspacesByUserId(userId: string): Promise<Workspace[]>;
  createWorkspace(workspace: InsertWorkspace): Promise<Workspace>;
  updateWorkspace(id: string, data: Partial<Workspace>): Promise<Workspace | undefined>;
  deleteWorkspace(id: string): Promise<void>;
  
  // Flows
  getFlow(id: string): Promise<Flow | undefined>;
  getFlowsByWorkspaceId(workspaceId: string): Promise<Flow[]>;
  createFlow(flow: InsertFlow): Promise<Flow>;
  updateFlow(id: string, data: Partial<Flow>): Promise<Flow | undefined>;
  deleteFlow(id: string): Promise<void>;
  
  // Flow Nodes
  getFlowNodesByFlowId(flowId: string): Promise<FlowNode[]>;
  createFlowNode(node: InsertFlowNode): Promise<FlowNode>;
  deleteFlowNodesByFlowId(flowId: string): Promise<void>;
  
  // Contacts
  getContact(id: string): Promise<Contact | undefined>;
  getContactsByWorkspaceId(workspaceId: string): Promise<Contact[]>;
  getContactByPhone(workspaceId: string, phone: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: string, data: Partial<Contact>): Promise<Contact | undefined>;
  deleteContact(id: string): Promise<void>;
  
  // Broadcasts
  getBroadcast(id: string): Promise<Broadcast | undefined>;
  getBroadcastsByWorkspaceId(workspaceId: string): Promise<Broadcast[]>;
  createBroadcast(broadcast: InsertBroadcast): Promise<Broadcast>;
  updateBroadcast(id: string, data: Partial<Broadcast>): Promise<Broadcast | undefined>;
  
  // Messages
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByBroadcastId(broadcastId: string): Promise<Message[]>;
  getMessagesByContactId(contactId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: string, data: Partial<Message>): Promise<Message | undefined>;
  
  // Payments
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentsByWorkspaceId(workspaceId: string): Promise<Payment[]>;
  getPendingPayments(): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, data: Partial<Payment>): Promise<Payment | undefined>;
  
  // WhatsApp Sessions
  getWhatsappSession(workspaceId: string): Promise<WhatsappSession | undefined>;
  createWhatsappSession(session: InsertWhatsappSession): Promise<WhatsappSession>;
  updateWhatsappSession(workspaceId: string, data: Partial<WhatsappSession>): Promise<WhatsappSession | undefined>;
  deleteWhatsappSession(workspaceId: string): Promise<void>;
}

export class DbStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: Omit<InsertUser, "isAdmin"> & { passwordHash: string }): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Workspaces
  async getWorkspace(id: string): Promise<Workspace | undefined> {
    const result = await db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1);
    return result[0];
  }

  async getWorkspacesByUserId(userId: string): Promise<Workspace[]> {
    return await db.select().from(workspaces).where(eq(workspaces.userId, userId)).orderBy(desc(workspaces.createdAt));
  }

  async createWorkspace(workspace: InsertWorkspace): Promise<Workspace> {
    const result = await db.insert(workspaces).values(workspace).returning();
    return result[0];
  }

  async updateWorkspace(id: string, data: Partial<Workspace>): Promise<Workspace | undefined> {
    const result = await db.update(workspaces).set({ ...data, createdAt: sql`created_at` }).where(eq(workspaces.id, id)).returning();
    return result[0];
  }

  async deleteWorkspace(id: string): Promise<void> {
    await db.delete(workspaces).where(eq(workspaces.id, id));
  }

  // Flows
  async getFlow(id: string): Promise<Flow | undefined> {
    const result = await db.select().from(flows).where(eq(flows.id, id)).limit(1);
    return result[0];
  }

  async getFlowsByWorkspaceId(workspaceId: string): Promise<Flow[]> {
    return await db.select().from(flows).where(eq(flows.workspaceId, workspaceId)).orderBy(desc(flows.createdAt));
  }

  async createFlow(flow: InsertFlow): Promise<Flow> {
    const result = await db.insert(flows).values(flow).returning();
    return result[0];
  }

  async updateFlow(id: string, data: Partial<Flow>): Promise<Flow | undefined> {
    const result = await db.update(flows).set({ ...data, updatedAt: new Date(), createdAt: sql`created_at` }).where(eq(flows.id, id)).returning();
    return result[0];
  }

  async deleteFlow(id: string): Promise<void> {
    await db.delete(flows).where(eq(flows.id, id));
  }

  // Flow Nodes
  async getFlowNodesByFlowId(flowId: string): Promise<FlowNode[]> {
    return await db.select().from(flowNodes).where(eq(flowNodes.flowId, flowId));
  }

  async createFlowNode(node: InsertFlowNode): Promise<FlowNode> {
    const result = await db.insert(flowNodes).values(node).returning();
    return result[0];
  }

  async deleteFlowNodesByFlowId(flowId: string): Promise<void> {
    await db.delete(flowNodes).where(eq(flowNodes.flowId, flowId));
  }

  // Contacts
  async getContact(id: string): Promise<Contact | undefined> {
    const result = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
    return result[0];
  }

  async getContactsByWorkspaceId(workspaceId: string): Promise<Contact[]> {
    return await db.select().from(contacts).where(eq(contacts.workspaceId, workspaceId)).orderBy(desc(contacts.createdAt));
  }

  async getContactByPhone(workspaceId: string, phone: string): Promise<Contact | undefined> {
    const result = await db.select().from(contacts).where(and(eq(contacts.workspaceId, workspaceId), eq(contacts.phone, phone))).limit(1);
    return result[0];
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const result = await db.insert(contacts).values(contact).returning();
    return result[0];
  }

  async updateContact(id: string, data: Partial<Contact>): Promise<Contact | undefined> {
    const result = await db.update(contacts).set({ ...data, createdAt: sql`created_at` }).where(eq(contacts.id, id)).returning();
    return result[0];
  }

  async deleteContact(id: string): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  // Broadcasts
  async getBroadcast(id: string): Promise<Broadcast | undefined> {
    const result = await db.select().from(broadcasts).where(eq(broadcasts.id, id)).limit(1);
    return result[0];
  }

  async getBroadcastsByWorkspaceId(workspaceId: string): Promise<Broadcast[]> {
    return await db.select().from(broadcasts).where(eq(broadcasts.workspaceId, workspaceId)).orderBy(desc(broadcasts.createdAt));
  }

  async createBroadcast(broadcast: InsertBroadcast): Promise<Broadcast> {
    const result = await db.insert(broadcasts).values(broadcast).returning();
    return result[0];
  }

  async updateBroadcast(id: string, data: Partial<Broadcast>): Promise<Broadcast | undefined> {
    const result = await db.update(broadcasts).set({ ...data, createdAt: sql`created_at` }).where(eq(broadcasts.id, id)).returning();
    return result[0];
  }

  // Messages
  async getMessage(id: string): Promise<Message | undefined> {
    const result = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
    return result[0];
  }

  async getMessagesByBroadcastId(broadcastId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.broadcastId, broadcastId)).orderBy(desc(messages.createdAt));
  }

  async getMessagesByContactId(contactId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.contactId, contactId)).orderBy(desc(messages.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  async updateMessage(id: string, data: Partial<Message>): Promise<Message | undefined> {
    const result = await db.update(messages).set({ ...data, createdAt: sql`created_at` }).where(eq(messages.id, id)).returning();
    return result[0];
  }

  // Payments
  async getPayment(id: string): Promise<Payment | undefined> {
    const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    return result[0];
  }

  async getPaymentsByWorkspaceId(workspaceId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.workspaceId, workspaceId)).orderBy(desc(payments.createdAt));
  }

  async getPendingPayments(): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.status, "pending")).orderBy(desc(payments.createdAt));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const result = await db.insert(payments).values(payment).returning();
    return result[0];
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment | undefined> {
    const result = await db.update(payments).set({ ...data, createdAt: sql`created_at` }).where(eq(payments.id, id)).returning();
    return result[0];
  }

  // WhatsApp Sessions
  async getWhatsappSession(workspaceId: string): Promise<WhatsappSession | undefined> {
    const result = await db.select().from(whatsappSessions).where(eq(whatsappSessions.workspaceId, workspaceId)).limit(1);
    return result[0];
  }

  async createWhatsappSession(session: InsertWhatsappSession): Promise<WhatsappSession> {
    const result = await db.insert(whatsappSessions).values(session).returning();
    return result[0];
  }

  async updateWhatsappSession(workspaceId: string, data: Partial<WhatsappSession>): Promise<WhatsappSession | undefined> {
    const result = await db.update(whatsappSessions).set({ ...data, updatedAt: new Date(), createdAt: sql`created_at` }).where(eq(whatsappSessions.workspaceId, workspaceId)).returning();
    return result[0];
  }

  async deleteWhatsappSession(workspaceId: string): Promise<void> {
    await db.delete(whatsappSessions).where(eq(whatsappSessions.workspaceId, workspaceId));
  }
}

export const storage = new DbStorage();
