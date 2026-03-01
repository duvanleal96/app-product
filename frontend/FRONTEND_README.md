# E-Commerce Application - Frontend

Frontend de aplicación e-commerce desarrollado con React, TypeScript, Redux Toolkit y Vite.

## 🚀 Tecnologías

- **React 19.2** - Framework UI
- **TypeScript 5.9** - Tipado estático
- **Vite 8 Beta** - Build tool y dev server
- **Redux Toolkit 2.11** - State management
- **React Router 7.13** - Routing
- **Tailwind CSS 4.2** - Styling
- **Axios 1.13** - HTTP client

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── common/         # Componentes comunes (Loading, ErrorMessage, etc.)
│   │   └── products/       # Componentes de productos
│   ├── pages/              # Páginas principales
│   │   ├── ProductListPage.tsx      # Listado de productos
│   │   ├── ProductDetailPage.tsx    # Detalle de producto
│   │   ├── CustomerInfoPage.tsx     # Formulario de cliente
│   │   ├── PaymentPage.tsx          # Pago y entrega
│   │   └── ResultPage.tsx           # Resultado de transacción
│   ├── services/           # API services
│   │   ├── api.ts          # Axios instance
│   │   ├── products.service.ts
│   │   └── transactions.service.ts
│   ├── store/              # Redux state management
│   │   ├── index.ts        # Store configuration
│   │   ├── hooks.ts        # Typed hooks
│   │   ├── productsSlice.ts
│   │   ├── cartSlice.ts
│   │   └── checkoutSlice.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── App.tsx             # Main app component with routes
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles with Tailwind
├── .env                    # Environment variables
├── tailwind.config.ts      # Tailwind configuration
├── vite.config.ts          # Vite configuration
└── package.json
```

## 🎯 Flujo de Checkout (5 Pasos)

1. **ProductListPage** (`/`) - Ver catálogo de productos
2. **ProductDetailPage** (`/product/:id`) - Seleccionar producto y cantidad
3. **CustomerInfoPage** (`/customer-info`) - Ingresar datos del cliente
4. **PaymentPage** (`/payment`) - Información de pago y entrega
5. **ResultPage** (`/result`) - Confirmación de transacción

## 🛠️ Instalación y Configuración

### 1. Instalar dependencias

```bash
cd frontend
npm install
```

### 2. Configurar variables de entorno

El archivo `.env` ya está configurado con:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=E-commerce App
VITE_ENV=development
```

### 3. Iniciar servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 4. Build para producción

```bash
npm run build
```

Los archivos optimizados se generarán en `dist/`

### 5. Preview producción

```bash
npm run preview
```

## 📦 Redux Store

### Slices disponibles:

#### 1. Products Slice
- `fetchProducts()` - Obtener todos los productos
- `fetchProductById(id)` - Obtener producto por ID

#### 2. Cart Slice
- `addToCart({ product, quantity })` - Agregar al carrito
- `updateQuantity({ productId, quantity })` - Actualizar cantidad
- `removeFromCart(productId)` - Eliminar del carrito
- `clearCart()` - Limpiar carrito

#### 3. Checkout Slice
- `createCustomer(customerDto)` - Crear cliente
- `createTransaction(transactionDto)` - Crear transacción
- `processPayment(paymentDto)` - Procesar pago
- `setStep(step)` - Cambiar paso del checkout

## 🎨 Estilos con Tailwind CSS

### Clases personalizadas disponibles:

```css
/* Loading spinner */
.spinner

/* Botones */
.btn .btn-primary .btn-secondary .btn-danger

/* Cards */
.card

/* Inputs */
.input .input-error

/* Badges */
.badge .badge-success .badge-warning .badge-danger
```

## 🔌 Integración con Backend

La aplicación se conecta al backend en `http://localhost:3000/api`

### Endpoints utilizados:

```
GET    /products              # Listar productos
GET    /products/:id          # Obtener producto
POST   /customers             # Crear cliente
GET    /customers/:id         # Obtener cliente
POST   /transactions          # Crear transacción
GET    /transactions/:id      # Obtener transacción
POST   /transactions/:id/process-payment  # Procesar pago
```

## 🧪 Testing

```bash
# Ejecutar tests unitarios
npm test

# Coverage
npm run test:coverage
```

## 📝 Scripts Disponibles

```json
{
  "dev": "vite",                    // Servidor desarrollo
  "build": "tsc -b && vite build",  // Build producción
  "lint": "eslint .",               // Linter
  "preview": "vite preview",        // Preview build
  "test": "vitest",                 // Tests
  "test:coverage": "vitest --coverage"
}
```

## 🌐 Deployment

### Vercel (Recomendado)

1. Conectar repositorio con Vercel
2. Configurar variables de entorno:
   - `VITE_API_URL` - URL del backend en producción
3. Deploy automático en cada push

### Otras opciones
- Netlify
- AWS S3 + CloudFront
- Railway
- Render

## 📋 Checklist de Desarrollo

- [x] Configurar proyecto con Vite + React + TypeScript
- [x] Instalar dependencias (Redux, Router, Axios, Tailwind)
- [x] Configurar Tailwind CSS
- [x] Crear tipos TypeScript
- [x] Configurar servicios API con Axios
- [x] Crear Redux store (3 slices)
- [x] Implementar 5 páginas del flujo
- [x] Configurar React Router
- [x] Crear componentes reutilizables
- [ ] Tests unitarios (>80% coverage)
- [ ] Tests de integración
- [ ] Optimización de performance
- [ ] Deploy a Vercel

## 🐛 Troubleshooting

### Error: Cannot find module
- Reiniciar el servidor TypeScript en VSCode: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
- Verificar que todos los archivos tengan la extensión correcta (.ts/.tsx)

### Error de CORS
- Verificar que el backend esté corriendo en `localhost:3000`
- Verificar configuración de CORS en el backend

### Estilos no se aplican
- Verificar que `@import "tailwindcss"` esté en `index.css`
- Reiniciar servidor de desarrollo

## 👤 Autor

Duvan Leal

## 📄 Licencia

MIT
