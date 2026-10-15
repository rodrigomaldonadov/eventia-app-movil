export type DocumentType = 'DNI' | 'CE' | 'Pasaporte';

export interface BuyerInfo {
  fullName: string;
  email: string;
  documentType: DocumentType;
  documentNumber: string;
  phone?: string;
}

export type PaymentMethodId = 'wallet' | 'card' | 'paypal';

export interface CardDetails {
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardHolder: string;
}

export type CheckoutStep = 1 | 2 | 3;

export interface CheckoutSummaryData {
  subtotal: number;
  serviceFee: number;
  igv: number;
  total: number;
  totalTickets: number;
}
