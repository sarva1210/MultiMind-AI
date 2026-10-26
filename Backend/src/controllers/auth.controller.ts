import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";

const JWT_SECRET = process.env.JWT_SECRET;

const createToken = (user: {
    _id: unknown;
    email: string;
    name: string;
}) => {
    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign({
        id: String(user._id),
        email: user.email,
        name: user.name
    },
    JWT_SECRET,
    { expiresIn: "7d" });
};