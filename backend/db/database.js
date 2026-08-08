import mongoose from 'mongoose';
import dns from 'dns';

// Set public DNS servers to resolve MongoDB SRV records if local DNS blocks querySrv
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectMongoDB = async () => {
    try {
        // Clear any existing connections
        if (mongoose.connection.readyState === 1) {
            console.log('🔄 Disconnecting from existing connection...');
            await mongoose.disconnect();
        }

        const mongoUri = process.env.MONGODB_URI;
        
        if (!mongoUri) {
            throw new Error('MONGODB_URI environment variable is not set. Cannot connect to database.');
        }
        
        console.log('🔗 Connecting to MongoDB...');
        console.log('📍 URI (first 50 chars):', mongoUri.substring(0, 50) + '...');
        
        await mongoose.connect(mongoUri, {
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            bufferCommands: false // Disable mongoose buffering
        });
        
        console.log('✅ Connected to MongoDB successfully');
        console.log('📊 Database name:', mongoose.connection.db.databaseName);
        console.log('🌐 Host:', mongoose.connection.host);
        console.log('🔌 Port:', mongoose.connection.port);
        console.log('🗄️  ============================================');
        console.log('🗄️  ACTIVE DATABASE:', mongoose.connection.db.databaseName);
        console.log('🗄️  ============================================');
        
        // Log connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB disconnected');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
        });
        
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
        console.error('❌ Connection string used:', process.env.MONGODB_URI ? 'Environment variable' : 'Fallback string');
        process.exit(1);
    }
}

export default connectMongoDB;
