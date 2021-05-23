const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
   email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
   },
   password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
   },
   passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
         // This only works on CREATE and SAVE!!!
         validator: function (el) {
            return el === this.password;
         },
         message: 'Passwords are not the same!',
      },
   },
   username: {
      type: String,
      required: [true, 'Please enter your username'],
      trim: true,
      index: true,
      unique: true,
      sparse: true,
   },
   role: {
      type: String,
      enum: ['admin', 'support', 'user'],
      default: 'user',
   },
   activationLink: {
      type: String,
   },
   passwordResetToken: String,
   passwordResetExpires: Date,
   activated: {
      type: Boolean,
      default: false,
   },

   // profile

   avatar: {
      type: String,
      default: `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQPrvDwVG49SBYvvDQI0IqEFnuPr-iMGT7UA&usqp=CAU`,
   },
   bio: String,
   website: String,
   followers: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
   followersCount: {
      type: Number,
      default: 0,
   },
   followingCount: {
      type: Number,
      default: 0,
   },
   following: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
   posts: [{ type: mongoose.Schema.ObjectId, ref: 'Post' }],
   postCount: {
      type: Number,
      default: 0,
   },
   savedPosts: [{ type: mongoose.Schema.ObjectId, ref: 'Post' }],
   createdAt: {
      type: Date,
      default: Date.now,
   },
});

userSchema.pre(/^find/, function (next) {
   this.populate({
      path: 'posts',
   });
   next();
});

// Encrpt the password ad Presave it
userSchema.pre('save', async function (next) {
   if (!this.isModified('password')) {
      //  only run if password is modified
      return next();
   }
   this.password = await bcrypt.hash(this.password, 12); // hashing password
   this.passwordConfirm = undefined; // delete passwordConfirm field
   next();
});

userSchema.methods.createAccountActivationLink = function () {
   const activationToken = crypto.randomBytes(32).toString('hex');
   // console.log(activationToken);
   this.activationLink = crypto
      .createHash('sha256')
      .update(activationToken)
      .digest('hex');
   // console.log({ activationToken }, this.activationLink);
   return activationToken;
};

// comparing password
userSchema.methods.correctPassword = async function (
   candidate_Password,
   user_Password
) {
   console.log(candidate_Password);
   return await bcrypt.compare(candidate_Password, user_Password);
};

userSchema.methods.createPasswordResetToken = function () {
   const resetToken = crypto.randomBytes(32).toString('hex');

   console.log(resetToken);

   this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

   // console.log({ resetToken }, this.passwordResetToken);
   this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
   return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
