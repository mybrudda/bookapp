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


// pagination => infinte loading/scrolling

router.get("/", protectRoute, async (req, res) => {
  try {
    const page = req.query.page || 1 // default page will be 1
    const limit = req.query.limit || 10 // default limit will be 10
    const skip = (page -1) * limit

    const books = await Book.find()
    .sort({created: -1}) // descending
    .skip(skip)
    .limit(limit)
    .populate("user", "username profileImage")

    const total = await Book.countDocuments()

    res.send({
      books,
      currentPage: page,
      totalBooks: total,
      totalPages: Math.ceil(total/limit)
    })

  } catch (error) {

    console.log("Error in get all books route", error)
    res.status(500).json({message: "Internal server error: Could not get all books"})

  }
})


export default router;
