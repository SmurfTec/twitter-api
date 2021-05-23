const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
   user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
   },
   status: {
      type: String,
      default: 'NOT Answered',
   },
   question: {
      type: String,
      required: [true, 'Please enter the question !'],
      trim: true,
   },
   answer: {
      type: String,
      trim: true,
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
});

supportSchema.pre(/^find/, function (next) {
   this.sort('-createdAt');
   next();
});

module.exports = mongoose.model('Support', supportSchema);
