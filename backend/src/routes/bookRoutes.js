import express from "express";
import cloudinary from "../lib/cloudinary";
import Book from "../models/Book";
import protectRoute from "../middleware/auth.middleware";

const router = express.Router();

router.post("/", protectRoute ,async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;

    if (!image || !title || !caption || !rating){
        return res.status(400).json({ message: "Please provide all fields" });
    }
      
    // upload the image to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image)
    const imageURL = uploadResponse.secure_url


    // save to the DB
    const newBook = new Book({
        title,
        caption,
        rating,
        image: imageURL,
        user: req.user._id,
    })

    await newBook.save()

    res.status(201).json(newBook)

  } catch (error) {
    console.log("Error creating book", error)
    res.status(500).json({message: error.message})
  }
});

export default router;
