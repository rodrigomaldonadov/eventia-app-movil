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
import type { Order } from '../types/order.types';
import { TicketQrModal } from './TicketQrModal';

interface HeroTicketPassProps {
  order: Order;
}

export const HeroTicketPass: React.FC<HeroTicketPassProps> = ({ order }) => {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `¡Tengo mis entradas para ${order.eventTitle}! 🎉 Código de pase digital: ${order.orderNumber}. Descárgalas en Eventia App.`,
        title: `Mi Pase Digital para ${order.eventTitle}`,
      });
    } catch {
      // Ignorar si cancela
    }
  };

  const handleDownload = () => {
    Alert.alert(
      'Descargar Comprobante',
      `El comprobante digital y boletos de la orden #${order.orderNumber} han sido generados en PDF. Puedes guardarlo en tu galería o archivos.`,
      [{ text: 'Aceptar' }],
    );
  };

  return (
    <View style={styles.cardContainer}>
      {/* 1. Event Visual Header */}
      <View style={styles.headerImageWrapper}>
        {order.imageUrl ? (
          <Image source={{ uri: order.imageUrl }} style={styles.headerImage} resizeMode="cover" />
        ) : (
          <View style={styles.imageFallback}>
            <Ionicons name="musical-notes" size={32} color="#FFFFFF" />
          </View>
        )}
        <View style={styles.headerOverlay} />

        {/* Badge Confirmado */}
        <View style={styles.confirmedBadge}>
          <View style={styles.pulseDot} />
          <Text style={styles.confirmedBadgeText}>Confirmado</Text>
        </View>

        {/* Share Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleShare}
          style={styles.shareBtn}
          hitSlop={8}>
          <Ionicons name="share-outline" size={18} color="#0B1C30" />
        </TouchableOpacity>
      </View>

      {/* 2. Ticket Core Details */}
      <View style={styles.detailsBody}>
        <View style={styles.topInfoRow}>
          <Text style={styles.verifiedTag}>Acceso Digital Verificado</Text>
          <Text style={styles.orderNum}>Orden #{order.orderNumber}</Text>
        </View>

        <Text style={styles.eventTitle} numberOfLines={2}>
          {order.eventTitle}
        </Text>

        <View style={styles.metaCol}>
          <View style={styles.metaItem}>
            <View style={styles.metaIconBox}>
              <Ionicons name="calendar-outline" size={15} color={Eventia.primary} />
            </View>
            <Text style={styles.metaTextBold}>
              {order.eventDate} {order.eventTime ? `• ${order.eventTime}` : ''}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <View style={styles.metaIconBox}>
              <Ionicons name="location-outline" size={15} color={Eventia.primary} />
            </View>
            <Text style={styles.metaTextRegular} numberOfLines={1}>
              {order.eventVenue}
            </Text>
          </View>
        </View>

        {/* Tier Breakdown Badges */}
        <View style={styles.tiersRow}>
          {order.items.slice(0, 2).map((item) => (
            <View key={item.id} style={styles.tierPill}>
              <Ionicons name="ticket-outline" size={13} color={Eventia.primary} />
              <Text style={styles.tierPillText}>
                {item.quantity}x {item.ticketName}
              </Text>
            </View>
          ))}
          <Text style={styles.totalBadgeRight}>
            {order.totalTickets} {order.totalTickets === 1 ? 'Entrada' : 'Entradas'}
          </Text>
        </View>
      </View>

      {/* 3. Ticket Perforation Edge Visual (Efecto boleto físico de Stitch) */}
      <View style={styles.perforationEdge}>
        <View style={styles.notchLeft} />
        <View style={styles.dashedBorder} />
        <View style={styles.notchRight} />
      </View>

      {/* 4. Scannable Digital QR Segment */}
      <View style={styles.qrSection}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setIsQrModalOpen(true)}
          style={styles.qrInteractiveBox}>
          <View style={styles.qrInnerBox}>
            <Ionicons name="qr-code" size={140} color="#0B1C30" />
          </View>
          <View style={styles.qrStatusRow}>
            <View style={styles.greenMiniDot} />
            <Text style={styles.qrStatusText}>Código dinámico se actualiza cada 30s</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Action Buttons */}
        <View style={styles.buttonsGrid}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsQrModalOpen(true)}
            style={styles.secondaryActionBtn}>
            <Ionicons name="expand-outline" size={16} color={Eventia.primary} />
            <Text style={styles.secondaryActionText}>Ver QR completo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleDownload}
            style={styles.primaryActionBtn}>
            <Ionicons name="download-outline" size={16} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Descargar PDF</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal QR Completo */}
      <TicketQrModal
        visible={isQrModalOpen}
        orderNumber={order.orderNumber}
        eventTitle={order.eventTitle}
        buyerName={order.buyerName}
        qrCode={order.qrCode}
        onClose={() => setIsQrModalOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0B1C30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginVertical: 4,
  },
  headerImageWrapper: {
    width: '100%',
    height: 140,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Eventia.primary,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 28, 48, 0.25)',
  },
  confirmedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#006E4B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6FFBBE',
  },
  confirmedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  shareBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsBody: {
    padding: 16,
    gap: 10,
  },
  topInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verifiedTag: {
    fontSize: 10,
    fontWeight: '800',
    color: Eventia.primary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  orderNum: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1C30',
    lineHeight: 24,
  },
  metaCol: {
    gap: 6,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#EFF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaTextBold: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1C30',
  },
  metaTextRegular: {
    fontSize: 12,
    color: '#64748B',
    flexShrink: 1,
  },
  tiersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tierPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0B1C30',
  },
  totalBadgeRight: {
    marginLeft: 'auto',
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  perforationEdge: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    width: '100%',
    overflow: 'hidden',
  },
  notchLeft: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F8F9FF',
    marginLeft: -10,
  },
  dashedBorder: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    marginHorizontal: 8,
  },
  notchRight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F8F9FF',
    marginRight: -10,
  },
  qrSection: {
    padding: 16,
    paddingTop: 4,
    alignItems: 'center',
    gap: 12,
  },
  qrInteractiveBox: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrInnerBox: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  qrStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  greenMiniDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  qrStatusText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  buttonsGrid: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  secondaryActionBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EFF4FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryActionText: {
    color: Eventia.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  primaryActionBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: Eventia.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
