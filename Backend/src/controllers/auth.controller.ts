import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

const createToken = (user: {
    _id: unknown;
    email: string;
    name: string;
}) => {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign(
        {
            id: String(user._id),
            email: user.email,
            name: user.name
        },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
};

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                error: "Name, email and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                error: "User already exists with this email"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        return res.status(201).json({
            token: createToken(user),
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            error: "Registration failed"
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const isPasswordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordMatch) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        return res.json({
            token: createToken(user),
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            error: "Login failed"
        });
    }
};

export const getMe = (
    req: AuthenticatedRequest,
    res: Response
) => {
    return res.json({
        user: req.user
    });
};