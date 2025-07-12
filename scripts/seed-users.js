const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema (simplified version)
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
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

// Sample users data
const sampleUsers = [
  {
    name: "Marc Deco",
    email: "marc@example.com",
    password: "password123",
    location: "New York, USA",
    availability: "Weekends",
    skillsOffered: ["React", "Node.js", "Illustration"],
    skillsWanted: ["Python", "Django"],
    rating: { average: 4.5, count: 12 },
  },
  {
    name: "Michelle",
    email: "michelle@example.com",
    password: "password123",
    location: "London, UK",
    availability: "Evenings",
    skillsOffered: ["Photoshop", "Figma", "UX Design"],
    skillsWanted: ["Webflow", "SEO"],
    rating: { average: 4.8, count: 8 },
  },
  {
    name: "Joe Wills",
    email: "joe@example.com",
    password: "password123",
    location: "Berlin, Germany",
    availability: "Anytime",
    skillsOffered: ["Go", "Docker", "Kubernetes"],
    skillsWanted: ["TypeScript", "GraphQL"],
    rating: { average: 4.2, count: 5 },
  },
  {
    name: "Sarah Chen",
    email: "sarah@example.com",
    password: "password123",
    location: "San Francisco, USA",
    availability: "Weekdays",
    skillsOffered: ["Machine Learning", "Python", "Data Analysis"],
    skillsWanted: ["React", "JavaScript"],
    rating: { average: 4.7, count: 15 },
  },
  {
    name: "Alex Rodriguez",
    email: "alex@example.com",
    password: "password123",
    location: "Madrid, Spain",
    availability: "Weekends",
    skillsOffered: ["Spanish", "Content Writing", "SEO"],
    skillsWanted: ["Web Development", "Design"],
    rating: { average: 4.3, count: 7 },
  }
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap');
    console.log('Connected to MongoDB');

    // Clear existing users (optional - remove this if you want to keep existing users)
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Hash passwords and create users
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const user = new User({
        ...userData,
        hashedPassword,
      });
      
      await user.save();
      console.log(`Created user: ${userData.name}`);
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedUsers(); 