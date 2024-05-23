// const { getPayload } = require("../utils/AuthUtils");

const { getPayload } = require("../utils/AuthUtils");

exports.isAuth = async (req, res, next) => {
    try {
        const token = req.get("Authorization")?.split(" ")[1];
        if (!token) {
            const error = new Error("Not authenticated")
            error.status = 403;
            throw error;
        }
        const payload = getPayload(token)
        req.user = payload;
        next();
    } catch (error) {
        next(error)
    }
}