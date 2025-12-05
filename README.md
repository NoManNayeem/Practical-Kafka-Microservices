# Practical Kafka Microservices

A comprehensive Proof of Concept (POC) demonstrating an event-driven microservices architecture using **Apache Kafka**, **Docker Compose**, **Python (Django, FastAPI, Flask)**, and **React**.

## 🚀 Project Overview

This project simulates a real-world e-commerce order processing flow. It showcases how different microservices can communicate asynchronously via Kafka to handle high-throughput tasks like order validation and notifications, ensuring loose coupling and scalability.

### Architecture

The system consists of the following containerized services:

1.  **Frontend (React + Vite)**:
    -   User interface for creating orders and tracking status.
    -   Polished, animated UI with real-time system logs.
    -   Communicates with Order Service (REST) and Notification Service (REST/Polling).

2.  **Order Service (Django REST Framework)**:
    -   **Role**: Order Management.
    -   **Database**: PostgreSQL (`order_db`).
    -   **Action**: Receives order requests, persists them, and publishes `order_created` events to Kafka.

3.  **Inventory Service (FastAPI)**:
    -   **Role**: Stock Validation.
    -   **Database**: PostgreSQL (`inventory_db`).
    -   **Action**: Consumes `order_created` events, checks stock (simulated), and publishes `order_validated` events.
    -   **Security**: Internal-only service (no external ports exposed).

4.  **Notification Service (Flask)**:
    -   **Role**: User Alerts.
    -   **Action**: Consumes `order_validated` events and updates the order status for the frontend.

5.  **Infrastructure**:
    -   **Kafka**: Message broker for asynchronous communication.
    -   **Zookeeper**: Coordination service for Kafka.
    -   **Docker Compose**: Orchestration, networking, and healthchecks.

## 🛠️ Tech Stack

-   **Frontend**: React 18, Vite, Lucide React (Icons), CSS Animations.
-   **Backend**:
    -   **Django**: Robust framework for the core Order Service.
    -   **FastAPI**: High-performance, async framework for the Inventory Service.
    -   **Flask**: Lightweight framework for the Notification Service.
-   **Messaging**: Apache Kafka, Zookeeper.
-   **Database**: PostgreSQL 15.
-   **DevOps**: Docker, Docker Compose (Healthchecks, Restart Policies).

## 📦 Installation & Setup

### Prerequisites
-   Docker and Docker Compose installed on your machine.

### Steps

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd Practical_Kafka
    ```

2.  **Start the Application**
    Run the following command to build and start all services. Docker Compose will handle dependencies and healthchecks.
    ```bash
    docker-compose up --build -d
    ```
    *Note: The first run may take a few minutes as images are built and dependencies (like Kafka) initialize.*

3.  **Verify Status**
    Check if all containers are healthy:
    ```bash
    docker-compose ps
    ```

4.  **Access the Application**
    -   **Frontend**: [http://localhost:5173](http://localhost:5173)
    -   **Order API**: [http://localhost:8000/api/orders/](http://localhost:8000/api/orders/)
    -   **Inventory Service**: *Internal Only* (Not accessible via browser)
    -   **Notification Service**: [http://localhost:5001](http://localhost:5001)

## 🎮 How to Use

1.  Open the **Frontend** at [http://localhost:5173](http://localhost:5173).
2.  **Place an Order**:
    -   Enter an **Item Name** (e.g., "Laptop").
    -   Enter a **Quantity** (e.g., "1").
    -   Click **Create Order**.
3.  **Observe the Flow**:
    -   The **System Logs** console in the UI will show real-time updates.
    -   The **Stepper** will animate as the order moves from Order Service -> Inventory Service -> Notification Service.
4.  **Check Status**:
    -   Click **Refresh Status** to see the final result (VALIDATED or REJECTED).

## 🔒 Security & Resilience Features

-   **Network Isolation**: The `inventory_service` and databases (`order_db`, `inventory_db`) do not expose ports to the host machine. They are only accessible within the Docker network.
-   **Healthchecks**: Services wait for their dependencies (Kafka, Postgres) to be fully "healthy" before starting, preventing startup race conditions.
-   **Restart Policies**: All containers are configured with `restart: on-failure` to automatically recover from crashes.

## 🐛 Troubleshooting

-   **Frontend Connection Error**: Ensure the backend services are running (`docker-compose ps`).
-   **Kafka Connection Issues**: If services fail to connect to Kafka, restart the stack:
    ```bash
    docker-compose restart
    ```
-   **Database Errors**: If you see "relation does not exist" errors, run migrations manually:
    ```bash
    docker-compose exec order_service python manage.py migrate
    ```

## 📚 API Documentation

### Order Service
-   `POST /api/orders/`: Create a new order.
    -   Body: `{"item": "string", "quantity": int}`

### Notification Service
-   `GET /status/<order_id>`: Get the status of an order.
