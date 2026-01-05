# E-commerce API

This is an e-commerce backend API project built using NestJS and Go (Golang). It adopts a hybrid architecture to leverage the strengths of both languages: NestJS for the main business logic and Go for high-performance tasks like inventory management.

## 📚 Tech Stack

### Backend
- **Main Framework**: NestJS (TypeScript)
- **Microservice/Service**: Go (Golang) + Gin Framework
- **Database**: PostgreSQL
- **ORM**: TypeORM (NestJS), `database/sql` (Go)
- **Caching & Session**: Redis
- **Authentication**: Passport (JWT, Google OAuth, Local)
- **API Documentation**: Swagger (OpenAPI)

### Infrastructure & Tools
- **Containerization**: Docker, Docker Compose
- **Testing**: Jest, Supertest (E2E Testing)
- **Automation**: Makefile

## 🚀 Features

### NestJS Service (Main Application)
- **Authentication**: Local login, Google OAuth, and JWT-based authentication/authorization.
- **Users**: User profile and address management.
- **Products**: Basic CRUD operations for products (Create, Read, Update).
- **Categories**: Product category management.
- **Cart**: Add, update, and remove items in the shopping cart.
- **Orders**: Order creation and management.
- **Payment**: Payment processing integration.

### Go Service (Performance/Microservice)
- **Inventory Management**: Handle stock checks (`check`), increases (`increase`), and decreases (`decrease`).
- **Optimized Product Retrieval**: High-performance API endpoints for fetching product details and lists.
- **Category Retrieval**: Fetching category lists.

## 🛠 Installation & Setup

### 1. Prerequisites
- Node.js (v18+)
- Go (v1.20+)
- Docker & Docker Compose

### 2. Clone Repository & Install Dependencies
```bash
# Clone the repository
git clone [https://github.com/your-username/ecommerce-api.git](https://github.com/your-username/ecommerce-api.git)
cd ecommerce-api

# Install Node.js dependencies
npm install
3. Environment Configuration (.env)
Create a .env file in the root directory and configure it based on .env.example.
```
```
Bash

cp .env.example .env
Key Variables:
```
POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB: Database configuration.

REDIS_HOST, REDIS_PORT: Redis configuration.

GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET: Google OAuth configuration.

JWT_SECRET: Secret key for signing JWTs.

4. Run Infrastructure (Docker)
Start PostgreSQL, Redis, and the Go service using Docker. (I will test makefile)
```
Bash

# Using Makefile
make up
```
# Using docker-compose directly
```docker-compose up -d```
Note: The NestJS service is commented out in docker-compose.yml to allow local development.

5. Running the Application
To run both NestJS and Go servers in development mode simultaneously:
```
Bash

npm run dev
```
This command uses concurrently to execute npm run start:go and npm run start:dev together.

To run them individually:
```
NestJS: npm run start:dev (http://localhost:3000)

Go: npm run start:go (http://localhost:8080)
```
📖 API Documentation
Once the server is running, you can access the Swagger UI documentation at:

URL: http://localhost:3000/api

🧪 Testing
E2E Testing (End-to-End) Run E2E tests for the NestJS application using Jest.
```
Bash

npm run test:e2e
Configuration: test/jest-e2e.json, test/test.e2e-spec.ts
```
📂 Project Structure
.
├── src/
│   ├── app.module.ts       # NestJS Main Module
│   ├── main.ts             # NestJS Entry Point
│   ├── main.go             # Go Entry Point (Gin Server)
│   ├── auth/               # Authentication Module
│   ├── users/              # Users Module
│   ├── product/            # Product Module (Includes NestJS & Go handlers)
│   ├── inventory/          # Inventory Module (Go implementation)
│   ├── cart/               # Cart Module
│   ├── order/              # Order Module
│   └── ...
├── test/                   # E2E Tests
├── docker-compose.yml      # Infrastructure Configuration
├── Makefile                # Shortcut Commands
└── package.json            # Dependencies & Scripts
📜 License
This project was created for educational purposes based on roadmap.sh/projects/ecommerce-api.
# Project License
	link: https://roadmap.sh/projects/ecommerce-api
