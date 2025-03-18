const validator = require('validator');

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

const validateSignupData = (req, isUpdate = false, isSeller = false) => {
    const { name, email, password, shopName } = req.body;

    if (!isUpdate) {
        if (!name) {
            throw new Error("Name is required");
        }
        if (!email || !validator.isEmail(email)) {
            throw new Error("Email is not valid");
        }
        if (!password || !validator.isStrongPassword(password)) {
            throw new Error("Enter a strong password");
        }
    }

    if (name && !name.trim()) {
        throw new Error("Name is not valid");
    }

    if (email && !validator.isEmail(email)) {
        throw new Error("Email is not valid");
    }

    if (password && !validator.isStrongPassword(password)) {
        throw new Error("Enter a strong password");
    }

    if (isSeller && shopName && !shopName.trim()) {
        throw new Error("Shop name is required");
    }
};


const validateAddress = (data) => {

    const { name, mobileNumber, pincode, state } = data;
    const mobileRegex = /^[6-9][0-9]{9}$/;
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!name) {
        throw new Error("Name is not valid");
    }
    if (!mobileRegex.test(mobileNumber)) {
        throw new Error("Not a valid number")
    }


    if (!pincodeRegex.test(pincode)) {
        throw new Error("Not a valid pincode")
    }

    if (!statesAndUTsEnum.includes(state)) {
        throw new Error("Enter a India's State")
    }

}

module.exports = { validateSignupData, validateAddress }