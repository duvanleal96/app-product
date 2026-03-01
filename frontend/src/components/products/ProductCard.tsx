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
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="aspect-w-16 aspect-h-9 mb-4">
        <img
          src={product.imageUrl || 'https://via.placeholder.com/400x300'}
          alt={product.name}
          className="w-full h-48 object-cover rounded-lg"
        />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-blue-600">
            {formatPrice(product.price)}
          </span>
          {product.stock > 0 ? (
            <span className="badge badge-success">
              {product.stock} disponibles
            </span>
          ) : (
            <span className="badge badge-danger">Sin stock</span>
          )}
        </div>
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
