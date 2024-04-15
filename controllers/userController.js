import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import { hashPassword } from "../helpers/authHelper.js";

async function updateProfile(req, res) {
  try {
    const userId = req.params.userId; // Extract userId from route parameters
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findById(userId);

    // Check if password is provided and hash it
    let hashedPassword;
    if (password) {
      hashedPassword = await hashPassword(password);
    }

    // Update user document
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        name: name || user.name,
        email: email || user.email,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Profile Updated Successfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error while updating profile",
      error,
    });
  }
}

async function getAllUsers(req, res) {
  try {
    const users = await userModel.find({});
    res.status(200).send(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send({ message: "Error fetching users" });
  }
}

// async function deleteUserById(req, res) {
//   const userId = req.params.userId;
//   try {
//     const deletedUser = await userModel.findByIdAndDelete(userId);
//     if (!deletedUser) {
//       return res.status(404).send({ message: "User not found" });
//     }
//     res.status(200).send({ message: "User deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting user:", error);
//     res.status(500).send({ message: "Error deleting user" });
//   }
// }

async function deleteUserById(req, res) {
  const userId = req.params.userId;
  try {
    // Find and delete all orders associated with the user
    await orderModel.deleteMany({ buyer: userId });

    // Delete the user
    const deletedUser = await userModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).send({ message: "User not found" });
    }
    res
      .status(200)
      .send({ message: "User and associated orders deleted successfully" });
  } catch (error) {
    console.error("Error deleting user and associated orders:", error);
    res
      .status(500)
      .send({ message: "Error deleting user and associated orders" });
  }
}

export { updateProfile, getAllUsers, deleteUserById };
