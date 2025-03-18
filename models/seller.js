const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
require('dotenv').config()
const bcrypt = require('bcrypt');
const Product = require('./product');
const User = require('./user');
const OrderItem = require('./orderItem')

const sellerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    shopName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50,
        required: true
    },
    shopDescription: {
        type: String,
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],
    orders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OrderItem'
        }
    ]
}, { timestamps: true })

sellerSchema.pre('save', function (next) {
    if (this.name) {
        this.name = this.name.trim().replace(/\s+/g, ' ');
    }
    if (this.shopName) {
        this.shopName = this.shopName.trim().replace(/\s+/g, ' ');
    }

    next();
})

sellerSchema.methods.getJWT = function () {
    const user = this;
    const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, { expiresIn: "7d" })
    return token;
}

sellerSchema.methods.validatePassword = async function (userInputPassword) {
    const seller = this;
    const isValidPassword = await bcrypt.compare(userInputPassword, seller.password)
    return isValidPassword;
}

const Seller = mongoose.model('Seller', sellerSchema)

module.exports = Seller