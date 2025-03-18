const express = require('express')
const sellerRouter = express.Router();
const multer = require('multer');
const { validateSignupData } = require('../utils/validator')
const { sellerAuth } = require('../middlewares/auth');
const Product = require("../models/product");
const { uploadMultipleAndStore } = require("../config/cloudinaryService");
const Seller = require('../models/seller');
const storage = multer.memoryStorage({});
const upload = multer({ storage: storage });

sellerRouter.post("/seller/product", sellerAuth, upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, subCategory, category, price, sizes } = req.body;
        const user = req.user
        if (isNaN(price) || price < 0) {
            return res.status(400).json({ message: "Price must be a valid positive number" })
        }
        const imageData = await uploadMultipleAndStore(req.files);

        if (imageData.length < 1) {
            return res.status(400).json({ message: "Atleast one image is required" })
        }

        let parsedSizes;
        try {
            parsedSizes = JSON.parse(sizes);
            if (!Array.isArray(parsedSizes) || parsedSizes.length === 0) {
                throw new Error();
            }

            for (const size of parsedSizes) {
                if (!['S', 'M', 'L', 'XL'].includes(size.size) || isNaN(size.quantity) || size.quantity < 0) {
                    return res.status(400).json({ message: "Invalid size format." });
                }
            }
        } catch (error) {
            return res.status(400).json({ message: "Invalid sizes format." });
        }
        const product = new Product({
            seller: user._id,
            name,
            description,
            subCategory,
            category,
            price,
            sizes: parsedSizes,
            images: imageData,
        })


        await product.save();

        res.status(201).json({ message: "Product uploaded successfully", product })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })
    }
})

sellerRouter.patch("/seller/profile", sellerAuth, async (req, res) => {
    try {
        const seller = req.user;
        let updatedSeller;
        const { name, email, shopName, oldPassword, newPassword } = req.body;
        validateSignupData(req, isUpdate = true, isSeller = true)

        if (newPassword) {
            const isValidPassword = await seller.validatePassword(oldPassword);
            if (isValidPassword) {
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                updatedSeller = await Seller.findByIdAndUpdate(seller._id, { name, email, shopName, password: hashedPassword }, { new: true })

            } else {
                return res.status(401).json({ message: "Incorrect old password" })
            }
        } else {
            updatedSeller = await Seller.findByIdAndUpdate(seller._id, { name, email, shopName }, { new: true });
        }
        const { password: _, ...sellerWithoutPassword } = updatedSeller.toObject();

        res.status(200).json({ message: "profile updated successfully", data: sellerWithoutPassword })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

sellerRouter.put("/seller/product/:id", sellerAuth, upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, subCategory, category, price, sizes } = req.body;
        const { id } = req.params;
        const user = req.user;


        if (isNaN(price) || price < 0) {
            return res.status(400).json({ message: "Price must be a valid positive number" });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(400).json({ message: "Product not found" })
        }

        if (product.seller.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "You are not the seller of this product" });
        }

        let parsedSizes;
        try {
            if (sizes) {
                parsedSizes = JSON.parse(sizes);
                if (!Array.isArray(parsedSizes) || parsedSizes.length === 0) {
                    throw new Error();
                }

                for (const size of parsedSizes) {
                    if (!['S', 'M', 'L', 'XL'].includes(size.size) || isNaN(size.quantity) || size.quantity < 0) {
                        return res.status(400).json({ message: "Invalid size format." });
                    }
                }
            }
        } catch (error) {
            return res.status(400).json({ message: "Invalid sizes format." });
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.subCategory = subCategory || product.subCategory;
        product.category = category || product.category;
        product.price = price || product.price;
        product.sizes = parsedSizes || product.sizes;

        await product.save();
        res.status(200).json({ message: "Product updated successfully", product });

    } catch (error) {
        console.log(error)
    }
})

sellerRouter.get("/seller/products", sellerAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10, sortByLatest = false } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10)
        const skip = (pageNumber - 1) * limitNumber

        const user = req.user
        const totalProducts = await Product.countDocuments({ seller: user.id, isDeleted: false });

        const products = await Product.find({ seller: user._id, isDeleted: false })
            .skip(skip)
            .limit(limitNumber);

        const totalPages = Math.ceil(totalProducts / limitNumber)

        res.status(200).json({
            products,
            pagination: {
                currentPage: pageNumber,
                totalPages: totalPages,
                totalProducts: totalProducts,
                pageSize: limitNumber
            }
        })



    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

sellerRouter.get("/seller/profile", sellerAuth, async (req, res) => {
    try {
        const user = req.user;
        const { password: _, ...userWithoutPassword } = user.toObject();
        res.status(201).json({ message: "User fetched successfully", data: userWithoutPassword });

    } catch (error) {
        res.status(400).send("Error : " + error.message)
    }
})

module.exports = sellerRouter;