# PharmaShoppingProject

> Full-stack e-commerce application for pharmaceutical products, built with **ASP.NET Core 9** and **Angular 20**.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)

---

## Features

- **Product catalog** with filtering, sorting, and server-side pagination
- **Shopping cart** persisted in Redis
- **User authentication & authorization** with role-based access control (Admin / Customer)
- **Checkout flow** with multiple delivery methods
- **Stripe payment integration** with webhook handling
- **Real-time order notifications** via SignalR
- **Coupon / discount system**
- **Admin panel** for product management (create, update, delete)
- **Response caching** with automatic cache invalidation

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| ASP.NET Core 9 | REST API & web server |
| Entity Framework Core 9 | ORM & database migrations |
| Microsoft SQL Server | Relational database |
| ASP.NET Core Identity | Authentication & authorization |
| StackExchange.Redis | Shopping cart & response cache |
| Stripe.net | Payment processing & webhooks |
| SignalR | Real-time notifications |

### Frontend
| Technology | Purpose |
|---|---|
| Angular 20 | SPA framework |
| Angular Material + CDK | UI component library |
| TailwindCSS 4 | Utility-first CSS framework |
| @microsoft/signalr | Real-time communication |
| @stripe/stripe-js | Client-side Stripe integration |
| RxJS | Reactive programming |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Containerized SQL Server & Redis |
| Azure SQL Edge (Docker image) | SQL Server for local development |

---

## Architecture

The backend follows a **Clean Architecture** (N-Layer) approach with strict layer separation:

```
┌──────────────────────────────────────────────────────────┐
│                        Client (Angular)                  │
└────────────────────────────┬─────────────────────────────┘
                             │ HTTP / SignalR
┌────────────────────────────▼─────────────────────────────┐
│                        API Layer                         │
│  Controllers · DTOs · Middleware · RequestHelpers        │
│  SignalR Hub · Extensions                                │
└────────────────────────────┬─────────────────────────────┘
                             │ Interfaces
┌────────────────────────────▼─────────────────────────────┐
│                     Domain Layer                         │
│  Entities · Interfaces · Specifications                  │
└────────────────────────────┬─────────────────────────────┘
                             │ Implements
┌────────────────────────────▼─────────────────────────────┐
│                  Infrastructure Layer                    │
│  EF Core DbContext · Repositories · Unit of Work        │
│  Services (Payment, Cart, Cache, Coupon) · Migrations    │
└──────────────────────────────────────────────────────────┘
```

### Design Patterns

- **Repository Pattern** — abstracts data access per entity
- **Generic Repository** — `IGenericRepository<T>` for common CRUD operations
- **Unit of Work** — coordinates multiple repositories in a single transaction
- **Specification Pattern** — encapsulates query logic (filters, ordering, pagination) outside of repositories
- **Response Caching** — custom `[Cache]` and `[InvalidateCache]` attributes backed by Redis

---

## Project Structure

```
pharmashopping/
├── API/                          # Presentation layer
│   ├── Controllers/              # REST API controllers
│   ├── DTOs/                     # Data Transfer Objects
│   ├── Middleware/               # Global exception handling
│   ├── RequestHelpers/           # Pagination, Cache attributes
│   ├── SignalR/                  # Real-time notification hub
│   └── Extensions/               # Mapping helpers
│
├── Domain/                       # Core business layer
│   ├── Entities/                 # Domain models
│   │   └── OrderAggregate/       # Order, OrderItem, ShippingAddress...
│   ├── Interfaces/               # Repository & service contracts
│   └── Specifications/           # Query specifications
│
├── Infrastructure/               # Data & external services layer
│   ├── Data/                     # DbContext, repositories, seed data
│   ├── Migrations/               # EF Core migrations
│   ├── Services/                 # Cart, Payment, Cache, Coupon services
│   └── Config/                   # Entity configurations
│
├── client/                       # Angular SPA
│   └── src/app/
│       ├── core/                 # Guards, interceptors, services
│       ├── features/             # Feature modules (shop, cart, checkout, orders, admin...)
│       ├── layout/               # Header, footer
│       └── shared/               # Shared components & models
│
└── docker-compose.yml            # SQL Server + Redis containers
```

---

## Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/) & npm
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Stripe CLI](https://stripe.com/docs/stripe-cli) *(optional, for webhook testing)*

### 1. Start the infrastructure (SQL Server + Redis)

```bash
docker-compose up -d
```

### 2. Configure secrets

```bash
cd API
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=pharmashopping;User Id=SA;Password=YourPassword;TrustServerCertificate=True;"
dotnet user-secrets set "ConnectionStrings:Redis" "localhost"
dotnet user-secrets set "StripeSettings:PublishableKey" "pk_test_..."
dotnet user-secrets set "StripeSettings:SecretKey" "sk_test_..."
dotnet user-secrets set "StripeSettings:WhSecret" "whsec_..."
```

> See [SETUP_ENV.md](SETUP_ENV.md) for more configuration options.

### 3. Run the backend

```bash
dotnet run --project API
```

The API will apply migrations and seed initial data automatically on first run.

### 4. Run the frontend

```bash
cd client
npm install
npm start
```

Navigate to `http://localhost:4200`.

---

## Environment Variables

| Variable | Description |
|---|---|
| `ConnectionStrings:DefaultConnection` | SQL Server connection string |
| `ConnectionStrings:Redis` | Redis connection string |
| `StripeSettings:PublishableKey` | Stripe publishable key |
| `StripeSettings:SecretKey` | Stripe secret key |
| `StripeSettings:WhSecret` | Stripe webhook signing secret |

---

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/products` | — | Get paginated product list |
| `GET` | `/api/products/{id}` | — | Get product by ID |
| `POST` | `/api/products` | Admin | Create product |
| `PUT` | `/api/products/{id}` | Admin | Update product |
| `DELETE` | `/api/products/{id}` | Admin | Delete product |
| `GET` | `/api/cart` | — | Get cart by ID |
| `POST` | `/api/cart` | — | Update cart |
| `DELETE` | `/api/cart` | — | Delete cart |
| `POST` | `/api/orders` | Auth | Create order |
| `GET` | `/api/orders` | Auth | Get user orders |
| `POST` | `/api/payments/{cartId}` | Auth | Create/update payment intent |
| `POST` | `/api/payments/webhook` | — | Stripe webhook |
| `GET` | `/api/payments/delivery-methods` | — | Get delivery methods |
| `POST` | `/api/account/register` | — | Register user |
| `POST` | `/api/account/login` | — | Login |
| `GET` | `/api/coupons/{code}` | Auth | Validate coupon |
| `WS` | `/hubs/notifications` | Auth | SignalR notification hub |

---

## License

This project is for educational / portfolio purposes.
