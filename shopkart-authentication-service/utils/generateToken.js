const jwt = require("jsonwebtoken");

const generateToken = (customerId) => {
    return jwt.sign(
        { id: customerId.toString() },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
};

module.exports = generateToken;
