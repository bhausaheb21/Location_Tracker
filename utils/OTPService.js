const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

exports.getOtp = () => {
    const otp = Math.round(Math.random() * 900000 + 100000);
    let currentTime = new Date();
    let otp_expiry = new Date(currentTime.getTime() + 30 * 60000);
    return { otp, otp_expiry }
}


exports.sendOTP = async (otp, email) => {
    try {
        const mailConfigurations = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Emai Verification',
            html: `OTP for Verification ${otp}`
        };
        await transporter.sendMail(mailConfigurations, function (error, info) {
            if (error) throw Error(error);
            console.log('Email Sent Successfully');
        });
    } catch (error) {
        console.log(error);
    }
}
