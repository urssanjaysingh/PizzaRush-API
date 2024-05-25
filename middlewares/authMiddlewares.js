import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";

const requireSignIn = (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

const isAdmin = async (req, res, next) => {
  const token = req.headers.authorization;

  try {
    const decodedToken = JWT.decode(token, { complete: true });

    if (decodedToken && decodedToken.payload._id) {
      const user = await userModel.findById(decodedToken.payload._id);

      if (user && user.role === 1) {
        next();
      } else {
        res.status(403).json({ error: "Forbidden, admin access required" });
      }
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export { requireSignIn, isAdmin };
