import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eventService } from '@/services/eventService';
import type { CartItem, CheckoutOrderPayload } from '@/types/cart.types';
import type { EventDetailDto, TicketTypeDto } from '@/types/event.types';

interface StockCheckOutcome {
  valid: boolean;
  message?: string;
}

interface CartContextType {
  items: CartItem[];
  totalTickets: number;
  subtotal: number;
  igv: number;
  total: number;
  isValidatingStock: boolean;
  addTicket: (event: EventDetailDto, ticket: TicketTypeDto, quantity: number) => void;
  addEventSelection: (
    event: EventDetailDto,
    ticketTypes: TicketTypeDto[],
    quantities: Record<number, number>,
  ) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  validateCartStock: () => Promise<StockCheckOutcome>;
  generateOrderPayload: () => CheckoutOrderPayload;
}

const STORAGE_KEY = '@eventia_cart_v2';

let memoryCart: CartItem[] = [];

const CartContext = createContext<CartContextType>({
  items: [],
  totalTickets: 0,
  subtotal: 0,
  igv: 0,
  total: 0,
  isValidatingStock: false,
  addTicket: () => {},
  addEventSelection: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
  validateCartStock: async () => ({ valid: true }),
  generateOrderPayload: () => ({
    orderId: '',
    items: [],
    orderItems: [],
    subtotal: 0,
    igv: 0,
    total: 0,
    createdAt: '',
  }),
});

// Verifica que el item recuperado de AsyncStorage tenga IDs numéricos válidos
function isValidCartItem(item: unknown): item is CartItem {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Record<string, unknown>;
  const eventIdNum = Number(candidate.eventId);
  const ticketIdNum = Number(candidate.ticketTypeId ?? candidate.ticketId);
  return (
    typeof candidate.id === 'string' &&
    Number.isInteger(eventIdNum) &&
    eventIdNum > 0 &&
    Number.isInteger(ticketIdNum) &&
    ticketIdNum > 0 &&
    typeof candidate.quantity === 'number' &&
    candidate.quantity > 0
  );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isValidatingStock, setIsValidatingStock] = useState(false);

  // Carga el carrito guardado en AsyncStorage al iniciar la app
  useEffect(() => {
    const loadCart = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const validItems = parsed.filter(isValidCartItem);
            setItems(validItems);
            memoryCart = validItems;
          }
        } else if (memoryCart.length > 0) {
          setItems(memoryCart);
        }
      } catch {
        // Ignorar si falla la lectura inicial
      }
    };
    loadCart();
  }, []);

  // Guarda la lista actualizada del carrito en memoria y AsyncStorage
  const saveCart = useCallback(async (newItems: CartItem[]) => {
    setItems(newItems);
    memoryCart = newItems;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch {
      // Ignorar si falla la escritura local
    }
  }, []);

<<<<<<< HEAD
  // Agrega un tipo de entrada individual respetando el stock y máximo por compra
  const addTicket = (event: EventDetailDto, ticket: TicketTypeDto, quantity: number) => {
    if (quantity <= 0 || ticket.availableCapacity <= 0) return;

    const maxAllowed = Math.min(ticket.availableCapacity, ticket.maxPerPurchase ?? 10);
    const itemId = `${event.id}_${ticket.id}`;
=======
  // Agrega una entrada específica
  const addTicket = (event: EventItem, ticket: TicketType, quantity: number) => {
    if (quantity <= 0) return;
    const ticketIdStr = String(ticket.id);
    const itemId = `${event.id}_${ticketIdStr}`;
    const maxAvail = ticket.available ?? ticket.availableCapacity ?? ticket.totalCapacity ?? ticket.total ?? 100;
>>>>>>> origin/feat/implGeneral
    const existingIndex = items.findIndex((i) => i.id === itemId);

    if (existingIndex >= 0) {
      const updated = [...items];
      const existing = updated[existingIndex];
      if (existing) {
<<<<<<< HEAD
        const nextQty = Math.min(existing.quantity + quantity, maxAllowed);
        updated[existingIndex] = {
          ...existing,
          price: ticket.price,
          quantity: nextQty,
          availableCapacity: ticket.availableCapacity,
          available: ticket.availableCapacity,
          maxPerPurchase: ticket.maxPerPurchase ?? 10,
        };
=======
        const nextQty = Math.min(existing.quantity + quantity, maxAvail);
        updated[existingIndex] = { ...existing, quantity: nextQty };
>>>>>>> origin/feat/implGeneral
        saveCart(updated);
      }
    } else {
      const newItem: CartItem = {
        id: itemId,
        eventId: String(event.id),
        eventTitle: event.title,
        eventDate: event.date,
<<<<<<< HEAD
        eventLocation: event.location,
        eventVenue: event.location,
        bannerUrl: event.bannerUrl,
        imageUrl: event.bannerUrl ?? undefined,
        ticketTypeId: ticket.id,
        ticketId: String(ticket.id),
=======
        eventVenue: event.venue || (event as any).location || 'Lugar por confirmar',
        imageUrl: event.imageUrl || event.bannerUrl,
        ticketId: ticketIdStr,
>>>>>>> origin/feat/implGeneral
        ticketName: ticket.name,
        zone: ticket.zone,
        price: ticket.price,
<<<<<<< HEAD
        quantity: Math.min(quantity, maxAllowed),
        availableCapacity: ticket.availableCapacity,
        available: ticket.availableCapacity,
        maxPerPurchase: ticket.maxPerPurchase ?? 10,
=======
        quantity: Math.min(quantity, maxAvail),
        available: maxAvail,
>>>>>>> origin/feat/implGeneral
      };
      saveCart([...items, newItem]);
    }
  };

  // Agrega las entradas seleccionadas desde la vista de detalle del evento
  const addEventSelection = (
    event: EventDetailDto,
    ticketTypes: TicketTypeDto[],
    quantities: Record<number, number>,
  ) => {
    const updated = [...items];

    for (const [rawTicketId, qty] of Object.entries(quantities)) {
      if (qty <= 0) continue;
<<<<<<< HEAD
      const ticketTypeId = Number(rawTicketId);
      const ticket = ticketTypes.find((t) => t.id === ticketTypeId);
      if (!ticket || ticket.availableCapacity <= 0) continue;

      const maxAllowed = Math.min(ticket.availableCapacity, ticket.maxPerPurchase ?? 10);
      const itemId = `${event.id}_${ticket.id}`;
=======
      const ticket = event.tickets.find(
        (t) =>
          String(t.id) === String(ticketId) ||
          (t.tier && String(t.tier).toLowerCase() === String(ticketId).toLowerCase()) ||
          (t.name && String(t.name).toLowerCase() === String(ticketId).toLowerCase())
      );
      if (!ticket) continue;

      const ticketIdStr = String(ticket.id);
      const itemId = `${event.id}_${ticketIdStr}`;
      const maxAvail = ticket.available ?? ticket.availableCapacity ?? ticket.totalCapacity ?? ticket.total ?? 100;
>>>>>>> origin/feat/implGeneral
      const existingIndex = updated.findIndex((i) => i.id === itemId);

      if (existingIndex >= 0) {
        const existing = updated[existingIndex];
        if (existing) {
<<<<<<< HEAD
          const nextQty = Math.min(existing.quantity + qty, maxAllowed);
          updated[existingIndex] = {
            ...existing,
            eventTitle: event.title,
            eventDate: event.date,
            eventLocation: event.location,
            eventVenue: event.location,
            bannerUrl: event.bannerUrl,
            imageUrl: event.bannerUrl ?? undefined,
            ticketName: ticket.name,
            zone: ticket.zone,
            price: ticket.price,
            quantity: nextQty,
            availableCapacity: ticket.availableCapacity,
            available: ticket.availableCapacity,
            maxPerPurchase: ticket.maxPerPurchase ?? 10,
          };
=======
          const nextQty = Math.min(existing.quantity + qty, maxAvail);
          updated[existingIndex] = { ...existing, quantity: nextQty };
>>>>>>> origin/feat/implGeneral
        }
      } else {
        updated.push({
          id: itemId,
          eventId: String(event.id),
          eventTitle: event.title,
          eventDate: event.date,
<<<<<<< HEAD
          eventLocation: event.location,
          eventVenue: event.location,
          bannerUrl: event.bannerUrl,
          imageUrl: event.bannerUrl ?? undefined,
          ticketTypeId: ticket.id,
          ticketId: String(ticket.id),
=======
          eventVenue: event.venue || (event as any).location || 'Lugar por confirmar',
          imageUrl: event.imageUrl || event.bannerUrl,
          ticketId: ticketIdStr,
>>>>>>> origin/feat/implGeneral
          ticketName: ticket.name,
          zone: ticket.zone,
          price: ticket.price,
<<<<<<< HEAD
          quantity: Math.min(qty, maxAllowed),
          availableCapacity: ticket.availableCapacity,
          available: ticket.availableCapacity,
          maxPerPurchase: ticket.maxPerPurchase ?? 10,
=======
          quantity: Math.min(qty, maxAvail),
          available: maxAvail,
>>>>>>> origin/feat/implGeneral
        });
      }
    }

    saveCart(updated);
  };

  // Actualiza la cantidad de un item en el carrito sin superar el stock ni el límite por compra
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    const updated = items.map((item) => {
      if (item.id === itemId) {
<<<<<<< HEAD
        const stock = item.availableCapacity ?? item.available;
        const maxPerTicket = item.maxPerPurchase ?? 10;
        const validQuantity = Math.min(newQuantity, Math.max(1, Math.min(stock, maxPerTicket)));
=======
        const maxAvail = item.available || 999;
        const validQuantity = Math.min(newQuantity, maxAvail);
>>>>>>> origin/feat/implGeneral
        return { ...item, quantity: validQuantity };
      }
      return item;
    });

    saveCart(updated);
  };

  // Elimina un item del carrito
  const removeItem = (itemId: string) => {
    const filtered = items.filter((item) => item.id !== itemId);
    saveCart(filtered);
  };

  // Vacía el carrito completo
  const clearCart = () => {
    saveCart([]);
  };

  // Consulta el stock real en el backend para todos los eventos del carrito
  const validateCartStock = useCallback(async (): Promise<StockCheckOutcome> => {
    if (items.length === 0) {
      return { valid: false, message: 'Tu carrito está vacío.' };
    }

    setIsValidatingStock(true);
    try {
      const uniqueEventIds = Array.from(new Set(items.map((i) => Number(i.eventId))));
      const ticketsByEvent = new Map<number, TicketTypeDto[]>();

      await Promise.all(
        uniqueEventIds.map(async (eventId) => {
          const remoteTickets = await eventService.getTicketTypesByEvent(eventId);
          ticketsByEvent.set(eventId, remoteTickets);
        }),
      );

      let stockError: string | undefined;
      const syncedItems: CartItem[] = [];

      for (const item of items) {
        const numericEventId = Number(item.eventId);
        const numericTicketTypeId = Number(item.ticketTypeId ?? item.ticketId);
        const eventTickets = ticketsByEvent.get(numericEventId) ?? [];
        const liveTicket = eventTickets.find((t) => t.id === numericTicketTypeId);

        if (!liveTicket || liveTicket.status === 'paused') {
          stockError = `La entrada "${item.ticketName}" de "${item.eventTitle}" ya no está disponible.`;
          syncedItems.push({
            ...item,
            availableCapacity: 0,
            available: 0,
          });
          continue;
        }

        const liveAvailable = liveTicket.availableCapacity ?? 0;
        const liveMaxPerPurchase = liveTicket.maxPerPurchase ?? 10;

        if (liveAvailable <= 0) {
          stockError = `La entrada "${item.ticketName}" (${item.eventTitle}) se ha agotado.`;
        } else if (item.quantity > liveAvailable) {
          stockError = `Stock insuficiente para "${item.ticketName}": seleccionaste ${item.quantity}, pero solo quedan ${liveAvailable} disponibles.`;
        } else if (item.quantity > liveMaxPerPurchase) {
          stockError = `Solo se pueden comprar hasta ${liveMaxPerPurchase} entradas de "${item.ticketName}".`;
        }

        syncedItems.push({
          ...item,
          ticketName: liveTicket.name,
          zone: liveTicket.zone,
          price: liveTicket.price,
          availableCapacity: liveAvailable,
          available: liveAvailable,
          maxPerPurchase: liveMaxPerPurchase,
        });
      }

      const totalCartQty = syncedItems.reduce((sum, i) => sum + i.quantity, 0);
      if (!stockError && totalCartQty > 10) {
        stockError = 'Solo se pueden comprar hasta 10 entradas por compra.';
      }

      await saveCart(syncedItems);

      if (stockError) {
        return { valid: false, message: stockError };
      }

      return { valid: true };
    } catch {
      return {
        valid: false,
        message: 'No se pudo verificar el stock con el servidor.',
      };
    } finally {
      setIsValidatingStock(false);
    }
  }, [items, saveCart]);

  const totalTickets = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
  const igv = 0;
  const total = subtotal;

  // Genera el resumen de la orden listo para el módulo de compras
  const generateOrderPayload = (): CheckoutOrderPayload => {
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    return {
      orderId,
      items,
      orderItems: items.map((item) => ({
        ticketTypeId: Number(item.ticketTypeId ?? item.ticketId),
        quantity: item.quantity,
      })),
      subtotal,
      igv,
      total,
      createdAt: new Date().toISOString(),
    };
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalTickets,
        subtotal,
        igv,
        total,
        isValidatingStock,
        addTicket,
        addEventSelection,
        updateQuantity,
        removeItem,
        clearCart,
        validateCartStock,
        generateOrderPayload,
      }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

export default useCart;
