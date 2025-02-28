//// Import the express package 
////// create an fs module
/// this is the main file.
/// this file contains all middleware
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const ratelimit = require('express-rate-limit');
const helmet = require('helmet');
const sanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const movRoute = require('./Route/moviesRoute');
const authRoute = require('./Route/authRoute');
const CustomError = require('./utils/CustomError');
const globalErrorHandler = require('./controllers/errorcontroller');
const userRoute = require('./Route/userRoute');



 // defining the app to the express.
let app = express(); 
//// Creating a router.  
//// Calling the helmet()
app.use(helmet());
app.use(sanitize()); // this will remove all mongodb strings that will want to be injected.

app.use(xss());

// Creating a middleware 
const logger = function(req, res, next){
    console.log("Hello the Middleware function is called");
    next();
}
app.use(cors());
let limiter = ratelimit({
  max: 3,
  WindowMs: 60 * 60 * 1000, // here we are converting it to 1 hour. which is 60 mins in milliseconds
  message: 'Sorry we have recieved so many request from this IP address into our server, Please wait for 1 hour',
});

app.use('/api',limiter);

///// we use the count: variable,length and also use a middleware = app.use()
//// setting the limit of data coming from the api request body.
app.use(express.json({limit: '10kb'}));
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
  app.use('/api/v1/auth',authRoute) 
  app.use('/api/v1/users',userRoute)

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