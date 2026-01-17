# 🚀 NestJS High-Performance Caching PoC

A **Proof of Concept (PoC)** demonstrating advanced caching strategies using **NestJS**, **Redis**, and **Prisma**.  
This project simulates high-load database scenarios to showcase the dramatic performance impact of a well-designed caching strategy.

---

## ⚡ Key Features

- **Hybrid Caching Strategy**
  - **Automatic:** Uses `CacheInterceptor` for list endpoints with short TTL (eventual consistency).
  - **Manual (Cache-Aside):** Uses `CacheManager` inside Services for item details, allowing precise cache invalidation on updates.

- **Performance Benchmarking**
  - Custom interceptors measure and log execution time, clearly showing the difference between Database I/O and Redis cache hits.

- **Latency Simulation**
  - Intentionally loads large datasets (10k+ records) to simulate heavy database I/O and highlight cache-hit benefits.

- **Observability**
  - Detailed logs including request context, HTTP method, and execution time.

---

## 🏗 Architecture & Strategy

This PoC addresses the classic **Performance vs. Data Freshness** trade-off using two complementary approaches.

### 1. List Strategy (Automatic Caching)

- **Route:** `GET /players`
- **Mechanism:** `@UseInterceptors(CacheInterceptor)`
- **Behavior:** Caches the entire list response.
- **Trade-off:**  
  - Fast to implement  
  - Hard to invalidate individual items  
- **Mitigation:** Short TTL (eventual consistency)

---

### 2. Detail Strategy (Manual / Cache-Aside)

- **Routes:**
  - `GET /players/:id`
  - `PATCH /players/:id`

- **Mechanism:** `CacheManager` (`get`, `set`, `del`) inside the Service layer

- **Behavior:**
  - **GET**
    - Checks Redis first
    - On cache miss → fetches from DB → stores in Redis
  - **PATCH**
    - Updates the database
    - Immediately deletes the corresponding Redis key

- **Benefit:**  
  Ensures strong consistency for critical reads while maintaining high performance.

---

## 🛠 Prerequisites

- **Node.js** v18+
- **PostgreSQL** (running locally)
- **Redis** (running on default port `6379`)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Caua-Vinicius/nestjs-redis-caching.git
cd nestjs-redis-caching
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
REDIS_CONNECTION_STRING="redis://localhost:6379"
```

### 4. Database Setup

```bash
npx prisma migrate deploy
npx prisma generate
```

---

### ▶️ Running the Seed

After configuring the `.env` file and applying migrations, run:

```bash
npx prisma db seed
```

## 🏃‍♂️ Running the Project

```bash
npm run start:dev
```

API available at `http://localhost:3000`

---

## 📊 Benchmark Results

### Fetching All Players

**Cold Start (DB):**

```
[PlayersService] 🐌 DATABASE LOAD: 850.20ms to fetch 10000 items.
[RequestLatency] ⚡ [GET /players] completed in: 8s65.00ms
```

**Warm Cache (Redis):**

```
[RequestLatency] ⚡ [GET /players] completed in: 4.00ms
```

---

## 📝 API Endpoints

| Method | Endpoint | Description | Cache Strategy |
|------:|---------|-------------|----------------|
| GET | /players | List players | Interceptor (TTL 10s) |
| GET | /players/:id | Player details | Manual |
| PATCH | /players/:id | Update nickname | Cache invalidation |

---

## 🎯 Goal

Show how well-designed caching in NestJS can drastically improve performance while maintaining consistency.
