/**
 * Task Tracker API Test Script
 *
 * This script demonstrates how to interact with the InSpatial Cloud API.
 *
 * IMPORTANT: InSpatial Cloud uses a centralized API structure:
 * - All CRUD operations go through: POST /api?group=entry&action=<actionName>
 * - The entry type is specified in the request body as "entryType"
 *
 * AUTHENTICATION:
 * - Most API actions require authentication
 * - You need to login first to get a session cookie
 * - The session cookie is automatically sent with subsequent requests
 * 
 * Note: For API clients (non-browser), you can also use an API token:
 * - Generate an API token for a user via the "generateApiToken" action
 * - Pass the token in the Authorization header as "Bearer YOUR_TOKEN"
 * - This test script uses session cookies for simplicity
 *
 * API STRUCTURE:
 * - group=entry: The built-in entry group handles all CRUD operations
 * - action: The specific operation to perform
 *   - createEntry: Create a new entry
 *   - getEntry: Get a single entry by ID
 *   - getEntryList: Get a list of entries with optional filtering
 *   - updateEntry: Update an existing entry
 *   - deleteEntry: Delete an entry
 *   - runEntryAction: Run a custom action defined on the entry type
 *
 * REQUEST BODY:
 * - entryType: The name of the entry type (e.g., "task")
 * - data: The data for create/update operations
 * - id: The entry ID for get/update/delete operations
 * - options: Query options for list operations (pagination, filtering, etc.)
 */

const BASE_URL = "http://localhost:8000/api";

// Store auth token and cookies
let authToken: string | null = null;
let sessionCookie: string | null = null;

/**
 * Helper function to make API calls
 */
async function apiCall<T = unknown>(
  action: string,
  body: Record<string, unknown>,
  group = "entry",
  requiresAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add session cookie if we have one
  if (sessionCookie) {
    headers["Cookie"] = sessionCookie;
  }

  // Add Authorization header if auth is required and we have a token
  if (requiresAuth && authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
    console.log("🔐 Using auth token:", authToken.substring(0, 20) + "...");
  }

  const res = await fetch(`${BASE_URL}?group=${group}&action=${action}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  // Capture session cookie from response
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    // Extract just the cookie value (before the first semicolon)
    const cookieValue = setCookie.split(";")[0];
    sessionCookie = cookieValue;
    console.log("🍪 Received session cookie:", cookieValue.substring(0, 30) + "...");
  }

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API Error (${res.status}): ${error}`);
  }

  return await res.json();
}

/**
 * Login to get session cookie
 */
async function login() {
  console.log("Logging in as admin...");
  try {
    const result = await apiCall<{ sessionId: string }>(
      "login",
      {
        email: "admin@user.com",
        password: "password",
      },
      "auth",
      false // Login doesn't require auth
    );
    console.log("✅ Logged in successfully");
    console.log("📝 Session ID:", result.sessionId ? `${result.sessionId.substring(0, 20)}...` : "MISSING!");
    console.log();
  } catch (error) {
    console.error("❌ Login failed:", error);
    console.log("\nNote: Make sure the server is running and the admin user was created.");
    console.log("If the admin user creation failed, delete the .inspatial/db-data folder and restart.\n");
    throw error;
  }
}

async function testApi() {
  try {
    console.log("🚀 Task Tracker API Test\n");
    console.log("=".repeat(50));

    // 0. Login first
    await login();

    // 1. Create a Task
    console.log("\n1. Creating a new task...");
    const newTask = await apiCall<{ id: string }>("createEntry", {
      entryType: "task",
      data: {
        title: "Buy Groceries",
        description: "Milk, Eggs, Bread",
        isCompleted: false,
        priority: "high",
      },
    });
    console.log("✅ Created:", newTask);

    // 2. Get the created task
    console.log("\n2. Getting the created task...");
    const task = await apiCall("getEntry", {
      entryType: "task",
      id: newTask.id,
    });
    console.log("✅ Retrieved:", task);

    // 3. List all Tasks
    console.log("\n3. Listing all tasks...");
    const list = await apiCall("getEntryList", {
      entryType: "task",
      options: {
        limit: 10,
      },
    });
    console.log("✅ List:", list);

    // 4. Update Task
    console.log(`\n4. Updating task ${newTask.id}...`);
    const updatedTask = await apiCall("updateEntry", {
      entryType: "task",
      id: newTask.id,
      data: {
        description: "Milk, Eggs, Bread, and Cheese",
        priority: "medium",
      },
    });
    console.log("✅ Updated:", updatedTask);

    // 5. Run custom action (mark as complete)
    console.log(`\n5. Running markComplete action on task ${newTask.id}...`);
    const actionResult = await apiCall("runEntryAction", {
      entryType: "task",
      id: newTask.id,
      action: "markComplete",
    });
    console.log("✅ Action result:", actionResult);

    // 6. Get entry type info
    console.log("\n6. Getting task entry type info...");
    const entryTypeInfo = await apiCall("getEntryTypeInfo", {
      entryType: "task",
    });
    console.log("✅ Entry Type Info:", JSON.stringify(entryTypeInfo, null, 2));

    // 7. Delete Task
    console.log(`\n7. Deleting task ${newTask.id}...`);
    const deleteResult = await apiCall("deleteEntry", {
      entryType: "task",
      id: newTask.id,
    });
    console.log("✅ Deleted:", deleteResult);

    console.log("\n" + "=" .repeat(50));
    console.log("🎉 All tests passed!");

  } catch (error) {
    console.error("❌ Error:", error);
    Deno.exit(1);
  }
}

// Run the test
testApi();
