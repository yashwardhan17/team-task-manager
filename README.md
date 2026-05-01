# TaskFlow — Team Task Manager

A full-stack team task management application with role-based access control, real-time Kanban board, and project analytics dashboard.

**Live URL:** https://team-task-manager-production-80fa.up.railway.app

## Tech Stack

**Backend:** Java 21, Spring Boot, Spring Security, Spring Data JPA, PostgreSQL, JWT Authentication

**Frontend:** React 18, Vite, React Router, Axios, Lucide Icons, React Hot Toast

**Deployment:** Railway (Backend + PostgreSQL), Static frontend served from Spring Boot

## Features

- **Authentication** — Secure signup/login with JWT tokens and BCrypt password hashing
- **Project Management** — Create projects, invite team members by email, manage teams
- **Kanban Board** — Drag-and-drop task management across 4 status columns (To Do, In Progress, In Review, Done)
- **Role-Based Access** — Admin and Member roles with permission-based actions
- **Task System** — Create tasks with title, description, priority levels (Low/Medium/High/Urgent), deadlines, and assignees
- **Overdue Detection** — Tasks past deadline are auto-flagged with visual indicators
- **Activity Feed** — Full audit log tracking who created, assigned, or moved tasks
- **Dashboard Analytics** — Completion rate, status breakdown with progress bars, overdue count, and recent activity timeline
- **Responsive UI** — Dark-themed, modern interface built without UI libraries

## Project Structure

```
team-task-manager/
├── src/main/java/com/taskmanager/
│   ├── config/          # Security configuration, CORS
│   ├── controller/      # REST API endpoints
│   ├── dto/             # Request/Response objects
│   ├── entity/          # JPA entities (User, Project, Task, ProjectMember, ActivityLog)
│   ├── repository/      # Spring Data repositories
│   ├── security/        # JWT filter, token utility
│   └── service/         # Business logic layer
├── frontend/            # React application (Vite)
│   └── src/
│       ├── api/         # Axios configuration
│       └── components/  # React components
└── pom.xml
```

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login and receive JWT

### Projects
- `POST /api/projects` — Create project
- `GET /api/projects` — Get user's projects
- `GET /api/projects/{id}` — Get project details
- `POST /api/projects/{id}/members` — Add team member
- `GET /api/projects/{id}/members` — List members
- `GET /api/projects/{id}/dashboard` — Dashboard analytics

### Tasks
- `POST /api/projects/{id}/tasks` — Create task
- `GET /api/projects/{id}/tasks` — List project tasks
- `PATCH /api/projects/{id}/tasks/{taskId}` — Update task (status, assignee, priority)
- `DELETE /api/projects/{id}/tasks/{taskId}` — Delete task

### Users
- `GET /api/users/search?email=` — Search user by email

## Running Locally

### Prerequisites
- Java 21
- PostgreSQL
- Node.js 18+

### Backend
```bash
# Create database
psql -U postgres -c "CREATE DATABASE taskmanager;"

# Configure src/main/resources/application.properties
# Run
./mvnw spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Design Decisions

- **Activity Log as differentiator** — Every action (task creation, assignment, status change) is logged, creating a full audit trail similar to GitHub/Jira
- **Drag-and-drop Kanban** — Native HTML5 drag-and-drop for zero-dependency task movement
- **JWT stateless auth** — No server-side sessions, scalable token-based authentication
- **Monorepo structure** — Single repository with frontend build served as static resources from Spring Boot for simplified deployment

## Author

**Yashwardhan** — [GitHub](https://github.com/yashwardhan17)