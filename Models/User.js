const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    salt: {
        type: String, required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: Number,
    },
    otp_expiry: {
        type: Date
    },
    room: String
}, {
    timestamps: true,
    toJSON: {
        transform: (ooj, ret) => {
            delete ret._id;
            delete ret.createdAt
            delete ret.updatedAt
            delete ret.salt
            delete ret.otp
            delete ret.password
            delete ret.otp_expiry
        }
    }
});

userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
