import { NextResponse } from 'next/server';
import { api } from '@/modules/shopify/api';
import { EnrichedFilterOptions, FilterValue, Product } from '@/modules/shopify/types';

const categorizeTag = (tag: string): { category: keyof EnrichedFilterOptions, label: string } => {
  const trimmedTag = tag.trim();

  if (trimmedTag.startsWith('locacion-')) {
    const label = trimmedTag.replace('locacion-', '').replace(/-/g, ' ');
    return { category: 'locations', label: label.charAt(0).toUpperCase() + label.slice(1) };
  }

  if (/^Formato (Grande|Mediano|Pequeño|Miniatura)$/.test(trimmedTag)) {
    return { category: 'formats', label: trimmedTag };
  }
  if (/^\d{4}$/.test(trimmedTag)) {
    return { category: 'years', label: trimmedTag };
  }

  const materialKeywords: Record<string, string> = { 
    'Óleo': 'techniques', 'Acrílico': 'techniques', 'Técnica Mixta': 'techniques', 
    'Collage': 'techniques', 'Tela': 'techniques', 'Papel': 'techniques', 
    'Madera': 'techniques', 'Metal': 'techniques', 'Bronce': 'techniques', 
    'Grabado': 'techniques', 'Fotografía': 'techniques', 'Tinta': 'techniques', 
    'Acuarela': 'techniques', 'Carboncillo': 'techniques', 'Grafito': 'techniques',
    'Lápiz': 'techniques', 'Pastel': 'techniques', 'Piedra': 'techniques', 'Litografía': 'techniques'
  };
  if (materialKeywords[trimmedTag]) {
    return { category: materialKeywords[trimmedTag] as keyof EnrichedFilterOptions, label: trimmedTag };
  }
  
  return { category: 'otherTags', label: trimmedTag };
};


export async function GET() {
  try {
    const shopifyResponse = await api.getProducts({ first: 250 });
    const products = shopifyResponse.data.products;

    const allTags = new Set<string>();
    const allVendors = new Set<string>();
    const allProductTypes = new Set<string>();
    let minPrice = Infinity;
    let maxPrice = 0;

    products.forEach((product: Product) => {
      product.tags?.forEach(tag => allTags.add(tag));
      if (product.vendor) allVendors.add(product.vendor);
      if (product.productType) allProductTypes.add(product.productType);
      const price = parseFloat(product.priceRange.minVariantPrice.amount);
      if (price < minPrice) minPrice = price;
      if (price > maxPrice) maxPrice = price;
    });

    const structuredFilters: EnrichedFilterOptions = {
      artists: [...allVendors].map(v => ({ input: v, label: v, count: 0 })),
      productTypes: [...allProductTypes].map(pt => ({ input: pt, label: pt, count: 0 })),
      price: {
        min: Math.floor(minPrice === Infinity ? 0 : minPrice),
        max: Math.ceil(maxPrice === 0 ? 10000 : maxPrice),
      },
      techniques: [],
      formats: [],
      locations: [],
      years: [],
      series: [],
      otherTags: [],
    };
    
    allTags.forEach((tag) => {
      const { category, label } = categorizeTag(tag);
      const categoryArray = structuredFilters[category] as FilterValue[];
      if (!categoryArray.some(item => item.input === tag)) {
        categoryArray.push({ input: tag, label: label, count: 0 });
      }
    });

    return NextResponse.json(structuredFilters);
  } catch (error) {
    console.error('Error in /api/filters route:', error);
    return NextResponse.json(
      { message: 'Error al construir los filtros.', error: (error as Error).message },
      { status: 500 }
    );
  }
}