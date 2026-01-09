/**
 * Task Tracker - Main Entry Point
 *
 * This is the main entry point for the Task Tracker application.
 * It initializes the InSpatial Cloud framework with our extension.
 *
 * HOW IT WORKS:
 * 1. We import createInCloud from the InSpatial Cloud framework
 * 2. We import our custom extension that contains our data models
 * 3. We call createInCloud() which:
 *    - Reads configuration from cloud-config.json
 *    - Sets up the database (PostgreSQL or embedded)
 *    - Registers all extensions and their entry types
 *    - Starts the API server, WebSocket broker, and job queue
 *    - Automatically creates database tables based on entry types
 *
 * RUNNING THE APP:
 * Use the deno task: deno task dev
 * This runs the InSpatial CLI which manages all the processes.
 */

import { createInCloud } from "@inspatial/cloud";
import { taskTrackerExtension } from "./src/mod.ts";

console.log("----------------------------------------");
console.log("STARTING SERVER WITH TASK TRACKER EXTENSION");
console.log("----------------------------------------");

// Initialize the InSpatial Cloud application
// Pass the app name as first argument, extensions as second argument
createInCloud("taskTracker", [taskTrackerExtension]);
