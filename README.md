<div align="center">
  <h1>📝 OpenBlog – Multi-User Blogging Platform</h1>
  <p>A JWT-authenticated, RBAC-secured full-stack blog platform with full CRUD across users, posts, and nested comments.</p>

  <div>
    <img src="https://img.shields.io/badge/Java_17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java" />
    <img src="https://img.shields.io/badge/Spring_Boot_3-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
    <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  </div>
</div>

---

## 🚀 Features

* **🔐 JWT Authentication** — stateless login/signup, token validated on every request by a custom `JwtAuthenticationFilter`.
* **🔒 Role-Based Access Control (RBAC)** — `USER` / `ADMIN` roles enforced declaratively in Spring Security (`hasRole("ADMIN")`) and reflected in the UI (an Admin dashboard only admins can reach).
* **✍️ Blog CRUD** — drafts, publishing, tags, read-time estimation, ownership-checked edit/delete.
* **💬 Nested Comments** — threaded replies, author/post-owner/admin-gated moderation, per-comment likes.
* **❤️ Likes, Bookmarks & Follows** — persisted (not simulated) many-to-many relations with idempotent toggle endpoints.
* **🛠️ Admin Console** — promote/demote users, remove accounts, moderate any post, platform-wide stats.
* **⚙️ Account Settings** — public/private profile toggle, blog name, notification preferences.

---

## 🏗️ Architecture Overview

```text
Client Layer (React 18 + TypeScript, Vite, shadcn/ui)
        ↓  REST / JSON, Bearer JWT
Application Layer (Spring Boot 3, Spring Security, Spring Data JPA/Hibernate)
        ↓
Data Layer (H2 in-memory for dev · PostgreSQL for prod)
```

Backend package layout (`Backend/src/main/java/com/openblog/`):

```text
entity/       User, Post, Comment, PostLike, Bookmark, Follow, CommentLike, Role
repository/   Spring Data JPA repositories (fetch-joined queries for list endpoints)
security/     JwtUtil, JwtAuthenticationFilter, SecurityUtils
config/       SecurityConfiguration (CORS, RBAC rules, 401/403 handling)
controller/   AuthController, MeController, UserController, PostController,
              CommentController, AdminController, HealthController
util/         Mappers (entity → response DTOs), ApiException, GlobalExceptionHandler
```

### Query optimization & lazy loading

`Post.author`, `Comment.author/post`, and the `Like`/`Bookmark`/`Follow` associations are all
`FetchType.LAZY` (not eagerly joined on every query). List endpoints that need the association
(`GET /api/posts`, `GET /api/posts/mine`, `GET /api/posts/{id}/comments`, …) use explicit
`LEFT JOIN FETCH` queries in the repositories instead, so a page of N posts costs one query
instead of N+1. Remaining incidental lazy navigation (follow lists, bookmarks, single-post
fetch) is wrapped in `@Transactional(readOnly = true)` so the persistence context stays open
for exactly the request, rather than relying on Open Session In View.

---

## 💻 Tech Stack

### Frontend
* **React 18 + TypeScript**, built with **Vite**
* **React Context API** for auth/blog state, **TanStack Query** for server cache
* **Tailwind CSS + shadcn/ui (Radix primitives)**
* **React Router**, **Vitest** for tests

### Backend
* **Spring Boot 3** / Java 17
* **Spring Data JPA (Hibernate)**
* **Spring Security** with a custom **JWT** filter and role-based authorization rules
* **BCrypt** password hashing
* **io.jsonwebtoken (jjwt)** for token signing/parsing

### Database
* **H2** (in-memory) — default, zero-setup local dev profile
* **PostgreSQL** — production profile, provisioned via the included `docker-compose.yml`

---

## 🚀 Getting Started

### Prerequisites
* **Java 17+** and **Maven**
* **Node.js 18+** and **npm**
* **Docker** (optional — only needed for the PostgreSQL profile)

### 1. Start the Backend (Spring Boot, H2, zero setup)

```bash
cd Backend
mvn clean package -DskipTests
java -jar target/backend-0.0.1-SNAPSHOT.jar
```
Runs on `http://localhost:3001`. Demo data (users, posts, nested comments, likes, follows) is
seeded automatically on first boot.

**Switch to PostgreSQL** instead of H2:
```bash
docker compose up -d                 # starts Postgres on :5432
cd Backend
SPRING_PROFILES_ACTIVE=prod mvn spring-boot:run
```

### 2. Start the Frontend (React + Vite)

```bash
cd FrontEnd
npm install
npm run dev
```
Runs on `http://localhost:8080`.

### 3. Demo accounts

| Email | Password | Role |
|---|---|---|
| `admin@openblog.com` | `admin123` | **ADMIN** — visit `/admin` after logging in |
| `nik@example.com` | `123456` | **ADMIN** |
| `alice@example.com` | `1234` | USER |
| `bob@example.com` | `1234` | USER |
| `charlie@example.com` | `1234` | USER |

---

## 📡 API Surface

35+ REST endpoints across six resource groups:

* **Auth** (`/api/auth`) — signup, login, me
* **Me** (`/api/me`) — profile, delete account, bookmarks, followers/following, stats, settings
* **Users** (`/api/users`) — public listing/search, profile, follow/unfollow, followers/following
* **Posts** (`/api/posts`) — CRUD, view counter, like, bookmark, related posts, search/tag filters
* **Comments** (`/api/posts/{id}/comments`) — nested create/list, delete (cascades replies), per-comment like
* **Admin** (`/api/admin`, `hasRole("ADMIN")`) — list/promote/demote/delete users, moderate any post, platform stats

Public reads (published posts, comments, public profiles) don't require a token; everything
that mutates state does; `/api/admin/**` additionally requires the `ADMIN` role — verified with
a 403 for a `USER` token and 200 for an `ADMIN` token.

---

## 🔐 Security

* **JWT Authentication** — `JwtAuthenticationFilter` validates the bearer token on every request and populates Spring Security's context (principal = user id, authority = `ROLE_<role>`).
* **RBAC** — declarative `hasRole("ADMIN")` rule in `SecurityConfiguration`, backed by a `role` claim embedded in the JWT at login.
* **BCrypt** password hashing; **stateless sessions** (`SessionCreationPolicy.STATELESS`).
* **Ownership checks** — editing/deleting a post or comment requires being the owner (or an admin); ownership bypasses return `403`, not a silent no-op.
* **Origin-restricted CORS** via `app.cors.allowed-origins` (not a wildcard).
* JSON `401`/`403` error bodies (not Spring's default HTML error page).

---

## 📈 Possible Next Steps

* Redis caching for hot read paths (published post list, profile lookups)
* Full-text search (Postgres `tsvector` or Elasticsearch) in place of the current in-memory filter
* Rate limiting on auth endpoints
* Media upload to object storage (S3-compatible) for cover images/avatars

---

## 👨‍💻 Contributors

* **Nikhil Madaravena** (B23CS063)
* **Talla Sathwik** (B23EC067)
* **Harsha Vardhan Ponnala** (B23CN068)

---

<div align="center">
  <i>Designed to provide a robust, scalable, and modern blogging platform.</i>
</div>
