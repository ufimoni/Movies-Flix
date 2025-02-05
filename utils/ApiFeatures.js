class Apifeauture{
    constructor(query, queryStr){
     //keep it for test
        this.query = query;
        this.queryStr = queryStr;
        this.queryObj = {}; //must be assugned to an empty string it must be defined
        
    }
    filter(){
// copy those commands from the controller
//// to limit the feilds that is sorting only the query strings in the feilds 
// convert query into JSON format
 let query_String = JSON.stringify(this.queryStr);
query_String = query_String.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // for functionality
this.queryObj = JSON.parse(query_String);

this.query = this.query.find()  // if it does not work it will be removed.(queryObj?)

return this; // here we are returning the instance of the API features class.
    }
    sort(){


        /// SORTING
// You Must delete the queryObj first before sorting
// anywhere req.query.sort change to this.queryStr.sort

   // this.query = Movie.find()  // to limit remove anything inside function and uncomment Movie.find() if it crash
   if(this.queryStr.sort) {
       // to sort other query strings.
       const sortBy = this.queryStr.sort.split(',').join(' ');
       console.log(sortBy)  
       this.query = this.query.sort(sortBy);
    }else{
       this.query = this.query.sort('createdAt');
    }
    
    return this;   // return the instance of the  API feature class.
    }
    limitFields(){
// no delete function here
 if (this.queryStr.fields) { 
    const selectFields = this.queryStr.fields.split(',').join(' '); 
    console.log('Selecting fields:', selectFields); // remove this line if any issue
     this.query = this.query.select(selectFields); 
    } 
    else {
 this.query = this.query.select('-__v');

    }
    return this;

    } 
    paginate(){
        
      const  page = this.queryStr.page*1 || 1;
      const limit = this.queryStr.limit*1 || 10; // specify the default value to be 10 this limit will return 5 documents
        const skip = (page-1)*limit;
        this.query = this.query.skip(skip).limit(limit)
        // to handle the page limit.
        // we will settle it later.
        // if(this.queryStr.page){
        //    const moviecount = await Movie.countDocuments(); // add await() here
        //    if(skip > moviecount){
        //        throw new Error("Page Not Found");
        //    }
        // }

        return this;
    }
}
// we want to use this code to different Models on our database.
module.exports = Apifeauture; // import this function in controllers