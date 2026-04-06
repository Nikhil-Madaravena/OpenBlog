# 📝 OpenBlog – Multi-Purpose Blog Platform

A scalable and modular full-stack blog platform that enables users to create, manage, and interact with blog content. The system supports authentication, publishing, commenting, liking, and media handling with a clean and maintainable architecture.

---

## 🚀 Features

* 🔐 User Authentication (JWT-based)
* ✍️ Blog Creation & Management
* 💬 Commenting System
* ❤️ Like & Interaction Features
* 🖼️ Media Upload (Images, Profile Pictures)
* 🔒 Role-Based Access Control (RBAC)
* ⚡ Scalable & Modular Architecture

---

## 🏗️ Architecture Overview

The application follows a **layered client-server architecture**:

```
Client Layer (Frontend)
        ↓
Application Layer (Backend - Spring Boot)
        ↓
Data Layer (MySQL + Firebase)
```

* Communication via **REST APIs (HTTP)**
* Data exchanged in **JSON format**

---

## 💻 Tech Stack

### Frontend

* React.js (SPA)
* Redux / Context API
* Axios / Fetch API

### Backend

* Spring Boot (MVC Architecture)
* Spring Data JPA (Hibernate)
* JWT Authentication
* BCrypt Password Hashing

### Database & Storage

* MySQL (Structured Data)
* Firebase Storage (Media Files)

---

## 📂 Project Structure

### Frontend

```
src/
 ├── components/
 ├── pages/
 ├── services/
 ├── store/
 └── App.js
```

### Backend

```
src/main/java/
 ├── controller/
 ├── service/
 ├── repository/
 ├── model/
 └── security/
```

---

## 🔄 Data Flow

1. User interacts with frontend
2. Frontend sends API request
3. Controller handles request
4. Service processes logic
5. Repository interacts with DB
6. Response sent back as JSON
7. UI updates dynamically

---

## 🔐 Security

* JWT-based Authentication
* Role-Based Authorization (RBAC)
* BCrypt Password Encryption
* Stateless Session Management
* Secured API Endpoints

---

## 📈 Scalability & Future Enhancements

* 🔄 Horizontal Scaling
* ⚡ Redis Caching (optional)
* 🔍 Elasticsearch (search optimization)
* 🌐 CDN for media delivery
* 📩 Kafka / RabbitMQ (async processing)

---

## 🧠 Design Principles

* Separation of Concerns
* Modular Architecture
* High Scalability
* Strong Security
* Easy Maintainability

---

## 👨‍💻 Contributors

* **Nikhil Madaravena** (B23CS063)
* **Talla Sathwik** (B23EC067)
* **Harsha Vardhan Ponnala** (B23CN068)

---

## 📌 Summary

OpenBlog is designed to provide a **robust, scalable, and modern blogging platform** using React and Spring Boot, with efficient handling of both structured and unstructured data.
