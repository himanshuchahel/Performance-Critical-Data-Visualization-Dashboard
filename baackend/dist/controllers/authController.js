"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const env_1 = require("../config/env");
async function register(req, res) {
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
    const exists = await User_1.User.findOne({ email: normalizedEmail });
    if (exists) {
        return res.status(409).json({
            success: false,
            message: "Email already registered",
        });
    }
    const user = await User_1.User.create({
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
async function login(req, res) {
    const { email, password } = req.body;
    const user = await User_1.User.findOne({
        email: email?.toLowerCase().trim(),
    });
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password",
        });
    }
    const token = jsonwebtoken_1.default.sign({
        userId: user._id.toString(),
        email: user.email,
    }, env_1.env.AUTH_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: env_1.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
        success: true,
        message: "Login successful",
        user,
    });
}
function logout(_req, res) {
    res.clearCookie("token");
    res.json({
        success: true,
        message: "Logout successful",
    });
}
