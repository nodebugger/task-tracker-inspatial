# InSpatial Cloud Framework Guide: Task Tracker Tutorial

## Introduction

Welcome! This document explains how the **Task Tracker** application works with **InSpatial Cloud**, a comprehensive backend framework for Deno. By reading this guide, you'll understand the framework's architecture, how to define data models, and how the API system works.

---

## Table of Contents

1. [What is InSpatial Cloud?](#1-what-is-inspatial-cloud)
2. [Project Structure](#2-project-structure)
3. [Understanding Entry Types (Data Models)](#3-understanding-entry-types-data-models)
4. [Understanding Extensions](#4-understanding-extensions)
5. [The API System](#5-the-api-system)
6. [Configuration](#6-configuration)
7. [Common Issues & Solutions](#7-common-issues--solutions)
8. [Next Steps](#8-next-steps)

---

## 1. What is InSpatial Cloud?

InSpatial Cloud is a backend framework that provides:

| Feature | Description |
|---------|-------------|
| **Automatic API Generation** | Define a data model once, get CRUD endpoints automatically |
| **Built-in ORM** | Object-Relational Mapping for PostgreSQL databases |
| **Embedded Database** | Development-ready embedded PostgreSQL (WASM-based) |
| **Real-time Support** | WebSocket broker for live updates |
| **Job Queues** | Background task processing |
| **Authentication** | Built-in user management and RBAC |

### Architecture Overview

When you run an InSpatial Cloud app, it spawns multiple processes:

```
┌─────────────────────────────────────────────────────────┐
│                    InSpatial Cloud                       │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Server  │  │  Broker  │  │  Queue   │  │   DB    │ │
│  │ (HTTP)   │  │ (WS)     │  │ (Jobs)   │  │ (PG)    │ │
│  │ :8000    │  │ :11254   │  │ :11354   │  │ :11527  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Project Structure

Here's how our Task Tracker project is organized:

```
task-tracker/
├── main.ts                         # Entry point - initializes the app
├── cloud-config.json               # Framework configuration
├── deno.json                       # Deno configuration & tasks
├── test_api.ts                     # API test script
├── README.md                       # Project documentation
├── public/                         # Static files served at root
│   └── index.html
└── src/                            # Application source code
    ├── mod.ts                      # Module exports
    ├── task-tracker-extension.ts   # Extension definition
    └── entries/                    # Data models
        ├── mod.ts                  # Entry exports
        └── task.ts                 # Task entry type
```

### Why This Structure?

1. **Modularity**: Code is organized by concern (entries, extensions, etc.)
2. **Scalability**: Easy to add new entry types, API groups, settings
3. **Clarity**: Clear separation between framework code and app code
4. **Best Practices**: Follows InSpatial Cloud conventions

---

## 3. Understanding Entry Types (Data Models)

An **EntryType** is the core concept in InSpatial Cloud. It represents a data model (like a database table) and automatically generates:

- Database table schema
- CRUD API endpoints
- TypeScript type definitions
- Validation rules

### Anatomy of an EntryType

```typescript
// src/entries/task.ts
import { EntryType } from "@inspatial/cloud";

export const taskEntry = new EntryType("task", {
  // Metadata
  label: "Task",
  description: "A task item in the task tracker",
  titleField: "title",
  
  // Field definitions
  fields: [
    {
      key: "title",           // Database column name
      type: "DataField",       // Short text (varchar)
      label: "Task Title",     // Human-readable label
      required: true,          // Validation rule
    },
    {
      key: "isCompleted",
      type: "BooleanField",    // Boolean type
      label: "Completed",
      defaultValue: false,     // Default when creating
    },
    // ... more fields
  ],
  
  // Custom actions
  actions: [
    {
      key: "markComplete",
      label: "Mark as Complete",
      action: async ({ entry }) => {
        entry.$isCompleted = true;
        await entry.save();
        return { success: true };
      },
    },
  ],
});
```

### Field Types Reference

| Type | Description | TypeScript Type |
|------|-------------|-----------------|
| `DataField` | Short text (varchar) | `string` |
| `TextField` | Long text (text) | `string` |
| `IntField` | Integer | `number` |
| `DecimalField` | Decimal number | `number` |
| `BooleanField` | True/False | `boolean` |
| `EmailField` | Validated email | `string` |
| `DateField` | ISO date | `string` |
| `TimeStampField` | Unix timestamp | `number` |
| `ChoicesField` | Enum/selection | `string` |
| `ConnectionField` | Foreign key | `string` |
| `JSONField` | JSON data | `object` |
| `ImageField` | Image URL | `string` |
| `ArrayField` | Array of values | `T[]` |

### Automatic Fields

Every EntryType automatically includes:

| Field | Type | Description |
|-------|------|-------------|
| `id` | IDField | Auto-generated unique ID (ULID) |
| `createdAt` | TimeStampField | When record was created |
| `updatedAt` | TimeStampField | When record was last updated |
| `in__tags` | ArrayField | Tags for the entry |

### The `$` Syntax

When working with entries in code, use the `$` prefix to access fields:

```typescript
// This triggers ORM tracking for changes
entry.$title = "New Title";
entry.$isCompleted = true;

// Save changes to database
await entry.save();
```

---

## 4. Understanding Extensions

**Extensions** are the modular building blocks of InSpatial Cloud applications. They bundle together related functionality.

### Why Use Extensions?

1. **Modularity**: Group related code together
2. **Reusability**: Share extensions across projects
3. **Configuration**: Each extension can have its own settings
4. **Lifecycle Hooks**: React to app startup, shutdown, etc.

### Creating an Extension

```typescript
// src/task-tracker-extension.ts
import { CloudExtension } from "@inspatial/cloud";
import { taskEntry } from "./entries/mod.ts";

export const taskTrackerExtension = new CloudExtension("taskTracker", {
  label: "Task Tracker",
  description: "A simple task tracking module",
  version: "1.0.0",
  
  // Data models
  entryTypes: [taskEntry],
  
  // Configuration schemas
  settingsTypes: [],
  
  // Custom API endpoints
  apiGroups: [],
  
  // User roles
  roles: [],
  
  // Request middleware
  middleware: [],
  
  // Custom route handlers
  pathHandlers: [],
});
```

### Registering Extensions

Extensions are registered in `main.ts`:

```typescript
import { createInCloud } from "@inspatial/cloud";
import { taskTrackerExtension } from "./src/mod.ts";

createInCloud({
  name: "taskTracker",
  extensions: [taskTrackerExtension],
});
```

---

## 5. The API System

InSpatial Cloud uses a **centralized API structure**. All requests go through `/api` with query parameters.

### API Endpoint Structure

```
POST /api?group=<group_name>&action=<action_name>
```

- **group**: The API group (e.g., `entry`, `api`, `auth`)
- **action**: The specific action to perform

### Built-in API Groups

| Group | Purpose |
|-------|---------|
| `api` | System actions (ping, getDocs) |
| `entry` | CRUD operations for all entry types |
| `settings` | Manage settings types |
| `orm` | Schema information |
| `auth` | Authentication |
| `files` | File management |

### Entry CRUD Operations

All entry types share the same API group (`entry`). The entry type is specified in the request body:

#### Create Entry
```bash
POST /api?group=entry&action=createEntry
Content-Type: application/json

{
  "entryType": "task",
  "data": {
    "title": "My Task",
    "description": "Task description",
    "priority": "high"
  }
}
```

#### Get Entry
```bash
POST /api?group=entry&action=getEntry
Content-Type: application/json

{
  "entryType": "task",
  "id": "01HQ..."
}
```

#### List Entries
```bash
POST /api?group=entry&action=getEntryList
Content-Type: application/json

{
  "entryType": "task",
  "options": {
    "limit": 10,
    "offset": 0,
    "orderBy": "createdAt",
    "orderDirection": "desc"
  }
}
```

#### Update Entry
```bash
POST /api?group=entry&action=updateEntry
Content-Type: application/json

{
  "entryType": "task",
  "id": "01HQ...",
  "data": {
    "isCompleted": true
  }
}
```

#### Delete Entry
```bash
POST /api?group=entry&action=deleteEntry
Content-Type: application/json

{
  "entryType": "task",
  "id": "01HQ..."
}
```

#### Run Custom Action
```bash
POST /api?group=entry&action=runEntryAction
Content-Type: application/json

{
  "entryType": "task",
  "id": "01HQ...",
  "action": "markComplete"
}
```

### Important: The "Group Name" Issue You Encountered

The original code had this error pattern:
```typescript
// ❌ WRONG: Using entry type name as group
fetch(`/api?group=task&action=create`, ...)

// ✅ CORRECT: Use "entry" group with entryType in body
fetch(`/api?group=entry&action=createEntry`, {
  body: JSON.stringify({
    entryType: "task",
    data: {...}
  })
})
```

The framework uses a **generic `entry` group** that handles ALL entry types. You specify which entry type to operate on using the `entryType` parameter in the request body.

---

## 6. Configuration

### cloud-config.json

This file configures the InSpatial Cloud framework:

```json
{
  "$schema": ".inspatial/cloud-config-schema.json",
  "core": {
    "CLOUD_MODE": "development",
    "LOG_LEVEL": "info",
    "SERVE_PORT": 8000,
    "BROKER_PORT": 11254,
    "QUEUE_PORT": 11354,
    "EMBEDDED_DB": true,
    "EMBEDDED_DB_PORT": 11527,
    "AUTO_MIGRATE": true,
    "AUTO_TYPES": true,
    "PUBLIC_ROOT": "./public",
    "ALLOWED_ORIGINS": ["*"]
  }
}
```

### Key Settings

| Setting | Description |
|---------|-------------|
| `CLOUD_MODE` | `development` or `production` |
| `SERVE_PORT` | HTTP server port |
| `EMBEDDED_DB` | Use embedded PostgreSQL (dev only) |
| `AUTO_MIGRATE` | Auto-run database migrations |
| `AUTO_TYPES` | Auto-generate TypeScript types |
| `PUBLIC_ROOT` | Directory for static files |

### deno.json

```json
{
  "tasks": {
    "dev": "deno run -A --unstable-kv --unstable-broadcast-channel ../inspatial-cloud/cli/incloud.ts run main.ts",
    "test-api": "deno run -A test_api.ts"
  },
  "imports": {
    "@inspatial/cloud": "../inspatial-cloud/mod.ts"
  }
}
```

---

## 7. Common Issues & Solutions

### Issue: "Group name is required" or "Group not found"

**Cause**: Using the entry type name as the group instead of "entry".

**Solution**: Use `group=entry` and pass `entryType` in the request body.

### Issue: "Field X is required"

**Cause**: Missing required field in the data.

**Solution**: Ensure all `required: true` fields have values.

### Issue: Server won't start / Database errors

**Cause**: Corrupted embedded database data.

**Solution**: Delete the `.inspatial/db-data` directory and restart.

### Issue: "BroadcastChannel is not defined"

**Cause**: Missing Deno unstable flags.

**Solution**: Run with `--unstable-broadcast-channel --unstable-kv` flags.

---

## 8. Next Steps

### Adding More Entry Types

1. Create a new file in `src/entries/` (e.g., `category.ts`)
2. Define the EntryType
3. Export from `src/entries/mod.ts`
4. Add to the extension's `entryTypes` array
5. Restart the server (migrations run automatically)

### Adding Custom API Actions

1. Define a `CloudAPIAction`
2. Create a `CloudAPIGroup`
3. Add the group to your extension's `apiGroups`

### Adding Settings

1. Create a `SettingsType`
2. Add to extension's `settingsTypes`
3. Access via the settings API group

### Adding Roles & Permissions

1. Define roles in your extension
2. Configure permissions for entry types
3. Add role checks in custom actions

---

## Summary

| Concept | Purpose |
|---------|---------|
| **EntryType** | Defines a data model (table + API) |
| **CloudExtension** | Bundles related functionality |
| **CloudAPIGroup** | Groups related API actions |
| **CloudAPIAction** | A single API endpoint |
| **SettingsType** | App configuration schemas |

### Key Files in Your Project

| File | Purpose |
|------|---------|
| `main.ts` | App entry point |
| `cloud-config.json` | Framework configuration |
| `src/entries/*.ts` | Data model definitions |
| `src/task-tracker-extension.ts` | Main extension |

---

## Quick Reference: API Cheat Sheet

```bash
# Ping server
GET /api?group=api&action=ping

# Create entry
POST /api?group=entry&action=createEntry
Body: { "entryType": "task", "data": {...} }

# Get entry
POST /api?group=entry&action=getEntry
Body: { "entryType": "task", "id": "..." }

# List entries
POST /api?group=entry&action=getEntryList
Body: { "entryType": "task", "options": {...} }

# Update entry
POST /api?group=entry&action=updateEntry
Body: { "entryType": "task", "id": "...", "data": {...} }

# Delete entry
POST /api?group=entry&action=deleteEntry
Body: { "entryType": "task", "id": "..." }

# Run custom action
POST /api?group=entry&action=runEntryAction
Body: { "entryType": "task", "id": "...", "action": "..." }
```

---

*This documentation was created as part of the Task Tracker tutorial for InSpatial Cloud.*
