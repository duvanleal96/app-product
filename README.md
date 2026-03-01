# 🛒 E-commerce con Pago

> App e-commerce con integración de pagos

[![Backend](https://img.shields.io/badge/Backend-NestJS-E0234E?logo=nestjs)](https://nestjs.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)](https://www.postgresql.org/)

---


## 🛠️ Stack Técnico

**Backend**: NestJS 10 + TypeORM + PostgreSQL 15  
**Frontend**: React 18 + Vite + Redux Toolkit + Tailwind  
**Testing**: Jest + React Testing Library  
**Deploy**: Railway + Vercel  
**Pagos**: Wompi API (sandbox)

---

## 🔑 Credenciales Wompi (Sandbox)

```
Public Key:  pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7
Private Key: prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg
Integrity:   stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp
API URL:     https://api-sandbox.co.uat.wompi.dev/v1
```

**Tarjetas de prueba**:
- ✅ Éxito: `4242 4242 4242 4242` (cualquier CVV futuro)
- ❌ Error: `4111 1111 1111 1111`

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

### Desarrollo
```bash
# Backend (puerto 3000)
cd backend && npm run start:dev

# Frontend (puerto 5173)
cd frontend && npm run dev
```

### Tests
```bash
# Backend
cd backend && npm run test:cov

# Frontend
cd frontend && npm run test -- --coverage
```

---

## 📊 Flujo de 5 Pasos (Business Process)

```
1. Ver Productos → 2. Seleccionar → 3. Datos Cliente → 4. Pago → 5. Resultado
```

**Endpoints necesarios**:
- `GET /api/products` - Listar productos
- `POST /api/transactions` - Crear transacción
- `POST /api/transactions/:id/process-payment` - Procesar pago
- `GET /api/transactions/:id` - Ver resultado

