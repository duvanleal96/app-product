# ▶️ EMPEZAR AHORA - Primeros Comandos

> Copia y pega estos comandos para empezar inmediatamente

---

## 🎯 RUTA RÁPIDA (Primeros 30 minutos)

### 1️⃣ Crear estructura Git (2 min)

```bash
# Ya estás en: app-product/
git checkout -b develop
git push -u origin develop
git checkout -b feature/initial-setup
```

---

### 2️⃣ Setup Backend - NestJS (10 min)

```bash
# Crear carpeta backend
cd backend

# Inicializar NestJS
npx @nestjs/cli new . --skip-git --package-manager npm

# Cuando pregunte el nombre del proyecto: backend
# Espera que termine la instalación...

# Instalar dependencias necesarias
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/config
npm install class-validator class-transformer
npm install @nestjs/swagger swagger-ui-express
npm install axios

# Instalar dev dependencies
npm install -D @types/node

# Verificar que funciona
npm run start:dev
# Deberías ver: Nest application successfully started
# Abre http://localhost:3000 → debe decir "Hello World!"
```

**✅ CHECKPOINT**: Backend corriendo en puerto 3000

---

### 3️⃣ Setup Frontend - React + Vite (8 min)

```bash
# Volver a raíz y crear frontend
cd ..
cd frontend

# Crear proyecto Vite con React + TypeScript
npm create vite@latest . -- --template react-ts

# Instalar dependencias base
npm install

# Instalar Redux y routing
npm install @reduxjs/toolkit react-redux
npm install react-router-dom
npm install axios

# Instalar Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Configurar Tailwind (copia este contenido)
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

# Verificar que funciona
npm run dev
# Deberías ver: Local: http://localhost:5173/
# Abre esa URL → debe mostrar página de Vite
```

**✅ CHECKPOINT**: Frontend corriendo en puerto 5173

---

### 4️⃣ Levantar PostgreSQL (5 min)

```bash
# Volver a raíz
cd ..

# Levantar PostgreSQL con Docker
docker-compose up -d postgres

# Verificar que está corriendo
docker-compose ps
# Debe mostrar: ecommerce-postgres Up

# Ver logs (opcional)
docker-compose logs postgres

# Conectar con psql (opcional, para verificar)
docker exec -it ecommerce-postgres psql -U postgres -d ecommerce_dev
# Si entras, sal con: \q
```

**✅ CHECKPOINT**: PostgreSQL corriendo en puerto 5432

---

### 5️⃣ Configurar Variables de Entorno (5 min)

```bash
# Backend
cd backend
cp ../.env.example .env

# Editar .env (usa tu editor favorito)
# Verifica que tenga al menos:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=postgres
# DB_NAME=ecommerce_dev

# Frontend
cd ../frontend
cp ../.env.example .env

# Editar .env
# Verifica que tenga:
# VITE_API_URL=http://localhost:3000/api

cd ..
```

**✅ CHECKPOINT**: Variables de entorno configuradas

---

## 🎉 ¡LISTO PARA EMPEZAR!

Si llegaste aquí, **tienes todo configurado** para comenzar a desarrollar.

### Verificación Final

Deberías tener 3 terminales abiertas:

```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend  
cd frontend
npm run dev

# Terminal 3: Para comandos varios
# (git, docker, etc.)
```

### URLs Activas

- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173
- **PostgreSQL**: localhost:5432

---

## 📍 ¿QUÉ SIGUE?

Ahora ve a **[CHECKLIST_3_DIAS.md](./CHECKLIST_3_DIAS.md)** y comienza:

**DÍA 1 → TARDE (14:00 - 20:00)**
- Crear entidades TypeORM
- Migrations y seeds
- Módulos Products, Customers, Transactions

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Backend no arranca

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run start:dev
```

### Frontend no arranca

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Puerto ocupado (backend)

```bash
# En Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# En Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Puerto ocupado (frontend)

```bash
# En Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# En Mac/Linux
lsof -ti:5173 | xargs kill -9
```

### PostgreSQL no conecta

```bash
docker-compose down
docker-compose up -d postgres
docker-compose logs postgres
```

---

## 💾 Primer Commit

Una vez que todo funcione:

```bash
git add .
git commit -m "chore: initial project setup - backend, frontend, and database"
git push origin feature/initial-setup
```

---

## 📚 Continúa con:

1. **[CHECKLIST_3_DIAS.md](./CHECKLIST_3_DIAS.md)** - Marca tu progreso
2. **[PLAN_EXPRESS_3_DIAS.md](./PLAN_EXPRESS_3_DIAS.md)** - Si necesitas más detalles
3. **[GUIAS_IMPLEMENTACION.md](./GUIAS_IMPLEMENTACION.md)** - Para código de ejemplo

---

**¡A trabajar! 💪 Tienes esto.**