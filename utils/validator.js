const validator = require('validator');

const validateSignupData = (req) => {
    const { name, email, password } = req.body;
    if (!name) {
        throw new Error("Name is not valid");
    }
    if (!email || !validator.isEmail(email)) {
        throw new Error("Email is not valid");
    }

    if (!password || !validator.isStrongPassword(password)) {
        throw new Error("Enter a strong password");
    }
}

module.exports = { validateSignupData }