import pizzaModel from "../models/pizzaModel.js";
import cloudinary from "cloudinary";
import multer from "multer";
import storage from "../helpers/fileStorage.js";

const upload = multer({ storage: storage }).single("image");

const createPizza = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        console.error("Error uploading pizza image:", err);
        return res.status(500).json({ message: "Error uploading pizza image" });
      }

      const { name, description, price, category } = req.body;

      if (!name || !description || !price || !category) {
        return res
          .status(400)
          .json({ message: "Please provide all required fields" });
      }

      try {
        if (req.file) {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "pizzas",
          });

          const cloudinaryBaseUrl =
            "https://res.cloudinary.com/dewblf95z/image/upload/";
          const transformedImageUrl = `${cloudinaryBaseUrl}w_640,h_640,c_fill/${result.public_id}.${result.format}`;

          const newPizza = new pizzaModel({
            name,
            description,
            price,
            category,
            image: transformedImageUrl,
          });

          await newPizza.save();

          res.status(201).send({
            success: true,
            message: "Pizza Created Successfully",
            pizza: newPizza,
          });
        } else {
          return res.status(400).send({ message: "Pizza photo is required" });
        }
      } catch (error) {
        console.error("Error creating pizza:", error);
        return res.status(500).send({
          success: false,
          error,
          message: "Internal server error",
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating pizza",
    });
  }
};

const updatePizza = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        console.error("Error uploading pizza image:", err);
        return res.status(500).json({ message: "Error uploading pizza image" });
      }

      const { name, description, price, category } = req.body;

      if (!name || !description || !price || !category) {
        return res
          .status(400)
          .json({ message: "Please provide all required fields" });
      }

      try {
        const pizzaId = req.params.id;
        const existingPizza = await pizzaModel.findById(pizzaId);

        if (!existingPizza) {
          return res.status(404).json({ message: "Pizza not found" });
        }

        let updatedPizzaData = {
          name,
          description,
          price,
          category,
        };

        if (req.file) {
          // Handle image upload
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "pizzas",
          });
          const cloudinaryBaseUrl =
            "https://res.cloudinary.com/dewblf95z/image/upload/";
          const transformedImageUrl = `${cloudinaryBaseUrl}w_640,h_640,c_fill/${result.public_id}.${result.format}`;
          updatedPizzaData.image = transformedImageUrl;
        }

        // Update pizza data
        const updatedPizza = await pizzaModel.findByIdAndUpdate(
          pizzaId,
          updatedPizzaData,
          { new: true }
        );

        res.status(200).send({
          success: true,
          message: "Pizza Updated Successfully",
          pizza: updatedPizza,
        });
      } catch (error) {
        console.error("Error updating pizza:", error);
        return res.status(500).send({
          success: false,
          error,
          message: "Internal server error",
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating pizza",
    });
  }
};

const getAllPizzas = async (req, res) => {
  try {
    const pizzas = await pizzaModel.find({}).sort({ createdAt: -1 });
    res.send(pizzas);
  } catch (err) {
    res.status(500).json({ message: "Error fetching pizzas", error: err });
  }
};

const getPizzaById = async (req, res) => {
  try {
    const pizza = await pizzaModel.findById(req.params.id);
    if (!pizza) {
      return res.status(404).json({ message: "Pizza not found" });
    }
    res.json(pizza);
  } catch (err) {
    res.status(500).json({ message: "Error fetching pizza by ID", error: err });
  }
};

const getRelatedPizzas = async (req, res) => {
  try {
    const { category } = req.params;

    // Use MongoDB aggregation to randomly select related pizzas based on the provided category
    const relatedPizzas = await pizzaModel.aggregate([
      { $match: { category } },
      { $sample: { size: 3 } },
    ]);

    res.status(200).json({
      success: true,
      relatedPizzas,
    });
  } catch (error) {
    console.error("Error while getting related pizzas:", error);
    res.status(500).json({
      success: false,
      message: "Error while getting related pizzas",
      error: error.message,
    });
  }
};

const deletePizzaById = async (req, res) => {
  try {
    const deletedPizza = await pizzaModel.findByIdAndDelete(req.params.id);
    if (!deletedPizza) {
      return res.status(404).json({ message: "Pizza not found" });
    }
    res.json({ success: true, message: "Pizza deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting pizza by ID", error: err });
  }
};

export {
  createPizza,
  updatePizza,
  getAllPizzas,
  getPizzaById,
  getRelatedPizzas,
  deletePizzaById,
};
