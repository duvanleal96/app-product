# 🛒 E-commerce con Pago - Plan Express 3 Días

> App e-commerce con integración de pagos Wompi. Objetivo: **100+ puntos en 72 horas**.

[![Backend](https://img.shields.io/badge/Backend-NestJS-E0234E?logo=nestjs)](https://nestjs.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)](https://www.postgresql.org/)

---

## 🚀 EMPEZAR AHORA

**⏱️ Tienes 72 horas. Cada minuto cuenta.**

### 1️⃣ Setup Inicial (30 min)
👉 Abre **[EMPEZAR_AHORA.md](EMPEZAR_AHORA.md)** y copia/pega todos los comandos

### 2️⃣ Seguir el Plan (3 días)
- **Día 1**: Backend + Frontend → [PLAN_EXPRESS_3_DIAS.md](PLAN_EXPRESS_3_DIAS.md)
- **Día 2**: Integración Wompi + Tests
- **Día 3**: Deploy + Docs

### 3️⃣ Marcar Progreso
📋 Usa **[CHECKLIST_3_DIAS.md](CHECKLIST_3_DIAS.md)** para ir marcando cada tarea

---

## 📂 Archivos Disponibles

```
📁 Documentación Esencial
├── README.md ...................... Este archivo
├── EMPEZAR_AHORA.md ............... 🚀 EMPIEZA AQUÍ (comandos)
├── PLAN_EXPRESS_3_DIAS.md ......... Plan hora por hora
└── CHECKLIST_3_DIAS.md ............ Checklist para marcar

📁 Configuración
├── docker-compose.yml ............. PostgreSQL + Redis
├── backend/.env.example ........... Variables backend
├── frontend/.env.example .......... Variables frontend
└── .gitignore ..................... Git ignore
```

---

## 🎯 Objetivo Mínimo para Aprobar

**100 puntos** = Reto aprobado

| Criterio | Puntos |
|----------|--------|
| ✅ Flujo de 5 pasos funcional | 40 pts |
| ✅ API REST completa | 20 pts |
| ✅ Tests >80% cobertura | 30 pts |
| ✅ App desplegada | 20 pts |
| ✅ Documentación | 10 pts |
| **TOTAL MÍNIMO** | **100 pts** |

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

---

## 💡 Siguiente Paso

👉 Ve a **[EMPEZAR_AHORA.md](EMPEZAR_AHORA.md)** y ejecuta los comandos de setup

**¡Suerte! 🚀**
