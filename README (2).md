# 🧬 Preclinical Tumor Model Tracker

A containerized, full-stack clinical research application designed to query, track, and manage preclinical tumor models, Protocol Participant Identifiers (PPIDs), and study metadata across multi-institutional datasets.

---

## ✨ Key Features

* **Tumor Model & PPID Registry:** Real-time search and filtering for protocol participant identifiers and associated tumor models across research studies.
* **Role-Based Access Control (RBAC):** End-to-end identity management and authorization using Firebase Authentication, restricting sensitive data views based on access levels.
* **Studies Management:** Complete CRUD workflows (Create, Read, Update, Delete) for study short names and Principal Investigators (PIs).
* **Resilient API Layer:** Spring Boot REST endpoints with status-code handling (`200 OK`, `204 NO_CONTENT`, `400 BAD_REQUEST`, `409 CONFLICT`).
* **Cloud-Ready Architecture:** Fully containerized using Docker and optimized for deployment on Google Cloud Platform (GCP).

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework:** React.js
* **Authentication:** Firebase Auth (RBAC)
* **HTTP Client:** Axios
* **Styling:** CSS-in-JS / Modular CSS

### **Backend**
* **Framework:** Java, Spring Boot
* **API Architecture:** RESTful APIs
* **Build Tool:** Maven

### **Cloud & DevOps**
* **Containerization:** Docker
* **Cloud Infrastructure:** Google Cloud Platform (GCP)

---

## 🚀 Getting Started

### **Prerequisites**
* Java 17+
* Node.js (v18+)
* Docker (optional, for containerized run)

---

### **Frontend Setup**

```# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend portal will then run on `http://localhost:5173`.