# LinkTrack — URL Shortener & Analytics Platform

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-red.svg)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)

**LinkTrack** is a high-performance, full-stack URL shortening and click-intelligence platform engineered with **Spring Boot 3 (Java 21)**, **Spring Security 6 (Stateless JWT)**, **PostgreSQL**, **Redis Caching**, and **React 18 (Vite + Recharts)**.

---

## 🌟 Key Features

- **⚡ High-Speed 302 Redirection**: Sub-millisecond redirects powered by resilient Redis caching with automatic database fallback.
- **🏷️ Base62 & Custom Branded Aliases**: Generates unique 7-character Base62 short codes or allows custom branded vanity URLs (e.g. `linktrack.com/spring-docs`) with reserved keyword protection.
- **⏳ Dynamic URL Expiration**: Set optional expiration dates on links with automated deactivation.
- **📊 Deep Click Intelligence & Analytics**:
  - Real-time click tracking across **Browser** (Chrome, Safari, Firefox, Edge, Opera, Samsung Internet), **Operating System** (Windows, macOS, Linux, iOS, Android), and **Device** (Desktop, Mobile, Tablet).
  - 30-day interactive time-series click trend graphs using Recharts.
- **🔒 Enterprise Security**:
  - Stateless JWT Bearer authentication.
  - Salted BCrypt password hashing.
  - Granular Role-Based Access Control (`USER` & `ADMIN`).
  - Strict ownership validation (users cannot view, edit, or analyze other users' URLs).
- **🛡️ Platform Administration**:
  - Global system statistics (total users, links, clicks, and active/expired ratio).
  - User registry monitoring.
  - Abusive URL governance with one-click deactivation.
- **📖 Interactive API Docs**: Swagger / OpenAPI 3 with integrated JWT Bearer authentication.
- **🩺 Spring Boot Actuator**: Health, metrics, and application liveness monitoring.
- **🐳 Multi-Container Docker Architecture**: Pre-configured Docker Compose orchestrating Backend, Frontend (Nginx), PostgreSQL, and Redis.

---

## 🏗️ Architecture & Data Flow

```mermaid
graph TD
    Client[React 18 + Vite Client\nModern Dark Glassmorphism UI] -->|REST API + JWT Bearer| Security[Spring Security 6\nStateless JwtAuthenticationFilter]
    
    subgraph Spring Boot 3 Backend
        Security --> AuthController[AuthController\n/api/auth/*]
        Security --> UrlController[UrlController\n/api/urls/*]
        Security --> RedirectController[RedirectController\n/{shortCode}]
        Security --> AnalyticsController[AnalyticsController\n/api/urls/{id}/analytics]
        Security --> DashboardController[DashboardController\n/api/dashboard]
        Security --> AdminController[AdminController\n/api/admin/*]
        
        UrlController --> UrlService[UrlService]
        RedirectController --> RedirectService[RedirectService]
        AnalyticsController --> AnalyticsService[AnalyticsService]
        DashboardController --> DashboardService[DashboardService]
        
        RedirectService -.->|1. Fast Cache Lookup| Redis[(Redis 7 Cache\nResilient / Sub-ms)]
        RedirectService -->|2. Miss / Query| DB[(PostgreSQL 16\nIndexed Tables)]
        UrlService --> DB
        AnalyticsService --> DB
    end

    subgraph Observability
        Backend --> Actuator[Spring Boot Actuator\n/actuator/health]
        Backend --> Swagger[OpenAPI 3 / Swagger UI\n/swagger-ui/index.html]
    end
```

---

## 🗄️ Database Schema & Entities

### 1. `users`
| Field | Type | Constraint | Description |
|---|---|---|---|
| `id` | `BIGINT` | `PRIMARY KEY AUTO_INCREMENT` | Unique user ID |
| `name` | `VARCHAR(100)` | `NOT NULL` | User full name |
| `email` | `VARCHAR(150)` | `UNIQUE, NOT NULL, INDEX` | User email address |
| `password` | `VARCHAR(255)` | `NOT NULL` | BCrypt hashed password |
| `role` | `VARCHAR(20)` | `NOT NULL` | `USER` or `ADMIN` |
| `created_at` | `TIMESTAMP` | `NOT NULL` | Registration timestamp |

### 2. `urls`
| Field | Type | Constraint | Description |
|---|---|---|---|
| `id` | `BIGINT` | `PRIMARY KEY AUTO_INCREMENT` | Unique URL record ID |
| `user_id` | `BIGINT` | `FOREIGN KEY, INDEX` | Owner user ID |
| `original_url` | `TEXT` | `NOT NULL` | Destination target URL |
| `short_code` | `VARCHAR(30)` | `UNIQUE, NOT NULL, INDEX` | 7-character Base62 string |
| `custom_alias` | `VARCHAR(50)` | `UNIQUE, INDEX` | Optional user-defined alias |
| `active` | `BOOLEAN` | `DEFAULT TRUE, INDEX` | Active status |
| `click_count` | `BIGINT` | `DEFAULT 0` | Total click count |
| `created_at` | `TIMESTAMP` | `NOT NULL` | Creation timestamp |
| `expires_at` | `TIMESTAMP` | `NULLABLE` | Optional expiration timestamp |

### 3. `click_events`
| Field | Type | Constraint | Description |
|---|---|---|---|
| `id` | `BIGINT` | `PRIMARY KEY AUTO_INCREMENT` | Event log ID |
| `url_id` | `BIGINT` | `FOREIGN KEY, INDEX` | Associated short URL |
| `clicked_at` | `TIMESTAMP` | `NOT NULL, INDEX` | Click timestamp |
| `ip_address` | `VARCHAR(100)` | `NULLABLE` | Client IP address |
| `user_agent` | `TEXT` | `NULLABLE` | Raw User-Agent string |
| `browser` | `VARCHAR(50)` | `NULLABLE` | Chrome, Safari, Firefox, Edge... |
| `operating_system` | `VARCHAR(50)` | `NULLABLE` | Windows, macOS, Linux, iOS, Android... |
| `device` | `VARCHAR(50)` | `NULLABLE` | Desktop, Mobile, Tablet |
| `referrer` | `TEXT` | `NULLABLE` | Referring site |

---

## 📡 REST API Reference

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account (`name`, `email`, `password`)
- `POST /api/auth/login` — Login and obtain JWT token (`email`, `password`)

### 🔗 Short URLs (`/api/urls`)
- `POST /api/urls` — Create a new short URL (`originalUrl`, `customAlias`, `expiresAt`)
- `GET /api/urls` — List paginated URLs belonging to authenticated user (`page`, `size`, `search`, `status`, `sortBy`, `sortDir`)
- `GET /api/urls/{id}` — Get single URL details
- `PUT /api/urls/{id}` — Update URL destination, expiration, or active status
- `DELETE /api/urls/{id}` — Deactivate URL (soft delete)

### 🚀 Public Redirection
- `GET /{shortCode}` — High-speed HTTP 302 Found redirection with asynchronous click event tracking.

### 📈 Analytics & Dashboard
- `GET /api/dashboard` — Authenticated user summary metrics, top links, and 30-day click trends.
- `GET /api/urls/{id}/analytics` — Detailed click analytics and browser/device/OS distribution for a specific URL.

### 👤 User Profile (`/api/users`)
- `GET /api/users/me` — Current authenticated user profile.
- `PUT /api/users/me` — Update current user's name.

### 🛡️ Admin (`/api/admin` - ADMIN Role Only)
- `GET /api/admin/statistics` — Platform-wide statistics.
- `GET /api/admin/users` — Paginated list of all platform users.
- `GET /api/admin/urls` — Paginated list of all platform URLs.
- `PATCH /api/admin/urls/{id}/status` — Activate or deactivate any URL.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Java 21+**
- **Maven 3.9+**
- **Node.js 18+** & **npm 9+**
- **PostgreSQL** & **Redis** (Optional: Docker will provision these automatically)

---

### Step 1: Clone Repository & Configure Environment

```bash
git clone https://github.com/hrithik/linktrack.git
cd linktrack
cp .env.example .env
```

---

### Step 2: Run Backend (Spring Boot)

```bash
cd backend

# Build and run tests
mvn clean test

# Start the Spring Boot backend
mvn spring-boot:run
```
> The backend will start on **`http://localhost:8080`**.
> Initial seed accounts (`admin@linktrack.com` and `hrithik@example.com`) are auto-created on initial boot.

---

### Step 3: Run Frontend (React + Vite)

```bash
cd ../frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
> The frontend application will open on **`http://localhost:5173`**.

---

## 🐳 Running with Docker Compose

To start the complete multi-tier stack (Backend, Frontend, PostgreSQL, Redis) with a single command:

```bash
docker compose up --build
```

- **Frontend Application**: `http://localhost:3000`
- **Backend API**: `http://localhost:8080`
- **Swagger UI**: `http://localhost:8080/swagger-ui/index.html`
- **Actuator Health**: `http://localhost:8080/actuator/health`

---

## 🔑 Default Seed Credentials

For quick local evaluation, the application seeds the following accounts on first startup:

| Account | Email | Password | Role |
|---|---|---|---|
| **Demo User** | `hrithik@example.com` | `Password123` | `USER` |
| **Platform Admin** | `admin@linktrack.com` | `Admin@123456` | `ADMIN` |

---

## 🧪 Automated Testing

Run the full automated test suite containing 26 integration & unit tests:

```bash
cd backend
mvn test
```

### Test Coverage Highlights:
- ✅ **Authentication**: User registration, duplicate email rejection (409), login validation, JWT generation, invalid credentials.
- ✅ **URL Management**: Base62 generation, custom alias collision, reserved keyword rejection, pagination, update/soft-delete.
- ✅ **Redirection & Clicks**: HTTP 302 redirect header, click event logging, expired URL handling, deactivated link rejection.
- ✅ **Analytics & Privacy**: Aggregate click metrics, device/browser categorization, cross-user privacy enforcement (403/401).
- ✅ **Admin Governance**: Role-based access restrictions (`ROLE_ADMIN`), platform-wide metrics inspection.

---

## 📄 License
Distributed under the MIT License.
