const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.getSalt = async () => {
    return await bcrypt.genSalt()
}

exports.encryptPass = async (password, salt) => {
    return await bcrypt.hash(password, salt)
}

exports.getToken = (payload) => {
    return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '7d' })
}

exports.getPayload = (token) => {
    return jwt.verify(token, process.env.SECRET_KEY)
}