const express = require('express');

const supportController = require('../controllers/supportController');

const router = express.Router();

router
   .route('/')
   .get(supportController.getAllSupports)
   .post(supportController.addNewSupport);

router
   .route('/:id')
   .get(supportController.getASupport)
   .delete(supportController.deleteSupport);

module.exports = router;
