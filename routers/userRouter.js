const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const {protect} = require('../middlewares/protect');
const restrictTo=require('../middlewares/restrictTo')

const router = express.Router();

router.post('/signUp', authController.signup);
router.post('/login', authController.login);
// router.post('/logout', authController.logout);

router.route('/confirmMail/:activationLink').get(authController.confirmMail);

// router.route('/forgotPassword').post(authController.forgotPassword);
// router.route('/resetPassword/:resetToken').post(authController.resetPassword);
// router.patch('/updatePassword', protect, authController.updatePassword);

router.use(protect)

router.route("/me").get(authController.me);

router.route("/").get(userController.getUsers);
router.route("/feed").get(userController.feed);
router.route("/").patch(restrictTo('user'),userController.updateUser);
router.route("/:username").get(userController.getUser);
router.route("/:id/follow").get(userController.follow);
router.route("/:id/unfollow").get(userController.unfollow);

module.exports = router;
