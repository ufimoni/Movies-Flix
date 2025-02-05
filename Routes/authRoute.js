/// This file is for all authentications for users admin and all stakeholders in our application

const express = require('express');
const aunthController = require('./../controllers/authController') /// check the require incase of any error.


const router = express.Router();


router.route('/signup')
      .post(aunthController.signup)


router.route('/login')
      .post(aunthController.login)

router.route('/forgotpassword')
       .post(aunthController.forgotpassword)

router.route('/ResetPassword/:token')
       .patch(aunthController.Resetpassword)

module.exports = router;
