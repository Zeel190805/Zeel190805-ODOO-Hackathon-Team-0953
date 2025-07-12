# Admin Panel Setup Guide

This guide will help you set up and use the admin panel for the SkillSwap platform.

## Features

The admin panel includes the following features:

### User Management
- View all users in the system
- Ban/unban users for policy violations
- Promote users to admin role
- Remove admin privileges
- Search and filter users

### Platform Messages
- Send platform-wide messages to all users
- Different message types: Info, Warning, Alert, Update
- Set message expiration dates
- Activate/deactivate messages
- Delete messages

### Reports & Analytics
- Comprehensive platform statistics
- User activity reports
- Swap and course request analytics
- Top skills analysis
- Download reports as JSON

### Monitoring
- Monitor pending, accepted, or cancelled swaps
- Track course requests and enrollments
- View user activity patterns
- Monitor platform health

## Setup Instructions

### 1. Database Schema Updates

The user model has been updated to include admin functionality. Run the following to ensure your database is up to date:

```bash
# The changes are automatically applied when you restart the application
npm run dev
```

### 2. Create First Admin User

Run the setup script to create your first admin user:

```bash
npm run setup-admin
```

This will create an admin user with the following default credentials:
- Email: admin@skillswap.com
- Password: admin123
- Name: Admin User

You can customize these by setting environment variables:
- `ADMIN_EMAIL`: Admin email address
- `ADMIN_PASSWORD`: Admin password
- `ADMIN_NAME`: Admin display name

### 3. Environment Variables

Make sure you have the following environment variables set in your `.env.local` file:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Access Admin Panel

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Login with your admin credentials
4. Click on your profile picture in the header
5. Select "Admin Panel" from the dropdown menu

## Usage Guide

### User Management

1. **View Users**: Go to the "Users" tab to see all registered users
2. **Search Users**: Use the search bar to find specific users by name or email
3. **Ban User**: Click the "Ban" button next to a user, provide a reason, and confirm
4. **Unban User**: Click the "Unban" button to restore user access
5. **Manage Admin Roles**: Use "Make Admin" or "Remove Admin" buttons to change user roles

### Platform Messages

1. **Create Message**: Click "New Message" button
2. **Fill Details**: 
   - Title: Brief message title
   - Content: Full message content
   - Type: Choose from Info, Warning, Alert, or Update
   - Expires At: Optional expiration date
3. **Send Message**: Click "Create Message" to send
4. **Manage Messages**: Use toggle switches to activate/deactivate messages
5. **Delete Messages**: Click the trash icon to remove messages

### Reports & Analytics

1. **View Overview**: Check the "Overview" tab for key metrics
2. **Download Reports**: Click "Download Report" to get comprehensive data
3. **Monitor Activity**: Track recent user activity and platform usage
4. **Analyze Skills**: View the most popular skills on the platform

## Security Considerations

### Admin Access Control
- Only users with `role: "admin"` can access the admin panel
- Admin status is checked on both client and server side
- Session includes role information for proper access control

### User Banning
- Banned users cannot log in to the platform
- Ban reasons are recorded for audit purposes
- Bans can be reversed by admins

### Message Management
- Platform messages are stored securely in the database
- Messages can be set to expire automatically
- Inactive messages don't appear to users

## API Endpoints

The admin panel uses the following API endpoints:

- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users` - Update user (ban/unban, role changes)
- `GET /api/admin/messages` - Get platform messages
- `POST /api/admin/messages` - Create new message
- `PUT /api/admin/messages` - Update message status
- `DELETE /api/admin/messages` - Delete message
- `GET /api/admin/reports` - Get platform statistics

## Troubleshooting

### Common Issues

1. **Admin Panel Not Accessible**
   - Ensure you're logged in with an admin account
   - Check that the user has `role: "admin"` in the database
   - Verify session includes role information

2. **Users Not Loading**
   - Check MongoDB connection
   - Verify admin middleware is working
   - Check browser console for errors

3. **Messages Not Sending**
   - Ensure all required fields are filled
   - Check API endpoint is accessible
   - Verify admin permissions

### Database Queries

To manually check admin users in MongoDB:

```javascript
// Check admin users
db.users.find({ role: "admin" })

// Check banned users
db.users.find({ isBanned: true })

// Check platform messages
db.platformmessages.find({})
```

## Best Practices

1. **Regular Monitoring**: Check the admin panel regularly for platform health
2. **User Communication**: Use platform messages for important announcements
3. **Audit Trail**: Keep records of admin actions for accountability
4. **Security**: Change default admin password after first login
5. **Backup**: Regularly backup your database and admin configurations

## Support

If you encounter any issues with the admin panel:

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Check that all dependencies are installed

For additional support, refer to the main project documentation or create an issue in the project repository. 