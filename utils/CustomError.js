// CustomError.js 
class CustomError extends Error {
    constructor(message, statusCode) {
        super(message); // calling the constructor of the error base class
        this.statusCode = statusCode; // the value received for the status code error parameter
        this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
      
      }
     } module.exports= CustomError;