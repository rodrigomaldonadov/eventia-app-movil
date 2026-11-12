import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartItem, CheckoutOrderPayload } from '@/types/cart.types';
import type { EventItem, TicketType } from '@/types/event.types';

interface CartContextType {
  items: CartItem[];
  totalTickets: number;
  subtotal: number;
  igv: number;
  total: number;
  addTicket: (event: EventItem, ticket: TicketType, quantity: number) => void;
  addEventSelection: (event: EventItem, quantities: Record<string, number>) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  generateOrderPayload: () => CheckoutOrderPayload;
}

const STORAGE_KEY = '@eventia_cart_v1';

let memoryCart: CartItem[] = [];

const CartContext = createContext<CartContextType>({
  items: [],
  totalTickets: 0,
  subtotal: 0,
  igv: 0,
  total: 0,
  addTicket: () => {},
  addEventSelection: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
  generateOrderPayload: () => ({
    orderId: '',
    items: [],
    subtotal: 0,
    igv: 0,
    total: 0,
    createdAt: '',
  }),
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Carga inicial del carrito
  useEffect(() => {
    const loadCart = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setItems(parsed);
            memoryCart = parsed;
          }
        } else if (memoryCart.length > 0) {
          setItems(memoryCart);
        }
      } catch {
        // ignore
      }
    };
    loadCart();
  }, []);

  // Guarda en almacenamiento cada vez que cambia el carrito
  const saveCart = async (newItems: CartItem[]) => {
    setItems(newItems);
    memoryCart = newItems;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    } catch {
      // ignore
    }
  };

  // Agrega una entrada específica
  const addTicket = (event: EventItem, ticket: TicketType, quantity: number) => {
    if (quantity <= 0) return;
    const ticketIdStr = String(ticket.id);
    const itemId = `${event.id}_${ticketIdStr}`;
    const maxAvail = ticket.available ?? ticket.availableCapacity ?? ticket.totalCapacity ?? ticket.total ?? 100;
    const existingIndex = items.findIndex((i) => i.id === itemId);

    if (existingIndex >= 0) {
      const updated = [...items];
      const existing = updated[existingIndex];
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, maxAvail);
        updated[existingIndex] = { ...existing, quantity: nextQty };
        saveCart(updated);
      }
    } else {
      const newItem: CartItem = {
        id: itemId,
        eventId: String(event.id),
        eventTitle: event.title,
        eventDate: event.date,
        eventVenue: event.venue || (event as any).location || 'Lugar por confirmar',
        imageUrl: event.imageUrl || event.bannerUrl,
        ticketId: ticketIdStr,
        ticketName: ticket.name,
        price: ticket.price,
        quantity: Math.min(quantity, maxAvail),
        available: maxAvail,
      };
      saveCart([...items, newItem]);
    }
  };

  // Agrega múltiples entradas seleccionadas en una pantalla de evento
  const addEventSelection = (event: EventItem, quantities: Record<string, number>) => {
    const updated = [...items];

    for (const [ticketId, qty] of Object.entries(quantities)) {
      if (qty <= 0) continue;
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
      const existingIndex = updated.findIndex((i) => i.id === itemId);

      if (existingIndex >= 0) {
        const existing = updated[existingIndex];
        if (existing) {
          const nextQty = Math.min(existing.quantity + qty, maxAvail);
          updated[existingIndex] = { ...existing, quantity: nextQty };
        }
      } else {
        updated.push({
          id: itemId,
          eventId: String(event.id),
          eventTitle: event.title,
          eventDate: event.date,
          eventVenue: event.venue || (event as any).location || 'Lugar por confirmar',
          imageUrl: event.imageUrl || event.bannerUrl,
          ticketId: ticketIdStr,
          ticketName: ticket.name,
          price: ticket.price,
          quantity: Math.min(qty, maxAvail),
          available: maxAvail,
        });
      }
    }

    saveCart(updated);
  };

  // Modifica la cantidad de una entrada en el carrito
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    const updated = items.map((item) => {
      if (item.id === itemId) {
        const maxAvail = item.available || 999;
        const validQuantity = Math.min(newQuantity, maxAvail);
        return { ...item, quantity: validQuantity };
      }
      return item;
    });

    saveCart(updated);
  };

  // Elimina una entrada del carrito
  const removeItem = (itemId: string) => {
    const filtered = items.filter((item) => item.id !== itemId);
    saveCart(filtered);
  };

  // Vacía todo el carrito
  const clearCart = () => {
    saveCart([]);
  };

  // Cálculos de subtotales, IGV y total
  const totalTickets = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const igv = Math.round(subtotal * 0.18 * 100) / 100; // IGV 18%
  const total = Math.round((subtotal + igv) * 100) / 100;

  // Genera el payload de la orden con el desglose de items y totales
  const generateOrderPayload = (): CheckoutOrderPayload => {
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    return {
      orderId,
      items,
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
        addTicket,
        addEventSelection,
        updateQuantity,
        removeItem,
        clearCart,
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
