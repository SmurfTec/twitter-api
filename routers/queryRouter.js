const express = require('express');

const { protect } = require('../middlewares/protect');
const queryController = require('../controllers/queryController');

const router = express.Router();

router.use(protect);

router
   .route('/')
   .get(queryController.getAllQueries)
   .post(queryController.addNewQuery);

router
   .route('/:id')
   .get(queryController.getAQuery)
   .patch(queryController.answerQuery)
   .delete(queryController.deleteQuery);

module.exports = router;
