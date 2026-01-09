/**
 * Task Entry Type
 *
 * This file defines the "task" entry type for our Task Tracker application.
 * An EntryType in InSpatial Cloud is similar to a database model/table.
 *
 * Key Concepts:
 * - EntryType: Defines a data model that automatically generates:
 *   - Database table
 *   - CRUD API endpoints
 *   - TypeScript types
 *
 * - Fields: Each field represents a column in the database table.
 *   - key: The unique identifier for this field (column name)
 *   - type: The data type (DataField = short text, TextField = long text, etc.)
 *   - label: Human-readable name shown in UIs
 *   - required: Whether this field must have a value
 *   - defaultValue: The default value when creating new entries
 */

import { EntryType } from "@inspatial/cloud";

export const taskEntry = new EntryType("task", {
  // Human-readable name for this entry type
  label: "Task",

  // Description shown in documentation and admin UIs
  description: "A task item in the task tracker",

  // The field to use as the display title (defaults to "id" if not specified)
  titleField: "title",

  // Fields define the structure of each task record
  fields: [
    {
      key: "title",
      type: "DataField", // Short text (up to ~255 chars)
      label: "Task Title",
      description: "The title of the task",
      required: true,
    },
    {
      key: "description",
      type: "TextField", // Long text (unlimited)
      label: "Description",
      description: "Detailed description of the task",
      required: false,
    },
    {
      key: "isCompleted",
      type: "BooleanField", // true/false
      label: "Completed",
      description: "Whether the task has been completed",
      defaultValue: false,
      required: false,
    },
    {
      key: "priority",
      type: "ChoicesField", // Selection from predefined options
      label: "Priority",
      description: "The priority level of the task",
      choices: [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
      ],
      defaultValue: "medium",
      required: false,
    },
    {
      key: "dueDate",
      type: "DateField", // ISO date string
      label: "Due Date",
      description: "The due date for the task",
      required: false,
    },
  ],

  // Custom actions that can be performed on a task
  // These create API endpoints like: POST /api?group=entry&action=runEntryAction
  // with params: { entryType: "task", id: "...", action: "markComplete" }
  actions: [
    {
      key: "markComplete",
      label: "Mark as Complete",
      description: "Marks the task as completed",
      params: [],
      async action({ entry, orm }) {
        // Access the entry's isCompleted field using the $ prefix
        entry.$isCompleted = true;
        await entry.save();
        return {
          success: true,
          message: "Task marked as complete",
          task: entry.clientData,
        };
      },
    },
    {
      key: "markIncomplete",
      label: "Mark as Incomplete",
      description: "Marks the task as incomplete",
      params: [],
      async action({ entry, orm }) {
        entry.$isCompleted = false;
        await entry.save();
        return {
          success: true,
          message: "Task marked as incomplete",
          task: entry.clientData,
        };
      },
    },
  ],

  // Search these fields when using the search feature
  searchFields: ["title", "description"],

  // Default fields to show in list views
  defaultListFields: ["title", "isCompleted", "priority", "dueDate"],

  // Default sorting
  defaultSortField: "createdAt",
  defaultSortDirection: "desc",
});
