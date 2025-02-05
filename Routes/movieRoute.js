
const express = require('express');

const movcontrol = require('./../controllers/movieController');

const authcontrol = require('./../controllers/authController');

const router = express.Router();

// to get the status.
router.route('/movies-stats')
            .get( movcontrol.getMovieStats);

//// to get the genre
router.route('/movies-genre/:genres')
        .get(movcontrol.getMovieByGenre);
// to destructor code and get the spicified feild. 
//router.route('/Movies/Actors').get(movcontrol.getMovieByGenre);

// params middleware
//router.param('id',movcontrol.checkID);
/* router.param('id',(req, res, next, value) =>{
    console.log("Movie ID is :" +value);  // value stores the id
    next();
})*/
 /// uing the middleware to handle the aliasing of the route
 router.route('/highest-rated')
        .get(movcontrol.gethighesrated, movcontrol.getAllmovies);

router.route('/')  // app.route('/api/v1/movies') was change.
    .get(authcontrol.protect, movcontrol.getAllmovies)
    .post(movcontrol.createMovie);
 
router.route('/:id')     // app.route('/api/v1/movies/:id')
   .get(authcontrol.protect,movcontrol.getmovie)
   .patch(movcontrol.updatemovie)
   .delete(authcontrol.protect,authcontrol.restrict('admin','test1'),movcontrol.deletemovie)


module.exports = router;
