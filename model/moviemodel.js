const mongoose = require('mongoose');
const fs = require('fs');
const validator = require('validator');
const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'The Name field is required'],
        unique: true,
        maxlength: [100, 'Maximum Length should be less than 100'],
        minlength: [4, 'Minimum lenght should be more than 4 characters'],
        trim: true
    },
    description:{
        type: String,
        required: [true, 'The description feild field is required'],
        unique: true,
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'Duration field is required']
    },
    ratings: {
        type: Number,
        required: [true, 'Ratings Feild is required'],
        // Built-in-validators
        // min: [1.0,"The Minimum ratings should be more than 1.0"],
        // max: [10.0, "The Maximum ratings should be less than 10.0"]

        // Custom Validators
         validate: function(value) {
            return value >=1 && value <= 10;
         }
    },
    totalRating: {
        type: Number
    },
    releaseYear: {
        type: Number,
        required: [true, 'Release Year Required ']
    },
    releaseDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    genres: {
        type: [String],
        required: [true,'Genres is required'],
        // enum:  {
        //       value: ["Action","Adventure","Sci-Fi","Thriller","Crime","Drama","Comedy","Romance","Biography"],
        //       message: "The Genre does not exist"            
        // } 
    },
    directors: {
        type: [String],
        required: [true, 'Directors Feild Required']
    },
    coverImages: {
        type: String,
        required: [true, 'cover Image Required']
    },
    actors: {
        type: [String],
        required: [true, 'actors field Required']
    },
    price: {
        type: Number,
        required: [true, 'price Feild Requird']
    },
    createdBy: String

},
{
    toJSON :{virtuals: true},
    toObject :{virtuals: true}

});
/////// VIRTUAL PROPERTIES.

//// dont use arrow function use the normal function
movieSchema.virtual('durationInHours').get(function(){
    return this.duration / 60;
})

///DOCUMENT MIDDLEWARE.
/// Executed before documents is saved in database

movieSchema.pre('save',function(next){
this.createdBy = 'Bertcode.py'/// to display the document created and save it.
next();
})

// a post hook to display the user who added a document to the database.
movieSchema.post('save',function(doc,next){
    const content = `A New Document: ${doc.name} has been created by ${doc.createdBy}`
    fs.writeFileSync('./log/log.txt', content, {flag: 'a'},(err)=>{
        console.log(err.message);
    })
    next();
})  

// want to display past and present movies.not future movies
movieSchema.pre(/^find/,function(next){             //////// use this /^find/ for all find() either findone or findMany
    this.find({releaseDate: {$lte: Date.now()}});
    next(); // to call the next middleware or stark.
})

movieSchema.pre(/^find/,function(next){
    this.find({releaseDate: {$lte: Date.now()}})
     this.startTime = Date.now()
     next();
})
movieSchema.post(/^find/,function(docs, next){
    this.find({releaseDate: {$lte: Date.now()}})
    this.endTime = Date.now();
// this content will get the time taken.
     const content = `Query took ${this.endTime - this.startTime}milliseconds to get the documents from db.`;
     fs.writeFileSync('./log/log.txt',content,{flag: 'a'},(err)=>{
        console.log(err.message);
     })   
next(); 
})


///// AGGREGATE MIDDLWARE
movieSchema.pre('aggregate',function(next){
    console.log(this.pipeline().unshift({$match: {releaseDate: {$lte: new Date()}}}));
    next();
})

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
