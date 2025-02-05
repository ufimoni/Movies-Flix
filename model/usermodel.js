///// Creating a user Model
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')
const { validate } = require('./moviemodel');
const crypto = require('crypto');


/// name, email, password, confirmPassword, photo
const userSchema = new mongoose.Schema({
    // starts with the name
    name: {
        type: String,
        required: [true, 'Please Enter the user name']
    },
    email: {
        type: String,
        required: [true,'Please Enter the Email Again'],
        lowercase: true,
        validate: [validator.isEmail, 'Please Enter a Valid Email']
    },
    photo: String,
    role: {
       type: String,
       enum: ['user','admin'],
       default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please Enter Password which is mixed of different characters'],
        minlength: 8,
        select: false

    },
    confirmPassword: {
        type: String,
        required: [true, 'Please Confirm Password'],
        validate: {
        validator: function(val){
            return val == this.password;  // validating the password.
        },
        message: 'Password and Confirm password does not match!'


        }

    },
    passwordChangedAt: Date,   // this will be used to get the timestamp of the password.
    passwordResetToken: String, /// creating a field which is resetToken for the password 
    passwordResetTokenExpires: Date ////// and also an expired token. when the token expires

})


userSchema.pre('save', async function(next){
if(!this.isModified('password'))
    return next();

//// encrypting the password
this.password = await bcrypt.hash(this.password, 11); // assign it to the password
this.confirmPassword = undefined; //// not to save the confirm password and it's value in the database

next()
})

///// Using a method to handle the two password one from the user and other from the db
userSchema.methods.comparetwoPassword = async function (pswd, pswdDB){
///// return the compare function to check them
return await bcrypt.compare(pswd, pswdDB);

}
///// checking if the user changes the password and verify the token so that deleted user or newly created user with older token cannot acces the db
//// this is an  async because this will runs asynchronously  since the password and token is logged in once.
///// in this function we passed in the timestamp but that of the JWTTimestamp 
userSchema.methods.isPasswordChanged = async function (JWTTimestamp){
if(this.passwordChangedAt){
    const pswdChangeTimestamp = parseInt( this.passwordChangedAt.getTime() / 1000, 10) 
    /* if the JWT is greater than pswdChgTstm then the password has not been changed
    
    */
    console.log(pswdChangeTimestamp,JWTTimestamp);
    return JWTTimestamp < pswdChangeTimestamp; // JWTTstmp(1737088473) < pswdChgTimestmp(1737072000) // this means password was changed when token was issued.
}
return false;
}
userSchema.methods.createResetpasswordToken = function(){
    //// Plain Token
    const resetToken = crypto.randomBytes(32).toString('hex');
 //// Encrypted Token. 
 const encryptedResetToken = this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
 const ExpiredencryptedResetToke = this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000; //// convert it to 10 mins where token expires after every 10 minutes.
 
console.log(resetToken, encryptedResetToken);
 return resetToken;
}
const User = mongoose.model('User',userSchema);

module.exports = User;