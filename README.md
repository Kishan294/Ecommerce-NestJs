# 🛒 E-Commerce API - Production Ready Backend

[![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)](https://swagger.io/)

A robust, enterprise-grade E-commerce REST API built with **NestJS**, **TypeScript**, and **Prisma ORM**. This project follows best practices, including module-based architecture, secure authentication, role-based access control, and seamless file uploads.

---

## 🚀 Features

### 🔐 Authentication & Security
- **JWT-based Auth**: Secure stateless authentication using Passport.js.
- **RBAC (Role-Based Access Control)**: Admin and User roles for sensitive operations.
- **Rate Limiting**: Protect endpoints from brute-force/spam using `@nestjs/throttler`.
- **Security Headers**: Enhanced security with `Helmet`.
- **Validation**: Strict input validation using `class-validator` and `class-transformer`.

### 📦 Product & Category Management
- **Full CRUD**: Manage products and categories with ease.
- **Image Uploads**: Integrated with **UploadThing** for fast and secure file handling.
- **Advanced Filtering**: Search, filter by price, category, and availability.
- **Caching**: Performance optimization for product retrieval using `@nestjs/cache-manager`.

### 🛒 Shopping Experience
- **Cart Management**: Add, remove, and update cart items.
- **Order Processing**: Dynamic checkout system with order history.
- **Inventory Sync**: Automatic stock deduction upon successful orders.

### 🛠️ Developer Experience
- **Swagger Documentation**: Interactive API testing at `/docs`.
- **Structured Logging**: Advanced logging using **Winston**.
- **Dockerized**: Easy setup with Docker and Docker Compose.
- **Health Checks**: Built-in health monitoring at `/health`.

---

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (v11+)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **File Upload**: [UploadThing](https://uploadthing.com/)
- **Caching**: [Cache Manager](https://github.com/node-cache-manager/node-cache-manager)
- **Monitoring**: [Terminus](https://docs.nestjs.com/recipes/terminus)
- **Containerization**: [Docker](https://www.docker.com/)

---

## 🏁 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ecommerce-api
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory (refer to the variables below).
   ```bash
   cp .env.example .env # If example exists, otherwise create new
   ```

### 🔑 Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL Connection String | `postgresql://...` |
| `JWT_SECRET` | Secret key for JWT signing | `dev-secret` |
| `JWT_EXPIRATION` | JWT token validity | `1h` |
| `UPLOADTHING_TOKEN` | API Token for UploadThing | **Required** |
| `PORT` | Application Port | `3000` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:3001` |

### 🗄️ Database Setup

1. **Run migrations**:
   ```bash
   pnpm prisma migrate dev
   ```

2. **Generate Prisma Client**:
   ```bash
   pnpm prisma generate
   ```

---

## 🏃 Running the Application

### Local Development
```bash
# Start in watch mode
pnpm run start:dev
```

### Production Build
```bash
pnpm run build
pnpm run start:prod
```

### 🐋 Docker Deployment
The easiest way to get everything running (API + Postgres):
```bash
docker-compose up --build
```
This will start:
- **API**: `http://localhost:3000`
- **Postgres**: `localhost:5432`

---

## 📖 API Documentation

Once the app is running, visit:
👉 **[http://localhost:3000/docs](http://localhost:3000/docs)**

The documentation provides a full list of endpoints, request bodies, and allows you to test the API directly from your browser.

---

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

---

## 📂 Project Structure

```text
src/
├── auth/           # Authentication logic & Passport strategies
├── users/          # User management
├── products/       # Product CRUD & logic
├── categories/     # Category management
├── cart/           # Shopping cart logic
├── orders/         # Order processing & history
├── prisma/         # Database service & schema
├── common/         # Shared filters, interceptors, decorators
├── config/         # Environment & app configuration
├── health/         # Health check endpoints
└── logger/         # Custom Winston logger setup
```

---

## 📄 License
This project is [UNLICENSED](LICENSE).
