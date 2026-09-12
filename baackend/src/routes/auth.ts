import { Router } from "express";
import { register, login, logout } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import { User } from "../models/User";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", authMiddleware, async (req: any, res) => {
  const user = await User.findById(req.user._id);

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

export default router;