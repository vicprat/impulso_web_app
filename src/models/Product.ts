const ARTWORK_METAFIELD_NAMESPACE = "art_details";

export type Money = {
  amount: string;
  currencyCode: string;
}

export type Image = {
  id?: string;
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

export type Variant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money; // Mantenemos el tipo Money interno
  compareAtPrice: Money | null;
  sku: string | null;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  inventoryQuantity: number | null;
  inventoryManagement: 'SHOPIFY' | 'NOT_MANAGED' | null;
  inventoryPolicy: 'DENY' | 'CONTINUE';
}

type ShopifyMetafieldNode = {
  namespace: string;
  key: string;
  value: string;
}

type ShopifyVariantNode = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: string; // La API devuelve string, no objeto Money
  sku: string | null;
  inventoryQuantity: number | null;
  inventoryPolicy: 'DENY' | 'CONTINUE';
  inventoryItem: {
    tracked: boolean;
  };
}

type ShopifyProductData = {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  tags: string[];
  images: {
    edges: { node: Image }[];
  };
  variants: {
    edges: { node: ShopifyVariantNode }[]; 
  };
  metafields: {
    edges: { node: ShopifyMetafieldNode }[];
  };
}

type ShopifyMetafieldInput = {
  namespace: string;
  key: string;
  value: string;
  type: string;
}

type ShopifyVariantInput = {
  id?: string;
  price: string;
  sku: string | null;
  inventoryItem?: { tracked: boolean };
  inventoryQuantities?: {
    availableQuantity: number;
    locationId: string;
  }[];
  inventoryPolicy?: 'DENY' | 'CONTINUE';
}

type ShopifyProductInput = {
  id?: string;
  title: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  variants: ShopifyVariantInput[];
  metafields?: ShopifyMetafieldInput[];
}

type ShopifyInputPayloads = {
  updatePayload: { input: ShopifyProductInput };
  createPayload: { input: Omit<ShopifyProductInput, 'id'> };
  metafieldsPayload: { productId: string; metafields: ShopifyMetafieldInput[] };
}

export type ArtworkDetails = {
  artist: string | null;
  medium: string | null; 
  year: string | null;
  height: string | null;
  width: string | null;
  depth: string | null;
  serie: string | null;
  location: string | null;
}

type DescriptionField = {
  key: keyof ArtworkDetails | 'vendor' | 'productType';
  label: string;
  formatter?: (product: Product) => string;
}

type FormatRule = {
  minSize: number;
  tag: string;
}

type TagRule = {
  condition: (product: Product) => boolean;
  getValue: (product: Product) => string | string[];
}

const DESCRIPTION_FIELDS: DescriptionField[] = [
  { key: 'vendor', label: 'Artista' },
  { key: 'medium', label: 'Técnica' },
  { key: 'productType', label: 'Tipo' },
  { 
    key: 'height', 
    label: 'Medidas (cm)', 
    formatter: (product: Product) => {
      return [product.artworkDetails.height, product.artworkDetails.width, product.artworkDetails.depth]
        .filter(Boolean)
        .join(' x ');
    }
  },
  { key: 'year', label: 'Año' },
  { key: 'location', label: 'Localización' }
];

const FORMAT_RULES: FormatRule[] = [
  { minSize: 150, tag: 'Formato Grande' },
  { minSize: 100, tag: 'Formato Mediano' },
  { minSize: 50, tag: 'Formato Pequeño' },
  { minSize: 0, tag: 'Formato Miniatura' }
];

const AUTO_TAG_RULES: TagRule[] = [
  {
    condition: (product) => !!product.vendor,
    getValue: (product) => product.vendor.trim()
  },
  {
    condition: (product) => !!product.productType,
    getValue: (product) => product.productType.trim()
  },
  {
    condition: (product) => !!product.artworkDetails.year,
    getValue: (product) => product.artworkDetails.year!.trim()
  },
  {
    condition: (product) => !!product.artworkDetails.location,
    getValue: (product) => {
      const locationHandle = product.artworkDetails.location!.trim().toLowerCase().replace(/\s+/g, '-');
      return `locacion-${locationHandle}`;
    }
  },
  {
    condition: (product) => product.status === "ACTIVE",
    getValue: () => 'Disponible'
  }
];

export class Product {
    id: string;
    handle: string;
    title: string;
    descriptionHtml: string;
    productType: string;
    vendor: string;
    status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
    images: Image[];
    variants: Variant[];
    tags: string[];
    manualTags: string[] = [];
    autoTags: string[] = [];
    artworkDetails: ArtworkDetails;
    private primaryLocationId: string;

    constructor(shopifyProductData: ShopifyProductData, primaryLocationId: string) {
        this.id = shopifyProductData.id;
        this.handle = shopifyProductData.handle;
        this.title = shopifyProductData.title;
        this.descriptionHtml = shopifyProductData.descriptionHtml || '';
        this.vendor = shopifyProductData.vendor;
        this.productType = shopifyProductData.productType;
        this.status = shopifyProductData.status;
        this.tags = shopifyProductData.tags || [];
        this.images = (shopifyProductData.images?.edges || []).map(edge => edge.node);
        
        this.variants = (shopifyProductData.variants?.edges || []).map(edge => this._convertVariantFromApi(edge.node));
        
        this.primaryLocationId = primaryLocationId;
        this.artworkDetails = this._parseDetailsFromMetafields(shopifyProductData.metafields?.edges || []);
        this._parseTags();
    }
    
    private _convertVariantFromApi(apiVariant: ShopifyVariantNode): Variant {
        return {
            id: apiVariant.id,
            title: apiVariant.title,
            availableForSale: apiVariant.availableForSale,
            price: {
                amount: apiVariant.price,
                currencyCode: 'MXN' // Asumiendo MXN, puedes hacerlo configurable
            },
            compareAtPrice: null,
            sku: apiVariant.sku,
            selectedOptions: [],
            inventoryQuantity: apiVariant.inventoryQuantity,
            inventoryManagement: apiVariant.inventoryItem?.tracked ? 'SHOPIFY' : 'NOT_MANAGED',
            inventoryPolicy: apiVariant.inventoryPolicy
        };
    }
    
    private _parseDetailsFromMetafields(metafieldEdges: { node: ShopifyMetafieldNode }[]): ArtworkDetails {
        const details: Partial<ArtworkDetails> = { artist: this.vendor };
        for (const { node } of metafieldEdges) {
            if (node.namespace === ARTWORK_METAFIELD_NAMESPACE && node.key in details) {
                (details as Record<string, string | null>)[node.key] = node.value;
            }
        }
        return details as ArtworkDetails;
    }

    private _parseTags(): void {
        if (!this.tags || this.tags.length === 0) return;
        const artists = this.vendor ? [this.vendor] : [];
        const types = this.productType ? [this.productType] : [];
        this.autoTags = this.tags.filter(tag => isAutoTag(tag, artists, types));
        this.manualTags = this.tags.filter(tag => !isAutoTag(tag, artists, types));
    }

    private _generateDescription(): string {
        const mainDescription = (this.descriptionHtml || '').split('<ul>')[0].trim().replace(/<p>|<\/p>/g, '');
        const parts: string[] = [];
        
        if (mainDescription) {
            parts.push(`<p>${mainDescription}</p>`);
        }
        
        const detailsList = DESCRIPTION_FIELDS
            .map(field => {
                const value = field.key === 'vendor' ? this.vendor 
                           : field.key === 'productType' ? this.productType
                           : this.artworkDetails[field.key as keyof ArtworkDetails];
                
                if (!value) return null;
                
                const displayValue = field.formatter ? field.formatter(this) : value;
                return displayValue ? `<li><strong>${field.label}:</strong> ${displayValue}</li>` : null;
            })
            .filter(Boolean);

        if (detailsList.length > 0) {
            parts.push(`<ul>${detailsList.join('')}</ul>`);
        }

        return parts.join('\n\n');
    }

    private _generateAutoTags(): Set<string> {
        const autoTags = new Set<string>();
        
        AUTO_TAG_RULES.forEach(rule => {
            if (rule.condition(this)) {
                const values = rule.getValue(this);
                const tags = Array.isArray(values) ? values : [values];
                tags.forEach(tag => autoTags.add(tag));
            }
        });

        const formatTag = this._getFormatTag();
        if (formatTag) autoTags.add(formatTag);

        const materialTags = this._getMaterialTags();
        materialTags.forEach(tag => autoTags.add(tag));

        return autoTags;
    }

    private _getFormatTag(): string | null {
        const height = parseFloat(this.artworkDetails.height || '0');
        const width = parseFloat(this.artworkDetails.width || '0');
        
        if (height === 0 && width === 0) return null;
        
        const maxDimension = Math.max(height, width);
        const rule = FORMAT_RULES.find(rule => maxDimension >= rule.minSize);
        return rule?.tag || null;
    }

    private _getMaterialTags(): string[] {
        const fullText = normalizeString(`${this.artworkDetails.medium || ''} ${this.productType || ''}`);
        return Object.entries(materialKeywords)
            .filter(([keyword]) => fullText.includes(keyword))
            .map(([, tag]) => tag);
    }

    public get primaryImage(): Image | null {
        return this.images.length > 0 ? this.images[0] : null;
    }

    public get primaryVariant(): Variant | null {
        return this.variants.length > 0 ? this.variants[0] : null;
    }

    public get formattedPrice(): string {
        const variant = this.primaryVariant;
        if (!variant) return 'Sin precio';
        return `$${parseFloat(variant.price.amount).toLocaleString('es-MX')} ${variant.price.currencyCode}`;
    }

    public get isAvailable(): boolean {
        const variant = this.primaryVariant;
        return variant ? variant.availableForSale && (variant.inventoryQuantity || 0) > 0 : false;
    }

    public get statusLabel(): string {
        const statusLabels = {
            'ACTIVE': 'Activo',
            'DRAFT': 'Borrador', 
            'ARCHIVED': 'Archivado'
        };
        return statusLabels[this.status] || this.status;
    }

    public update(
        updates: {
            title?: string;
            productType?: string;
            inventoryQuantity?: number;
            price?: string;
            details?: Partial<ArtworkDetails>;
            manualTags?: string[];
            status?: 'ACTIVE' | 'DRAFT';
            description?: string;
        }
    ): void {
        const propertyUpdaters = {
            title: () => { if (updates.title) this.title = updates.title; },
            productType: () => { if (updates.productType) this.productType = updates.productType; },
            status: () => { if (updates.status) this.status = updates.status; },
            details: () => { if (updates.details) this.artworkDetails = { ...this.artworkDetails, ...updates.details }; },
            manualTags: () => { if (updates.manualTags) this.manualTags = updates.manualTags; },
            description: () => {
                if (updates.description) {
                    const currentList = (this.descriptionHtml || '').split('<ul>')[1] || '';
                    this.descriptionHtml = `<p>${updates.description}</p>${currentList ? `\n\n<ul>${currentList}` : ''}`;
                }
            }
        };

        Object.keys(propertyUpdaters).forEach(key => {
            if (updates[key as keyof typeof updates] !== undefined) {
                propertyUpdaters[key as keyof typeof propertyUpdaters]();
            }
        });

        if (this.variants[0]) {
            if (updates.price) this.variants[0].price.amount = updates.price;
            if (updates.inventoryQuantity !== undefined) this.variants[0].inventoryQuantity = updates.inventoryQuantity;
        }

        const newAutoTags = this._generateAutoTags();
        this.autoTags = Array.from(newAutoTags);
        this.tags = [...new Set([...this.manualTags, ...this.autoTags])];
        this.descriptionHtml = this._generateDescription();
    }

    public toShopifyInput(): ShopifyInputPayloads {
        const metafields = Object.entries(this.artworkDetails)
            .filter(([, value]) => value != null && value !== '')
            .map(([key, value]) => ({
                namespace: ARTWORK_METAFIELD_NAMESPACE,
                key: key,
                value: String(value),
                type: 'single_line_text_field'
            }));

        const variantsInput: ShopifyVariantInput[] = this.variants.map(variant => ({
            id: variant.id,
            price: variant.price.amount,
            sku: variant.sku,
            inventoryItem: { tracked: true },
            inventoryQuantities: [{
                availableQuantity: variant.inventoryQuantity || 0,
                locationId: this.primaryLocationId,
            }],
            inventoryPolicy: variant.inventoryPolicy || 'DENY',
        }));

        const input: ShopifyProductInput = {
            id: this.id,
            title: this.title,
            descriptionHtml: this.descriptionHtml,
            vendor: this.vendor,
            productType: this.productType,
            tags: this.tags,
            status: this.status,
            variants: variantsInput,
        };
        
        const createInput = { ...input };
        delete createInput.id;
        createInput.variants = createInput.variants.map((v) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...rest } = v; 
            return rest;
        });

        return {
            updatePayload: { input },
            createPayload: { input: createInput },
            metafieldsPayload: {
                productId: this.id,
                metafields: metafields
            }
        };
    }
}

function normalizeString(str: string | null | undefined): string {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

const structuralTagPatterns = [/^locacion-/, /^Formato (Grande|Mediano|Pequeño|Miniatura)$/, /^Disponible$/, /^\d{4}$/];
const materialKeywords: Record<string, string> = { 
    'oleo': 'Óleo', 'acrilico': 'Acrílico', 'mixta': 'Técnica Mixta', 'collage': 'Collage', 
    'tela': 'Tela', 'canvas': 'Tela', 'lienzo': 'Tela', 'papel': 'Papel', 'madera': 'Madera', 
    'metal': 'Metal', 'bronce': 'Bronce', 'grabado': 'Grabado', 'fotografia': 'Fotografía'
};

function isAutoTag(tag: string, artists: string[], types: string[]): boolean {
  const trimmedTag = tag.trim();
  const normalizedTag = normalizeString(trimmedTag);
  const materialTags = Object.values(materialKeywords).map(normalizeString);
  const valueBasedTagSet = new Set([...artists.map(normalizeString), ...types.map(normalizeString), ...materialTags]);

  if (valueBasedTagSet.has(normalizedTag)) return true;
  if (structuralTagPatterns.some(pattern => pattern.test(trimmedTag))) return true;

  return false;
}