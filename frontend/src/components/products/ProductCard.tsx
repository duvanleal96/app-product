import { applyGradient } from '../../theme/colors';
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
    <div className="group relative rounded-3xl shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-300 overflow-hidden border-4 border-white/50 transform hover:scale-105 hover:-rotate-1" style={applyGradient('card')}>
      {/* Badge de categoría */}
      <div className="absolute top-4 left-4 z-10">
        <span className="inline-block px-4 py-2 text-sm font-black text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-2xl uppercase tracking-wide">
          {product.category}
        </span>
      </div>

      {/* Imagen del producto */}
      <div className="relative aspect-w-16 aspect-h-9 bg-gray-100 overflow-hidden">
        <img
          src={product.imageUrl || 'https://via.placeholder.com/400x300'}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
          {product.name}
        </h3>
        <p className="text-base text-gray-700 mb-5 line-clamp-2 leading-relaxed font-medium">
          {product.description}
        </p>
        
        {/* Precio y stock */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
          <div>
            <p className="text-xs text-gray-600 mb-1 font-bold uppercase">Precio</p>
            <span className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {formatPrice(product.price)}
            </span>
          </div>
          {product.stock > 0 ? (
            <div className="text-right">
              <p className="text-xs text-gray-600 mb-1 font-bold uppercase">Stock</p>
              <span className="inline-flex items-center gap-1 px-4 py-2 text-base font-black text-green-700 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full border-2 border-green-400 shadow-lg">
                <span className="text-lg">✅</span>
                {product.stock}
              </span>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 px-4 py-2 text-base font-black text-red-700 bg-gradient-to-r from-red-100 to-pink-100 rounded-full border-2 border-red-400 shadow-lg">
              <span className="text-lg">❌</span>
              AGOTADO
            </span>
          )}
        </div>

        {/* Botón de acción */}
        <button
          onClick={() => onSelect(product)}
          disabled={product.stock === 0}
          className="btn btn-primary w-full"
        >
          {product.stock > 0 ? (
            <span className="flex items-center justify-center gap-2">
              <span>👁️</span>
              Ver detalles
            </span>
          ) : (
            'Sin stock'
          )}
        </button>
      </div>
    </div>
  );
};
