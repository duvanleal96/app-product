# ⚡ PLAN EXPRESS - 3 DÍAS (72 horas)

> **Objetivo**: Lograr los 100 puntos mínimos requeridos en 3 días intensivos

---

## 🎯 Estrategia Express

### Prioridades
1. ✅ **Funcionalidad completa** (20 pts) - CRÍTICO
2. ✅ **API funcionando** (20 pts) - CRÍTICO  
3. ✅ **Testing >80%** (30 pts) - CRÍTICO
4. ✅ **Deployment AWS** (20 pts) - CRÍTICO
5. ✅ **README + Docs** (5 pts)
6. ✅ **UI básica funcional** (5 pts)

### Sacrificios Aceptables
- ❌ Arquitectura Hexagonal perfecta → Usar Clean Architecture simplificada
- ❌ ROP puro → Usar async/await con try/catch bien estructurado
- ❌ CSS perfecto → Tailwind con componentes básicos pero funcionales
- ❌ Múltiples navegadores → Solo Chrome/Edge
- ❌ Optimización extrema → Funcional y limpio

---

## 📅 CRONOGRAMA INTENSIVO

### 🔥 DÍA 1 - SETUP + BACKEND + FRONTEND BÁSICO (24h)

#### Mañana (8:00 - 14:00) - 6 horas
**Setup completo del proyecto**

```bash
# 1. Crear estructura base (30 min)
mkdir -p backend frontend
cd backend
npm init -y
npm install @nestjs/cli -g
nest new . --skip-git --package-manager npm

# 2. Instalar dependencias backend (20 min)
npm install @nestjs/typeorm typeorm pg @nestjs/config
npm install class-validator class-transformer @nestjs/swagger
npm install axios

# 3. Setup Docker + DB (20 min)
# Usar el docker-compose.yml ya creado
docker-compose up -d postgres

# 4. Configurar TypeORM (30 min)
# Crear configuraciones básicas

# 5. Frontend setup (30 min)
cd ../frontend
npm create vite@latest . -- --template react-ts
npm install
npm install @reduxjs/toolkit react-redux react-router-dom axios

# 6. Tailwind setup (20 min)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# CHECKPOINT: Ambos proyectos corriendo
# Backend: npm run start:dev → http://localhost:3000
# Frontend: npm run dev → http://localhost:5173
```

**Entregables Día 1 Mañana**:
- ✅ Proyectos inicializados
- ✅ Base de datos corriendo
- ✅ Ambas apps arrancan sin errores

---

#### Tarde (14:00 - 20:00) - 6 horas
**Backend - Entidades y Repositorios**

**Estructura simplificada (NO hexagonal completa)**:
```
backend/src/
├── modules/
│   ├── products/
│   │   ├── entities/product.entity.ts
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   └── products.module.ts
│   ├── transactions/
│   ├── customers/
│   └── deliveries/
├── common/
│   ├── dto/
│   └── utils/
└── config/
```

**Tareas Backend (6 horas)**:
- [ ] 1h - Crear entidades TypeORM (Product, Transaction, Customer, Delivery)
- [ ] 1h - Migrations y seeds de productos
- [ ] 2h - Módulos Products y Customers (CRUD básico)
- [ ] 2h - Módulo Transactions (create, get)

**Código Express - Product Entity**:
```typescript
// product.entity.ts
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int')
  stock: number;

  @Column()
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Entregables Día 1 Tarde**:
- ✅ 4 entidades creadas
- ✅ Endpoints básicos funcionando
- ✅ Swagger documentado

---

#### Noche (20:00 - 24:00) - 4 horas
**Frontend - Páginas principales**

**Tareas Frontend (4 horas)**:
- [ ] 1h - Setup Redux (store, slices básicos)
- [ ] 1h - Componentes compartidos (Button, Input, Card)
- [ ] 2h - Página de productos (listar + seleccionar)

**Entregables Día 1 Noche**:
- ✅ Redux configurado
- ✅ Productos se muestran desde API
- ✅ Navegación básica funciona

---

### 🔥 DÍA 2 - INTEGRACIÓN + WOMPI + TESTING (24h)

#### Mañana (8:00 - 14:00) - 6 horas
**Integración con Wompi + Flujo completo**

**Tareas (6 horas)**:
- [ ] 2h - Adaptador Wompi (versión simplificada)
- [ ] 2h - Endpoint ProcessPayment con lógica completa
- [ ] 2h - Formulario de pago frontend (validación tarjetas)

**Wompi Adapter Simplificado**:
```typescript
// wompi.service.ts
@Injectable()
export class WompiService {
  private readonly apiUrl = process.env.WOMPI_API_URL;
  private readonly privateKey = process.env.WOMPI_PRIVATE_KEY;

  async processPayment(data: PaymentDto) {
    try {
      // 1. Tokenizar tarjeta
      const token = await this.tokenizeCard(data.card);
      
      // 2. Crear transacción
      const result = await axios.post(`${this.apiUrl}/transactions`, {
        amount: data.amount * 100,
        currency: 'COP',
        payment_method: {
          type: 'CARD',
          token,
          installments: 1,
        },
        reference: data.reference,
      }, {
        headers: { Authorization: `Bearer ${this.privateKey}` }
      });

      return result.data;
    } catch (error) {
      throw new BadRequestException('Payment failed');
    }
  }
}
```

**Entregables Día 2 Mañana**:
- ✅ Wompi integrado
- ✅ Pago funciona end-to-end
- ✅ Stock se actualiza

---

#### Tarde (14:00 - 20:00) - 6 horas
**Frontend - Completar flujo + Formularios**

**Tareas (6 horas)**:
- [ ] 2h - Formulario de tarjeta con validación Luhn
- [ ] 2h - Formulario de entrega
- [ ] 1h - Página de resumen
- [ ] 1h - Página de resultado

**Validación Luhn rápida**:
```typescript
export function validateLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}
```

**Entregables Día 2 Tarde**:
- ✅ 5 pasos completos funcionando
- ✅ Validación de tarjetas OK
- ✅ Flujo completo probado manualmente

---

#### Noche (20:00 - 24:00) - 4 horas
**Testing Backend (alcanzar 80%)**

**Estrategia de Testing Express**:
1. **Unit tests de servicios** (más fácil, mayor cobertura)
2. **Tests de validaciones** (DTOs)
3. **1-2 E2E del flujo crítico**

**Prioridad de tests**:
```typescript
// 1. Services (2h)
products.service.spec.ts
transactions.service.spec.ts
wompi.service.spec.ts (con mocks)

// 2. Controllers (1h)
products.controller.spec.ts
transactions.controller.spec.ts

// 3. E2E (1h)
payment-flow.e2e-spec.ts (flujo completo)
```

**Tip**: Usar generadores
```bash
# NestJS genera esqueleto de tests
nest g service products --spec
```

**Entregables Día 2 Noche**:
- ✅ Tests backend >80%
- ✅ Reporte de coverage generado

---

### 🔥 DÍA 3 - TESTING FRONTEND + DEPLOYMENT + DOCS (24h)

#### Mañana (8:00 - 14:00) - 6 horas
**Testing Frontend (alcanzar 80%)**

**Estrategia**:
1. Tests de componentes simples (fácil)
2. Tests de utils (validaciones)
3. Tests de Redux slices

```bash
# Tests prioritarios (6h)
# 1. Utils (1h)
creditCardValidation.test.ts
formatters.test.ts

# 2. Components (3h)
ProductCard.test.tsx
CreditCardForm.test.tsx
Button.test.tsx
Input.test.tsx

# 3. Redux (2h)
productsSlice.test.ts
checkoutSlice.test.ts
paymentSlice.test.ts
```

**Test simple de ejemplo**:
```typescript
// ProductCard.test.tsx
describe('ProductCard', () => {
  it('renders product info', () => {
    const product = { id: '1', name: 'Test', price: 100 };
    render(<ProductCard product={product} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

**Entregables Día 3 Mañana**:
- ✅ Tests frontend >80%
- ✅ Ambos reportes de coverage listos

---

#### Tarde (14:00 - 20:00) - 6 horas  
**Deployment a AWS**

**Opción RÁPIDA: Vercel (Frontend) + Railway (Backend)**

**Plan B AWS Rápido**:
```bash
# Frontend → S3 + CloudFront (2h)
1. Build: npm run build
2. Crear bucket S3
3. Subir dist/
4. Configurar CloudFront
5. Habilitar HTTPS

# Backend → AWS App Runner o Heroku (3h)
1. Dockerfile básico
2. Push a ECR o Heroku
3. Configurar RDS (o usar Neon.tech gratis)
4. Variables de entorno
5. Deploy

# Alternativa MÁS RÁPIDA:
Frontend → Vercel (15 min)
Backend → Railway.app (20 min)
DB → Railway PostgreSQL (incluido)
```

**Railway es MUCHO más rápido**:
```bash
# 1. Frontend en Vercel
vercel --prod

# 2. Backend en Railway
railway init
railway up
railway add postgresql
```

**Entregables Día 3 Tarde**:
- ✅ Frontend desplegado con HTTPS
- ✅ Backend desplegado con HTTPS
- ✅ Base de datos en la nube
- ✅ Todo conectado y funcionando

---

#### Noche (18:00 - 24:00) - 6 horas
**Documentación y Pulido Final**

**Tareas (6 horas)**:
- [ ] 2h - README completo con:
  - Screenshots de la app
  - Instrucciones de instalación
  - Variables de entorno
  - Links de deployment
  - Resultados de tests (screenshots)
  
- [ ] 1h - Colección de Postman/Swagger público

- [ ] 1h - Verificar que TODO funcione:
  - Flujo completo en producción
  - Tests pasan al 100%
  - Links funcionan
  
- [ ] 2h - Últimos ajustes:
  - Responsive básico
  - Loading states
  - Mensajes de error
  - Limpiar console.logs

**Entregables Día 3 Noche**:
- ✅ README profesional
- ✅ API documentada
- ✅ Todo funcional en producción
- ✅ Screenshots incluidos

---

## 🎯 CHECKLIST DE ENTREGA FINAL

### Funcionalidad (40 pts)
- [ ] GET /api/products funciona
- [ ] Página de productos muestra items
- [ ] Se puede seleccionar producto
- [ ] Formulario de tarjeta valida correctamente
- [ ] Detecta Visa/MasterCard y muestra logo
- [ ] Formulario de entrega valida
- [ ] Resumen muestra todos los montos
- [ ] POST /api/transactions crea transacción
- [ ] POST /api/transactions/:id/process-payment procesa pago
- [ ] Wompi API responde correctamente
- [ ] Stock se actualiza en DB
- [ ] Se crea registro de delivery
- [ ] Página de resultado muestra status
- [ ] Redirect de vuelta a productos funciona
- [ ] Stock actualizado se refleja en UI

### Testing (30 pts)
- [ ] Backend: >80% coverage
- [ ] Frontend: >80% coverage
- [ ] Screenshot de coverage backend en README
- [ ] Screenshot de coverage frontend en README

### Deployment (20 pts)
- [ ] Frontend deployado con HTTPS
- [ ] Backend deployado con HTTPS
- [ ] Base de datos en la nube
- [ ] URLs públicos en README
- [ ] App funciona completamente desde URLs públicos

### Documentación (10 pts)
- [ ] README completo
- [ ] Screenshots de la app
- [ ] Instrucciones de instalación local
- [ ] Variables de entorno documentadas
- [ ] Colección de Postman o Swagger público
- [ ] Modelo de datos (ERD) en README

---

## 💡 TIPS PARA MÁXIMA VELOCIDAD

### 1. Usa Generadores
```bash
# NestJS
nest g resource products --no-spec
nest g module transactions
nest g service transactions
nest g controller transactions

# Genera tests automáticamente
nest g service products --spec
```

### 2. Copia y Adapta Código
- Usa los ejemplos de GUIAS_IMPLEMENTACION.md
- Adapta, no escribas desde cero
- Stack Overflow y GitHub Copilot son tus amigos

### 3. No te Compliques
```typescript
// ❌ NO hagas esto en 3 días
class ComplexResultMonad<T, E> { ... }

// ✅ Haz esto
async function processPayment(data) {
  try {
    const result = await wompiService.pay(data);
    await transactionRepo.update(id, { status: 'COMPLETED' });
    return { success: true, data: result };
  } catch (error) {
    await transactionRepo.update(id, { status: 'FAILED' });
    return { success: false, error: error.message };
  }
}
```

### 4. Testing Pragmático
```typescript
// Tests que dan alta cobertura rápido:

// 1. Validaciones (fácil)
describe('validateLuhn', () => {
  it('validates correct card', () => {
    expect(validateLuhn('4111111111111111')).toBe(true);
  });
  it('rejects invalid card', () => {
    expect(validateLuhn('1234567890123456')).toBe(false);
  });
});

// 2. Servicios con mocks (moderado)
describe('ProductsService', () => {
  it('returns products', async () => {
    const mockRepo = { find: jest.fn().mockResolvedValue([]) };
    const service = new ProductsService(mockRepo);
    const result = await service.findAll();
    expect(result).toEqual([]);
  });
});
```

### 5. Deployment Rápido

**Opción A: Railway (MÁS RÁPIDO - 30 min total)**
```bash
# Backend + DB
railway init
railway add postgresql
railway up

# Frontend
vercel --prod
```

**Opción B: AWS con scripts automatizados**
- Usa CloudFormation o CDK templates pre-hechos
- O simplemente usa Elastic Beanstalk (más fácil que ECS)

### 6. No Reinventes la Rueda
- Usa bibliotecas existentes para validación de tarjetas
- Tailwind UI para componentes
- Ejemplos de NestJS docs
- React Hook Form para formularios

---

## 📊 DISTRIBUCIÓN DE TIEMPO

| Actividad | Horas | % |
|-----------|-------|---|
| Setup inicial | 4 | 5.5% |
| Backend desarrollo | 16 | 22% |
| Frontend desarrollo | 16 | 22% |
| Integración Wompi | 4 | 5.5% |
| Testing | 12 | 17% |
| Deployment | 8 | 11% |
| Documentación | 6 | 8.5% |
| Buffer/Imprevistos | 6 | 8.5% |
| **TOTAL** | **72h** | **100%** |

---

## ⚠️ RED FLAGS - Si te atrasas

### Si llevas retraso en Día 1
- ❌ Elimina: Swagger docs (puedes agregar Día 3)
- ❌ Simplifica: Solo módulo Products y Transactions
- ❌ Postpone: Módulo Deliveries (opcional)

### Si llevas retraso en Día 2
- ❌ Reduce testing a 70% (arriesgado pero viable)
- ❌ Usa Railway en lugar de AWS (más rápido)
- ❌ Frontend: Solo Chrome, no multi-browser

### Plan de Emergencia (Día 3 mañana)
Si el Día 3 a las 8am no tienes >70% de tests:
1. **PARA TODO**
2. Dedica 8 horas solo a testing
3. Deployment express con Railway (2h)
4. README mínimo (1h)

---

## 🏆 RESULTADO ESPERADO

Con este plan deberías lograr:

✅ **100 puntos base** - Mínimo para aprobar
- Funcionalidad completa: 40 pts
- Testing >80%: 30 pts
- Deployment: 20 pts
- Docs: 10 pts

🎁 **Posibles bonus** (sin esfuerzo extra):
- Clean code básico: +5 pts
- Responsive básico: +3 pts

**Total esperado: 105-108 puntos** ✨

---

## 📞 AYUDA RÁPIDA

Si te atascas:
1. **Backend**: NestJS docs + ejemplos oficiales
2. **Frontend**: React docs + Redux Toolkit docs
3. **Wompi**: Docs oficiales + Postman collection
4. **Testing**: Jest docs + examples
5. **Deployment**: Railway/Vercel docs (más simple que AWS)

---

## ✅ VERIFICACIÓN FINAL (Día 3, 22:00)

Antes de entregar, verifica:

```bash
# Backend
npm run test:cov  # >80%?
npm run build     # Compila sin errores?
curl https://tu-api.com/api/products  # Funciona?

# Frontend
npm run test:coverage  # >80%?
npm run build          # Compila sin errores?
# Abre https://tu-app.com y prueba el flujo completo

# Documentación
# - README tiene todo?
# - Screenshots incluidos?
# - URLs funcionan?
# - Postman/Swagger accesible?
```

---

## 🚀 EMPIEZA AHORA

```bash
# Comando 1
git checkout -b develop
git push -u origin develop

# Comando 2
git checkout -b feature/initial-setup

# Comando 3
# ¡A TRABAJAR! 💪
```

**¡ÉXITO! Tienes esto. 3 días es justo pero suficiente si te enfocas.** 🔥