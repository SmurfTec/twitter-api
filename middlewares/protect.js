const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = catchAsync(async (req, res, next) => {
   // 1- get the token check if exist
   //   const token=req.header('Authorization').replace('Bearer ','')
   let token;
   if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
   ) {
      token = req.headers.authorization.split(' ')[1];
   }
   if (!token) {
      return next(new AppError(' you are not login ', 401));
   }
   // 2- validate the token
   const decode = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
   );
   // 3- check user exits
   console.log(`decode`, decode);
   console.log(`decode.id`, decode.id);
   const currentUser = await User.findById(decode.id);
   if (!currentUser) {
      return next(
         new AppError(
            'the user belong to this token does not exists ',
            401
         )
      );
   }
   // 4- check user changed the password and token was issued iat=> issued_at

   // if (currentUser.changePasswordAfter(decode.iat)) {
   //   return next(
   //     new AppError('user recently changed password ! please login again ', 401)
   //   );
   // }

   // grant access to protected route
   req.user = currentUser;
   next();
});
