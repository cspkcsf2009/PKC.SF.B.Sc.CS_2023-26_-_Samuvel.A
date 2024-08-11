const connectToDatabase = require('./index');
const mongoose = require('mongoose');

// Establish the database connection
connectToDatabase();

// Bin Schema
const binSchema = new mongoose.Schema({
    binName: {
        type: String,
        required: [true, 'Bin name is required'],
    },
    binLocation: {
        type: String,
        required: [true, 'Bin location is required'],
    },
    binColor: {
        type: String,
        required: [true, 'Bin color is required'],
    }
}, { versionKey: false, collection: 'bins' });

// Bin Model
const binModel = mongoose.model('bins', binSchema);

module.exports = binModel;
