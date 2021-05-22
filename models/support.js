const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
   user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
   },
   question: {
      type: String,
      required: [true, 'Please enter the comment'],
      trim: true,
   },
   answer: {
      type: String,
      required: [true, 'Please enter the comment'],
      trim: true,
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
});

module.exports = mongoose.model('Support', supportSchema);
