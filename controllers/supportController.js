const Support = require('../models/support');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllSupports = catchAsync(async (req, res, next) => {
   const supports = await Support.find();

   res.status(200).json({
      status: 'success',
      results: supports.length,
      supports,
   });
});

exports.addNewSupport = catchAsync(async (req, res, next) => {
   const newSupport = await Support.create(req.body);

   res.status(201).json({
      status: 'success',
      newSupport,
   });
});

exports.getASupport = catchAsync(async (req, res, next) => {
   const { id } = req.params;

   if (!id) return next(new AppError('Invalid id ', 400));

   const support = await Support.findById(id);

   if (!support)
      return next(
         new AppError(`No Support found against id ${id}`, 404)
      );

   res.status(200).json({
      status: 'success',
      support,
   });
});

exports.deleteSupport = catchAsync(async (req, res, next) => {
   const { id } = req.params;

   if (!id) return next(new AppError('Invalid Id', 400));

   const deletedSupport = await Support.findByIdAndDelete(id);

   if (!deletedSupport)
      return next(
         new AppError(`Error deleting Support with id ${id}`),
         500
      );

   res.status(200).json({
      status: 'success',
      deletedSupport,
   });
});
