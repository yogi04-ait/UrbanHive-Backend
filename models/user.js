const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
require('dotenv').config()
const bcrypt = require('bcrypt');
const Address = require('./address.js');
const Product = require('./product.js')
const Order = require("./order.js")

const userSchema = new mongoose.Schema({
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
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    wishlist:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            }
        ],
    address:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Address'
        }
    ],
    orders:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        }

    ]

}, { timestamps: true })

userSchema.pre('save', function (next) {
    if (this.name) {
        // Remove leading/trailing spaces and replace multiple spaces with a single space
        this.name = this.name.trim().replace(/\s+/g, ' ');
    }
    next();
});

userSchema.methods.getJWT = function () {
    const user = this;
    const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, { expiresIn: "1d" });
    return token;

}

userSchema.methods.validatePassword = async function (userInputPassword) {
    const user = this;
    const isValidPassword = await bcrypt.compare(userInputPassword, user.password)
    return isValidPassword;
}

const User = mongoose.model('User', userSchema);

module.exports = User;