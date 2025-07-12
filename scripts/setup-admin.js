const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

// Define User Schema directly in the script
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  hashedPassword: { type: String, required: true },
  location: { type: String },
  availability: { type: String },
  profileImage: { type: String, default: "/placeholder.svg?height=100&width=100" },
  skillsOffered: [{ type: String }],
  skillsWanted: [{ type: String }],
  isProfilePublic: { type: Boolean, default: true },
  socketId: { type: String },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },
  bannedAt: { type: Date },
  bannedBy: { type: String },
}, { timestamps: true });

// Create User model
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function setupAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI environment variable is required');
      console.log('💡 Please create a .env file with your MongoDB connection string');
      console.log('📝 Example: MONGO_URI=mongodb://localhost:27017/skillswap');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully');

    // Check if admin already exists
    console.log('🔍 Checking for existing admin user...');
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists:', existingAdmin.email);
      console.log('💡 You can use the existing admin account or create a new one manually');
      process.exit(0);
    }

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@skillswap.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'Admin User';

    console.log('🔐 Creating admin user...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const adminUser = new User({
      name: adminName,
      email: adminEmail,
      hashedPassword: hashedPassword,
      role: 'admin',
      isBanned: false,
      skillsOffered: ['Administration', 'Platform Management'],
      skillsWanted: [],
      isProfilePublic: false,
      rating: {
        average: 0,
        count: 0
      }
    });

    await adminUser.save();
    
    console.log('');
    console.log('🎉 SUCCESS! Admin user created successfully!');
    console.log('');
    console.log('📋 Admin Credentials:');
    console.log('   📧 Email: ' + adminEmail);
    console.log('   🔑 Password: ' + adminPassword);
    console.log('   👤 Name: ' + adminName);
    console.log('');
    console.log('⚠️  IMPORTANT: Please change the password after first login!');
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('   1. Start the development server: npm run dev');
    console.log('   2. Navigate to: http://localhost:3000');
    console.log('   3. Login with the admin credentials above');
    console.log('   4. Click your profile picture → "Admin Panel"');
    console.log('');
    console.log('🔧 Admin Panel Features:');
    console.log('   • User Management (ban/unban, role management)');
    console.log('   • Platform Messages (send announcements)');
    console.log('   • Reports & Analytics (view platform statistics)');
    console.log('   • Monitoring (track swaps, course requests)');

  } catch (error) {
    console.error('❌ Error setting up admin:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.log('');
      console.log('💡 Troubleshooting:');
      console.log('   • Make sure MongoDB is running');
      console.log('   • Check your MongoDB connection string in .env');
      console.log('   • Ensure the database is accessible');
    } else if (error.code === 11000) {
      console.log('');
      console.log('💡 This email already exists. Try a different email or use the existing account.');
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
    process.exit(0);
  }
}

// Run the setup
console.log('🛠️  Setting up Admin Panel...');
console.log('');
setupAdmin(); 