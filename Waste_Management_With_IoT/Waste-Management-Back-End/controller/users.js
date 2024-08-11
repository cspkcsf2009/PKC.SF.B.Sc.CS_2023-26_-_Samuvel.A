const sanitize = require('../common/Sanitize');
const userModel = require('../model/users');
const auth = require('../common/Auth');

const handleClientError = (res, message) => {
    res.status(400).send({ message });
};

const handleServerError = (res, error) => {
    console.error('Error:', error.message);
    res.status(500).send({
        message: 'Internal Server Error',
        errorMessage: error.message,
    });
};

const getUsers = async (req, res) => {
    try {
        const data = await userModel.find().sort({ _id: 1 });

        res.status(200).send({
            data,
            message: 'User Data Fetch Successful',
        });
    } catch (error) {
        handleServerError(res, error);
    }
};


const getUserById = async (req, res) => {
    try {
        const userId = sanitize.isString(req.params.id);
        const data = await userModel.findById(userId);
        if (data) {
            res.status(200).send({
                data,
                message: 'User Data Fetch Successful',
            });
        } else {
            handleClientError(res, 'Invalid User ID');
        }
    } catch (error) {
        handleServerError(res, error);
    }
};

const createUser = async (req, res) => {
    try {
        const { firstName, lastName, email, batch, status, password, role } = req.body;

        if (!firstName || !lastName || !email || !batch || !password || !role) {
            return handleClientError(res, 'Missing required fields');
        }

        const hashedPassword = await auth.hashPassword(password);

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return handleClientError(res, `${email} already exists`);
        }

        await userModel.create({
            firstName,
            lastName,
            email,
            batch,
            status,
            role,
            password: hashedPassword,
        });

        res.status(200).send({
            message: 'User Created Successfully',
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

const editUserById = async (req, res) => {
    try {
        const { firstName, lastName, email, batch, role, status } = req.body;
        const userId = sanitize.isString(req.params.id);

        const user = await userModel.findById(userId);
        if (user) {
            user.firstName = firstName;
            user.lastName = lastName;
            user.email = email;
            user.batch = batch;
            user.role = role;
            user.status = status;

            await user.save();

            res.status(200).send({
                message: 'User Data Edited Successfully',
            });
        } else {
            handleClientError(res, 'Invalid User ID');
        }
    } catch (error) {
        handleServerError(res, error);
    }
};

const deleteUserById = async (req, res) => {
    try {
        const userId = sanitize.isString(req.params.id);
        const user = await userModel.findById(userId);

        if (user) {
            await userModel.deleteOne({ _id: userId });
            res.status(200).send({
                message: 'User Data Deleted Successfully',
            });
        } else {
            handleClientError(res, 'Invalid User ID');
        }
    } catch (error) {
        handleServerError(res, error);
    }
};

const loginUser = async (req, res) => {
    try {
        const email = sanitize.isString(req.body.email);
        const password = sanitize.isString(req.body.password);
        const user = await userModel.findOne({ email });

        if (user) {
            if (await auth.comparePassword(password, user.password)) {
                const token = await auth.createToken({
                    email: user.email,
                    role: user.role,
                    firstName: user.firstName,
                    lastName: user.lastName,
                });
                res.status(200).send({ message: 'Login Successful', token, role:user.role });
            } else {
                handleClientError(res, 'Invalid password');
            }
        } else {
            handleClientError(res, 'Invalid email address');
        }
    } catch (error) {
        handleServerError(res, error);
    }
};

const changePassword = async (req, res) => {
    try {
        const userId = sanitize.isString(req.params.id);
        const password = sanitize.isString(req.body.password);
        const user = await userModel.findById(userId);

        if (user) {
            user.password = await auth.hashPassword(password);
            await user.save();
            res.status(200).send({
                message: 'Password Changed Successfully',
            });
        } else {
            handleClientError(res, 'Invalid User');
        }
    } catch (error) {
        handleServerError(res, error);
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    editUserById,
    deleteUserById,
    loginUser,
    changePassword,
};
