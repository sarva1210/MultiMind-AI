import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authMiddleware = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Unauthorized: No token provided"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            error: "Unauthorized: Malformed token"
        });
    }

    try {
        const secret = process.env.JWT_SECRET;
        
        if (!secret) {
            throw new Error("JWT_SECRET is not configured");
        }
        
        const decoded = jwt.verify(token, secret) as {
            id: string;
            email: string;
            name: string;
        }
    }
};