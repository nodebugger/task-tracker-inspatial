# Error Fixes: Summary

## Issues Encountered and Fixed

### 1. Framework Bug: "Field enabled is required for user"

**Error:**
```
error: Uncaught (in promise) ORMException: Field enabled is required for user
    at createAdminUser (file://.../init-admin-account.ts:65:3)
```

**Root Cause:**
The user entry type has an `enabled` field marked as `required: true`, but the admin user creation code wasn't setting this field.

**Location:** `inspatial-cloud/src/auth/migrate/init-admin-account.ts`

**Fix:**
Added `enabled: true` to the user creation data:

```typescript
user.update({
  firstName,
  lastName,
  email,
  systemAdmin: true,
  adminPortalAccess: true,
  enabled: true,  // ← Added this
});
```

**Why it happened:**
The field was recently added to the user entry type but the migration script wasn't updated to include it.

---

### 2. Authentication Error: "User is not authenticated" (401)

**Error:**
```
❌ Error: API Error (401): ["User is not authenticated"]
```

**Root Cause:**
InSpatial Cloud's API requires authentication via the `Authorization` header with a Bearer token, not in the request body. The test script was incorrectly passing the authToken in the request body instead of the header.

**How Authentication Works:**
The framework extracts the authToken from the `Authorization: Bearer <token>` header in the auth lifecycle handler ([inspatial-cloud/src/auth/auth-lifecycle.ts](inspatial-cloud/src/auth/auth-lifecycle.ts#L12-L17)):

```typescript
const authHeader = inRequest.headers.get("Authorization");
if (authHeader) {
  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
    inRequest.context.update("authToken", parts[1]);
  }
}
```

**Fix:**
Updated the test script ([task-tracker/test_api.ts](task-tracker/test_api.ts)) to:

1. **Use Authorization header** instead of body parameter:
   ```typescript
   const headers: Record<string, string> = {
     "Content-Type": "application/json",
   };

   if (requiresAuth && authToken) {
     headers["Authorization"] = `Bearer ${authToken}`;
   }

   const res = await fetch(`${BASE_URL}?group=${group}&action=${action}`, {
     method: "POST",
     headers,
     body: JSON.stringify(body),  // No authToken in body
   });
   ```

2. **Example curl command**:
   ```bash
   curl -X POST "http://localhost:8000/api?group=entry&action=createEntry" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
     -d '{"entryType": "task", "data": {...}}'
   ```

---

## How to Test Now

1. **Delete the corrupted database** (since the first migration failed):
   ```bash
   Remove-Item .inspatial/db-data -Recurse -Force
   ```

2. **Start the server**:
   ```bash
   deno task dev
   ```
   
   The server should start successfully now and create the admin user.

3. **Run the test script**:
   ```bash
   deno task test-api
   ```
   
   It will:
   - Login as admin
   - Create a task
   - List tasks
   - Update the task
   - Run custom actions
   - Delete the task

---

## Default Admin Credentials

When the app starts for the first time, it creates:

| Field | Value |
|-------|-------|
| Email | `admin@user.com` |
| Password | `password` |

**Important:** Change these in production!

---

## Updated Documentation

The following files were updated to reflect these changes:

1. **README.md**
   - Added authentication section
   - Updated all API examples to include `authToken`
   - Added default admin credentials

2. **test_api.ts**
   - Added login function
   - Added auth token management
   - Updated all API calls to include authentication

---

## Why Authentication is Required

InSpatial Cloud is designed as a multi-tenant system with:

- **Role-based access control (RBAC)**
- **Account isolation**
- **User permissions**

Each API request needs to know:
- Who is making the request (authentication)
- What account they belong to (authorization)
- What role they have (permissions)

This is why most endpoints require authentication via the `Authorization: Bearer <token>` header.

---

## Files Modified

### Framework (inspatial-cloud)
- `src/auth/migrate/init-admin-account.ts` - Added `enabled: true` to user creation

### Task Tracker
- `test_api.ts` - Added authentication flow
- `README.md` - Added auth documentation
- `FIXES.md` - This file

---

## Next Steps

After applying these fixes:

1. ✅ Delete `.inspatial/db-data` folder
2. ✅ Restart the server with `deno task dev`
3. ✅ Wait for "Server: Running on port 8000" message
4. ✅ Run `deno task test-api` to verify everything works

The server should start cleanly without the "Field enabled" error, and the test script should complete successfully with authentication.
