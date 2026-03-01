# 🏗️ Arquitectura Frontend - E-Shop

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── common/       # Componentes comunes (Header, Loading, etc.)
│   │   └── products/     # Componentes específicos de productos
│   ├── pages/            # Páginas de la aplicación
│   ├── services/         # Capa de servicios (API calls)
│   ├── store/            # Estado global con Redux Toolkit
│   │   ├── cartSlice.ts
│   │   ├── checkoutSlice.ts
│   │   ├── productsSlice.ts
│   │   └── hooks.ts
│   ├── theme/            # Sistema de diseño centralizado
│   │   └── colors.ts     # Gradientes y colores
│   └── types/            # TypeScript types e interfaces
```

## 🎨 Sistema de Diseño

### Theme System (Nuevo)

Todos los colores y gradientes están centralizados en `theme/colors.ts`:

```typescript
import { applyGradient } from '../theme/colors';

// Usar en componentes
<div style={applyGradient('primary')}>
  {/* ... */}
</div>
```

**Gradientes disponibles:**
- `primary` - Morado vibrante (hero sections)
- `secondary` - Rosa/amarillo cálido
- `background` - Fondo general colorido
- `card` - Fondo sutil para tarjetas
- `lightPurple`, `lightBlue`, `lightPink` - Variaciones suaves

**✅ Ventajas:**
- ✨ DRY (Don't Repeat Yourself) - No duplicar código
- 🎨 Consistencia visual en toda la app
- 🔧 Fácil de mantener y actualizar
- 📦 Reutilizable en cualquier componente

## 🔄 Manejo de Estado (Redux Toolkit)

### Slices Implementados

#### 1. **productsSlice.ts**
```typescript
// Estado de productos
interface ProductsState {
  items: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
}

// Thunks asíncronos
fetchProducts();      // GET /api/products/available
fetchProductById(id); // GET /api/products/:id
```

#### 2. **cartSlice.ts**
```typescript
// Carrito de compras local
interface CartState {
  items: CartItem[];
}

// Acciones
addToCart({ product, quantity });
updateQuantity({ productId, quantity });
removeFromCart(productId);
clearCart();
```

#### 3. **checkoutSlice.ts**
```typescript
// Proceso de checkout
interface CheckoutState {
  customer: Customer | null;
  transaction: Transaction | null;
  currentStep: number;
  loading: boolean;
  error: string | null;
}

// Thunks
createCustomer(data);
createTransaction(data);
```

### Custom Hooks

```typescript
// hooks.ts - Hooks tipados
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

**✅ Buenas prácticas aplicadas:**
- ✨ TypeScript con tipado fuerte
- 🔄 Async thunks para operaciones asíncronas
- 🎯 Estado normalizado y predecible
- 🔒 Immutabilidad garantizada por Immer
- 📊 Separación clara de responsabilidades

## 🌐 Capa de Servicios

### API Layer

```typescript
// services/api.ts - Cliente HTTP centralizado
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Interceptores para logging y manejo de errores
api.interceptors.response.use(onSuccess, onError);
```

### Services Específicos

```typescript
// products.service.ts
export const productsService = {
  getAvailableProducts(): Promise<Product[]>
  getProductById(id: string): Promise<Product>
}

// transactions.service.ts
export const transactionsService = {
  createTransaction(data): Promise<Transaction>
}
```

**✅ Ventajas:**
- 🔌 Separación de lógica de negocio
- 🔄 Reutilización de código
- 🧪 Fácil de testear
- 📝 Documentación clara de endpoints

## 🎯 Componentes

### Estructura de Componentes

1. **Funcionales con TypeScript**
```typescript
interface Props {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard = ({ product, onSelect }: Props) => {
  // Lógica del componente
  return (/* JSX */);
};
```

2. **Hooks de React**
- `useState` - Estado local
- `useEffect` - Efectos secundarios
- `useNavigate` - Navegación programática
- `useAppSelector` - Lectura del store
- `useAppDispatch` - Dispatch de acciones

### Componentes Comunes

- **Header** - Navegación y carrito
- **Loading** - Spinner de carga
- **ErrorMessage** - Mensajes de error
- **StepIndicator** - Indicador de pasos de checkout

### Componentes de Productos

- **ProductCard** - Tarjeta de producto
- **ProductListPage** - Lista de productos con filtros
- **ProductDetailPage** - Detalle de producto

## 🚀 Mejoras Aplicadas

### Sistema de Diseño Centralizado ✨ (NUEVO)

**Antes:**
```tsx
// ❌ Colores hardcodeados en cada archivo
<div style={{background: 'linear-gradient(135deg, #667eea 0%, ...)'}} />
```

**Después:**
```tsx
// ✅ Sistema centralizado y reutilizable
import { applyGradient } from '../theme/colors';
<div style={applyGradient('primary')} />
```

### Gradiente de Fondo Vibrante 🎨 (NUEVO)

Ahora toda la aplicación tiene un gradiente colorido y vibrante que incluye:
- Morado (#667eea)
- Púrpura (#764ba2)
- Rosa (#f093fb)
- Coral (#f5576c)
- Amarillo (#ffd876)

**Resultado:** Vista más moderna, colorida y profesional en toda la app.

## 📊 Flujo de Datos

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │ Interacción
       ▼
┌─────────────────┐
│   Componente    │ ← useAppSelector (leer)
│    (React)      │ → useAppDispatch (escribir)
└────────┬────────┘
         │
         ▼
┌────────────────────┐
│   Redux Store      │
│  (Estado Global)   │
└─────────┬──────────┘
          │ Async Thunk
          ▼
┌──────────────────┐
│   Service Layer  │
└────────┬─────────┘
         │ HTTP Request
         ▼
┌──────────────────┐
│   Backend API    │
└──────────────────┘
```

## 🧪 Testing (Por implementar)

**Herramientas recomendadas:**
- Vitest - Testing unitario
- React Testing Library - Testing de componentes
- MSW - Mockear API calls

## 🔒 Seguridad

- ✅ Variables de entorno para configuración sensible
- ✅ Validación de formularios en cliente
- ✅ TypeScript para prevenir errores de tipo
- ✅ CORS configurado correctamente en backend

## 📈 Performance

**Optimizaciones aplicadas:**
- ✅ Lazy loading con React.lazy (por implementar)
- ✅ Memoización con useMemo/useCallback (donde necesario)
- ✅ Images optimizadas (Lorem Picsum con tamaños específicos)
- ✅ Code splitting por rutas

## 🎓 Buenas Prácticas Seguidas

1. ✅ **Separación de responsabilidades** - Components, Services, Store separados
2. ✅ **DRY (Don't Repeat Yourself)** - Sistema de tema reutilizable
3. ✅ **TypeScript** - Tipado fuerte en toda la aplicación
4. ✅ **Arquitectura escalable** - Fácil agregar nuevas features
5. ✅ **Estado predecible** - Redux Toolkit con slices
6. ✅ **Componentes funcionales** - Hooks modernos de React
7. ✅ **Diseño responsive** - Tailwind CSS con breakpoints
8. ✅ **Accesibilidad** - Semantic HTML y ARIA labels
9. ✅ **Performance** - Optimizaciones donde aplican
10. ✅ **Convenciones de naming** - Consistentes y claras

## 📚 Referencias

- [React 19 Docs](https://react.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
