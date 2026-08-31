const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true,
            trim: true
        },
        email:{
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },
        password:{
            type: String,
            required: true,
            minlength: 6,
            select: false
        },
        role:{
            type: String,
            enum: ['recruiter'],
            default: 'recruiter'
        },   
    },
    {
        timestamps: true
    }
);  

// Hash the password before saving the user
userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }

    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare the candidate password with the hashed password
userSchema.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove the password field when returning the user object
userSchema.methods.toJSON = function(){
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

module.exports = mongoose.model('User', userSchema);