import express from "express";
import { requireSignIn, isAdmin } from "../middlewares/authMiddlewares.js";
import {
  generateClientToken,
  processBraintreePayment,
  getAllOrders,
  getOrdersByUserId,
  updateOrderStatus,
  deleteOrderById,
} from "../controllers/orderController.js";

const router = express.Router();

// Route to generate a Braintree client token
router.get("/braintree/token", generateClientToken);

// Route to process Braintree payment
router.post("/braintree/payment", requireSignIn, processBraintreePayment);

// Route to get all orders
router.get("/all-orders", requireSignIn, isAdmin, getAllOrders);

// Route to get orders by user ID
router.get("/:userId", requireSignIn, getOrdersByUserId);

// Route to update order status
router.put("/order-status/:orderId", requireSignIn, isAdmin, updateOrderStatus);

// Route to delete an order by ID
router.delete("/:orderId", requireSignIn, isAdmin, deleteOrderById);

export default router;
