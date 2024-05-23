const jwt = require("jsonwebtoken");


const User = require("../Models/User");
// const { sendOTP, getOtp } = require("../utils/OTPService");
const { encryptPass, getSalt, getToken } = require("../utils/AuthUtils");
const { getOtp, sendOTP } = require("../utils/OTPService");



class AuthController {
    static async signup(req, res, next) {
        try {
            const { email, name, password } = req.body;

            const exisitingUser = await User.findOne({ email: email })

            if (exisitingUser) {
                const error = new Error("Existing Account Associated with Email")
                error.status = 422;
                throw error;
            }
            const salt = await getSalt();
            const hashedpass = await encryptPass(password, salt)
            const { otp, otp_expiry } = getOtp();
            await sendOTP(otp, email)

            const user = new User({
                email,
                salt,
                name,
                password: hashedpass,
                otp: otp,
                otp_expiry: otp_expiry,
                verified: false,
            });

            const saveuser = await user.save();

            const payload = {
                id: saveuser._id,
                email: saveuser.email,
                name: saveuser.name,
                verified: saveuser.verified
            }

            const token = getToken(payload);
            return res.json({
                message: "SignUp Successful",
                token,
                verified: saveuser.verified,
                name: user.name
            })

        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    static async verify(req, res, next) {
        try {
            const id = req.user.id;
            const { otp } = req.body;
            const user = await User.findById(id);
            if (parseInt(otp) === parseInt(user.otp) && new Date() <= user.otp_expiry) {
                user.verified = true;
                const finaluser = await user.save();
                const payload = {
                    id: finaluser._id,
                    email: finaluser.email,
                    name: finaluser.firstname,
                    verified: finaluser.verified
                }
                await user.save();

                const token = getToken(payload);
                return res.status(200).json({
                    message: "Verification Successful",
                    token,
                    verified: finaluser.verified,
                    name: user.name
                })
            }
            const error = new Error("Invalid OTP")
            error.status = 422;
            throw error;
        } catch (error) {
            console.log(error);
            next(error)
        }
    }

    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email: email });

            if (!user) {
                const error = new Error("Invalid Email")
                error.status = 422;
                throw error;
            }
            if (!user.verified) {
                const error = new Error("Not Verified")
                error.status = 401;
                throw error;
            }

            const match = (await encryptPass(password, user.salt)).toString() === user.password.toString();
            if (!match) {
                const error = new Error("Invalid Password");
                error.status = 422;
                throw error;
            }
            const payload = {
                id: user._id,
                email: user.email,
                verified: user.verified,
                name: user.name
            }
            const token = getToken(payload);
            return res.status(200).json({ message: "Login Successful", token, verified: user.verified, name: user.name })

        } catch (error) {
            next(error)
        }
    }

    static async ResetPassword(req, res, next) {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email: email });

            if (!user) {
                const error = new Error("Invalid Email");
                error.status = 404;
                throw error;
            }
            const { otp, otp_expiry } = getOtp()
            user.otp = otp;
            user.otp_expiry = otp_expiry;
            await sendOTP(user.otp, email);
            await user.save();

            const token = jwt.sign({ email }, 'Reset', { expiresIn: '30m' })

            return res.status(200).json({ message: "OTP sent Successfully", token });

        } catch (error) {
            next(error)
        }
    }

    static async Savepassword(req, res, next) {
        try {
            const { password, cpassword, otp } = req.body;
            const email = req.email;

            const user = await User.findOne({ email: email });

            if (cpassword !== password) {
                const error = new Error("Password and Confirm Passwords are Different");
                error.status = 422;
                throw error;
            }
            if (otp !== user.otp) {
                const error = new Error("Invalid OTP");
                error.status = 422;
                throw error;
            }
            if (Date.now() > user.otp_expiry) {
                const error = new Error("OTP Expired");
                error.status = 410;
                throw error;
            }
            const hashedpass = await encryptPass(password, user.salt);
            user.password = hashedpass;
            await user.save()
            return res.status(201).json({ message: "Password Reset Successful" });
        }
        catch (err) {
            next(err)
        }
    }

    static async joinroom(req, res, next) {
        try {
            const { room } = req.body;
            const user = await User.findById(req.user.id);

            if (!user) {
                const error = new Error("Invalid User");
                error.status = 404;
                throw error;
            }
            
            user.room = room;
            await user.save();
            return res.status(200).json({message : "Room joined Successfully"});
        } catch (error) {
            next(error)
        }
    }
}

module.exports = AuthController