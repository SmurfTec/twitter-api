const AppError = require('../utils/appError');

// apply restricting to specific members
module.exports = (...role) => {
   //  roles is an array like ['admin','lead-guide'] using res-parameter syntax
   return (req, res, next) => {
      console.log(role);
      const userRole = req.user.role;

      if (!role.includes(userRole)) {
         console.log(role);
         return next(
            new AppError(
               ' you do not have permission to perform this action',
               403
            )
         );
      }

      next();
   };
};
