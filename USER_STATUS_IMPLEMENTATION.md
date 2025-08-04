# User Status Field Implementation - Impact Analysis

## Overview
This document outlines all the changes made to implement a `status` field for users in the STS-Server application and what components were affected.

## Changes Made

### 1. User Model (models/user.js)
**Added status field:**
```javascript
status: {
  type: String,
  enum: ['active', 'inactive', 'suspended', 'pending'],
  default: 'active'
}
```

**Impact:**
- New users will have 'active' status by default
- Status field is validated against the enum values
- Database schema is extended with the new field

### 2. User Controller (controllers/userController.js)

#### Modified Functions:

**registerUser:**
- Now accepts optional `status` parameter in request body
- Sets status if provided, otherwise uses default ('active')
- Returns status in response message

**loginUser:**
- Added status validation - only 'active' users can login
- Returns appropriate error message for non-active users
- Maintains existing authentication logic

**adminData:**
- Added status check for admin access
- Admin must be both role='admin' AND status='active'
- Enhanced security for admin functions

#### New Functions:

**updateUserStatus:**
- Allows admins to update user status
- Requires admin authentication
- Validates admin permissions before allowing changes
- Returns updated user information (without password)

### 3. User Routes (routes/users.js)

#### New Routes:
**PUT /api/users/status**
- Endpoint for updating user status
- Admin-only functionality
- Body: { userId, status, adminEmail }

#### Modified Routes:

**GET /api/users**
- Added optional status filtering via query parameter
- Usage: `GET /api/users?status=active`
- Returns all users if no status filter provided

**GET /api/users/profile/:username**
- Now includes status field in user profile response

## API Changes Summary

### New Endpoints:
- `PUT /api/users/status` - Update user status (admin only)

### Modified Endpoints:
- `POST /api/users/register` - Now accepts status field
- `POST /api/users/login` - Now validates user status
- `GET /api/users` - Now supports status filtering
- `GET /api/users/profile/:username` - Now includes status in response

### Request/Response Changes:

#### Registration (POST /api/users/register)
**New optional field in request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "user",
  "status": "active"  // Optional, defaults to 'active'
}
```

**Response now includes status:**
```json
{
  "message": "User registered successfully",
  "status": "active"
}
```

#### Login (POST /api/users/login)
**New error responses for non-active users:**
```json
{
  "error": "Account is inactive. Please contact administrator."
}
```

#### Status Update (PUT /api/users/status)
**Request body:**
```json
{
  "userId": "user-uuid",
  "status": "suspended",
  "adminEmail": "admin@example.com"
}
```

**Response:**
```json
{
  "message": "User status updated successfully",
  "user": {
    "userId": "user-uuid",
    "email": "user@example.com",
    "status": "suspended"
  }
}
```

#### User Listing (GET /api/users)
**New query parameter:**
- `?status=active` - Filter by status
- `?status=inactive` - Filter by inactive users
- `?status=suspended` - Filter by suspended users
- `?status=pending` - Filter by pending users

## Authentication & Authorization Impact

### Login Process:
1. Validate email/password (existing)
2. **NEW:** Check if user status is 'active'
3. Allow login only if both conditions are met

### Admin Functions:
1. Validate admin role (existing)
2. **NEW:** Check if admin status is 'active'
3. Allow admin access only if both conditions are met

## Database Migration Considerations

### Existing Users:
- All existing users will automatically have status='active' (default value)
- No manual migration required
- Backward compatibility maintained

### New Users:
- Will have status='active' by default unless specified otherwise
- Status field is required and validated

## Status Field Values

| Status | Description | Login Allowed | Admin Access |
|--------|-------------|---------------|--------------|
| active | Normal active user | ✅ Yes | ✅ Yes (if admin role) |
| inactive | Temporarily disabled | ❌ No | ❌ No |
| suspended | Account suspended | ❌ No | ❌ No |
| pending | Awaiting activation | ❌ No | ❌ No |

## Components NOT Affected

The following components were NOT modified as they don't directly interact with user authentication or user data display:

- **URL Model** (models/url.js) - Only references userId as string
- **Scan Model** (models/scan.js) - No direct user reference
- **Scan Result Model** (models/scanResult.js) - Only references userId as string
- **Calendar Routes** (routes/calendar.js) - No user-specific functionality
- **URL Routes** (routes/urls.js) - No user status dependency
- **Scan Routes** (routes/scans.js) - No user status dependency
- **Result Routes** (routes/results.js) - No user status dependency

## Testing Recommendations

### Unit Tests:
1. Test user creation with default status
2. Test user creation with specific status
3. Test status enum validation
4. Test login with different status values
5. Test admin access with different status values
6. Test status update functionality

### Integration Tests:
1. Test complete user registration flow
2. Test complete login flow with status validation
3. Test admin status management workflow
4. Test user filtering by status

### API Tests:
1. Test all modified endpoints
2. Test error responses for status validation
3. Test query parameter filtering
4. Test authorization for status updates

## Security Considerations

### Enhanced Security:
- **Double validation for admins:** Both role and status must be valid
- **Controlled status changes:** Only active admins can modify status
- **Login restrictions:** Inactive users cannot access the system

### Audit Trail:
Consider implementing:
- Status change logging
- Timestamp tracking for status changes
- Admin action logging

## Future Enhancements

### Potential Additions:
1. **Status history tracking** - Log when status changes and who changed it
2. **Automatic status transitions** - e.g., pending → active after email verification
3. **Status-based permissions** - Different access levels for different statuses
4. **Notification system** - Alert users when their status changes
5. **Bulk status operations** - Admin ability to change multiple user statuses

### Related Features:
1. **Email verification** for pending users
2. **Account suspension reasons** with admin notes
3. **Temporary suspensions** with automatic reactivation
4. **User self-service** status requests

## Conclusion

The user status field implementation is a minimal but comprehensive change that:
- ✅ Adds essential user account management capabilities
- ✅ Maintains backward compatibility
- ✅ Provides proper validation and security
- ✅ Follows existing code patterns and conventions
- ✅ Requires no database migration for existing data
- ✅ Enhances security without breaking existing functionality

The implementation affects only user-related components and maintains the existing API structure while adding new capabilities for user account management.