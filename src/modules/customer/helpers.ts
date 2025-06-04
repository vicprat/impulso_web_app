import { Order, RawOrder, RawOrderLineItem, OrderLineItem } from "./types";

/**
 * Transform raw order line item data from GraphQL to a clean format
 */
export const transformOrderLineItem = (rawLineItem: RawOrderLineItem): OrderLineItem => {
  return {
    title: rawLineItem.title,
    quantity: rawLineItem.quantity,
    variant: rawLineItem.variant ? {
      id: rawLineItem.variant.id,
      title: rawLineItem.variant.title,
      image: rawLineItem.variant.image ? {
        url: rawLineItem.variant.image.url,
        altText: rawLineItem.variant.image.altText,
      } : undefined,
      price: rawLineItem.variant.price,
    } : undefined,
  };
};

/**
 * Transform raw order data from GraphQL to a clean format
 */
export const transformOrderData = (rawOrder: RawOrder): Order => {
  return {
    id: rawOrder.id,
    name: rawOrder.name,
    processedAt: rawOrder.processedAt,
    fulfillmentStatus: rawOrder.fulfillmentStatus,
    financialStatus: rawOrder.financialStatus,
    currentTotalPrice: rawOrder.currentTotalPrice,
    lineItems: rawOrder.lineItems.edges.map(edge => transformOrderLineItem(edge.node)),
    shippingAddress: rawOrder.shippingAddress || undefined,
  };
};

/**
 * Format currency amount for display
 */
export const formatCurrency = (amount: string, currencyCode: string): string => {
  const numericAmount = parseFloat(amount);
  
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(numericAmount);
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Get display status for order fulfillment
 */
export const getFulfillmentStatusDisplay = (status: string): string => {
  const statusMap: Record<string, string> = {
    'FULFILLED': 'Entregado',
    'UNFULFILLED': 'Pendiente',
    'PARTIALLY_FULFILLED': 'Parcialmente entregado',
    'RESTOCKED': 'Restock',
  };
  
  return statusMap[status] || status;
};

/**
 * Get display status for order payment
 */
export const getFinancialStatusDisplay = (status: string): string => {
  const statusMap: Record<string, string> = {
    'PENDING': 'Pendiente',
    'AUTHORIZED': 'Autorizado',
    'PARTIALLY_PAID': 'Parcialmente pagado',
    'PAID': 'Pagado',
    'PARTIALLY_REFUNDED': 'Parcialmente reembolsado',
    'REFUNDED': 'Reembolsado',
    'VOIDED': 'Anulado',
  };
  
  return statusMap[status] || status;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (basic validation)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Format full name from first and last name
 */
export const formatFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};

/**
 * Format address for display
 */
export const formatAddress = (address: {
  address1: string;
  address2?: string;
  city: string;
  province: string;
  zip: string;
  country: string;
}): string => {
  const parts = [
    address.address1,
    address.address2,
    address.city,
    address.province,
    address.zip,
    address.country,
  ].filter(Boolean);
  
  return parts.join(', ');
};

/**
 * Get order status color for UI
 */
export const getOrderStatusColor = (fulfillmentStatus: string, financialStatus: string): string => {
  if (fulfillmentStatus === 'FULFILLED' && financialStatus === 'PAID') {
    return 'green';
  }
  
  if (fulfillmentStatus === 'UNFULFILLED' || financialStatus === 'PENDING') {
    return 'yellow';
  }
  
  if (financialStatus === 'REFUNDED' || financialStatus === 'VOIDED') {
    return 'red';
  }
  
  return 'blue';
};

/**
 * Calculate total items in order
 */
export const calculateOrderItemsTotal = (lineItems: OrderLineItem[]): number => {
  return lineItems.reduce((total, item) => total + item.quantity, 0);
};