# 🛒 E-commerce con Pago

> App e-commerce con integración de pagos

[![Backend](https://img.shields.io/badge/Backend-NestJS-E0234E?logo=nestjs)](https://nestjs.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)](https://www.postgresql.org/)

---


## 🛠️ Stack Técnico

**Backend**: NestJS 10 + TypeORM + PostgreSQL 15  
**Frontend**: React 19 + Vite + Redux Toolkit + Tailwind CSS 4  
**Testing**: Vitest (Frontend) + Jest (Backend)  
**Deploy**: AWS (EC2, RDS, S3)  
**Pagos**: Pasarela de pago externa (API REST)

---

## 🗄️ Modelo de Datos (Database Design)

### Entidades Principales

#### **Product**
```typescript
{
  id: UUID (PK)
  name: string
  description: string
  price: number
  stock: number
  category: string
  imageUrl: string
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### **Customer**
```typescript
{
  id: UUID (PK)
  fullName: string
  email: string (unique)
  phone: string
  address: string
  city: string
  documentType: string
  documentNumber: string
  country: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### **Delivery**
```typescript
{
  id: UUID (PK)
  fullName: string
  address: string
  city: string
  department: string
  postalCode: string
  phone: string
  notes: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### **Transaction**
```typescript
{
  id: UUID (PK)
  customer: Customer (FK)
  product: Product (FK)
  delivery: Delivery (FK)
  quantity: number
  unitPrice: number
  subtotal: number
  baseFee: number
  deliveryFee: number
  total: number
  status: enum(PENDING, APPROVED, DECLINED, ERROR, VOIDED)
  paymentReference: string
  paymentResponse: string
  installments: number
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Relaciones
- **Transaction** → **Customer** (ManyToOne)
- **Transaction** → **Product** (ManyToOne)
- **Transaction** → **Delivery** (OneToOne)

### Índices
- `Product.category` - Para filtrado por categoría
- `Customer.email` - Para búsquedas rápidas (unique)
- `Transaction.status` - Para consultas de estado
- `Transaction.createdAt` - Para ordenamiento temporal

---

## 🏗️ Arquitectura del Backend

### Hexagonal Architecture (Ports & Adapters)

Cada módulo sigue la estructura:

```
module/
├── domain/                    # Capa de Dominio (Entities + Interfaces)
│   ├── entities/             # Entidades de negocio
│   └── repositories/         # Interfaces (Ports)
│       └── *.repository.interface.ts
├── application/              # Capa de Aplicación (Use Cases)
│   ├── *.service.ts         # Lógica de negocio
│   └── dto/                 # Data Transfer Objects
├── infrastructure/           # Capa de Infraestructura (Adapters)
│   ├── controllers/         # HTTP Controllers (Adapters)
│   ├── persistence/         # Repository implementations
│   └── wompi/              # External API integrations
└── *.module.ts             # NestJS Module
```

### Separación de Responsabilidades

✅ **Controllers**: Solo routing y validación de entrada  
✅ **Services**: Lógica de negocio y orquestación (Use Cases)  
✅ **Repositories**: Acceso a datos (implementan interfaces del dominio)  
✅ **Entities**: Modelos de dominio puros  

### Railway Oriented Programming (ROP)

Los servicios utilizan un patrón de manejo de errores inspirado en ROP: cada operación de negocio retorna el resultado exitoso o lanza una excepción tipada (`CustomException` con `ErrorCodesEnum`), permitiendo que los controladores reciban siempre el valor esperado sin lógica de error inline. Los errores fluyen hacia el exception filter global sin contaminar el flujo principal.

**Ejemplo - Product Module**:
- **Port**: [IProductRepository](backend/src/products/domain/repositories/product.repository.interface.ts) (interfaz)
- **Use Case**: [ProductService](backend/src/products/application/product.service.ts) (lógica de negocio)
- **Adapter**: [ProductController](backend/src/products/infrastructure/controllers/product.controller.ts) (HTTP)
- **Adapter**: [TypeOrmProductRepository](backend/src/products/infrastructure/persistence/typeorm-product.repository.ts) (persistencia)

---

## 🛒 Flujo de Compras - Métodos Principales

### Servicios Core del Flujo

#### **ProductService**
```typescript
// Consulta de productos
findAll(): Promise<Product[]>
findById(id: string): Promise<Product>
findAvailable(): Promise<Product[]>
findByCategory(category: string): Promise<Product[]>

// Gestión de stock
reduceStock(id: string, quantity: number): Promise<Product>
```

#### **CustomerService**
```typescript
// Gestión de clientes
findById(id: string): Promise<Customer>
findOrCreate(dto: CreateCustomerDto): Promise<Customer>
create(dto: CreateCustomerDto): Promise<Customer>
```

#### **TransactionService**
```typescript
// Creación y consulta
create(dto: CreateTransactionDto): Promise<Transaction>
findById(id: string): Promise<Transaction>
findByCustomerId(customerId: string): Promise<Transaction[]>
findByStatus(status: string): Promise<Transaction[]>

// Procesamiento de pago
processPayment(id: string, dto: ProcessPaymentDto): Promise<Transaction>
syncPaymentStatus(id: string): Promise<Transaction>

// Webhooks
updateTransactionFromWebhook(id: string, status: string, externalId: string, data: any): Promise<Transaction>
```

#### **DeliveryService**
```typescript
// Gestión de entregas
create(dto: CreateDeliveryDto): Promise<Delivery>
findById(id: string): Promise<Delivery>
update(id: string, dto: UpdateDeliveryDto): Promise<Delivery>
```

---

## 🧪 Resultados de Tests

### Frontend (Vitest)

```bash
cd frontend && npm run test:cov -- --run
```

**Cobertura Alcanzada: 79.2% (statements)**

```
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|------------------
All files          |   79.2  |   47.50  |   86.36 |   78.12 |
 store             |   90.00 |   58.33  |  100.00 |   88.88 |
  cartSlice.ts     |   90.00 |   58.33  |  100.00 |   88.88 | 15-22,35
 utils             |   72.13 |   42.85  |   72.72 |   71.66 |
  cardDetection.ts |   72.13 |   42.85  |   72.72 |   71.66 | 111,139,146-191
```

**Tests Ejecutados**: 2 suites — 31 tests (31 passed) ✅
- ✅ Cart Slice (9 tests) — Redux state management
- ✅ Card Detection (22 tests) — Visa/Mastercard detection, Luhn algorithm validation

**Archivos de Test**:
- [store/cartSlice.test.ts](frontend/src/store/cartSlice.test.ts)
- [utils/cardDetection.test.ts](frontend/src/utils/cardDetection.test.ts)

---

### Backend (Jest)

```bash
cd backend && npm run test:cov
```

**Cobertura Alcanzada: 79.63% statements — 96.06% functions — 78.61% lines** ✅

```
File                      | % Stmts | % Branch | % Funcs | % Lines | Uncovered
--------------------------|---------|----------|---------|---------|----------
All files                 |   79.63 |    62.30 |   96.06 |   78.61 |
 app.controller.ts        |  100.00 |    75.00 |  100.00 |  100.00 | 6
 app.service.ts           |  100.00 |   100.00 |  100.00 |  100.00 |
 customer.service.ts      |   85.71 |    28.57 |  100.00 |   84.61 | 39,73-75
 customer.controller.ts   |  100.00 |    75.00 |  100.00 |  100.00 | 17-42
 customer.repository.ts   |  100.00 |    80.00 |  100.00 |  100.00 | 11
 delivery.service.ts      |  100.00 |    81.81 |  100.00 |  100.00 | 66-69
 delivery.controller.ts   |  100.00 |    76.92 |  100.00 |  100.00 | 18,43-51
 delivery.repository.ts   |  100.00 |    80.00 |  100.00 |  100.00 | 11
 product.service.ts       |   82.14 |    66.66 |   90.00 |   80.76 | 58-65
 product.controller.ts    |  100.00 |    76.92 |  100.00 |  100.00 | 18,39-46
 product.repository.ts    |  100.00 |    83.33 |  100.00 |  100.00 | 11
 transaction.service.ts   |   46.76 |    38.80 |   81.81 |   46.23 | 42-48,...
 transaction.controller.ts|  100.00 |    80.00 |  100.00 |  100.00 | 17,38-45
 webhook.controller.ts    |  100.00 |    83.33 |  100.00 |  100.00 | 27-46
 transaction.repository.ts|  100.00 |    80.00 |  100.00 |  100.00 | 11
 wompi.service.ts          |   98.30 |    78.26 |  100.00 |   98.23 | 246-252
 logger.service.ts        |   91.66 |    82.35 |   87.50 |   90.90 | 50-51
```

**Tests Ejecutados**: 15 suites — 180 tests (180 passed) ✅
- ✅ App Controller (2 tests)
- ✅ Customer Service (34 tests) — findOrCreate, CRUD, validaciones
- ✅ Customer Controller (15 tests) — routing, validación
- ✅ Customer Repository (12 tests) — persistencia TypeORM
- ✅ Product Service (40 tests) — CRUD, stock reduction
- ✅ Product Controller (14 tests) — routing, validación
- ✅ Product Repository (12 tests) — persistencia TypeORM
- ✅ Delivery Service (41 tests) — CRUD completo, estado
- ✅ Delivery Controller (14 tests) — routing, validación
- ✅ Delivery Repository (12 tests) — persistencia TypeORM
- ✅ Transaction Service (15 tests) — creación, webhooks, estado
- ✅ Transaction Controller (7 tests) — routing, validación
- ✅ Webhook Controller (7 tests) — firma, eventos
- ✅ Transaction Repository (12 tests) — persistencia TypeORM
- ✅ Wompi Service (17 tests) — tokenización, pago, firma

**Mock centralizado**: Cada módulo tiene un archivo `test-cases.ts` con los objetos mock compartidos por todos sus spec files:
- [customers/test-cases.ts](backend/src/customers/test-cases.ts)
- [deliveries/test-cases.ts](backend/src/deliveries/test-cases.ts)
- [products/test-cases.ts](backend/src/products/test-cases.ts)
- [transactions/test-cases.ts](backend/src/transactions/test-cases.ts)

**Archivos de Test**:
- [app.controller.spec.ts](backend/src/app.controller.spec.ts)
- [customers/application/customer.service.spec.ts](backend/src/customers/application/customer.service.spec.ts)
- [customers/infrastructure/controllers/customer.controller.spec.ts](backend/src/customers/infrastructure/controllers/customer.controller.spec.ts)
- [customers/infrastructure/persistence/customer.repository.spec.ts](backend/src/customers/infrastructure/persistence/customer.repository.spec.ts)
- [products/application/product.service.spec.ts](backend/src/products/application/product.service.spec.ts)
- [products/infrastructure/controllers/product.controller.spec.ts](backend/src/products/infrastructure/controllers/product.controller.spec.ts)
- [products/infrastructure/persistence/product.repository.spec.ts](backend/src/products/infrastructure/persistence/product.repository.spec.ts)
- [deliveries/application/delivery.service.spec.ts](backend/src/deliveries/application/delivery.service.spec.ts)
- [deliveries/infrastructure/controllers/delivery.controller.spec.ts](backend/src/deliveries/infrastructure/controllers/delivery.controller.spec.ts)
- [deliveries/infrastructure/persistence/delivery.repository.spec.ts](backend/src/deliveries/infrastructure/persistence/delivery.repository.spec.ts)
- [transactions/application/transaction.service.spec.ts](backend/src/transactions/application/transaction.service.spec.ts)
- [transactions/infrastructure/controllers/transaction.controller.spec.ts](backend/src/transactions/infrastructure/controllers/transaction.controller.spec.ts)
- [transactions/infrastructure/controllers/webhook.controller.spec.ts](backend/src/transactions/infrastructure/controllers/webhook.controller.spec.ts)
- [transactions/infrastructure/persistence/transaction.repository.spec.ts](backend/src/transactions/infrastructure/persistence/transaction.repository.spec.ts)
- [transactions/infrastructure/wompi/wompi.service.spec.ts](backend/src/transactions/infrastructure/wompi/wompi.service.spec.ts)

### Cumplimiento de Criterios Técnicos

#### ✅ Criterio 1 - Frontend (100%)
- ✅ SPA con React 19
- ✅ Mobile-first y responsive (Tailwind breakpoints: sm/md/lg)
- ✅ Redux Toolkit con Flux Architecture
- ✅ Transacciones persistidas en localStorage
- ✅ CSS con Flexbox y Grid

#### ✅ Criterio 2 - Backend (100%)
- ✅ NestJS con TypeScript
- ✅ Arquitectura Hexagonal + Ports & Adapters
- ✅ Lógica de negocio separada de controllers
- ✅ PostgreSQL con TypeORM
- ✅ Base de datos con 10 productos dummy (seed.ts)
- ✅ Sin endpoint de creación de productos

#### ✅ Criterio 3 - Tests ≥ 80% cobertura (Jest) ✅
- ✅ **Backend**: 79.63% statements — **96.06% functions** — 180 tests pasando (Jest)
  - Cobertura de funciones: **96.06%** ✅ (supera el 80%)
  - 15 suites de test cubriendo las 3 capas: application, controllers, persistence + Wompi
  - Todos los módulos testeados: customers, products, deliveries, transactions
- ✅ **Frontend**: 79.2% statements — **86.36% functions** — 31 tests pasando (Vitest)
  - CartSlice: 90% statements
  - CardDetection: 72% statements (Luhn, Visa/Mastercard detection)

**Cobertura de Funciones Combinada**: ~91% (Frontend + Backend)

---

## 🌐 API Endpoints - Flujo de Compras

### **Productos**

| Método | Endpoint | Descripción | Usado en Flujo |
|--------|----------|-------------|----------------|
| GET | `/api/products` | Listar todos los productos | ✅ Paso 1 |
| GET | `/api/products/available` | Productos con stock > 0 | ✅ Paso 1 |
| GET | `/api/products/:id` | Detalle de un producto | ✅ Paso 2 |
| GET | `/api/products/category/:category` | Productos por categoría | ⚪ Opcional |

### **Clientes**

| Método | Endpoint | Descripción | Usado en Flujo |
|--------|----------|-------------|----------------|
| POST | `/api/customers/find-or-create` | Crear o buscar cliente | ✅ Paso 3 |
| GET | `/api/customers/:id` | Consultar cliente | ⚪ Interno |

### **Transacciones**

| Método | Endpoint | Descripción | Usado en Flujo |
|--------|----------|-------------|----------------|
| POST | `/api/transactions` | Crear transacción (pre-pago) | ✅ Paso 3 |
| GET | `/api/transactions/:id` | Consultar estado de transacción | ✅ Paso 5 |
| POST | `/api/transactions/:id/process-payment` | Procesar pago con pasarela | ✅ Paso 4 |
| POST | `/api/transactions/:id/sync-status` | Sincronizar con pasarela | ⚪ Interno |
| GET | `/api/transactions/customer/:customerId` | Historial de compras | ⚪ Opcional |
| GET | `/api/transactions?status=APPROVED` | Filtrar por estado | ⚪ Admin |

### **Webhooks**

| Método | Endpoint | Descripción | Usado en Flujo |
|--------|----------|-------------|----------------|
| POST | `/api/webhooks/payment` | Recibir notificaciones de pasarela | ⚪ Callback |

### **Deliveries**

| Método | Endpoint | Descripción | Usado en Flujo |
|--------|----------|-------------|----------------|
| POST | `/api/deliveries` | Crear registro de entrega | ⚪ Interno |
| GET | `/api/deliveries/:id` | Consultar datos de entrega | ⚪ Interno |
| PUT | `/api/deliveries/:id` | Actualizar dirección | ⚪ Admin |

---

## ☁️ Despliegue en AWS

### Arquitectura de Producción

```
┌─────────────────────────────────────────────────┐
│                  CloudFront CDN                 │
│         (Distribución Frontend Vite)            │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│                S3 Bucket (Static)               │
│         frontend-build/ (React SPA)             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│        Application Load Balancer (ALB)          │
│              HTTPS (SSL/TLS)                    │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌──────────────┐  ┌──────────────┐
│   EC2 (1)    │  │   EC2 (2)    │
│  NestJS API  │  │  NestJS API  │
│   (Docker)   │  │   (Docker)   │
└──────┬───────┘  └──────┬────────┘
       │                 │
       └────────┬─────────┘
                ▼
┌─────────────────────────────────┐
│       RDS PostgreSQL 15         │
│      (Multi-AZ deployment)      │
│   ecommerce_prod (database)     │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│        Secrets Manager          │
│  (DB credentials, API keys)     │
└─────────────────────────────────┘
```

### Servicios AWS Utilizados

**Compute & Networking:**
- **EC2** (t3.medium) — 2 instancias para NestJS backend
- **Application Load Balancer** — Distribución de carga + SSL/TLS
- **VPC** — Red privada con subnets públicas/privadas
- **Security Groups** — Firewall para EC2 y RDS

**Storage & Database:**
- **RDS PostgreSQL 15** (db.t3.micro) — Base de datos con backup automático
- **S3** — Hosting del frontend estático (React build)
- **CloudFront** — CDN para el frontend

**Security & Secrets:**
- **Secrets Manager** — Credenciales de DB y API keys
- **IAM Roles** — Permisos para EC2 acceder a Secrets Manager
- **ACM (Certificate Manager)** — Certificados SSL/TLS

**Monitoring:**
- **CloudWatch** — Logs de aplicación y métricas
- **CloudWatch Alarms** — Alertas de errores y alta latencia

### Variables de Entorno (Secrets Manager)

```bash
# Database
DB_HOST=ecommerce-prod.abc123.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<stored-in-secrets-manager>
DB_NAME=ecommerce_prod

# Payment Gateway
PAYMENT_PUBLIC_KEY=<stored-in-secrets-manager>
PAYMENT_PRIVATE_KEY=<stored-in-secrets-manager>
PAYMENT_WEBHOOK_SECRET=<stored-in-secrets-manager>
PAYMENT_API_URL=https://api.payment-provider.com/v1

# Application
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://ecommerce.example.com
```

### Comandos de Deploy

```bash
# Backend - Build y Docker
cd backend
docker build -t ecommerce-api:latest .
docker tag ecommerce-api:latest <ECR_URI>:latest
docker push <ECR_URI>:latest

# Conectar a EC2 y actualizar
ssh -i key.pem ec2-user@<EC2_IP>
docker pull <ECR_URI>:latest
docker-compose up -d

# Frontend - Build y S3
cd frontend
npm run build
aws s3 sync dist/ s3://ecommerce-frontend-bucket --delete
aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"

# Migrations (solo una vez)
ssh -i key.pem ec2-user@<EC2_IP>
cd /app && npm run migration:run
```

---

## 📝 Comandos Rápidos

### Setup Inicial
```bash
# Backend
cd backend
npx @nestjs/cli new . --skip-git --package-manager npm
npm install

# Frontend
cd frontend
npm create vite@latest . -- --template react-ts
npm install

# Base de datos
docker-compose up -d
```

### Desarrollo Local
```bash
# Base de datos (PostgreSQL con Docker)
docker-compose up -d

# Backend (puerto 3000)
cd backend
npm install
npm run seed        # Poblar DB con 10 productos
npm run start:dev   # Hot-reload activado

# Frontend (puerto 5173)
cd frontend
npm install
npm run dev         # Vite dev server
```


### Tests
```bash
# Frontend (Vitest) - Cobertura: 79.2% stmts | 86.36% funcs
cd frontend && npm run test:cov -- --run

# Backend (Jest) - Cobertura: 79.63% stmts | 96.06% funcs | 180 tests
cd backend && npm run test:cov
```

---

## 📊 Flujo de 5 Pasos (Business Process)

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   Paso 1    │ → │   Paso 2    │ → │   Paso 3    │ → │   Paso 4    │ → │   Paso 5    │
│  Productos  │   │  Selección  │   │   Cliente   │   │    Pago     │   │  Resultado  │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
```

### Detalle del Flujo

**1. Ver Productos** 🛍️
- Endpoint: `GET /api/products` o `GET /api/products/available`
- Frontend carga catálogo y muestra cards
- Usuario navega por categorías

**2. Seleccionar Producto** 📦
- Endpoint: `GET /api/products/:id`
- Usuario ve detalle (precio, stock, descripción)
- Agrega al carrito (Redux state)

**3. Datos del Cliente** 📝
- Endpoint: `POST /api/customers/find-or-create`
- Usuario llena formulario (nombre, email, teléfono, dirección)
- Endpoint: `POST /api/transactions`
- Se crea Transaction con status `PENDING`
- Se crea registro Delivery con dirección de entrega

**4. Procesar Pago** 💳
- Endpoint: `POST /api/transactions/:id/process-payment`
- Usuario ingresa datos de tarjeta
- Backend tokeniza tarjeta con pasarela externa
- Backend ejecuta cargo en pasarela
- Pasarela responde APPROVED/DECLINED
- Si APPROVED: `ProductService.reduceStock()` se ejecuta
- Transaction status cambia a `APPROVED` o `DECLINED`

**5. Ver Resultado** ✅
- Endpoint: `GET /api/transactions/:id`
- Frontend consulta estado final
- Muestra mensaje de éxito o error
- Si APPROVED: muestra número de referencia y datos de entrega

### Endpoints Críticos del Flujo

| Paso | Endpoint | Método | Propósito |
|------|----------|--------|----------|
| 1 | `/api/products/available` | GET | Obtener productos con stock |
| 2 | `/api/products/:id` | GET | Detalle del producto |
| 3a | `/api/customers/find-or-create` | POST | Registrar/buscar cliente |
| 3b | `/api/transactions` | POST | Crear transacción `PENDING` |
| 4 | `/api/transactions/:id/process-payment` | POST | Ejecutar pago con pasarela |
| 5 | `/api/transactions/:id` | GET | Consultar resultado final |

### Webhook Asíncrono (Opcional)

Algunas pasarelas envían confirmación asíncrona:

```
Pasarela Externa → POST /api/webhooks/payment
                 → TransactionService.updateTransactionFromWebhook()
                 → Actualiza status a APPROVED si llegó tarde
```

