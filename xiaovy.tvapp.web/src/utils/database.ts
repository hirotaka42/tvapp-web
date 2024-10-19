import mongoose from 'mongoose';

const db_username = process.env.DB_USERNAME;
const db_password = process.env.DB_PASSWORD;
const db_connection = process.env.DB_CONNECTION_STRING;
const uri = `mongodb+srv://${db_username}:${db_password}@${db_connection}`;

const connectDB = async () => {
    try {
        await mongoose.connect(uri, {});
        console.log('Success: connected to MongoDB');
    } catch {
        console.log('Failure: unconnected to MongoDB');
        throw new Error();
    }
};

export default connectDB;