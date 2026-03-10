import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dropIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'algoprep' });
        console.log('Connected to MongoDB');
        
        const collection = mongoose.connection.collection('users');
        await collection.dropIndex('phoneNumber_1');
        console.log('Successfully dropped phoneNumber_1 index');
        
        process.exit(0);
    } catch (err) {
        console.error('Error dropping index (it might not exist or connection failed):', err.message);
        process.exit(1);
    }
};

dropIndex();
