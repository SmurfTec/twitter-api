const express = require('express');
const userController = require('../controllers/userController');
const {protect} = require('../middlewares/protect');
const restrictTo=require('../middlewares/restrictTo')


const router = express.Router();

router.use(protect)
router.use(restrictTo('admin'))

router
    .route('/')
    .get(userController.getUsers)

router
    .route('/:id')
    .delete(userController.deleteUser)

router
    .route('/support')
    .get(userController.getSupport)
    .post(userController.addSupport)

router
    .route('/support/:id')
    .delete(userController.deleteSupport)
module.exports = router;
