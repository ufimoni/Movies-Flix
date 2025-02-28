
const User = require('./../model/usermodel') // import the User model
const jwt = require('jsonwebtoken');
const asyncErrorHandler = require('./../utils/asyncErrorHandler')
const CustomError = require('./../utils/CustomError')
const util = require('util');
const { findOne } = require('../model/moviemodel');
const send_Email = require('./../utils/email');
const crypto = require('crypto');
const authController = require('./authController');

exports.getAllusers = asyncErrorHandler( async(req, res, next)=>{
  const users = await User.find();
  res.status(200).json({
    status: 'sucess',
    result: users.length,
    data:{
        users
    }
  })
  next();
}
)



/// Creating the filter fucntion
/// now it receives two parameter obj and allowed feild which is an array,
const filterReqObj = (obj, ...allowedFeilds) =>{
//// now we set an empty object
const newobj = {};
Object.keys(obj).forEach(props =>{
    if(allowedFeilds.includes(props)){
        newobj[props] = obj[props]
    }
})


}


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


 //// Creating a UserDetails function to be updated. or to update user details.
 exports.updateMe = asyncErrorHandler(async (req, res, next) => {
    if (req.body.password || req.body.confirmPassword) {
        return next(new CustomError('You Cannot Update your password using this endpoint..', 400));
    }
    const filterObj = filterReqObj(req.body, 'name', 'email'); // Filter only name and email
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterObj, { runValidators: true, new: true });
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

 //// DELETING USER
 exports.deleteMe = asyncErrorHandler ( async(req, res, next)=>{
    await User.findByIdAndUpdate(req.user._id, {active: false});
    res.status(204).json({
        status: 'success',
        data: null
    })

 })