import { createInCloud } from "@inspatial/cloud";
import { taskTrackerExtension } from "./src/mod.ts";

console.log("----------------------------------------");
console.log("STARTING SERVER WITH TASK TRACKER EXTENSION");
console.log("----------------------------------------");

// Initialize the InSpatial Cloud application
// Pass the app name as first argument, extensions as second argument
createInCloud("taskTracker", [taskTrackerExtension]);
