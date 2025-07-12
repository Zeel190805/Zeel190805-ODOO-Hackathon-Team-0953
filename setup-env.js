const fs = require('fs');
const path = require('path');

// Create .env.local file if it doesn't exist
const envPath = path.join(__dirname, '.env.local');
const envContent = `# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/skillswap

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# Socket.IO (optional)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Google OAuth (optional - for Google login)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret

# Gemini AI (optional - for chatbot)
# GEMINI_API_KEY=your-gemini-api-key
`;

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file with default configuration');
  console.log('📝 Please update the values in .env.local as needed');
} else {
  console.log('⚠️  .env.local already exists');
}

console.log('\n🔧 Setup Instructions:');
console.log('1. Make sure MongoDB is running on localhost:27017');
console.log('2. Update .env.local with your actual values');
console.log('3. Run: npm run seed (to populate database with sample users)');
console.log('4. Run: npm run dev (to start the development server)');
console.log('\n📚 For MongoDB setup:');
console.log('- Install MongoDB Community Edition');
console.log('- Start MongoDB service');
console.log('- Or use MongoDB Atlas (cloud) and update MONGO_URI'); 