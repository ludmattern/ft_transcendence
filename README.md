# ft_transcendence

ft_transcendence is a 3D Pong game with an elegant multiplayer interface. The project combines advanced 3D techniques with real-time gameplay, robust security, and a microservices architecture to deliver a unique and immersive gaming experience.

---

## Table of Contents

-   [Overview](#overview)
-   [Key Features](#key-features)
-   [Architecture & Project Structure](#architecture--project-structure)
-   [Technologies & Frameworks](#technologies--frameworks)
-   [Inter-Service Communication](#inter-service-communication)
-   [Security](#security)
-   [Deployment & Environment](#deployment--environment)
-   [Testing](#testing)
-   [Documentation & Future Work](#documentation--future-work)
-   [License](#license)

---

## Overview

ft_transcendence is designed as a modern, real-time 3D Pong game where players can compete both locally and remotely. The game offers advanced multiplayer features such as live chat, tournament matchmaking, and even an AI opponent. The backend is developed using Django (with Django Channels for real-time communications) and is split into multiple microservices, while the frontend leverages Vanilla JavaScript, Three.js/OpenGL, and Bootstrap for a responsive and visually engaging experience.

---

## Key Features

-   **3D Pong Gameplay:**  
    Immersive and visually appealing Pong game using advanced 3D techniques.
-   **Multiplayer Experience:**  
    Real-time gameplay with remote players, live chat, and tournament organization.
-   **User Management & Authentication:**  
    Standard registration, login, and profile management with remote OAuth 2.0 authentication. Supports Two-Factor Authentication (2FA) and JSON Web Tokens (JWT) for enhanced security.
-   **Microservices Architecture:**  
    The backend is divided into several microservices (auth, gateway, live chat, matchmaking, pong, tournament, user, etc.) to promote scalability and maintainability.
-   **Security:**  
    End-to-end HTTPS communications, robust token-based security, and secure secrets management via injected configuration files.
-   **AI Opponent:**  
    Integrated AI opponent to offer additional challenge in gameplay.
-   **Dockerized Deployment:**  
    Complete containerization using Docker and Docker Compose simplifies deployment and scalability.

---

## Architecture & Project Structure

Below is the commented architecture of the project. Each main directory and file group is organized to clearly separate concerns and responsibilities:

```bash
ft_transcendence/                # Root folder for the entire project.
├── backend                      # Contains all backend microservices.
│   ├── auth-service             # Service for user authentication and authorization.
│   │   ├── auth                 # Django configuration for the auth module (ASGI, routing, settings, URLs, WSGI).
│   │   ├── Dockerfile           # Dockerfile to build the auth-service container.
│   │   ├── manage.py            # Django management script for auth-service.
│   │   ├── requirements.txt     # Python dependencies for auth-service.
│   │   ├── service              # Business logic: consumers, models, and views for authentication.
│   │   └── templates            # HTML templates (e.g., authenticating page).
│   ├── certif-issuer            # Service responsible for issuing certificates.
│   │   ├── Dockerfile           # Dockerfile for certif-issuer.
│   │   └── entrypoint.sh        # Entrypoint script for initializing certificate issuance.
│   ├── common                   # Shared settings and dependency files for backend services.
│   │   ├── common_settings.py
│   │   ├── requirements_channels.txt
│   │   ├── requirements_common.txt
│   │   └── requirements_security.txt
│   ├── gateway-service          # Central gateway handling inter-service communication.
│   │   ├── Dockerfile           # Dockerfile for gateway-service.
│   │   ├── gateway              # Contains ASGI configuration and settings.
│   │   ├── gateway_service      # Django app initialization (e.g., apps.py) and module setup.
│   │   ├── manage.py            # Management script for gateway-service.
│   │   ├── requirements.txt     # Dependencies for gateway-service.
│   │   └── service              # Service logic for handling connections (auth, chat, matchmaking, pong, tournament, user registry).
│   ├── livechat-service         # Real-time chat service for user communications.
│   │   ├── Dockerfile           # Dockerfile for livechat-service.
│   │   ├── livechat             # ASGI, routing, settings, URLs, and WSGI configuration.
│   │   ├── manage.py            # Management script for livechat-service.
│   │   ├── requirements.txt     # Dependencies for livechat-service.
│   │   └── service              # Chat-specific consumers, models, and views.
│   ├── matchmaking-service      # Handles matchmaking and tournament scheduling.
│   │   ├── Dockerfile           # Dockerfile for matchmaking-service.
│   │   ├── manage.py            # Management script.
│   │   ├── matchmaking          # Settings and URL configurations.
│   │   ├── requirements.txt     # Dependencies for matchmaking-service.
│   │   └── service              # Business logic for matchmaking (consumers, matchmaking manager, private manager, routing, WSGI).
│   ├── pong-service             # Contains the core game logic for Pong.
│   │   ├── Dockerfile           # Dockerfile for pong-service.
│   │   ├── manage.py            # Management script.
│   │   ├── pong                 # ASGI, settings, and URL configurations for Pong.
│   │   ├── requirements.txt     # Dependencies for pong-service.
│   │   └── service              # Game logic: bot, consumers, game manager, games, models, routing, and utility functions.
│   ├── redis                    # Redis configuration for caching and messaging.
│   │   ├── Dockerfile           # Dockerfile to build the Redis container.
│   │   └── redis.conf           # Redis configuration file.
│   ├── tournament-service       # Manages tournaments, including match scheduling and tournament state.
│   │   ├── Dockerfile           # Dockerfile for tournament-service.
│   │   ├── manage.py            # Management script.
│   │   ├── requirements.txt     # Dependencies for tournament-service.
│   │   ├── service              # Business logic: consumers, models, routing, views, and WSGI for tournaments.
│   │   └── tournament           # Tournament-specific settings and URL configurations.
│   └── user-service             # Manages user profiles, friend lists, and related user data.
│       ├── Dockerfile           # Dockerfile for user-service.
│       ├── manage.py            # Management script.
│       ├── requirements.txt     # Dependencies for user-service.
│       ├── service              # Contains user-related logic (blocked users, friends, info, profiles, views).
│       └── user                 # ASGI, settings, URL configurations, and WSGI for user-service.
├── base.Dockerfile              # Base Dockerfile for building a shared image used by multiple services.
├── config                       # Global configuration files.
├── database                     # Database-related files including Dockerfile and PostgreSQL initialization scripts.
│   ├── Dockerfile
│   └── postgres
│       └── init.sql
├── docker-compose.yml           # Orchestrates all Docker containers for the project.
├── frontend                     # Contains the client-side code and assets.
│   ├── public                   # Public assets including the main HTML entry point.
│   └── src                      # Source code for the frontend:
│       ├── 3d                   # JavaScript files for 3D animations and scene management.
│       ├── assets               # Icons, fonts, images, models, and videos.
│       ├── components           # UI components (HUD, menus, windows, etc.).
│       └── context, pages, store, styles, three, utils
│                                # Organized by functionality: routing, state management,
│                                 # styling, 3D rendering, and utility functions.
├── LICENSE                      # License file.
├── Makefile                     # Build and automation commands.
├── media                        # Contains media assets such as profile pictures.
├── nginx                        # Nginx configuration for reverse proxy and load balancing.
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── nginx.conf.template
│   └── wait-for-certs.sh
├── README.md                    # Project documentation (this file).
├── secret                       # Contains sensitive files (handled securely).
└── subject                      # Project specifications and additional documentation.
    └── ft_transcendence.pdf     # Detailed project requirements and modules.
```

---

## Technologies & Frameworks

-   **Backend:**

    -   **Django** with Django Channels for real-time communication.
    -   **PostgreSQL** as the primary database.
    -   Additional Python packages include: pyjwt, daphne, psycopg2, bcrypt, cryptography, pyotp, and more.

-   **Frontend:**

    -   **Vanilla JavaScript** enhanced with **Three.js/OpenGL** for 3D graphics.
    -   **Bootstrap** for responsive design and UI components.

-   **Other Technologies:**
    -   **Redis** for caching and inter-service messaging.
    -   **Docker & Docker Compose** for containerization.
    -   **GitHub Actions (CodeQL)** for continuous integration and security analysis.

---

## Inter-Service Communication

Microservices communicate primarily through:

-   **REST APIs:** For standard data exchange and service interaction.
-   **Websockets:** Managed by the gateway service to handle real-time communications (e.g., live chat, tournament updates). For example, the tournament module leverages Django Channels to send and receive messages about tournament events such as lobby creation, participant status updates, and match progression.

---

## Security

-   **HTTPS Everywhere:**  
    All communications are secured with HTTPS and WSS for websockets.
-   **JWT & 2FA:**  
    JSON Web Tokens (JWT) secure API requests, and Two-Factor Authentication (2FA) is implemented to add an extra layer of security.

-   **Secrets Management:**  
    Sensitive data (API keys, credentials) are injected via a secure `secrets.txt` file into the docker-compose setup.

-   **Additional Measures:**  
    The use of robust hashing (bcrypt) and cryptographic libraries (cryptography, pyotp) further secures user data and application integrity.

---

## Deployment & Environment

-   **Containerization:**  
    All services are containerized using Docker and orchestrated with Docker Compose. A single command (`docker-compose up --build`) launches the entire environment.
-   **CI/CD Pipeline:**  
    GitHub Actions, including CodeQL analysis, are integrated to ensure code quality and security on every push to the main branch.
-   **Dependency Management:**  
    Specific versions of essential packages are defined (e.g., pyjwt, daphne, pillow, redis, channels, django) to ensure consistency across deployments.

---

## Testing

The project includes a suite of code tests to verify the functionality of individual components. These tests focus on code correctness rather than full end-to-end integration tests at this stage.

---

## Documentation & Future Work

-   **API Documentation:**  
    There is currently no formal documentation for API endpoints. Future work will include the implementation of a tool (such as Swagger/OpenAPI) to document and version the APIs.
-   **Further Improvements:**  
    Planned improvements include enhanced inter-service communication documentation, more comprehensive testing, and additional modules as per the project specifications.

-   **Project Specifications:**  
    Detailed project requirements and modules are outlined in the subject file located in the `subject` directory [ft_transcendence.pdf](./subject/ft_transcendence.pdf).

---

## License

Refer to the [LICENSE](./LICENSE) file for details on the project’s license.

---

ft_transcendence is designed to push the boundaries of traditional Pong, integrating modern web technologies and secure microservices architecture to create an engaging multiplayer experience.
