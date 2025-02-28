/// This file is for all authentications for users admin and all stakeholders in our application

const express = require('express');
const aunthController = require('./../controllers/authController')


const router = express.Router();


router.route('/signup')
      .post(aunthController.signup)


router.route('/login')
      .post(aunthController.login)

router.route('/forgotpassword')
       .post(aunthController.forgotpassword)

router.route('/ResetPassword/:token')
       .patch(aunthController.Resetpassword)

router.route('/updatePassword')
      .patch(aunthController.protect, aunthController.updatePassword)

module.exports = router;
