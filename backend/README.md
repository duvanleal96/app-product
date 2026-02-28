# Backend - E-commerce API

API para aplicación de e-commerce con procesamiento de pagos, construida con NestJS, PostgreSQL y arquitectura hexagonal.

## 🏗️ Arquitectura

Este proyecto sigue **Arquitectura Hexagonal (Ports & Adapters)** para mantener un código desacoplado, testeable y mantenible.

### Estructura de Carpetas

```
src/
├── config/                    # Configuraciones globales
│   ├── app.config.ts         # Configuración general
│   ├── database.config.ts    # Configuración TypeORM
│   └── typeorm.cli.config.ts # CLI TypeORM
├── shared/                    # Código compartido
│   └── domain/
│       └── base.entity.ts    # Entidad base con timestamps
├── products/                  # Módulo Products
│   ├── domain/
│   │   ├── entities/         # Entidades del dominio
│   │   └── repositories/     # Interfaces (puertos)
│   ├── application/          # Casos de uso y DTOs
│   │   ├── dto/
│   │   └── product.service.ts
│   ├── infrastructure/       # Adaptadores
│   │   ├── controllers/      # REST Controllers
│   │   └── persistence/      # Implementación de repositorios
│   └── products.module.ts
├── customers/                 # Módulo Customers (misma estructura)
├── transactions/              # Módulo Transactions (misma estructura)
├── deliveries/                # Módulo Deliveries (misma estructura)
├── database/
│   ├── seeds/                # Scripts de población de datos
│   └── migrations/           # Migraciones de base de datos
├── app.module.ts             # Módulo principal
└── main.ts                   # Bootstrap de la aplicación
```

### Capas de la Arquitectura Hexagonal

1. **Domain (Dominio)**: Entidades e interfaces de repositorios
   - Sin dependencias externas
   - Lógica de negocio pura

2. **Application (Aplicación)**: Casos de uso y servicios
   - Orquesta la lógica de negocio
   - Define DTOs

3. **Infrastructure (Infraestructura)**: Adaptadores
   - Controllers (REST API)
   - Implementación de repositorios (TypeORM)
   - Servicios externos (Wompi)

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- PostgreSQL 15+ (o Docker)
- npm o yarn

### Instalación

1. **Instalar dependencias**
   ```bash
   cd backend
   npm install
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

3. **Iniciar base de datos (Docker)**
   ```bash
   cd ..
   docker-compose up -d postgres
   ```

4. **Poblar base de datos con productos**
   ```bash
   npm run seed
   ```

5. **Iniciar servidor en desarrollo**
   ```bash
   npm run start:dev
   ```

La API estará disponible en `http://localhost:3000`

## 📚 Documentación API

Swagger está disponible en: `http://localhost:3000/api/docs`

### Endpoints Principales

#### Products
- `GET /api/products` - Lista todos los productos
- `GET /api/products/available` - Productos disponibles
- `GET /api/products/:id` - Obtener producto por ID
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

#### Customers
- `GET /api/customers` - Lista todos los clientes
- `GET /api/customers/:id` - Obtener cliente por ID
- `POST /api/customers` - Crear cliente

#### Transactions
- `GET /api/transactions` - Lista todas las transacciones
- `GET /api/transactions/:id` - Obtener transacción por ID
- `POST /api/transactions` - Crear transacción
- `POST /api/transactions/:id/process-payment` - Procesar pago

#### Deliveries
- `GET /api/deliveries/:id` - Obtener entrega por ID
- `GET /api/deliveries/transaction/:transactionId` - Por transacción
- `PATCH /api/deliveries/:id/status` - Actualizar estado

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests con cobertura
npm run test:cov

# Tests en modo watch
npm run test:watch

# Tests E2E
npm run test:e2e
```

## 🗃️ Base de Datos

### Entidades

1. **Product**: Productos del catálogo
2. **Customer**: Información de clientes
3. **Transaction**: Transacciones de compra
4. **Delivery**: Información de entregas

### Relaciones

- `Product` → `Transaction` (One-to-Many)
- `Customer` → `Transaction` (One-to-Many)
- `Transaction` → `Delivery` (One-to-One)

### Scripts

```bash
# Poblar base de datos
npm run seed
```

## 🔧 Scripts Disponibles

```bash
npm run start          # Iniciar en producción
npm run start:dev      # Iniciar en desarrollo (watch mode)
npm run start:debug    # Iniciar en modo debug
npm run build          # Compilar proyecto
npm run format         # Formatear código
npm run lint           # Ejecutar linter
npm run test           # Ejecutar tests
npm run test:cov       # Tests con cobertura
npm run seed           # Poblar base de datos
```

## 🌍 Variables de Entorno

Ver `.env.example` para todas las variables disponibles:

- `NODE_ENV`: Entorno (development/production)
- `PORT`: Puerto del servidor
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`: PostgreSQL
- `WOMPI_*`: Credenciales de Wompi (sandbox)
- `BASE_FEE`: Tarifa base en centavos
- `DELIVERY_FEE`: Tarifa de envío en centavos
- `CORS_ORIGIN`: Origen permitido para CORS

## 📦 Stack Tecnológico

- **Framework**: NestJS 11
- **ORM**: TypeORM 0.3
- **Base de Datos**: PostgreSQL 15
- **Validación**: class-validator, class-transformer
- **Documentación**: Swagger/OpenAPI
- **Testing**: Jest
- **Linting**: ESLint + Prettier

## 🏛️ Principios Aplicados

- **Arquitectura Hexagonal**: Separación de capas
- **Dependency Injection**: Inversión de dependencias
- **SOLID**: Principios de diseño orientado a objetos
- **DTOs**: Validación de entrada/salida
- **Repository Pattern**: Abstracción de acceso a datos

## 📝 Licencia

UNLICENSED - Proyecto privado
