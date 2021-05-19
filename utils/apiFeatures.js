class APIFeatures {
    constructor(query, querystring) {   // mongooseQuery and QueryString that is comming from express 
      (this.query = query),
      (this.querystring = querystring);
    }

    filtering() {
      const queryObj = { ...this.querystring }; // create a copy of the query
      const excludeFields = ['page', 'sort', 'limit', 'fields'];     // excluding these from query 
      excludeFields.forEach((e) => delete queryObj[e]);
  
      let querystr = JSON.stringify(queryObj);
      querystr = querystr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // replace gte to &gte 
  
      this.query.find(JSON.parse(querystr));
  
      return this;
    }

    sorting() {
      if (this.querystring.sort) {
        const sort = this.querystring.sort.split(',').join(' ');    // for multiple sorting options
        this.query = this.query.sort(sort);
      } else {
        this.query = this.query.sort('-created_At');     // sort default createdAt 
      }
      return this;
    }

    limiting() {
      if (this.querystring.fields) {
        const field = this.querystring.fields.split(',').join(' '); // for multiple limiting options
        this.query = this.query.select(field);
      } else {
        this.query = this.query.select('-__v'); // exclude this field and show all 
      }
      return this;
    }

    pagination() {
    // page=2&limit=10 => page1=1-10,page2=11-20,page3=21-30
      const page = this.querystring.page * 1 || 1;
      const limit = this.querystring.limit * 1 || 100;
      const skip = (page - 1) * limit;
  
      this.query = this.query.skip(skip).limit(limit);
  
      return this;
    }
}

module.exports =APIFeatures