# Backend Integration Test Plan

## Overview
This document outlines the test procedures for integrating the frontend user application with the backend API. All tests assume the backend has implemented the required endpoints specified in `API_CHANGE_REQUEST.md`.

## Prerequisites

### Backend Requirements
- Backend running with JWT authentication enabled
- Required endpoints implemented (see priority list in API_CHANGE_REQUEST.md)
- Test user account credentials available
- Payment gateway configured (for payment tests)

### Frontend Configuration
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_MOCK_AUTH=false
VITE_PAYMENT_SUCCESS_URL=http://localhost:9556/payment/success
VITE_PAYMENT_FAIL_URL=http://localhost:9556/payment/fail
```

### Test Data
- Test username: `testuser`
- Test password: `TestPass123`
- Test connection: `testuser-1`
- Test server: `US-West` (active)

## Test Scenarios

### 1. Authentication Flow

#### 1.1 User Registration
**Objective:** Verify new users can register successfully.

**Steps:**
1. Navigate to `/register`
2. Fill registration form:
   - Username: `newuser-{timestamp}`
   - Password: `SecurePass123`
   - Confirm password: `SecurePass123`
   - Telegram ID: `123456789` (optional)
3. Submit form
4. Verify success:
   - Redirect to dashboard (`/`)
   - JWT token stored in localStorage/sessionStorage
   - User menu shows username

**Expected Results:**
- HTTP 200 response from `/auth/register`
- JWT token returned
- User logged in automatically

**Error Cases:**
- Duplicate username → Error message shown
- Password validation failure → Appropriate error message
- Network error → User-friendly error message

#### 1.2 User Login
**Objective:** Verify existing users can login.

**Steps:**
1. Navigate to `/login`
2. Enter valid credentials
3. Submit form
4. Verify success:
   - Redirect to dashboard
   - Token stored
   - User context updated

**Expected Results:**
- Successful authentication
- Access to protected routes

**Error Cases:**
- Invalid credentials → "Invalid username or password"
- Account locked/disabled → Appropriate error
- Network error → Graceful handling

#### 1.3 Password Reset
**Objective:** Verify password reset flow works.

**Steps:**
1. Navigate to `/forgot-password`
2. Enter registered username
3. Submit request
4. Simulate token reception (backend should generate)
5. Navigate to reset page with token
6. Enter new password
7. Submit
8. Verify:
   - Password changed
   - Can login with new password

**Expected Results:**
- Reset request acknowledged (even for non-existent users - security)
- Token validation works
- Password updated successfully

### 2. Connection Management

#### 2.1 List User Connections
**Objective:** Verify users can view their connections.

**Steps:**
1. Login with test user
2. Navigate to dashboard (`/`)
3. Verify:
   - Connections displayed in cards/table
   - Each connection shows: name, server, price, paydate, status
   - Status indicators (active, expiring, expired, disabled)
   - Auto-renew toggle present
   - Action buttons (copy, extend, change server)

**Expected Results:**
- `GET /connections/my` returns user's connections
- Data displayed correctly
- Empty state handled gracefully

#### 2.2 Create New Connection
**Objective:** Verify users can create new connections.

**Steps:**
1. From dashboard, click "New Connection"
2. Select server from dropdown
3. Select number of months (default 1)
4. Optionally set custom connection name
5. Set auto-renew preference
6. Submit
7. Verify:
   - Connection created with grace period
   - Redirected to payment flow
   - New connection appears in list

**Expected Results:**
- `POST /connections/` creates connection
- Grace period applied (24 hours)
- Connection string generated
- Server assigned correctly

#### 2.3 Change Server
**Objective:** Verify users can change server for existing connection.

**Steps:**
1. From connection card, click "Change Server" (gear icon)
2. Select new server from dropdown (excluding current)
3. Confirm change
4. Verify:
   - New connection string generated
   - Connection updated in backend
   - UI reflects new server name

**Expected Results:**
- `POST /connections/{name}/change-server` succeeds
- Connection string updated
- User notified of success

#### 2.4 Toggle Auto-Renew
**Objective:** Verify auto-renew can be toggled.

**Steps:**
1. From connection card, toggle auto-renew switch
2. Verify:
   - Immediate visual feedback
   - `PUT /connections/{name}` called with `auto_renew` field
   - State persists after page refresh

**Expected Results:**
- Auto-renew setting saved
- No unintended side effects

### 3. Payment Flow

#### 3.1 Initiate Payment
**Objective:** Verify payment initiation works.

**Steps:**
1. From connection card, click "Extend" (payment icon)
2. Select number of months
3. Select payment method
4. Click "Proceed to Payment"
5. Verify:
   - `POST /payments/initiate` called with connection context
   - Redirect to payment gateway
   - Payment ID stored for status polling

**Expected Results:**
- Payment initiated successfully
- Correct amount calculated (price × months)
- Redirect to payment gateway

#### 3.2 Payment Status Polling
**Objective:** Verify payment status updates after gateway redirect.

**Steps:**
1. Complete payment on gateway (simulate)
2. Return to success URL
3. Verify:
   - Frontend polls `GET /payments/transaction/{id}/status`
   - Status updates from PENDING → COMPLETED
   - Connection paydate extended
   - Connection re-enabled if disabled

**Expected Results:**
- Polling works with appropriate intervals
- Status transitions handled
- UI updates accordingly

#### 3.3 Payment History
**Objective:** Verify users can view payment history.

**Steps:**
1. Navigate to `/payment-history`
2. Verify:
   - List of payments displayed
   - Columns: Date, Amount, Method, Status
   - Pagination if many payments
   - Total amounts calculated

**Expected Results:**
- `GET /payments/` with user filtering works
- Data displayed correctly
- Empty state handled

### 4. Profile Management

#### 4.1 View Profile
**Objective:** Verify users can view their profile.

**Steps:**
1. Navigate to `/profile`
2. Verify:
   - Username displayed (read-only)
   - Telegram ID shown if set
   - Account creation date

**Expected Results:**
- `GET /users/me` returns user data
- Data displayed correctly

#### 4.2 Update Profile
**Objective:** Verify users can update their profile.

**Steps:**
1. From profile page, update Telegram ID
2. Submit changes
3. Verify:
   - `PUT /users/me` called with updated data
   - Success message displayed
   - Changes persist after refresh

**Expected Results:**
- Profile updates successful
- Validation errors handled (e.g., invalid Telegram ID)

#### 4.3 Change Password
**Objective:** Verify users can change password.

**Steps:**
1. From profile page, enter:
   - Current password
   - New password
   - Confirm new password
2. Submit
3. Verify:
   - `POST /auth/change-password` succeeds
   - Can login with new password
   - Cannot login with old password

**Expected Results:**
- Password changed successfully
- Appropriate error for wrong current password

## Error Handling Tests

### Network Errors
- Simulate network disconnect during API calls
- Verify user-friendly error messages
- Verify retry logic where appropriate

### API Error Responses
- Test 400 (Bad Request) responses
- Test 401 (Unauthorized) - token expired
- Test 403 (Forbidden) - ownership violation
- Test 404 (Not Found) - resource missing
- Test 500 (Server Error) - backend issues

### Validation Errors
- Test form validation errors
- Test backend validation errors (e.g., password too long)
- Verify error messages are user-friendly

## Cross-Browser Testing

### Browsers to Test
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### Mobile Browsers
- Chrome Mobile
- Safari iOS
- Telegram WebView
- Firefox Mobile

### Responsive Testing
- Mobile (375px)
- Tablet (768px)
- Desktop (1024px+)
- Landscape orientations

## Performance Testing

### Load Times
- Initial page load < 2s on 4G
- Dashboard load with connections < 3s
- API response times < 1s

### Bundle Size
- Verify production bundle sizes reasonable
- Check code splitting effectiveness

### Memory Usage
- No memory leaks during navigation
- Cleanup of event listeners, subscriptions

## Security Testing

### Authentication
- JWT token storage secure
- Token refresh handling
- Logout clears all sensitive data

### Authorization
- Users cannot access other users' data
- Ownership enforcement verified
- Admin vs user permissions (if applicable)

### Input Validation
- XSS prevention
- SQL injection prevention (backend)
- CSRF protection (if applicable)

## Integration Checklist

### Backend Endpoints Verified
- [ ] `POST /auth/register`
- [ ] `POST /auth/login`
- [ ] `POST /auth/restore`
- [ ] `POST /auth/reset`
- [ ] `POST /auth/change-password`
- [ ] `GET /users/me`
- [ ] `PUT /users/me`
- [ ] `GET /connections/my`
- [ ] `POST /connections/`
- [ ] `POST /connections/{name}/change-server`
- [ ] `GET /payments/` (with user filtering)
- [ ] `POST /payments/initiate` (with connection context)
- [ ] `GET /payments/transaction/{id}/status`
- [ ] `GET /servers/?active_only=true`

### Frontend Features Verified
- [ ] User registration
- [ ] User login
- [ ] Password reset
- [ ] Connection listing
- [ ] Connection creation
- [ ] Server change
- [ ] Auto-renew toggle
- [ ] Payment initiation
- [ ] Payment status polling
- [ ] Payment history
- [ ] Profile viewing
- [ ] Profile updating
- [ ] Password changing

### Non-Functional Requirements Verified
- [ ] Mobile responsive design
- [ ] WCAG 2.1 AA accessibility
- [ ] Performance targets met
- [ ] Error handling robust
- [ ] Security requirements met
- [ ] Cross-browser compatibility

## Test Execution

### Environment Setup
```bash
# Start backend
cd /path/to/central_manager
docker-compose up -d

# Start frontend
cd /path/to/front-user
npm run dev

# Set environment
VITE_MOCK_AUTH=false
```

### Test Tools
- Browser DevTools for network inspection
- Postman/curl for API testing
- Lighthouse for performance/accessibility
- BrowserStack for cross-browser testing

### Test Data Management
- Use separate test accounts for each test run
- Clean up test data after tests
- Consider using test database

## Issue Reporting

### Template
```
## Issue Description
[Brief description]

## Steps to Reproduce
1. 
2. 
3. 

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- Frontend: [commit hash]
- Backend: [commit hash]
- Browser: [name and version]
- OS: [name and version]

## Screenshots/Logs
[If applicable]
```

## Success Criteria
All critical test scenarios pass with no blocking issues. Application is ready for user acceptance testing (UAT).