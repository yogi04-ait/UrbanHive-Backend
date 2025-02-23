const mongoose = require('mongoose');
const User = require('./user')
const statesAndUTsEnum = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
    "West Bengal", "Andaman and Nicobar Islands",
    "Dadra and Nagar Haveli and Daman and Diu", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Delhi", "Puducherry"
];

const addressSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    name: {
        type: String,
        trim: true,
        required: true,
        minLength: 3,
        maxLength: 50
    },
    mobileNumber: {
        type: String,
        required: true,
    },
    pincode: {
        type: String,
        required: true,
    },
    line1: {
        type: String,
        required: true,
        trim: true,
    },
    line2: {
        type: String,
        trim: true,
        required: true,
    },
    landmark: {
        type: String,
        trim: true,
    },
    city: {
        type: String,
        trim: true,
        required: true,
    },
    state: {
        type: String,
        enum: statesAndUTsEnum,
        required: true,
    }
},{timestamps:true})

const Address = mongoose.model("Address", addressSchema);
module.exports = Address