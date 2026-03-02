import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard = ({ product, onSelect }: ProductCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="group relative rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 transform hover:-translate-y-1 bg-white">
      {/* Badge de categoría */}
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-block px-3 py-1 text-xs font-medium text-gray-700 bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-gray-200">
          {product.category}
        </span>
      </div>

      {/* Imagen del producto */}
      <div className="relative aspect-w-16 aspect-h-9 bg-gray-50 overflow-hidden">
        <img
          src={product.imageUrl || 'https://via.placeholder.com/400x300'}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      </div>

      {/* Contenido */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        
        {/* Precio y stock */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <p className="text-xs text-gray-500 mb-0.5 font-medium">Precio</p>
            <span className="text-xl font-semibold text-gray-900">
              {formatPrice(product.price)}
            </span>
          </div>
          {product.stock > 0 ? (
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-0.5 font-medium">Stock</p>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-sm font-medium text-green-700 bg-green-50 rounded-md border border-green-200">
                ✓ {product.stock}
              </span>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-sm font-medium text-red-700 bg-red-50 rounded-md border border-red-200">
              ✕ AGOTADO
            </span>
          )}
        </div>

        {/* Botón de acción */}
        <button
          onClick={() => onSelect(product)}
          disabled={product.stock === 0}
          className="btn btn-primary w-full"
        >
          {product.stock > 0 ? 'Ver detalles' : 'Sin stock'}
        </button>
      </div>
    </div>
  );
};
