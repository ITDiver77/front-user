# API Change Request for User Frontend

## Overview
The frontend user application requires several backend API enhancements to support per-user authentication, self-service operations, and a seamless user experience. This document outlines the required changes.

## Current Status
The backend already implements:
- JWT authentication endpoints (`/auth/register`, `/auth/login`, `/auth/restore`, `/auth/reset`, `/auth/change-password`)
- Mixed authentication (`get_current_user_or_admin`) supporting both JWT and API key
- Basic user, connection, server, and payment management

## Required Changes

### 1. User-Specific Endpoints

#### 1.1. Current User Profile Endpoint
**Current:** Users must know their username to access `/users/{username}`  
**Required:** Add `/users/me` endpoint that returns current user based on JWT

```python
@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Returns user profile for authenticated user
```

#### 1.2. Current User Connections
**Current:** `/connections/user/{username}` requires username parameter  
**Required:** Add `/connections/my` endpoint that filters by current user

```python
@router.get("/my", response_model=List[ConnectionResponse])
async def get_my_connections(
    current_user: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Returns connections for current user
```

### 2. Connection Management Enhancements

#### 2.1. Change Server Endpoint
**Current:** No endpoint to change server for a connection  
**Required:** Add `/connections/{connection_name}/change-server` endpoint

```python
@router.post("/{connection_name}/change-server", response_model=ConnectionResponse)
async def change_connection_server(
    connection_name: str,
    change_request: ChangeServerRequest,  # { "new_server_name": "string" }
    auth_data: tuple = Depends(get_current_user_or_admin),
    db: AsyncSession = Depends(get_db)
):
    # Changes server for connection, generates new connection_string
    # Must enforce ownership for non-admin users
```

#### 2.2. Connection Creation Defaults
**Current:** Connection creation requires explicit fields  
**Required:** Support minimal creation with defaults:
- `username` from JWT (if not admin)
- `price` from server default
- `paydate` = created_at + GRACE_PERIOD_HOURS (24h)
- `enabled` = true
- `auto_renew` = true (default)
- Server assignment: choose least loaded active server or allow selection

### 3. Payment System Improvements

#### 3.1. Payment Initiation for Connections
**Current:** `/payments/initiate` requires `user_id` and generic details  
**Required:** Add connection-aware payment initiation:
- Option A: Extend existing endpoint with `connection_name` parameter
- Option B: Create `/connections/{connection_name}/pay` endpoint

**Preferred (Option A):** Extend `PaymentInitiate` schema:
```python
class PaymentInitiate(BaseModel):
    user_id: int  # Could be optional if derived from JWT
    amount: int
    currency: str = "RUB"
    description: str = ""
    return_url: Optional[str] = None
    failed_url: Optional[str] = None
    payment_method: int = 2  # SBPQR
    connection_name: Optional[str] = None  # NEW: Link payment to connection
    months: Optional[int] = 1  # NEW: Number of months to extend
```

**Behavior:** When `connection_name` provided:
1. Verify connection belongs to user (or admin)
2. Calculate amount = connection.price × months
3. On payment completion: extend connection paydate, re-enable if disabled

#### 3.2. Payment Status Polling
**Current:** `/payments/transaction/{transaction_id}/status` requires API key  
**Required:** Allow JWT authentication for users to check their own payment status

### 4. Authentication & Security

#### 4.1. Password Length Validation
**Current:** Password length error: "password cannot be longer than 72 bytes, truncate manually if necessary"  
**Required:** Better error message and frontend validation guidance

**Fix:** Update password validation to provide user-friendly error:
```
"Password must be between 8 and 72 characters"
```

#### 4.2. JWT Token Lifetime
**Current:** Unknown JWT expiration  
**Required:** Document token lifetime (suggest 24h for access tokens)

### 5. Missing Endpoints for Frontend

#### 5.1. Active Servers List
**Current:** `/servers/` with `active_only` parameter exists ✓  
**Required:** Ensure JWT authentication allowed for this endpoint

#### 5.2. Grace Period Information
**Current:** Grace period logic implemented but not exposed  
**Required:** Expose GRACE_PERIOD_HOURS configuration via API endpoint or include in connection creation response

### 6. Ownership Enforcement

**Required:** Ensure all user-facing endpoints properly enforce:
1. Users can only access their own resources
2. Non-admin JWT users cannot access other users' data
3. Admin API key can access all resources

**Verify endpoints:**
- [x] `/users/{username}` - has `get_current_user_or_admin` ✓
- [x] `/connections/user/{username}` - has `get_current_user_or_admin` ✓  
- [x] `/connections/{connection_name}` - has `get_current_user_or_admin` ✓
- [ ] `/payments/` - currently requires API key only; add JWT support for user filtering

### 7. Error Responses Consistency

**Required:** Standardize error responses for frontend handling:
- 401: Authentication required/invalid
- 403: Ownership violation
- 404: Resource not found
- 400: Validation errors with detail array

## Priority Order

1. **High Priority (Blocking):**
   - `/users/me` endpoint
   - `/connections/my` endpoint  
   - Password validation fix
   - JWT support for `/payments/` with user filtering

2. **Medium Priority:**
   - `/connections/{connection_name}/change-server` endpoint
   - Connection-aware payment initiation
   - Grace period information exposure

3. **Low Priority:**
   - Enhanced error response standardization
   - Connection creation defaults improvement

## Testing Requirements

Backend team should provide:
1. Updated API documentation
2. Test credentials for JWT authentication
3. Sample workflows:
   - Register → Login → View profile → View connections
   - Create connection → Initiate payment → Check status
   - Change server → Verify new connection string

## Frontend Dependencies

The frontend development can proceed with mock data for endpoints marked as "High Priority" but cannot complete without these backend changes. Medium and low priority items allow partial frontend implementation with fallbacks.

## Timeline Request

Please provide estimated completion timeline for High Priority items to coordinate frontend development.