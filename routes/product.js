const express = require('express')
const productRouter = express.Router();
const multer = require('multer');
const { sellerAuth } = require('../middlewares/auth');
const Product = require("../models/product");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/'); // Directory to store images
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

productRouter.post("/seller/product", sellerAuth, upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, category, genderCategory, price, sizes } = req.body;
        const user = req.user
        const imageUrls = req.files.map(file => file.path);

        if (imageUrls.length < 1) {
            return res.status(400).json({ message: "Atleast one image is required" })
        }

        if (isNaN(price) || price < 0) {
            return res.status(400).json({ message: "Price must be a valid positive number" })
        }

        let parsedSizes;
        try {
            parsedSizes = JSON.parse(sizes);
            if (!Array.isArray(parsedSizes)) throw new Error();
        } catch {
            return res.status(400).json({ message: "Invalid sizes format. Must be a JSON array of IDs." });
        }

        const product = new Product({
            seller: user._id,
            name,
            description,
            category: genderCategory,
            subCategory: category,
            price,
            sizes: parsedSizes,
            images: imageUrls
        })

        await product.save();
        res.status(201).json({ message: "Product uploaded successfully", product })


    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

module.exports = productRouter;