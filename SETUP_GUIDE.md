# Quick Setup Guide

## Step 1: Create Environment File

Create a file named `.env` in the `temp-oddo` directory with the following content:

```env
# MongoDB Connection String
MONGO_URI=mongodb://localhost:27017/skillswap

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# Admin User Configuration (Optional)
# ADMIN_EMAIL=admin@skillswap.com
# ADMIN_PASSWORD=admin123
# ADMIN_NAME=Admin User
```

## Step 2: Set Up MongoDB

### Option A: Local MongoDB
1. Install MongoDB on your system
2. Start MongoDB service
3. Use the connection string: `mongodb://localhost:27017/skillswap`

### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string and replace the MONGO_URI in `.env`

## Step 3: Test MongoDB Connection

```bash
cd temp-oddo
npm run test-mongo
```

## Step 4: Run Admin Setup

```bash
npm run setup-admin
```

## Step 5: Start Development Server

```bash
npm run dev
```

## Step 6: Access Admin Panel

1. Open http://localhost:3000
2. Login with admin credentials:
   - Email: admin@skillswap.com
   - Password: admin123
3. Click your profile picture → "Admin Panel"

## Troubleshooting

### MongoDB Connection Issues
- Make sure MongoDB is running
- Check your connection string
- Ensure the database is accessible

### Admin Setup Fails
- Verify `.env` file exists
- Check MongoDB connection
- Ensure all dependencies are installed

### Admin Panel Not Accessible
- Make sure you're logged in with admin account
- Check browser console for errors
- Verify session includes role information

## Default Admin Credentials

- **Email**: admin@skillswap.com
- **Password**: admin123
- **Name**: Admin User

⚠️ **Important**: Change the password after first login! 