const dotenv = require('dotenv');
dotenv.config({path: './config.env'})

const mongoose = require('mongoose')

process.on('uncaughtException', (err)=>{ // this code should always be at the top.
    console.log(err.name, err.message);
    console.log("Uncaught Exceptions has Occured!! App is Shutting down...");
// close the server
       process.exit(1);
    
})


// this is always below.
const app = require('./app1');
//// CONNECTING MONGODB 
mongoose.connect(process.env.conn_str, {
// useNewUrlParser: true. this is used for older versions of nodejs.
}).then((conn) =>{
    //console.log(conn);
    console.log("Database Connected Successfully..");


})

const PORT = process.env.PORT || 4000;
// app.listen(PORT,()=>{....}) will be assign to a variable
 const server = app.listen(PORT, ()=>{
  
    console.log("Running on port: 4000");
})


////// These Error Handlers are Optional
//// Handling Rejected Promises Globally in our code.
process.on('unhandledRejection', (err)=>{
    console.log(err.name, err.message);
    console.log("Unhandled rejection has Occured!! App is Shutting down...");
// close the server
     server.close(()=>{
        process.exit(1);
     })   
})
