const { Router } = require('express');

const { isAuth } = require('../Middlewares/isAuth');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const AuthController = require('../Controllers/AuthController');
const User = require('../Models/User');

const userRouter = Router();
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: 'Too many requests, please try again later',
    keyGenerator: (req) => {
        return req.email ? req.email : req.ip;
    }
});

const limiter2 = rateLimit({
    windowMs: 4 * 60 * 1000,
    max: 5,
    message: 'Too many requests, please try after 5 minutes',
    keyGenerator: (req) => {
        return req.body ? req.body.email : req.ip;
    }
});

const limiter3 = rateLimit({
    windowMs: 4 * 60 * 1000,
    max: 5,
    message: 'Too many requests, please try after 5 minutes',
    keyGenerator: (req) => {
        return req.user ? req.user.id : req.ip;
    }
});


userRouter.post('/', limiter2, AuthController.login)
userRouter.post('/signup', limiter2, AuthController.signup)
userRouter.post('/reset-password', limiter2, AuthController.ResetPassword);

userRouter.post('/reset_password/verify', (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) {
            const error = new Error("Not Authenticated")
            error.status = 401;
            throw error;
        }
        const payload = jwt.verify(token, 'Reset');
        req.email = payload.email;
        next();
    }
    catch (err) {
        next(err)
    }
}, limiter, AuthController.Savepassword)



userRouter.use(isAuth)
userRouter.post('/verify', limiter3, AuthController.verify)
userRouter.get('/user_auth', async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.verified) {
            res.status(200).json({ ok: true })
        }
        const error = new Error("Not Verified");
        error.status = 422;
        throw error;
    } catch (error) {
        next(error);
    }
})


module.exports = userRouter;