/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { api } from '@/modules/shopify/api';
import { Card } from '@/components/Card.tsx';

async function getHomepageData() {
  try {
    const response = await api.getHomepageData();
    return response.data;
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return { collections: [], featuredProducts: [] };
  }
}

export default async function Page() {
  const { collections, featuredProducts } = await getHomepageData();

  return (
    <div className="min-h-screen">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Bienvenido a nuestra tienda</h1>
          <p className="text-xl mb-8">Descubre productos increíbles a precios excepcionales</p>
          <Link 
            href="/store" 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Explorar Tienda
          </Link>
          <Link href="/auth/login" className="sr-only">
        Iniciar sesión
      </Link>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Colecciones Destacadas</h2>
            <p className="text-gray-600">Explora nuestras colecciones más populares</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {collections.slice(0, 6).map((collection) => (
              <Link 
                key={collection.id} 
                href={`/store/collections/${collection.handle}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {collection.image && (
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={collection.image.url} 
                        alt={collection.image.altText || collection.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{collection.title}</h3>
                    <p className="text-gray-600 line-clamp-2">{collection.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link 
              href="/store/collections" 
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Ver todas las colecciones →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Productos Destacados</h2>
            <p className="text-gray-600">Los productos más populares y mejor valorados</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredProducts.map((product) => (
              <Card.Product key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center">
            <Link 
              href="/store" 
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Ver todos los productos →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿No encuentras lo que buscas?</h2>
          <p className="text-xl mb-8">Explora toda nuestra tienda con filtros avanzados</p>
          <Link 
            href="/store" 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Ir a la tienda completa
          </Link>
        </div>
      </section>
    </div>
  );
}