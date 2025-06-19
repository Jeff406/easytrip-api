# Role-Based User System Migration

## Overview

This migration adds support for multiple roles per user in the EasyTrip application. A user can now be both a driver and a passenger, with separate user records for each role.

## Changes Made

### 1. User Model Updates (`models/User.js`)
- Added `role` field with enum values: `['driver', 'passenger']`
- Removed unique constraint on `firebaseId`
- Added compound unique index on `{ firebaseId: 1, role: 1 }`

### 2. User Controller Updates (`controllers/userControllers.js`)
- Updated `updateDeviceToken` to require role parameter
- Added `createOrUpdateUser` endpoint for role-based user creation
- Added `getUserByRole` endpoint to fetch users by firebaseId and role

### 3. User Routes Updates (`routes/userRoutes.js`)
- Added new routes for role-based user operations
- Updated existing device token route to include role

### 4. Notification Service Updates (`services/notificationService.js`)
- Updated to find users by firebaseId and role when sending notifications

### 5. Trip Request Controller Updates (`controllers/tripRequestControllers.js`)
- Updated user lookups to include role when fetching driver and passenger information

### 6. Frontend Updates

#### AuthContext (`contexts/AuthContext.js`)
- Updated `saveRole` to create/update user in backend with role
- Enhanced logout to clear role from local storage
- Added backend communication for role-based user creation

#### NotificationService (`services/NotificationService.js`)
- Updated `updateTokenOnServer` to include role when updating device tokens

## Database Migration

### Running the Migration

1. **Backup your database** before running the migration
2. Run the migration script:
   ```bash
   npm run migrate
   ```

### What the Migration Does

1. Finds all existing users without a role field
2. Assigns them a default role of 'passenger'
3. Creates the compound index for `{ firebaseId: 1, role: 1 }`
4. Removes the old unique index on `firebaseId`

## API Endpoints

### New Endpoints

- `POST /api/users/create-or-update` - Create or update user with role
- `GET /api/users/:firebaseId/:role` - Get user by firebaseId and role

### Updated Endpoints

- `POST /api/users/device-token` - Now requires role parameter

## Usage Examples

### Creating a Driver User
```javascript
// Frontend
const { setRole } = useContext(AuthContext);
await setRole('driver');

// Backend API call
POST /api/users/create-or-update
{
  "role": "driver"
}
```

### Creating a Passenger User
```javascript
// Frontend
const { setRole } = useContext(AuthContext);
await setRole('passenger');

// Backend API call
POST /api/users/create-or-update
{
  "role": "passenger"
}
```

### Updating Device Token with Role
```javascript
// Backend API call
POST /api/users/device-token
{
  "token": "fcm_token_here",
  "role": "driver"
}
```

## Benefits

1. **Multiple Roles**: Users can be both drivers and passengers
2. **Separate Device Tokens**: Each role can have its own device token for notifications
3. **Role-Specific Data**: User data can be different for each role
4. **Flexible Authentication**: Users can switch between roles seamlessly

## Important Notes

1. **Role Selection**: Users must select a role after login
2. **Local Storage**: Role is stored locally and cleared on logout
3. **Backend Sync**: Role is synced with backend when selected
4. **Notifications**: Device tokens are role-specific
5. **Data Integrity**: Compound index ensures no duplicate firebaseId+role combinations

## Testing

After migration, test the following scenarios:

1. User login and role selection
2. Creating users with different roles
3. Device token updates with roles
4. Notifications for different roles
5. User logout and role clearing
6. Switching between roles for the same user 