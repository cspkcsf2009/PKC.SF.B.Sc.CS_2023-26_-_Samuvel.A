const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const saltRound = 10;

const hashPassword = async (password)=>{
    let salt = await bcrypt.genSalt(saltRound)
    let hashedPassword = await bcrypt.hash(password,salt)
    return hashedPassword
}

const comparePassword = async (password,hashedPassword)=>{
    return bcrypt.compare(password,hashedPassword)
}

const createToken = async (payload)=>{
    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE
        })
    return token
}

const decodeToken = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        // Handle verification errors, such as expired tokens
        throw new Error(error.message);
    }
};

//middleware
const validate = async (req, res, next) => {
    try {
        let token = req?.headers?.authorization?.split(" ")[1];
        if (token) {
            let payload = await decodeToken(token);
            let currentTime = Math.round(+new Date() / 1000);
            if (currentTime < payload.exp) {
                next();
            } else {
                res.status(401).send({ message: "Token Expired" });
            }
        } else {
            res.status(401).send({ message: "Token Not Found" });
        }
    } catch (error) {
        console.log(error);
        res.status(401).send({ message: "Invalid Token" });
    }
};

const adminGuard = async (req, res, next) => {
    try {
        let token = req?.headers?.authorization?.split(" ")[1];
        if (token) {
            let payload = await decodeToken(token);
            if (payload.role === 'admin') {
                next();
            } else {
                res.status(401).send({ message: "Only Admins are allowed to access" });
            }
        } else {
            res.status(401).send({ message: "Token Not Found" });
        }
    } catch (error) {
        console.log(error);
        res.status(401).send({ message: "Invalid Token" });
    }
};

module.exports = {
    hashPassword,
    comparePassword,
    createToken,
    decodeToken,
    validate,
    adminGuard: adminGuard
}