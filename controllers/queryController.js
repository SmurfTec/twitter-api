const Query = require('../models/query');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllQueries = catchAsync(async (req, res, next) => {
   const queries = await Query.find();

   res.status(200).json({
      status: 'success',
      results: queries.length,
      queries,
   });
});

exports.answerQuery = catchAsync(async (req, res, next) => {
   const { id } = req.params;
   const { answer } = req.body;

   if (!id) return next(new AppError('Invalid id ', 400));

   if (!answer)
      return next(new AppError('Provide Answer with Request', 400));

   const query = await Query.findById(id);

   if (!query)
      return next(
         new AppError(`No Query found against id ${id}`, 404)
      );

   console.log(`query`, query);
   console.log(`answer`, answer);

   query.answer = answer;
   query.status = 'Answered';
   await query.save();

   res.status(200).json({
      status: 'success',
      query,
   });
});

exports.addNewQuery = catchAsync(async (req, res, next) => {
   const { question } = req.body;

   if (!question)
      return next(new AppError('Provide Question with query', 400));

   const newQuery = await Query.create({
      user: req.user._id,
      question,
   });

   res.status(201).json({
      status: 'success',
      newQuery,
   });
});

exports.getAQuery = catchAsync(async (req, res, next) => {
   const { id } = req.params;

   if (!id) return next(new AppError('Invalid id ', 400));

   const query = await Query.findById(id);

   if (!query)
      return next(
         new AppError(`No Query found against id ${id}`, 404)
      );

   res.status(200).json({
      status: 'success',
      query,
   });
});

exports.deleteQuery = catchAsync(async (req, res, next) => {
   const { id } = req.params;

   if (!id) return next(new AppError('Invalid Id', 400));

   const deletedQuery = await Query.findByIdAndDelete(id);

   if (!deletedQuery)
      return next(
         new AppError(`Error deleting Query with id ${id}`),
         500
      );

   res.status(200).json({
      status: 'success',
      deletedQuery,
   });
});
