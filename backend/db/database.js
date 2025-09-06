import mongoose from 'mongoose';

const connectMongoDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://abhirambca2021_db_user:Root@cluster0.5rf3i8g.mongodb.net/Rootments?retryWrites=true&w=majority&appName=Cluster0';
        console.log('🔗 Connecting to MongoDB:', mongoUri);
        await mongoose.connect(mongoUri); // No extra options needed
        console.log('✅ Connected to MongoDB successfully');
        console.log('📊 Database name:', mongoose.connection.db.databaseName);
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
        process.exit(1); // Exit process with failure
    }
}

export default connectMongoDB;
