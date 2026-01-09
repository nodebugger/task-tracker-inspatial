/**
 * Debug script to inspect role and entry type setup
 * 
 * This will help us understand why "task" isn't registered with systemAdmin
 */

import { createInCloud } from "@inspatial/cloud";
import { taskTrackerExtension } from "./src/mod.ts";

console.log("\n==========================================");
console.log("DEBUG: Inspecting Extension and Entry Types");
console.log("==========================================\n");

// Check the extension before passing it
console.log("1. Extension Details:");
console.log("   Key:", taskTrackerExtension.key);
console.log("   Label:", taskTrackerExtension.label);
console.log("   Entry Types Count:", taskTrackerExtension.entryTypes?.length || 0);

if (taskTrackerExtension.entryTypes && taskTrackerExtension.entryTypes.length > 0) {
  console.log("\n2. Entry Types in Extension:");
  taskTrackerExtension.entryTypes.forEach((entry, idx) => {
    console.log(`   [${idx}] Name: "${entry.name}"`);
    console.log(`       Label: "${entry.label}"`);
    console.log(`       Extension: "${entry.config.extension?.key || 'none'}"`);
  });
} else {
  console.log("\n❌ ERROR: No entry types found in extension!");
}

console.log("\n3. Creating InCloud instance...\n");

// Initialize the InSpatial Cloud application
createInCloud({
  name: "taskTracker",
  description: "A simple task tracking application built with InSpatial Cloud",
  version: "1.0.0",
  extensions: [taskTrackerExtension],
});
