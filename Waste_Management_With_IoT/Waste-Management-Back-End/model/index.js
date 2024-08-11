const mongoose = require('mongoose');

const connectToDatabase = async () => {
  try {
    await mongoose.connect(`${process.env.dbUrl}/${process.env.dbName}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    // Optionally, you might choose to throw the error here or handle it as appropriate for your application.
  }
};

// Export the connectToDatabase function
module.exports = connectToDatabase;
