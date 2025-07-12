const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env if it exists
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = envContent.split('\n');
    envVars.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
}

loadEnv();

async function testMongoConnection() {
  try {
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.log('❌ MONGO_URI not found in .env');
      console.log('💡 Please create .env file with your MongoDB connection string');
      return;
    }

    console.log('🔌 Testing MongoDB connection...');
    console.log('📍 Connection string:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connection successful!');
    
    // Test database operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Available collections:', collections.length);
    
    if (collections.length > 0) {
      collections.forEach(col => {
        console.log('   - ' + col.name);
      });
    }
    
    console.log('🎉 MongoDB is ready for use!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('');
    console.log('💡 Troubleshooting tips:');
    console.log('   • Make sure MongoDB is running');
    console.log('   • Check your connection string');
    console.log('   • Ensure network connectivity');
    console.log('   • Verify database permissions');
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

console.log('🧪 Testing MongoDB Connection...');
console.log('');
testMongoConnection(); 