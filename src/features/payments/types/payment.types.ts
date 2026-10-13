export type PaymentGatewayType = 'mercado_pago' | 'card' | 'paypal' | 'wallet';

export type TransactionStatus = 'approved' | 'rejected' | 'pending' | 'processing';

export interface CardPaymentInfo {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  installments: number;
  brand?: 'visa' | 'mastercard' | 'amex' | 'generic';
}

export interface PayerInfo {
  fullName: string;
  email: string;
  documentType: string;
  documentNumber: string;
  phone?: string;
}

export interface PaymentTransactionRequest {
  orderId: string;
  amount: number;
  currency: 'PEN' | 'USD';
  gateway: PaymentGatewayType;
  payer: PayerInfo;
  card?: CardPaymentInfo;
  description: string;
}

export interface PaymentTransactionResponse {
  transactionId: string;
  orderId: string;
  status: TransactionStatus;
  statusDetail: string;
  gateway: PaymentGatewayType;
  amount: number;
  currency: 'PEN' | 'USD';
  authorizationCode?: string;
  createdAt: string;
  installments?: number;
  lastFourDigits?: string;
}

export interface InstallmentOption {
  installments: number;
  amountPerInstallment: number;
  totalAmount: number;
  hasInterest: boolean;
  interestText: string;
}
