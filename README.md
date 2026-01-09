# Task Tracker API

A simple task tracking application built with **InSpatial Cloud** framework.

## Overview

This project demonstrates how to build a backend API using InSpatial Cloud, a comprehensive backend framework for Deno. It features:

- **Automatic API Generation**: CRUD endpoints are auto-generated from data models
- **Built-in Database**: Uses an embedded PostgreSQL for development
- **Real-time Support**: WebSocket broker for live updates
- **Type Safety**: Full TypeScript support with auto-generated types

## Project Structure

```
task-tracker/
├── main.ts                    # Application entry point
├── cloud-config.json          # Framework configuration
├── deno.json                  # Deno configuration & tasks
├── test_api.ts                # API test script
├── public/                    # Static files
│   └── index.html
└── src/                       # Application source code
    ├── mod.ts                 # Main export file
    ├── task-tracker-extension.ts  # Extension definition
    └── entries/               # Data models (EntryTypes)
        ├── mod.ts             # Entries export
        └── task.ts            # Task entry definition
```

## Data Model

The `task` EntryType has the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | ID | Auto-generated unique identifier |
| `title` | DataField | Task title (required) |
| `description` | TextField | Detailed description |
| `isCompleted` | BooleanField | Completion status |
| `priority` | ChoicesField | low, medium, high |
| `dueDate` | DateField | Due date |
| `createdAt` | TimeStampField | Auto-generated |
| `updatedAt` | TimeStampField | Auto-generated |

## How to Run

### Prerequisites

- **Deno**: Install Deno runtime
  - Windows: `irm https://deno.land/install.ps1 | iex`
  - Mac/Linux: `curl -fsSL https://deno.land/x/install/install.sh | sh`

### Running the App

1. Open a terminal in this folder
2. Run the development server:
   ```bash
   deno task dev
   ```
3. The server will start on `http://localhost:8000`

### Testing the API

Run the test script (while the server is running):
```bash
deno task test-api
```

## API Reference

InSpatial Cloud uses a centralized API structure. All requests go to `/api` with query parameters specifying the group and action.

### Authentication

**For development/testing**, authentication is disabled via the `authAllowAll` config setting in [cloud-config.json](cloud-config.json). This allows you to make API calls without logging in.

**For production**, remove `authAllowAll` and implement proper authentication:

1. Login to get a session cookie:

```bash
curl -X POST "http://localhost:8000/api?group=auth&action=login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@user.com",
    "password": "password"
  }'
```

2. The session cookie is automatically included in subsequent requests from browsers
3. For API clients, you can generate and use API tokens via the Authorization header

### Default Admin Credentials

When the app first starts, it creates a default admin user:

| Field | Value |
|-------|-------|
| Email | admin@user.com |
| Password | password |

**Important**: Change these credentials in production!

### Base URL
```
http://localhost:8000/api
```

### Entry CRUD Operations

All entry operations use `group=entry` and the entry type is specified in the request body.

#### Create a Task
```bash
curl -X POST "http://localhost:8000/api?group=entry&action=createEntry" \
  -H "Content-Type: application/json" \
  -d '{
    "entryType": "task",
    "data": {
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "priority": "high"
    }
  }'
```

#### Get a Task
```bash
curl -X POST "http://localhost:8000/api?group=entry&action=getEntry" \
  -H "Content-Type: application/json" \
  -d '{
    "entryType": "task",
    "id": "YOUR_TASK_ID"
  }'
```

#### List Tasks
```bash
curl -X POST "http://localhost:8000/api?group=entry&action=getEntryList" \
  -H "Content-Type: application/json" \
  -d '{
    "entryType": "task",
    "options": {
      "limit": 10
    }
  }'
```

#### Update a Task
```bash
curl -X POST "http://localhost:8000/api?group=entry&action=updateEntry" \
  -H "Content-Type: application/json" \
  -d '{
    "entryType": "task",
    "id": "YOUR_TASK_ID",
    "data": {
      "isCompleted": true
    }
  }'
```

#### Delete a Task
```bash
curl -X POST "http://localhost:8000/api?group=entry&action=deleteEntry" \
  -H "Content-Type: application/json" \
  -d '{
    "entryType": "task",
    "id": "YOUR_TASK_ID"
  }'
```

### Custom Actions

The task entry type includes custom actions:

#### Mark as Complete
```bash
curl -X POST "http://localhost:8000/api?group=entry&action=runEntryAction" \
  -H "Content-Type: application/json" \
  -d '{
    "entryType": "task",
    "id": "YOUR_TASK_ID",
    "action": "markComplete"
  }'
```

#### Mark as Incomplete
```bash
curl -X POST "http://localhost:8000/api?group=entry&action=runEntryAction" \
  -H "Content-Type: application/json" \
  -d '{
    "entryType": "task",
    "id": "YOUR_TASK_ID",
    "action": "markIncomplete"
  }'
```

### Other Useful Endpoints

#### Ping (Check Server Status)
```bash
curl "http://localhost:8000/api?group=api&action=ping"
```

#### Get Entry Type Info
```bash
curl -X POST "http://localhost:8000/api?group=entry&action=getEntryTypeInfo" \
  -H "Content-Type: application/json" \
  -d '{
    "entryType": "task"
  }'
```

## Configuration

Configuration is stored in `cloud-config.json`. Key settings:

| Setting | Default | Description |
|---------|---------|-------------|
| `CLOUD_MODE` | development | development or production |
| `SERVE_PORT` | 8000 | HTTP server port |
| `BROKER_PORT` | 11254 | WebSocket broker port |
| `EMBEDDED_DB` | true | Use embedded PostgreSQL |
| `AUTO_MIGRATE` | true | Auto-run database migrations |
| `AUTO_TYPES` | true | Auto-generate TypeScript types |

## Local Development

This project is configured to use the local `inspatial-cloud` repository. The `deno.json` maps:

```json
{
  "imports": {
    "@inspatial/cloud": "../inspatial-cloud/mod.ts"
  }
}
```

For production, you would use the public registry:
```json
{
  "imports": {
    "@inspatial/cloud": "jsr:@inspatial/cloud"
  }
}
```

## Learn More

See the documentation in `../inspatial-cloud/local/docs/` for:
- Core Concepts & Setup
- Data Modeling
- API & Business Logic
- Authentication & Security
- Advanced Features
- Extensions & Deployment
