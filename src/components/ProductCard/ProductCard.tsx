import Link from "next/link";
import Image from "next/image";
import { Product } from "@/modules/shopify/types";

type Props = {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<Props> = ({ product, className = "" }) => {
  // Obtener la primera imagen o usar un placeholder
  const featuredImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : null;
  
  // Formatear el precio
  const formatPrice = (price: string, currencyCode: string) => {
    const numericPrice = parseFloat(price);
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: currencyCode,
    }).format(numericPrice);
  };

  // Verificar si el producto tiene descuento
  const hasDiscount = product.variants && product.variants.length > 0 && 
    product.variants[0].compareAtPrice && 
    parseFloat(product.variants[0].compareAtPrice.amount) > parseFloat(product.variants[0].price.amount);

  // Calcular el porcentaje de descuento si existe
  const discountPercentage = hasDiscount && product.variants[0].compareAtPrice 
    ? Math.round((1 - parseFloat(product.variants[0].price.amount) / parseFloat(product.variants[0].compareAtPrice.amount)) * 100) 
    : 0;

  return (
    <Link 
      href={`/products/${product.handle}`} 
      className={`group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md ${className}`}
    >
      <div className="relative pt-[100%]">
        {featuredImage ? (
          <Image
            src={featuredImage.url}
            alt={featuredImage.altText || product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <span className="text-gray-400">Sin imagen</span>
          </div>
        )}
        
        {/* Etiqueta de disponibilidad */}
        {!product.availableForSale && (
          <div className="absolute right-2 top-2 rounded-md bg-gray-700 px-2 py-1 text-xs font-medium text-white">
            Agotado
          </div>
        )}
        
        {/* Badge de descuento */}
        {hasDiscount && (
          <div className="absolute left-2 top-2 rounded-md bg-red-500 px-2 py-1 text-xs font-medium text-white">
            -{discountPercentage}%
          </div>
        )}
      </div>
      
      <div className="p-4">
        {/* Vendor / Marca */}
        {product.vendor && (
          <p className="mb-1 text-xs font-medium text-gray-500">{product.vendor}</p>
        )}
        
        {/* Título del producto */}
        <h3 className="mb-2 text-sm font-medium text-gray-900 line-clamp-2">{product.title}</h3>
        
        {/* Información de precio */}
        <div className="flex items-center justify-between">
          <div>
            {hasDiscount && product.variants[0].compareAtPrice ? (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {formatPrice(product.variants[0].price.amount, product.variants[0].price.currencyCode)}
                </span>
                <span className="text-xs text-gray-500 line-through">
                  {formatPrice(product.variants[0].compareAtPrice.amount, product.variants[0].compareAtPrice.currencyCode)}
                </span>
              </div>
            ) : (
              <span className="text-sm font-medium text-gray-900">
                {formatPrice(
                  product.priceRange.minVariantPrice.amount,
                  product.priceRange.minVariantPrice.currencyCode
                )}
              </span>
            )}
          </div>
          
          {/* Botón de compra rápida */}
          <button 
            className="rounded-full bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-primary hover:text-white"
            onClick={(e) => {
              e.preventDefault();
              // Aquí podrías implementar lógica para agregar al carrito directamente
              console.log(`Añadir al carrito: ${product.title}`);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
};
