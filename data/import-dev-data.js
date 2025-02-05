const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Movie = require('./../model/moviemodel'); ///Check the file path again if Error is found in the code.


dotenv.config({path: './config.env'})

 ///// CONNECT TO MONGDB
 mongoose.connect(process.env.conn_str, {
    // useNewUrlParser: true. this is used for older versions of nodejs.
    }).then((conn) =>{
        //console.log(conn);
        console.log("Database Connected Successfully..");
    }).catch((error) =>{
    console.log("Error has Occured")
    })

    const movies = JSON.parse(fs.readFileSync('./data/cust1.json','utf-8'));

    ///// DELETE EXISTING DOCUMENTS.
const deleteMovie = async () =>{
    try{
     await Movie.deleteMany(); // no code should be inside .
    console.log('Data has been deleted successful')

    }catch(err){
     console.log(err.message);
    }
    process.exit();
}
const ImportMovies = async () =>{
 try{
  await Movie.create(movies);
  console.log('Data has been Imported Successful')
 }catch(err){
    console.log(err.message);
 }
 process.exit();
}
// deleteMovie();
// ImportMovies();
console.log(process.argv);
if(process.argv[2] === '--import'){
    ImportMovies();
}
 if(process.argv[2] === '--delete'){
    deleteMovie();
} 