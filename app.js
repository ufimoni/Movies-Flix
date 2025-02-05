//// Import the express package 
////// create an fs module
/// this is the main file.
/// this file contains all middleware
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const movRoute = require('./Route/moviesRoute');
const authRoute = require('./Route/authRoute');
const CustomError = require('./utils/CustomError');
const globalErrorHandler = require('./controllers/errorcontroller')


 // defining the app to the express.
let app = express(); 
//// Creating a router.  

// Creating a middleware 
const logger = function(req, res, next){
    console.log("Hello the Middleware function is called");
    next();
}
app.use(cors());
///// we use the count: variable,length and also use a middleware = app.use()
app.use(express.json());
app.use (logger)
if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
}
app.use(express.static('./public'))
// here we want to get the time if a request is made
app.use((req, res, next) =>{
    req.reqDate = new Date().toISOString();
    next();
})

    // uisng the routes
  app.use('/api/v1/movies',movRoute)
  app.use('/api/v1/users',authRoute) 

  // the default route always come last.
  app.all('*', (req,res,next)=>{
    // res.status(404).json({
    //     status: 'fail',
    //     meassage: `cant find ${req.originalUrl} on the server.`
    // })
    // to call the next middleware based on the given parameter.
    // const err = new Error(`cant find ${req.originalUrl} on the server.`);
    // err.status = 'fail',
    // err.statusCode = 404;
    const err = new CustomError(`cant find ${req.originalUrl} on the server.`,404);

    next(err);
    // }))
  });
 

  // Global Error Handling
  app.use(globalErrorHandler);
module.exports = app;