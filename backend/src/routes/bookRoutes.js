import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;

    if (!image || !title || !caption || !rating) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    // upload the image to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageURL = uploadResponse.secure_url;

    // save to the DB
    const newBook = new Book({
      title,
      caption,
      rating,
      image: imageURL,
      user: req.user._id,
    });

    await newBook.save();

    res.status(201).json(newBook);
  } catch (error) {
    console.log("Error creating book", error);
    res.status(500).json({ message: error.message });
  }
});

// pagination => infinte loading/scrolling

router.get("/", protectRoute, async (req, res) => {
  try {
    const page = req.query.page || 1; // default page will be 1
    const limit = req.query.limit || 10; // default limit will be 10
    const skip = (page - 1) * limit;

    const books = await Book.find()
      .sort({ createdAt: -1 }) // descending
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    const total = await Book.countDocuments();

    res.send({
      books,
      currentPage: page,
      totalBooks: total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.log("Error in get all books route", error);
    res
      .status(500)
      .json({ message: "Internal server error: Could not get all books" });
  }
});

// get recommended books by the logged in user
router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(books);
  } catch (error) {
    console.log("Could not get user books: ", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // check if user is the creator of the book
    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // deleting post image from cloudinary
    if (book.image && book.image.includes("cloudinary")) {
      try {
        // example link: https://res.cloudinary.com/dtac4dhtj/image/upload/v1740499765/apm8us158inl7frp9jny.jpg
        // Getting the id from the end of the link
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.log("Error deleting image from cloudinary", error);
      }
    }
    // deleting post from DB
    await book.deleteOne();

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.log("Error deleting book", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/title", protectRoute, async (req, res) => {
  try {
    const { title } = req.query;

    if (!title) {
      return res.status(400).json({ message: "Please provide a title" });
    }

    const books = await Book.find({ title: new RegExp(title, "i") })
      .sort({ createdAt: -1 })
      .populate("user", "username profileImage");

    if (books.length === 0) {
      return res
        .status(404)
        .json({ message: "No books found with that title" });
    }

    res.json(books);
  } catch (error) {
    console.log("Error fetching books by title", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
