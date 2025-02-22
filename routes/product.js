const express = require('express');
const productRouter = express.Router();
const Product = require('../models/product')
const mongoose = require('mongoose')



productRouter.get("/products", async (req, res) => {
    try {
        const { category, subCategory, sort, page = 1, limit = 15 } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        let filter = {}

        if (category) {
            filter.category = category
        }
        if (subCategory) {
            filter.subCategory = subCategory;
        }
        let sortOrder = {}
        if (sort) {
            if (sort === "price_asc") {
                sortOrder.price = 1;
            } else if (sort === 'price_desc') {
                sortOrder.price = -1;
            }
        }

        const skip = (pageNumber - 1) * limitNumber
        const products = await Product.find(filter)
            .sort(sortOrder)
            .skip(skip)
            .limit(limitNumber)
            .select("_id name price images")


        const totalItems = await Product.countDocuments(filter);

        res.status(200).json({
            data: products,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                totalItems: totalItems,
                totalPages: Math.ceil(totalItems / limitNumber)
            }
        })


    } catch (error) {
        res.status(500).json({ message: error.message })
    }

})

productRouter.get("/product/:id", async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }
        const product = await Product.findById(id)

        if (!product) {
            res.status(404).json({ message: "Item not found" })
        }
        res.status(200).json(product)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = productRouter