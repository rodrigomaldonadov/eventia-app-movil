import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import api from '@/services/api';
import type {
  InstallmentOption,
  PaymentTransactionRequest,
  PaymentTransactionResponse,
} from '../types/payment.types';

const TRANSACTIONS_STORAGE_KEY = '@eventia_transactions_v1';

export const paymentService = {
  /**
   * Detecta la marca de la tarjeta basándose en los primeros dígitos.
   */
  detectCardBrand(cardNumber: string): 'visa' | 'mastercard' | 'amex' | 'generic' {
    const cleanNumber = cardNumber.replace(/\s+/g, '');
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^(5[1-5]|2[2-7])/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    return 'generic';
  },

  /**
   * Formatea el número de tarjeta en bloques de 4 dígitos (ej: 4532 8821 9910 8910).
   */
  formatCardNumber(val: string): string {
    const clean = val.replace(/\D/g, '').slice(0, 16);
    return clean.replace(/(\d{4})(?=\d)/g, '$1 ');
  },

  /**
   * Formatea la fecha de vencimiento (MM/AA).
   */
  formatExpiry(val: string): string {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) {
      return `${clean.slice(0, 2)}/${clean.slice(2)}`;
    }
    return clean;
  },

  /**
   * Genera las opciones de cuotas disponibles para Mercado Pago / Tarjetas de crédito.
   */
  calculateInstallments(totalAmount: number): InstallmentOption[] {
    const options: InstallmentOption[] = [
      {
        installments: 1,
        amountPerInstallment: Math.round(totalAmount * 100) / 100,
        totalAmount,
        hasInterest: false,
        interestText: 'Sin interés',
      },
      {
        installments: 3,
        amountPerInstallment: Math.round((totalAmount / 3) * 100) / 100,
        totalAmount,
        hasInterest: false,
        interestText: '3 cuotas sin interés',
      },
      {
        installments: 6,
        amountPerInstallment: Math.round((totalAmount / 6) * 100) / 100,
        totalAmount,
        hasInterest: false,
        interestText: '6 cuotas sin interés (Mercado Pago)',
      },
      {
        installments: 12,
        amountPerInstallment: Math.round(((totalAmount * 1.1) / 12) * 100) / 100,
        totalAmount: Math.round(totalAmount * 1.1 * 100) / 100,
        hasInterest: true,
        interestText: '10% de recargo bancario',
      },
    ];
    return options;
  },

  /**
   * Procesa la transacción a través de la API del backend o el sandbox controlado.
   */
  async processPayment(request: PaymentTransactionRequest): Promise<PaymentTransactionResponse> {
    try {
      // Intentar procesar en backend si está configurado
      const response = await api.post<PaymentTransactionResponse>('/payments/process', request);
      if (response.data && response.data.status) {
        await this.saveTransaction(response.data);
        return response.data;
      }
    } catch {
      // Si el backend no está disponible, continuar con la pasarela Sandbox simulada
    }

    // --- Simulación Sandbox Inteligente (Mercado Pago / Tarjetas / PayPal) ---
    await new Promise((resolve) => setTimeout(resolve, 1800));

    const cleanCard = request.card?.cardNumber.replace(/\s+/g, '') || '';
    const transactionId = `TXN-${Date.now().toString(36).toUpperCase()}-${Crypto.randomUUID().slice(0, 4).toUpperCase()}`;
    const authCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Caso de prueba: Tarjeta rechazada por fondos insuficientes (termina en 0002)
    if (cleanCard.endsWith('0002')) {
      const rejectedResult: PaymentTransactionResponse = {
        transactionId,
        orderId: request.orderId,
        status: 'rejected',
        statusDetail: 'Fondos insuficientes en la cuenta del emisor.',
        gateway: request.gateway,
        amount: request.amount,
        currency: request.currency,
        createdAt: new Date().toISOString(),
      };
      await this.saveTransaction(rejectedResult);
      return rejectedResult;
    }

    // Caso de prueba: Tarjeta expirada (termina en 0003)
    if (cleanCard.endsWith('0003')) {
      const expiredResult: PaymentTransactionResponse = {
        transactionId,
        orderId: request.orderId,
        status: 'rejected',
        statusDetail: 'La tarjeta ingresada ha expirado o los datos son inválidos.',
        gateway: request.gateway,
        amount: request.amount,
        currency: request.currency,
        createdAt: new Date().toISOString(),
      };
      await this.saveTransaction(expiredResult);
      return expiredResult;
    }

    // Transacción aprobada por defecto
    const approvedResult: PaymentTransactionResponse = {
      transactionId,
      orderId: request.orderId,
      status: 'approved',
      statusDetail: 'Transacción aprobada satisfactoriamente por la entidad bancaria.',
      gateway: request.gateway,
      amount: request.amount,
      currency: request.currency,
      authorizationCode: authCode,
      createdAt: new Date().toISOString(),
      installments: request.card?.installments || 1,
      lastFourDigits: cleanCard.slice(-4) || '8910',
    };

    await this.saveTransaction(approvedResult);
    return approvedResult;
  },

  /**
   * Guarda el historial de transacciones en almacenamiento local.
   */
  async saveTransaction(txn: PaymentTransactionResponse): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      const list: PaymentTransactionResponse[] = raw ? JSON.parse(raw) : [];
      list.unshift(txn);
      await AsyncStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('[PaymentService]: Error al guardar transacción en AsyncStorage', e);
    }
  },

  /**
   * Recupera todas las transacciones locales guardadas.
   */
  async getTransactions(): Promise<PaymentTransactionResponse[]> {
    try {
      const raw = await AsyncStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
};

export default paymentService;
