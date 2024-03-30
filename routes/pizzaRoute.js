import express from "express";
import { requireSignIn, isAdmin } from "../middlewares/authMiddlewares.js";
import {
  createPizza,
  updatePizza,
  getAllPizzas,
  getPizzaById,
  getRelatedPizzas,
  deletePizzaById,
} from "../controllers/pizzaController.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// create a new pizza
router.post("/create", requireSignIn, isAdmin, createPizza);

// update a pizza
router.post("/update/:id", requireSignIn, isAdmin, updatePizza);

// get all pizzas
router.get("/getAllPizzas", getAllPizzas);

// get a pizza by ID
router.get("/getPizzaById/:id", getPizzaById);

// get related pizzas by category
router.get("/relatedPizzas/:category", getRelatedPizzas);

// delete a pizza by ID
router.delete("/deletePizzaById/:id", requireSignIn, isAdmin, deletePizzaById);

export default router;
