import { Product, Collection, RawProduct, RawCollection, Edge } from "./types";

export const transformProductData = (rawProduct: RawProduct): Product => {
  return {
    id: rawProduct.id,
    title: rawProduct.title,
    handle: rawProduct.handle,
    description: rawProduct.description,
    descriptionHtml: rawProduct.descriptionHtml,
    availableForSale: rawProduct.availableForSale,
    productType: rawProduct.productType,
    vendor: rawProduct.vendor,
    createdAt: rawProduct.createdAt,
    priceRange: rawProduct.priceRange,
    images: rawProduct.images?.edges?.map(edge => edge.node) ?? [],
    variants: rawProduct.variants?.edges?.map(edge => edge.node) ?? []
  };
};

export const transformCollectionData = (rawCollection: RawCollection): Collection => {
  return {
    id: rawCollection.id,
    title: rawCollection.title,
    handle: rawCollection.handle,
    description: rawCollection.description,
    descriptionHtml: rawCollection.descriptionHtml,
    image: rawCollection.image,
    products: rawCollection.products?.edges?.map((edge: Edge<RawProduct>) => 
      transformProductData(edge.node)
    ) ?? []
  };
};