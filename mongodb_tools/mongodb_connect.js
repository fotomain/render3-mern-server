
const mongoose = require('mongoose');

//=== demo uri !!!
const localUri = "mongodb+srv://work_user:Taras777999$Taras777999$@cluster0.algml.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// mongodb connection string
const mongoDBAdapter = async () => {
    const conn = await mongoose.connect(process.env.MONGO_URI || localUri);

    console.log(`=== MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
};

module.exports = mongoDBAdapter;
