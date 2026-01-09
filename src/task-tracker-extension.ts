/**
 * Task Tracker Extension
 *
 * This file defines the main extension for the Task Tracker application.
 *
 * Key Concepts:
 * - CloudExtension: A modular container that bundles together:
 *   - Entry Types (data models)
 *   - Settings Types (configuration)
 *   - API Groups (custom endpoints)
 *   - Roles (permission definitions)
 *   - Middleware (request interceptors)
 *   - And more...
 *
 * Why use Extensions?
 * - Modularity: Group related functionality together
 * - Reusability: Extensions can be shared across projects
 * - Organization: Clear separation of concerns
 * - Configuration: Each extension can have its own config
 */

import { CloudExtension } from "@inspatial/cloud";
import { taskEntry } from "./entries/task.ts";

/**
 * The main Task Tracker extension.
 *
 * This extension registers:
 * - The "task" entry type for storing tasks
 * 
 * Note: The systemAdmin role automatically gets full permissions 
 * for all entry types registered by extensions.
 */
export const taskTrackerExtension = new CloudExtension("taskTracker", {
  // Human-readable name
  label: "Task Tracker",

  // Description for documentation
  description: "A simple task tracking module for InSpatial Cloud",

  // Version of this extension
  version: "1.0.0",

  // Entry Types (data models) provided by this extension
  entryTypes: [taskEntry],

  // Settings Types (app configuration) - empty for now
  settingsTypes: [],

  // Custom API Groups - empty for now (using built-in CRUD)
  apiGroups: [],

  // Custom Roles - empty for now (systemAdmin auto-gets access)
  roles: [],

  // Middleware - empty for now
  middleware: [],

  // Path Handlers - empty for now
  pathHandlers: [],
});
