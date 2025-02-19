const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minLength:3,
        maxLength:50

    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    password:{
        password:true,
        required:true,
    },
    wishlist:{
        type:Array,
    },
    
},{timestamps:true})

userSchema.pre('save', function (next) {
    if (this.name) {
        // Remove leading/trailing spaces and replace multiple spaces with a single space
        this.name = this.name.trim().replace(/\s+/g, ' ');
    }
    next();
});



const User = mongoose.model('User', userSchema);

module.exports = User;