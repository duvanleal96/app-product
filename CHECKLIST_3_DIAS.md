# ✅ CHECKLIST DIARIO - 3 DÍAS

> Imprime o marca directamente en este archivo

---

## ⏰ ANTES DE EMPEZAR

- [ ] Leí [INICIO_RAPIDO.md](./INICIO_RAPIDO.md)
- [ ] Tengo café/bebida ☕
- [ ] Timer/reloj listo
- [ ] Distracciones OFF
- [ ] Repos: backend/ y frontend/ creados

---

## 📅 DÍA 1 - SETUP Y BÁSICOS

**Objetivo**: Apps corriendo y productos listándose

### 🌅 Mañana (8:00 - 14:00) - 6 horas

#### Setup Backend (2.5h)
- [ ] `nest new backend`
- [ ] Instalar: typeorm, pg, config, class-validator
- [ ] Crear estructura de carpetas
- [ ] Configurar TypeORM
- [ ] Backend arranca en http://localhost:3000

#### Setup Frontend (1.5h)
- [ ] `npm create vite frontend -- --template react-ts`
- [ ] Instalar: redux, router, axios, tailwind
- [ ] Configurar Tailwind
- [ ] Frontend arranca en http://localhost:5173

#### Base de Datos (1.5h)
- [ ] `docker-compose up -d postgres`
- [ ] Postgres corriendo
- [ ] Conexión desde backend OK

#### Primera API (0.5h)
- [ ] GET /health funciona
- [ ] GET /products retorna []

**✅ CHECKPOINT DÍA 1 MAÑANA**
- Backend responde en puerto 3000
- Frontend muestra en puerto 5173
- DB acepta conexiones

---

### 🌆 Tarde (14:00 - 20:00) - 6 horas

#### Entidades Backend (1h)
- [ ] Product.entity.ts
- [ ] Transaction.entity.ts
- [ ] Customer.entity.ts
- [ ] Delivery.entity.ts

#### Migrations & Seeds (1h)
- [ ] Migration creada
- [ ] `npm run migration:run`
- [ ] Seed de 5 productos
- [ ] Verificar en pgAdmin/psql

#### Módulo Products (2h)
- [ ] products.service.ts
- [ ] products.controller.ts
- [ ] GET /api/products funciona
- [ ] Probado con Postman/Thunder

#### Módulo Customers (1h)
- [ ] customers.service.ts
- [ ] customers.controller.ts
- [ ] POST /api/customers funciona

#### Módulo Transactions (1h)
- [ ] transactions.service.ts
- [ ] transactions.controller.ts
- [ ] POST /api/transactions (solo crear)
- [ ] GET /api/transactions/:id

**✅ CHECKPOINT DÍA 1 TARDE**
- GET /api/products retorna productos
- POST /api/customers crea cliente
- POST /api/transactions crea transacción

---

### 🌙 Noche (20:00 - 24:00) - 4 horas

#### Redux Setup (1h)
- [ ] store.ts configurado
- [ ] productsSlice.ts
- [ ] App.tsx con Provider

#### Componentes Base (1h)
- [ ] Button.tsx
- [ ] Card.tsx
- [ ] Input.tsx

#### Página Productos (2h)
- [ ] ProductPage.tsx
- [ ] ProductCard.tsx
- [ ] Lista productos desde API
- [ ] Botón "Comprar" navega a /checkout

**✅ CHECKPOINT DÍA 1 NOCHE**
- Frontend muestra productos
- Botones funcionan
- Navegación OK

**🎉 FIN DÍA 1** - Commit: `feat: day 1 complete - basic setup`

---

## 📅 DÍA 2 - INTEGRACIÓN Y TESTING

**Objetivo**: Flujo de pago completo funcionando

### 🌅 Mañana (8:00 - 14:00) - 6 horas

#### Wompi Service (2h)
- [ ] wompi.service.ts creado
- [ ] tokenizeCard() funciona
- [ ] processPayment() funciona
- [ ] Probado con tarjeta test

#### Endpoint ProcessPayment (2h)
- [ ] POST /api/transactions/:id/process-payment
- [ ] Llama Wompi
- [ ] Actualiza transaction.status
- [ ] Actualiza product.stock
- [ ] Crea delivery

#### Completar Módulo Deliveries (1h)
- [ ] deliveries.service.ts
- [ ] deliveries.controller.ts
- [ ] GET /api/deliveries/:id

#### Pruebas End-to-End Backend (1h)
- [ ] Flujo completo con Postman
- [ ] Pago exitoso
- [ ] Pago fallido
- [ ] Stock se actualiza

**✅ CHECKPOINT DÍA 2 MAÑANA**
- Wompi responde
- Pago completo funciona
- Stock disminuye

---

### 🌆 Tarde (14:00 - 20:00) - 6 horas

#### Validación Tarjetas (1h)
- [ ] creditCardValidation.ts
- [ ] validateLuhn()
- [ ] detectCardType()
- [ ] formatCardNumber()

#### Formulario Tarjeta (2h)
- [ ] CreditCardForm.tsx
- [ ] Validación en tiempo real
- [ ] Muestra logo Visa/MC
- [ ] checkoutSlice.ts actualizado

#### Formulario Entrega (1h)
- [ ] DeliveryForm.tsx
- [ ] Validación campos
- [ ] Guardado en Redux

#### Resumen y Resultado (2h)
- [ ] SummaryPage.tsx (montos)
- [ ] Botón procesar pago
- [ ] ResultPage.tsx (success/error)
- [ ] Redirect a productos

**✅ CHECKPOINT DÍA 2 TARDE**
- 5 pasos completos
- Formularios validan
- Flujo funciona end-to-end

---

### 🌙 Noche (20:00 - 24:00) - 4 horas

#### Tests Backend (4h)

**Services (2h)**
- [ ] products.service.spec.ts
- [ ] transactions.service.spec.ts
- [ ] wompi.service.spec.ts (con mocks)
- [ ] customers.service.spec.ts

**Controllers (1h)**
- [ ] products.controller.spec.ts
- [ ] transactions.controller.spec.ts

**E2E (1h)**
- [ ] payment-flow.e2e-spec.ts

#### Verificar Coverage
- [ ] `npm run test:cov`
- [ ] Coverage >80%
- [ ] Screenshot guardado

**✅ CHECKPOINT DÍA 2 NOCHE**
- Tests backend >80%
- Screenshot coverage

**🎉 FIN DÍA 2** - Commit: `feat: day 2 complete - integration and backend tests`

---

## 📅 DÍA 3 - TESTING FRONTEND Y DEPLOYMENT

**Objetivo**: Todo deployed y documentado

### 🌅 Mañana (8:00 - 14:00) - 6 horas

#### Tests Utils (1h)
- [ ] creditCardValidation.test.ts
- [ ] formatters.test.ts

#### Tests Componentes (3h)
- [ ] ProductCard.test.tsx
- [ ] CreditCardForm.test.tsx
- [ ] DeliveryForm.test.tsx
- [ ] Button.test.tsx
- [ ] Input.test.tsx

#### Tests Redux (2h)
- [ ] productsSlice.test.ts
- [ ] checkoutSlice.test.ts
- [ ] paymentSlice.test.ts

#### Verificar Coverage
- [ ] `npm run test:coverage`
- [ ] Coverage >80%
- [ ] Screenshot guardado

**✅ CHECKPOINT DÍA 3 MAÑANA**
- Tests frontend >80%
- Ambos coverage listos

---

### 🌆 Tarde (14:00 - 20:00) - 6 horas

#### Build Local (0.5h)
- [ ] Backend: `npm run build` OK
- [ ] Frontend: `npm run build` OK

#### Opción A: Railway (Recomendado - 2h)

**Backend + DB (1h)**
- [ ] `railway init`
- [ ] `railway add postgresql`
- [ ] Configurar variables entorno
- [ ] `railway up`
- [ ] Verificar URL backend

**Frontend Vercel (1h)**
- [ ] `npm install -g vercel`
- [ ] `vercel --prod`
- [ ] Configurar VITE_API_URL
- [ ] Verificar URL frontend

#### Opción B: AWS (5h)
- [ ] Crear bucket S3
- [ ] Deploy frontend a S3
- [ ] CloudFront distribution
- [ ] Backend a Elastic Beanstalk
- [ ] RDS PostgreSQL

#### Verificación (0.5h)
- [ ] URL frontend funciona
- [ ] URL backend funciona
- [ ] HTTPS habilitado
- [ ] Flujo completo probado

**✅ CHECKPOINT DÍA 3 TARDE**
- Apps deployed
- URLs públicos OK
- HTTPS activo

---

### 🌙 Noche (18:00 - 24:00) - 6 horas

#### README Completo (2h)
- [ ] Descripción proyecto
- [ ] Stack tecnológico
- [ ] Instrucciones instalación
- [ ] Variables entorno
- [ ] Comandos tests
- [ ] Screenshots coverage (ambos)
- [ ] URLs deployment
- [ ] Screenshots de la app

#### Screenshots (1h)
- [ ] Captura: Página productos
- [ ] Captura: Formulario pago
- [ ] Captura: Resumen
- [ ] Captura: Resultado éxito
- [ ] Captura: Coverage backend
- [ ] Captura: Coverage frontend

#### Documentación API (1h)
- [ ] Swagger configurado O
- [ ] Postman collection exportada
- [ ] Link/archivo en README

#### Verificación Final (1h)
- [ ] Flujo completo en producción
- [ ] Tests pasan 100%
- [ ] Links funcionan
- [ ] README completo

#### Git Final (1h)
- [ ] Revisar commits
- [ ] Limpiar console.logs
- [ ] Último commit
- [ ] Push final

**✅ CHECKPOINT DÍA 3 NOCHE**
- README profesional
- Todo documentado
- Git limpio

**🎉 FIN DÍA 3** - Commit: `docs: complete documentation and deployment`

---

## 🏆 VERIFICACIÓN FINAL

Antes de marcar como completo:

### Funcionalidad
- [ ] Puedo ver productos desde URL pública
- [ ] Puedo comprar y procesar pago
- [ ] Stock se actualiza
- [ ] Veo resultado correcto

### Tests
- [ ] Backend >80%
- [ ] Frontend >80%
- [ ] Screenshots en README

### Deployment
- [ ] Frontend público HTTPS
- [ ] Backend público HTTPS
- [ ] Todo conectado

### Documentación
- [ ] README completo
- [ ] Screenshots incluidos
- [ ] API documentada
- [ ] .env.example actualizado

---

## 🎊 SUBMISSION CHECKLIST

- [ ] Repository público en GitHub
- [ ] No usa palabra "Wompi" en nombre
- [ ] README.md completo
- [ ] Links de producción funcionan
- [ ] Commits organizados y descriptivos
- [ ] .env no está en Git
- [ ] .env.example sí está

---

**SI TODO ESTÁ ✅ = ¡FELICITACIONES! LO LOGRASTE 🎉**

Score esperado: **100+ puntos**