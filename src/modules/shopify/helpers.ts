import {
  type Collection,
  type Edge,
  type Product,
  type RawCollection,
  type RawProduct,
} from './types'

export const transformProductData = (rawProduct: RawProduct): Product => {
  return {
    availableForSale: rawProduct.availableForSale,
    createdAt: rawProduct.createdAt,
    description: rawProduct.description,
    descriptionHtml: rawProduct.descriptionHtml,
    handle: rawProduct.handle,
    id: rawProduct.id,
    images: rawProduct.images?.edges.map((edge) => edge.node) ?? [],
    priceRange: rawProduct.priceRange,
    productType: rawProduct.productType,
    title: rawProduct.title,
    variants: rawProduct.variants?.edges.map((edge) => edge.node) ?? [],
    vendor: rawProduct.vendor,
  }
}

export const transformCollectionData = (rawCollection: RawCollection): Collection => {
  return {
    description: rawCollection.description,
    descriptionHtml: rawCollection.descriptionHtml,
    handle: rawCollection.handle,
    id: rawCollection.id,
    image: rawCollection.image,
    products:
      rawCollection.products?.edges.map((edge: Edge<RawProduct>) =>
        transformProductData(edge.node)
      ) ?? [],
    title: rawCollection.title,
  }
}
