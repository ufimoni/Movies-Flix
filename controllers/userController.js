
const User = require('./../model/usermodel') // import the User model
const jwt = require('jsonwebtoken');
const asyncErrorHandler = require('./../utils/asyncErrorHandler')
const CustomError = require('./../utils/CustomError')
const util = require('util');
const { findOne } = require('../model/moviemodel');
const send_Email = require('./../utils/email');
const crypto = require('crypto');

const signToken = id =>{
    const token = jwt.sign({id}, process.env.SECRET_STR,{
        expiresIn:  process.env.Login_Expires // for the expiring time
      })
      console.log("Generated Token: ",token)
      return token;
}


//// CREATING A REUSABLE FUNCTION.
const createSendResponse = (user, statusCode, res) =>{
    const token = signToken(user._id);
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.updatePassword = asyncErrorHandler( async (req, res, next)=>{
    ///// GET CURRENT USER FROM THE DATABASE.
    ///1. call the protected middleware before calling the update password.
     const user = await User.findById(req.user._id).select('+password');
     
     //// CHECK IF THE SUPPLIED CURRENT PASSWORD IS CORRECT
     if(!(await user.comparetwoPassword(req.body.currentPassword, user.password))){
         return next(new CustomError('The current password entered is incorrect',401));
     }
     //// IF SUPPLIED PASSWORD IS CORRECT, UPDATE USER.
     user.password = req.body.password;
     user.confirmPassword = req.body.confirmPassword;
 
     await user.save();
     ///// LOGUN THE USER AND SEND JWT
     
     createSendResponse(user, 200, res);
     
 })