<div align="center">
  <h1>📝 OpenBlog – Multi-Purpose Blog Platform</h1>
  <p>A scalable, modular, and full-stack blog platform that enables users to create, manage, and interact with blog content.</p>

  <div>
    <img src="https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java" />
    <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
    <img src="https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
    <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  </div>
</div>

---

## 🚀 Features

* **🔐 User Authentication**: Secure JWT-based authentication system.
* **✍️ Blog Creation & Management**: Create, edit, and manage blog posts seamlessly.
* **💬 Commenting System**: Engage with content through nested comments.
* **❤️ Like & Interaction Features**: Express appreciation with post likes.
* **🖼️ Media Upload**: Profile pictures and blog media handling via Firebase.
* **🔒 Role-Based Access Control (RBAC)**: Secure access tailored to user roles (Admin, User).
* **⚡ Scalable & Modular Architecture**: Built with maintainability and scaling in mind.

---

## 🏗️ Architecture Overview

The application follows a **layered client-server architecture**:

```text
Client Layer (React Frontend)
        ↓
Application Layer (Spring Boot Backend)
        ↓
Data Layer (H2/MySQL + Firebase)
```

* Communication via **REST APIs (HTTP)**
* Data exchanged in **JSON format**

---

## 💻 Tech Stack

### Frontend
* **React.js (SPA)** powered by **Vite**
* **Redux / Context API** for State Management
* **Tailwind CSS / Shadcn UI** for modern styling
* **Axios** for API requests

### Backend
* **Spring Boot 3** (MVC Architecture)
* **Spring Data JPA** (Hibernate)
* **Spring Security** & **JWT Authentication**
* **BCrypt** Password Hashing

### Database & Storage
* **H2 Database** (In-Memory Development Mode)
* **MySQL** (Production Database)
* **Firebase Storage** (Media Files)

---

## 🚀 Getting Started

Follow these instructions to run the project locally for development and testing.

### Prerequisites
* **Java 17+**
* **Maven**
* **Node.js 18+** & **npm** / **bun**

### 1. Clone the repository
```bash
git clone https://github.com/Nikhil-Madaravena/OpenBlog.git
cd OpenBlog
```

### 2. Start the Backend (Spring Boot)
The backend is pre-configured to use an H2 in-memory database for local development, so no database setup is required.

```bash
cd Backend
mvn clean install -DskipTests
mvn spring-boot:run
```
*The backend will run on `http://localhost:3001`.*

### 3. Start the Frontend (React + Vite)
Open a new terminal window:

```bash
cd FrontEnd
npm install
npm run dev
```
*The frontend will run on `http://localhost:8080`.*

---

## 📂 Project Structure

### Frontend (`/FrontEnd`)
```text
src/
 ├── components/    # Reusable UI components
 ├── pages/         # Application views/routes
 ├── services/      # API communication logic
 ├── store/         # State management
 └── App.tsx        # Main application entry
```

### Backend (`/Backend`)
```text
src/main/java/com/openblog/
 ├── controller/    # REST API Endpoints
 ├── service/       # Business Logic
 ├── repository/    # Database Interactions
 ├── model/         # Entities & DTOs
 └── security/      # JWT & Auth Configurations
```

---

## 🔄 Data Flow

1. User interacts with frontend components.
2. Frontend sends an API request (with JWT if authenticated).
3. The backend Controller handles the request.
4. The Service layer processes business logic.
5. The Repository layer interacts with the Database.
6. A Response is sent back as JSON.
7. The UI updates dynamically based on the response.

---

## 🔐 Security

* **JWT-based Authentication**: Secure stateless sessions.
* **Role-Based Authorization (RBAC)**: Fine-grained access control.
* **BCrypt Password Encryption**: Safe credential storage.
* **CORS Configured**: Secure cross-origin resource sharing.

---

## 📈 Scalability & Future Enhancements

* 🔄 **Horizontal Scaling** for handling increased traffic.
* ⚡ **Redis Caching** for optimized read operations.
* 🔍 **Elasticsearch** for high-performance full-text search.
* 🌐 **CDN Integration** for faster media delivery.
* 📩 **Message Queues (Kafka/RabbitMQ)** for async processing (e.g., email notifications).

---

## 👨‍💻 Contributors

* **Nikhil Madaravena** (B23CS063)
* **Talla Sathwik** (B23EC067)
* **Harsha Vardhan Ponnala** (B23CN068)

---

<div align="center">
  <i>Designed to provide a robust, scalable, and modern blogging platform.</i>
</div>
