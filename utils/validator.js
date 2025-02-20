const validator = require('validator');

const validateSignupData = (req, isSeller = false) => {
    const { name, email, password,shopName } = req.body;
    if (!name) {
        throw new Error("Name is not valid");
    }
    if (!email || !validator.isEmail(email)) {
        throw new Error("Email is not valid");
    }

    if (!password || !validator.isStrongPassword(password)) {
        throw new Error("Enter a strong password");
    }
    if (isSeller && !shopName ) {
        throw new Error("Shop name is required")
    }
}

module.exports = { validateSignupData }