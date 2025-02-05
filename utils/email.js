const nodemailer = require('nodemailer');


///// Send the email
const send_Email =  async (option) =>{
    ////1. Create Transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST, // if this was Gmail then the configuration will be different.
        port: process.env.EMAIL_PORT, ///// for the port
        /// Now this is the authentication script
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD

        }
        
    });
    console.log("UserName: ",process.env.EMAIL_USERNAME);
    console.log("Password: ",process.env.EMAIL_PASSWORD);
    
    ///////2. Define Email Options 
    const emailOptions = {
        from: 'BertcodeTech support<support@BertcodeTech.com>',
        to: option.email,
        subject: option.subject,
        text: option.message,
    } /// this is an array
    await transporter.sendMail(emailOptions);
} /// this function is async and await

module.exports = send_Email;