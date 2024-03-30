import orderModel from "../models/orderModel.js";
import gateway from "../services/paymentServices.js";

// Endpoint to generate a Braintree client token
const generateClientToken = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
  }
};

// Controller function to handle Braintree payment
const processBraintreePayment = async (req, res) => {
  try {
    const { cart, nonce, userId } = req.body;

    if (!Array.isArray(cart)) {
      return res.status(400).json({ error: "Cart should be an array" });
    }

    let total = 0;

    // Calculate the total price based on the items in the cart
    cart.forEach((item) => {
      total += item.prices;
    });

    // Perform the transaction using Braintree
    gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          // Construct the order object based on the new schema
          const pizzas = cart.map((item) => {
            return {
              predefined: item.category !== "custom", // Set predefined based on category
              pizza: item._id,
              customPizza:
                item.category === "custom"
                  ? {
                      name: item.name,
                      price: item.price,
                      description: item.description,
                      image: item.image,
                      category: item.category,
                    }
                  : undefined,
              quantity: item.quantity,
              prices: item.prices,
            };
          });

          // Create a new order instance
          const order = new orderModel({
            pizzas: pizzas, // Assign the constructed pizzas array
            payment: result,
            buyer: userId,
          });

          // Save the order to the database
          order
            .save()
            .then(() => {
              res.json({ ok: true });
            })
            .catch((saveError) => {
              res.status(500).send(saveError);
            });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

// Controller function to get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate({
        path: "pizzas",
        populate: {
          path: "pizza",
          model: "Pizzas",
        },
      })
      .populate("buyer", "name")
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      totalCount: orders.length,
      message: "All Orders",
      orders,
    });
  } catch (error) {
    console.error("Error in Getting Orders:", error);
    res.status(500).send({
      success: false,
      message: "Error in Getting Orders",
      error: error.message,
    });
  }
};

// Controller function to get orders by user ID
const getOrdersByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await orderModel
      .find({ buyer: userId })
      .populate({
        path: "pizzas",
        populate: {
          path: "pizza",
          model: "Pizzas",
        },
      })
      .populate("buyer", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      totalCount: orders.length,
      message: "User Orders",
      orders,
    });
  } catch (error) {
    console.error("Error in Getting User Orders:", error);
    res.status(500).send({
      success: false,
      message: "Error while getting user orders",
      error: error.message,
    });
  }
};

// Controller function to update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error while updating order status",
      error: error.message,
    });
  }
};

// Controller function to delete an order
const deleteOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find the order by its ID and delete it
    const deletedOrder = await orderModel.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      message: "Order deleted successfully",
      deletedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting order",
      error: error.message,
    });
  }
};

export {
  generateClientToken,
  processBraintreePayment,
  getAllOrders,
  getOrdersByUserId,
  updateOrderStatus,
  deleteOrderById,
};
