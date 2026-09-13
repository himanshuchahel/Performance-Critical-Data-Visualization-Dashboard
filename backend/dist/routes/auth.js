"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
router.post("/register", authController_1.register);
router.post("/login", authController_1.login);
router.post("/logout", authController_1.logout);
router.get("/me", authMiddleware_1.authMiddleware, async (req, res) => {
    const user = await User_1.User.findById(req.user._id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }
    res.json({
        success: true,
        user,
    });
});
exports.default = router;
