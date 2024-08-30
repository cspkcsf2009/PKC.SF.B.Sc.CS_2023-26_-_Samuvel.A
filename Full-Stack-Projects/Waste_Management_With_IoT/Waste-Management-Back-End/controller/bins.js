const sanitize = require('../common/Sanitize');
const binModel = require('../model/bins');

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

const getBins = async (req, res) => {
    try {
        const data = await binModel.find().sort({ _id: 1 });
        res.status(200).send({
            data,
            message: 'Bin Data Fetch Successful',
        });
    } catch (error) {
        handleServerError(res, error);
    }
};

const getBinById = async (req, res) => {
    try {
        const binId = sanitize.isString(req.params.id);
        const data = await binModel.findById(binId);
        if (data) {
            res.status(200).send({
                data,
                message: 'Bin Data Fetch Successful',
            });
        } else {
            handleClientError(res, 'Invalid Bin ID');
        }
    } catch (error) {
        handleServerError(res, error);
    }
};

const createBin = async (req, res) => {
    try {
        const { binName, binLocation, binColor } = req.body;

        if (!binName || !binLocation || !binColor) {
            return handleClientError(res, 'Missing required fields');
        }

        const existingBinName = await binModel.findOne({ binName });
        if (!existingBinName) {
            await binModel.create({
                binName,
                binLocation,
                binColor,
            });

            res.status(200).send({
                message: 'Bin Created Successfully',
            });
        } else {
            handleClientError(res, `${binName} already exists`);
        }
    } catch (error) {
        handleServerError(res, error);
    }
};

const editBinById = async (req, res) => {
    try {
        const { binName, binLocation, binColor } = req.body;
        const binId = sanitize.isString(req.params.id);

        const bin = await binModel.findById(binId);
        if (bin) {
            bin.binName = binName;
            bin.binLocation = binLocation;
            bin.binColor = binColor;

            await bin.save();

            res.status(200).send({
                message: 'Bin Data Edited Successfully',
            });
        } else {
            handleClientError(res, 'Invalid Bin ID');
        }
    } catch (error) {
        handleServerError(res, error);
    }
};

const deleteBinById = async (req, res) => {
    try {
        const binId = sanitize.isString(req.params.id);
        const bin = await binModel.findById(binId);

        if (bin) {
            await binModel.deleteOne({ _id: binId });
            res.status(200).send({
                message: 'Bin Data Deleted Successfully',
            });
        } else {
            handleClientError(res, 'Invalid Bin ID');
        }
    } catch (error) {
        handleServerError(res, error);
    }
};

module.exports = {
    getBins,
    getBinById,
    createBin,
    editBinById,
    deleteBinById,
};