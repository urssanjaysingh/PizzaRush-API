import express from "express";
import { requireSignIn, isAdmin } from "../middlewares/authMiddlewares.js";
import {
  updateProfile,
  getAllUsers,
  deleteUserById,
} from "../controllers/userController.js";

const router = express.Router();

// Route to update user profile
router.put("/profile/:userId", requireSignIn, updateProfile);

// Route to get all users (requires admin privileges)
router.get("/get-all", requireSignIn, isAdmin, getAllUsers);

// Route to delete a user by ID (requires admin privileges)
router.delete("/user/:userId", requireSignIn, isAdmin, deleteUserById);

export default router;
