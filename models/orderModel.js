import mongoose from "mongoose";

const orderPizzaSchema = new mongoose.Schema({
  predefined: { type: Boolean, required: true },
  pizza: {
    type: mongoose.ObjectId,
    ref: "Pizzas",
  },
  customPizza: {
    name: String,
    price: Number,
    description: String,
    image: String,
    category: String,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  prices: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    pizzas: [orderPizzaSchema],
    payment: {},
    buyer: {
      type: mongoose.ObjectId,
      ref: "Users",
    },
    status: {
      type: String,
      default: "Placed",
      enum: ["Placed", "Processing", "Shipped", "Delivered", "Canceled"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Orders", orderSchema);
