const mongoose = require('mongoose')
const User = require('./user')
const Product = require('./product')
const Address = require('./address')

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    orderItems: [
        {
            "productId": {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            "size": {
                type: String,
                enum: ['S', 'M', 'L', 'XL'],
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, 'Quantity must be at least 1'],
                validate: {
                    validator: Number.isInteger,
                    message: '{VALUE} is not an integer value'
                }
            },
            productPrice: {
                type: Number,
                required: true,
                min: [0, 'Product price must be a positive value']
            }
        },

    ],
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount must be positive']
    },
    isPaid: {
        type: Boolean,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["online", "COD"],
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "shipped", "delivered", "cancelled"],
        default: "pending",
        required: true,
    }
}, { timestamps: true })

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;