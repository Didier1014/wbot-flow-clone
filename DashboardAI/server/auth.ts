import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { type Request, type Response, type NextFunction } from "express";
import { storage } from "./storage";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const SALT_ROUNDS = 10;

export interface JWTPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      workspaceId?: string;
    }
  }
}

// Auth middleware
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Admin middleware
export async function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user?.isAdmin) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

// Workspace ownership middleware
export async function workspaceMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspaceId;
    
    if (!workspaceId) {
      res.status(400).json({ error: "Workspace ID required" });
      return;
    }

    const workspace = await storage.getWorkspace(workspaceId);
    
    if (!workspace) {
      res.status(404).json({ error: "Workspace not found" });
      return;
    }

    // Check if user owns this workspace or is admin
    if (workspace.userId !== req.user?.userId && !req.user?.isAdmin) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    req.workspaceId = workspaceId;
    next();
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}

// Workspace active middleware (blocks if workspace is inactive)
export async function activeWorkspaceMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const workspaceId = req.workspaceId || req.params.workspaceId;
    
    if (!workspaceId) {
      res.status(400).json({ error: "Workspace ID required" });
      return;
    }

    const workspace = await storage.getWorkspace(workspaceId);
    
    if (!workspace?.active) {
      res.status(403).json({ 
        error: "Workspace is inactive. Please complete payment to activate." 
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}
