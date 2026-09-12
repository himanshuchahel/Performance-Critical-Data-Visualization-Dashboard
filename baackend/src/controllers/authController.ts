import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { env } from "../config/env";

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email and password are required",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters",
    });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const exists = await User.findOne({ email: normalizedEmail });

  if (exists) {
    return res.status(409).json({
      success: false,
      message: "Email already registered",
    });
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: password,
  });

  res.status(201).json({
    success: true,
    message: "Registration successful",
    user,
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await User.findOne({
    email: email?.toLowerCase().trim(),
  });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
    },
    env.AUTH_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    message: "Login successful",
    user,
  });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie("token");

  res.json({
    success: true,
    message: "Logout successful",
  });
}