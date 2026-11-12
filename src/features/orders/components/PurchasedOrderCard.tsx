import React, { useState } from 'react';
import {
  Alert,
  Image,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Eventia } from '@/constants/theme';
import { formatPricePEN } from '@/data/events';
import type { Order } from '../types/order.types';
import { TicketQrModal } from './TicketQrModal';

interface PurchasedOrderCardProps {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
}

export const PurchasedOrderCard: React.FC<PurchasedOrderCardProps> = ({
  order,
  isExpanded,
  onToggle,
}) => {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `¡Tengo mis entradas para ${order.eventTitle}! 🎉 Código de pase digital: ${order.orderNumber}. Eventia App.`,
        title: `Mi Entrada para ${order.eventTitle}`,
      });
    } catch {
      // Ignorar si cancela
    }
  };

  const handleDownload = () => {
    Alert.alert(
      'Comprobante Digital',
      `El comprobante y pase digital para la orden #${order.orderNumber} están listos y validados en el sistema.`,
      [{ text: 'Aceptar' }]
    );
  };

  // Formato de fecha para badge
  const parseDateBadge = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
        const m = parseInt(parts[1], 10) - 1;
        const d = parts[2];
        return { day: d, month: months[m] || 'NOV' };
      }
    } catch {
      // fallback
    }
    return { day: '20', month: 'NOV' };
  };

  const badge = parseDateBadge(order.eventDate);

  return (
    <View style={[styles.card, isExpanded && styles.cardExpanded]}>
      {/* CABECERA PRINCIPAL INTERACTIVA: Alterna expandir / contraer */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onToggle}
        style={styles.cardHeader}>
        {/* Badge de fecha */}
        <View style={styles.dateBadge}>
          <Text style={styles.dateMonth}>{badge.month}</Text>
          <Text style={styles.dateDay}>{badge.day}</Text>
        </View>

        {/* Información central del evento */}
        <View style={styles.headerInfo}>
          <View style={styles.titleStatusRow}>
            <Text style={styles.eventTitle} numberOfLines={isExpanded ? 3 : 1}>
              {order.eventTitle}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={13} color="#94A3B8" />
            <Text style={styles.metaText} numberOfLines={1}>
              {order.eventVenue}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={13} color="#94A3B8" />
            <Text style={styles.metaText}>
              {order.eventDate} {order.eventTime ? `• ${order.eventTime}` : ''}
            </Text>
          </View>
        </View>

        {/* Columna derecha con status y chevron */}
        <View style={styles.headerRight}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>PAGADA</Text>
          </View>

          <View style={styles.chevronBox}>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={isExpanded ? '#818CF8' : '#94A3B8'}
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* Resumen inferior cuando está colapsado */}
      {!isExpanded && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onToggle}
          style={styles.collapsedFooter}>
          <View style={styles.collapsedFooterLeft}>
            <Ionicons name="ticket-outline" size={14} color={Eventia.primary} />
            <Text style={styles.collapsedTicketsText}>
              {order.totalTickets} {order.totalTickets === 1 ? 'entrada' : 'entradas'} • {formatPricePEN(order.total)}
            </Text>
          </View>
          <Text style={styles.tapToExpandText}>Toca para ver detalle y QR ▾</Text>
        </TouchableOpacity>
      )}

      {/* SECCIÓN EXPANDIDA: Detalle completo de entradas y QR */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Perforación visual de boleto */}
          <View style={styles.perforationRow}>
            <View style={styles.notchLeft} />
            <View style={styles.dashedLine} />
            <View style={styles.notchRight} />
          </View>

          {/* Desglose de Entradas Adquiridas */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Entradas Compradas</Text>
            <View style={styles.ticketsList}>
              {order.items && order.items.length > 0 ? (
                order.items.map((it, idx) => (
                  <View key={idx} style={styles.ticketItemRow}>
                    <View style={styles.ticketItemLeft}>
                      <View style={styles.ticketPill}>
                        <Text style={styles.ticketPillQty}>{it.quantity}x</Text>
                      </View>
                      <View>
                        <Text style={styles.ticketItemName}>{it.ticketName}</Text>
                        <Text style={styles.ticketItemSub}>Acceso verificado para evento</Text>
                      </View>
                    </View>
                    <Text style={styles.ticketItemPrice}>
                      {formatPricePEN(it.price * it.quantity)}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.ticketItemRow}>
                  <Text style={styles.ticketItemName}>Entrada General x {order.totalTickets}</Text>
                  <Text style={styles.ticketItemPrice}>{formatPricePEN(order.total)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Datos del Comprador y Orden */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>N° DE ORDEN</Text>
              <Text style={styles.infoValue}>#{order.orderNumber}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>TITULAR</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{order.buyerName || 'Cliente'}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>MÉTODO</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{order.paymentMethod || 'Culqi'}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>TOTAL PAGADO</Text>
              <Text style={[styles.infoValue, { color: '#818CF8' }]}>{formatPricePEN(order.total)}</Text>
            </View>
          </View>

          {/* Pase de Acceso con Código QR */}
          <View style={styles.qrCard}>
            <Text style={styles.qrCardTitle}>Pase Digital de Acceso</Text>
            <Text style={styles.qrCardSub}>Presenta este código al ingresar al recinto</Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setIsQrModalOpen(true)}
              style={styles.qrTouchable}>
              <View style={styles.qrWrapper}>
                <Ionicons name="qr-code" size={130} color="#0B1C30" />
              </View>
              <View style={styles.qrCodeTag}>
                <Text style={styles.qrCodeTagText}>{order.qrCode || `EVENTIA-${order.orderNumber}`}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.qrActionsRow}>
              <TouchableOpacity
                onPress={() => setIsQrModalOpen(true)}
                style={styles.qrActionBtn}>
                <Ionicons name="scan-outline" size={15} color="#818CF8" />
                <Text style={styles.qrActionBtnText}>Ver en pantalla completa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShare}
                style={[styles.qrActionBtn, styles.qrActionBtnSecondary]}>
                <Ionicons name="share-social-outline" size={15} color="#E2E8F0" />
                <Text style={[styles.qrActionBtnText, { color: '#E2E8F0' }]}>Compartir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Modal QR Completo */}
      <TicketQrModal
        visible={isQrModalOpen}
        orderNumber={order.orderNumber}
        eventTitle={order.eventTitle}
        buyerName={order.buyerName || 'Cliente'}
        qrCode={order.qrCode}
        onClose={() => setIsQrModalOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E2024',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2E3135',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  cardExpanded: {
    borderColor: '#6366F1',
    backgroundColor: '#181A1E',
  },
  cardHeader: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateBadge: {
    backgroundColor: '#262930',
    borderRadius: 10,
    width: 48,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '800',
    color: '#818CF8',
    letterSpacing: 0.5,
  },
  dateDay: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
    gap: 3,
  },
  titleStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#34D399',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.5,
  },
  chevronBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#262930',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapsedFooter: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#161719',
    borderTopWidth: 1,
    borderTopColor: '#262930',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  collapsedFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  collapsedTicketsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  tapToExpandText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#818CF8',
  },
  expandedContent: {
    backgroundColor: '#161719',
    paddingBottom: 16,
  },
  perforationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  notchLeft: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#000000',
    position: 'absolute',
    left: -7,
  },
  notchRight: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#000000',
    position: 'absolute',
    right: -7,
  },
  dashedLine: {
    flex: 1,
    marginHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2E3135',
    borderStyle: 'dashed',
  },
  sectionBlock: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
    letterSpacing: 0.3,
  },
  ticketsList: {
    gap: 8,
  },
  ticketItemRow: {
    backgroundColor: '#1E2024',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#262930',
  },
  ticketItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ticketPill: {
    backgroundColor: '#312E81',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ticketPillQty: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A5B4FC',
  },
  ticketItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ticketItemSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  ticketItemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 12,
  },
  infoCol: {
    width: '46%',
    gap: 2,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  qrCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#1E2024',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2E3135',
    gap: 6,
  },
  qrCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  qrCardSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 6,
  },
  qrTouchable: {
    alignItems: 'center',
    gap: 6,
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  qrCodeTag: {
    backgroundColor: '#262930',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  qrCodeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A5B4FC',
    letterSpacing: 0.5,
  },
  qrActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    width: '100%',
  },
  qrActionBtn: {
    flex: 1,
    backgroundColor: '#262930',
    borderRadius: 8,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#374151',
  },
  qrActionBtnSecondary: {
    backgroundColor: '#1E2024',
  },
  qrActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#818CF8',
  },
});

