/* 
this file is for all authentication and how the logic are been handled.

every authentication and security takes place here
*/
const User = require('./../model/usermodel') // import the User model
const jwt = require('jsonwebtoken')
const asyncErrorHandler = require('./../utils/asyncErrorHandler')
const CustomError = require('./../utils/CustomError')
const util = require('util');
const { findOne } = require('../model/moviemodel');
const send_Email = require('./../utils/email');
const crypto = require('crypto');
/// Creating a Reusable function for the token. or reuse token
const signToken = id =>{
    return jwt.sign({id}, process.env.SECRET_STR,{
        expiresIn:  process.env.Login_Expires // for the expiring time
      })
}



// creating a post signup function
/// creatiing a user adding asyncErrorHandler func.
exports.signup = asyncErrorHandler ( async (req, res, next)=>{
//// creating a new user
const _newUser = await User.create(req.body);
const token = signToken(_newUser._id)
console.log(req.body)
res.status(201).json({
    status: 'sucess',
    token,
    data: {
        user: _newUser
    }
})
    
});

/// for login
exports.login = asyncErrorHandler ( async (req, res, next)=>{
const email = req.body.email;
const password = req.body.password;
// using destructuring syntax
// const {email, password} = req.body
//// return error the token is incorrect
if(!email || !password){
const error = new CustomError('Please Enter the Email ID and Password again to Login!', 400) // require from utils
return next(error);


}

//// checking if the user exist with given email
const user = await User.findOne({email: email}).select('+password');

// const Ismatch = await user.comparetwoPassword(password, user.password) // compare both database password and user's password
//// should incase the findOne returns an empty strings in some scenarios
///// checks if user and password matches
if(!user || !(await user.comparetwoPassword(password, user.password))){
const error = new CustomError('Please enter the password and email correctly ',400);
return next(error);
}

const token = signToken(user._id)
res.status(200).json({
    status: 'sucess',
    token: token,
    user
  

})

})

////// Putting Security.

exports.protect = asyncErrorHandler(async (req, res, next)=>{
    // 1.  Read the token and check it if it exists
    // / check the authorization and read it's value in which it returns an array
    const testToken = req.headers.authorization
    let token;
    if(testToken && testToken.startsWith('Bearer')){
    token = testToken.split(' ')[1];
    }
   else if(!token){
    next(new CustomError('You have been unable to logged in', 401))
   }
   // 2. Validate the token
    //// here we will check the token
/* the main code here is the jwt.verify(token, secrete_String) this is how we validate the token
promisify converts it into a promise
    */
   const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STR);
  console.log(decodedToken);

  // 3. if the user exist

  /* so if the user still exist in the databse we check it along with the token gotten from the database.*/
  const user = await User.findById(decodedToken.id); // each
 if(!user){
    const error = new CustomError('The User with this token does not exist',401);
    next(error);
 }

 // 4. if the user changed Password after the token was issued. 
 /* this code shows that if password was changed when the user's token was given*/
 const ChangedPassword = await user.isPasswordChanged(decodedToken.iat)
if (ChangedPassword){
 const error = new CustomError('Password Expired: The Password has been changed recently. please Login again',401);
 next(error);

}

//// 5. Allow user to access the routes.
req.user = user;

  next();
})

//// TO RESTRICT USERS.
//// creates a wrapper function
exports.restrict = (role)=>{
    /// we return a middleware function
    return (req, res, next)=>{
        if(req.user.role !== role){
            const error = new CustomError(`Sorry you don't have the permission to perform this action `,403);
            next(error);
        }
        next();
    }
}

// /// creates a Multiple roles for multiple users in the application.
// exports.restrict = (...role)=>{
//     /// we return a middleware function
//     return (req, res, next)=>{
//         if(!role.includes(req.user.role)){
//             const error = new CustomError(`Sorry you don't have the permission to perform this action `,403);
//             next(error);
//         }
//         next();
//     }
// }


/// Password and Reset Functionality
///// For the forgot password
exports.forgotpassword = asyncErrorHandler ( async (req, res, next)=>{
    ////1. GET THE USER BASED ON POSTED EMAIL
    const user = await User.findOne({email: req.body.email})
    //// Now to check if the user exists in the database.
    if(!user){
        const error = new CustomError("Sorry we could'nt find this user with this email on the server ",404);
        next (error);
    }

    ////2. GENERATE A RANDOM RESET TOKEN
   const plainResetToken =  user.createResetpasswordToken(); /// save in in a variable
   await user.save({validateBeforeSave: false});


   ////3. Send the Token Back to the user
   const resetUrl = `${req.protocol}: // ${req.get('host')}/api/v1/users/ResetPassword/${plainResetToken}`;
   const message = `We have recieved a password reset request, Please click the below button to reset again\n\n${resetUrl}\n\n This reset Password Link will be available only for 10 minutes`;

   ///// Using the try and catch block.
   try{
    await send_Email({
        email: user.email,
        subject: 'Password Changed request recievd',
        message: message

    })
    console.log('Password reset email sent to:', user.email);
    res.status(200).json({
        status: 'success',
        message: 'Password reset linked sent!!!'
    })
    
   }catch(err){
     user.passwordResetToken = undefined;
     user.passwordResetTokenExpires = undefined;
     user.save({
        validateBeforeSave: false
     });
      console.log(err)
     return next( new CustomError('There was an Error sending the password reset email, try again! ',500));
   }
});

///// For the Reset Password
exports.Resetpassword = asyncErrorHandler( async (req, res, next)=>{
//////1. checking if the user exist with the given reset token and Token has not expired.
 ///// encryprting the token fromt the client. and passwordRestToken is saved in the db. 
 ///// here we are using the crypto.createHash Algorithm and update to enncrypt and digest to convert it to hexadecimal.
 const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
    //// here we are checking if the token mathces the one in the database.
    const user = await User.findOne({passwordResetToken: token, 
        passwordResetTokenExpires: {$gt: Date.now()}});
     if(!user){
      const error = new CustomError("Invalid Token or it has expired",400);
      next(error); /// calling he next middleware on the server.

     }
     //// Left hand side is the database and the right hand side is the client request parameters
     ///// 2. RESETTING THE USER'S PASSWORD
     user.password = req.body.password;
     user.confirmPassword = req.body.confirmPassword;
     user.passwordResetToken = undefined;
     user.passwordResetTokenExpires = undefined;

     user.save(); /// we save what we have newly created for the user.


////// 3. LOGIN THE USER AUTOMATICALLY
const logtoken = signToken(user._id)
res.status(200).json({
    status: 'sucess',
    token: logtoken
})
console.log("This is the token: "+logtoken);
})

