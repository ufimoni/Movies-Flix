
const { query } = require('express');
const  { param }  = require('../Route/moviesRoute');
const Movie = require('./../model/moviemodel');
const { unlock } = require('../app1');
const Apifeauture = require('./../utils/ApiFeatures');
const asyncErrorHandler = require('./../utils/asyncErrorHandler');
const CustomError = require('../utils/CustomError');

// creating a middleware for the aliasing of routes.
exports.gethighesrated = (req, res, next)=>{
req.query.limit= '5',
req.query.sort = '-ratings'
//always use the next() to call the next middleware
next();

}

exports.getAllmovies =  asyncErrorHandler(  async (req, res, next)=>{
 
    // this will return the instances of all those class.
  const feautures = new Apifeauture(Movie.find(), req.query)
  .filter().sort().limitFields().paginate();
 
//// to limit the feilds that is sorting only the query strings in the feilds 
// const { sort, fields, limit, page } = req.query; // uncomment if commented else do reverse
// // convert query into JSON format
// let queryStr = JSON.stringify(req.query);
// queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // for functionality
// let queryObj = JSON.parse(queryStr)
/// do not delete the above codes from const features to the let queryObj


/// SORTING
// // You Must delete the queryObj first before sorting
// if(req.query.sort){
//  delete queryObj.sort;
// }
// let query = Movie.find()  // to limit remove anything inside function
// if(req.query.sort) {
//     // to sort other query strings.
//     const sortBy = req.query.sort.split(',').join(' ');
//     console.log(sortBy)  
//     query = query.sort(sortBy);
//  }else{
//     query=query.sort('createdAt');
//  }
 

///// LIMITING FIELDS


// if(fields){
//     delete queryObj.fields;
// }
//  if (fields) { 
//     const selectFields = fields.split(',').join(' '); 
//     console.log('Selecting fields:', selectFields);
//      query = query.select(selectFields); 
//     } 
//     else {
//   query = query.select('-__v');

//     } // Keep this code
 ////PAGINATION.....
 
    // npage = page*1 || 1;
    // nlimit = limit*1 || 10; // specify the default value to be 10
    // const skip = (npage-1)*limit;
    // query = query.skip(skip).limit(nlimit)
    // // to handle the page limit.
    // if(page){
    //    const moviecount = await Movie.countDocuments(); // add await() here
    //    if(skip > moviecount){
    //        throw new Error("Page Not Found");
    //    }
    // }
/// do not delete




let movies = await feautures.query;

res.status(200).json({
    status: 'success',
    length: movies.length,
    data: {
        movies
    }

})

    
}); // end of getAllmovies
// get request by ID. and ir should be converted into a middleware
exports.getmovie =  asyncErrorHandler(  async (req, res,next) =>{

        const movie = await Movie.findById(req.params.id);
        if(!movie){
            const error = new CustomError('Movie with this ID is not found',404);
          return next(error); // must be returned
        }
     
        res.status(200).json({
           status: 'success',
           data: {
               movie
           }
       
       })

   }
)
  
// post request
exports.createMovie = asyncErrorHandler(async(req, res) =>{

        console.log(req.body);
        const movie = await Movie.create(req.body);
        res.status(201).json({
            status: 'sucess',
            data: {
                movie
            }
        })
    
    
    }
) 
// patch request
// convert to middle-ware. r
exports.updatemovie = asyncErrorHandler(    async (req, res, next) =>{
        
        const updatedMovie = await Movie.findByIdAndUpdate(req.params.id,req.body,{new: true, runValidators: true})
        if(!updatedMovie){
            const error = new CustomError('Movie with that ID is not found on this server',404);
            return next(error);
        }
        res.status(202).json({
         status: "success",
         data: {
            movie: updatedMovie
         }
        })  
             
             
         }
)
    // delete request
 exports.deletemovie = asyncErrorHandler(   async (req, res, next) =>{
    

     const deletedMovie =  await Movie.findByIdAndDelete(req.params.id);
      if(!deletedMovie){
        const error = new CustomError('Movie with that ID:${req.params.id}is not found on this server',404)
        return next()
      }

        res.status(201).json({
         status: "success",
         data: null
        })
     
     
     }
 ) 
/// AGGREGATIONS USING A PIPELINE TO AGGREGRATE THEM
////  

exports.getMovieStats =  asyncErrorHandler(   async (req, res)=>{
  
        const stats = await Movie.aggregate([
           {
           $match: {ratings: {$gte: 2.5}}
           
        }, // first group
        { $match: {releaseDate: {$lte: new Date()}}},// second group // will not be displayed until future use.
   
       {
          $group: {
          _id: '$releaseYear',
          average_Ratings: {$avg: '$ratings'}, // calculate the average ratings
          average_Price: {$avg: '$price'}, // calculate the average price.
          Minimum_Price: {$min: '$price'}, // calculate the Minimum Price.
          Maximum_Price: {$max: '$price'}, // calculate the Maximum price
          Total_Price_Of_Movies: {$sum: '$price'},// to calculate the sum or total price.
          Movie_Count: {$sum: 1}// this will add the number of fields or documents from the database in which these operations happen.
   
   
   
          }
       },// third group
   { 
       $sort: {Minimum_Price: 1} // a feild must be taken from the second group
   },// fourth group
   //
   {$match: {Maximum_Price: {$gte: 60}}} //fifth group 
   
       ])
   
        res.status(200).json({
           status: 'success',
           data : {
               stats
           }
        })
   }

  ) 
// to get data by a specific feild on each of the database and how they appears to be.
exports.getMovieByGenre =  asyncErrorHandler( async (req, res) =>{
   
        const genre = req.params.genre;
       const moviegen = await Movie.aggregate([
               {$unwind: '$genres'},// first stage destructure them
               {$group: {
                   _id: '$genres',
                   Movie_Count: {$sum: 1},
                   movies: {$push: '$name'}
               }}, //second stage group the feilds into one.
   
               {$addFields: {genre: "$_id"}}, // third stage add the genre feild
               {$project: {_id: 0}}, // fourth stage remove the feild we don't want to be displayed
               {$sort: {Movie_Count: -1}}// fifth stage to be displayed in descending order
       ]);
   
           res.status(200).json({
               status: 'success',
               count: moviegen.length, 
               data: {
                   moviegen
               }
           })
      
   }
 ) 
////// Change this to Restau or resouces in the database.