import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { MaxContentWidth, Spacing, Eventia } from '@/constants/theme';
import { eventService } from '@/services/eventService';
import { cloudinaryService } from '@/services/cloudinaryService';
import { EVENT_CATEGORIES } from '@/data/events';
import type { EventCategory, TicketType } from '@/types/event.types';

const POPULAR_HOURS = ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function AdminEventFormScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [eventLocked, setEventLocked] = useState(false);
  const [soldTicketsCount, setSoldTicketsCount] = useState(0);

  // Campos principales del evento
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Música');
  const [imageUrl, setImageUrl] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 15);
    return today.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('20:00');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('Lima');
  const [organizer, setOrganizer] = useState('Eventia Live');
  const [description, setDescription] = useState('');

  // Configuración de Entradas independientes por evento: General, VIP, VIP+
  const [generalPrice, setGeneralPrice] = useState('50');
  const [generalStock, setGeneralStock] = useState('30');

  const [vipPrice, setVipPrice] = useState('100');
  const [vipStock, setVipStock] = useState('20');

  const [vipPlusPrice, setVipPlusPrice] = useState('150');
  const [vipPlusStock, setVipPlusStock] = useState('10');

  // Suma total calculada en vivo de cupos para este evento
  const totalEventStock = useMemo(() => {
    const g = parseInt(generalStock, 10) || 0;
    const v = parseInt(vipStock, 10) || 0;
    const vp = parseInt(vipPlusStock, 10) || 0;
    return g + v + vp;
  }, [generalStock, vipStock, vipPlusStock]);

  // Estado de validaciones y errores por campo
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estado para el modal de Calendario
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarYear, setCalendarYear] = useState(() => {
    const d = new Date(date || Date.now());
    return isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear();
  });
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date(date || Date.now());
    return isNaN(d.getMonth()) ? new Date().getMonth() : d.getMonth();
  });

  const [isUploadingCloudinary, setIsUploadingCloudinary] = useState(false);

  const handlePickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const localUri = res.assets[0].uri;
        setImageUrl(localUri);
        setIsUploadingCloudinary(true);
        try {
          const cloudUrl = await cloudinaryService.uploadImage(localUri);
          setImageUrl(cloudUrl);
        } catch {
          // Mantener localUri si falla la subida remota
        } finally {
          setIsUploadingCloudinary(false);
        }
      }
    } catch {
      Alert.alert('Error', 'No se pudo seleccionar la imagen de la galería.');
    }
  };

  // Autoformato inteligente de hora (HH:MM)
  const handleTimeChange = (text: string) => {
    setErrors((prev) => ({ ...prev, time: '' }));
    // Eliminar todo lo que no sea dígito
    const clean = text.replace(/\D/g, '').slice(0, 4);

    if (clean.length === 0) {
      setTime('');
      return;
    }

    if (clean.length <= 2) {
      let h = parseInt(clean, 10);
      if (h > 23) h = 23;
      setTime(clean.length === 2 ? String(h).padStart(2, '0') : clean);
      return;
    }

    let hours = parseInt(clean.slice(0, 2), 10);
    if (hours > 23) hours = 23;
    const hoursStr = String(hours).padStart(2, '0');

    let mins = clean.slice(2);
    if (mins.length === 2) {
      let m = parseInt(mins, 10);
      if (m > 59) m = 59;
      mins = String(m).padStart(2, '0');
    }

    setTime(`${hoursStr}:${mins}`);
  };

  // Cargar datos si estamos editando
  useEffect(() => {
    if (isEditing && id) {
      eventService
        .getEventById(id)
        .then((evt) => {
          if (evt) {
            setTitle(evt.title || '');
            setCategory(evt.category || 'Música');
            setImageUrl(evt.imageUrl || '');
            setDate(evt.date || '');
            setTime(evt.time || '20:00');
            setVenue(evt.venue || (evt as any).location || '');
            setCity(evt.city || 'Lima');
            setOrganizer(evt.organizer || 'Eventia Live');
            setDescription(evt.description || '');

            const tickets = Array.isArray(evt.tickets) && evt.tickets.length > 0
              ? evt.tickets
              : ((evt as any).ticketTypes ?? []);

            const vipP = tickets.find((t: any) =>
              (t.id === 'vip_plus') ||
              (t.name || '').includes('+') ||
              (t.name || '').toLowerCase().includes('plus')
            );
            const vip = tickets.find((t: any) =>
              (t.id === 'vip') ||
              ((t.name || '').toLowerCase() === 'vip') ||
              ((t.name || '').includes('VIP') && !(t.name || '').includes('+') && !(t.name || '').toLowerCase().includes('plus'))
            );
            const gen = tickets.find((t: any) =>
              (t.id === 'general') ||
              (t.name || '').toLowerCase().includes('general')
            );

            if (gen) {
              setGeneralPrice(String(gen.price ?? ''));
              setGeneralStock(String(gen.available ?? (gen as any).availableCapacity ?? '0'));
            }
            if (vip) {
              setVipPrice(String(vip.price ?? ''));
              setVipStock(String(vip.available ?? (vip as any).availableCapacity ?? '0'));
            }
            if (vipP) {
              setVipPlusPrice(String(vipP.price ?? ''));
              setVipPlusStock(String(vipP.available ?? (vipP as any).availableCapacity ?? '0'));
            }

            // Validar si el evento ya cuenta con entradas vendidas
            const totalCap = tickets.reduce((acc: number, t: any) => acc + (t.total ?? t.totalCapacity ?? t.available ?? 0), 0);
            const totalAvail = tickets.reduce((acc: number, t: any) => acc + (t.available ?? t.availableCapacity ?? 0), 0);
            const totalSold = Math.max(0, totalCap - totalAvail);
            const isLocked = Boolean(evt.hasSoldTickets) || (evt.soldTicketsCount ?? 0) > 0 || totalSold > 0;
            const soldCount = (evt.soldTicketsCount ?? 0) || totalSold;

            setEventLocked(isLocked);
            setSoldTicketsCount(soldCount);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  // Generador de días para la cuadrícula del calendario
  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [calendarYear, calendarMonth]);

  const selectDay = (day: number) => {
    const m = String(calendarMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const fullDate = `${calendarYear}-${m}-${d}`;
    setDate(fullDate);
    setErrors((prev) => ({ ...prev, date: '' }));
    setCalendarVisible(false);
  };

  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  // Validación rigurosa de campos
  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!title.trim() || title.trim().length < 3) {
      errs.title = 'El título debe tener al menos 3 caracteres.';
    }

    if (!venue.trim() || venue.trim().length < 3) {
      errs.venue = 'Ingresa el nombre del recinto o lugar del evento.';
    }

    if (!description.trim() || description.trim().length < 10) {
      errs.description = 'La descripción debe tener al menos 10 caracteres.';
    }

    // Validación de fecha YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!date.trim() || !dateRegex.test(date.trim())) {
      errs.date = 'Selecciona una fecha válida (formato YYYY-MM-DD).';
    }

    // Validación de hora HH:MM (00:00 a 23:59)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!time.trim() || !timeRegex.test(time.trim())) {
      errs.time = 'Ingresa una hora válida en formato HH:MM (ej. 20:00).';
    }

    // Validación de entradas
    const genP = parseFloat(generalPrice);
    const genS = parseInt(generalStock, 10);
    if (isNaN(genP) || genP < 0) errs.generalPrice = 'Precio inválido.';
    if (isNaN(genS) || genS <= 0) errs.generalStock = 'Cupos > 0.';

    const vipP = parseFloat(vipPrice);
    const vipS = parseInt(vipStock, 10);
    if (isNaN(vipP) || vipP < 0) errs.vipPrice = 'Precio inválido.';
    if (isNaN(vipS) || vipS < 0) errs.vipStock = 'Cupos inválidos.';

    const vipPP = parseFloat(vipPlusPrice);
    const vipPS = parseInt(vipPlusStock, 10);
    if (isNaN(vipPP) || vipPP < 0) errs.vipPlusPrice = 'Precio inválido.';
    if (isNaN(vipPS) || vipPS < 0) errs.vipPlusStock = 'Cupos inválidos.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (eventLocked) {
      Alert.alert(
        '🔒 Evento Bloqueado',
        `Este evento ya registra ${soldTicketsCount} entrada(s) vendida(s).\n\nNo se puede modificar la información, fechas ni tarifas una vez iniciada la venta de boletos.`
      );
      return;
    }

    if (!validateForm()) {
      Alert.alert(
        'Campos incompletos o inválidos',
        'Por favor revisa los campos señalados en rojo antes de continuar.'
      );
      return;
    }

    const genP = parseFloat(generalPrice) || 0;
    const genS = parseInt(generalStock, 10) || 0;
    const vipP = parseFloat(vipPrice) || 0;
    const vipS = parseInt(vipStock, 10) || 0;
    const vipPP = parseFloat(vipPlusPrice) || 0;
    const vipPS = parseInt(vipPlusStock, 10) || 0;

    const tickets: TicketType[] = [
      {
        id: 'general',
        name: 'General',
        tier: 'General',
        price: genP,
        available: genS,
        description: 'Acceso general al evento y zonas de uso común.',
      },
      {
        id: 'vip',
        name: 'VIP',
        tier: 'VIP',
        price: vipP,
        available: vipS,
        description: 'Ubicación preferencial, acceso rápido y servicios exclusivos.',
      },
      {
        id: 'vip_plus',
        name: 'VIP+',
        tier: 'VIP+',
        price: vipPP,
        available: vipPS,
        description: 'Pase backstage total, atención VIP y beneficios conmemorativos.',
      },
    ];

    setSubmitting(true);
    try {
      if (isEditing && id) {
        await eventService.updateEvent(id, {
          title: title.trim(),
          category,
          imageUrl: imageUrl.trim() || undefined,
          date: date.trim(),
          time: time.trim(),
          venue: venue.trim(),
          city: city.trim(),
          organizer: organizer.trim(),
          description: description.trim(),
          tickets,
        });
        Alert.alert('Éxito', 'Evento actualizado correctamente.');
      } else {
        await eventService.createEvent({
          title: title.trim(),
          category,
          imageUrl:
            imageUrl.trim() ||
            'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop',
          date: date.trim(),
          time: time.trim(),
          venue: venue.trim(),
          city: city.trim(),
          organizer: organizer.trim(),
          description: description.trim(),
          featured: false,
          tickets,
        });
        Alert.alert('Éxito', '¡Nuevo evento publicado exitosamente en MySQL!');
      }
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo guardar el evento en el backend.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Eventia.primary} />
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Acceso Denegado' }} />
        <Ionicons name="lock-closed-outline" size={64} color="#EF4444" />
        <Text style={[styles.deniedTitle, { color: theme.text }]}>Acceso Restringido</Text>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: Eventia.primary }]}
          onPress={() => router.replace('/')}>
          <Text style={styles.primaryBtnText}>Volver al Catálogo</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: isEditing ? 'Editar Evento' : 'Crear Evento',
          headerShown: true,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Banner de Bloqueo si el evento tiene ventas */}
          {eventLocked && (
            <View style={styles.lockedBanner}>
              <Ionicons name="lock-closed" size={22} color="#F59E0B" />
              <View style={{ flex: 1 }}>
                <Text style={styles.lockedBannerTitle}>Evento Bloqueado para Modificaciones</Text>
                <Text style={styles.lockedBannerText}>
                  Este evento ya registra {soldTicketsCount} entrada(s) vendida(s). Por normativas de protección al comprador y validez de boletos, no se pueden modificar las fechas, el recinto ni las tarifas.
                </Text>
              </View>
            </View>
          )}

          {/* Sección 1: Información General */}
          <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              1. Información Principal del Evento
            </Text>

            {/* Título */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Título del Evento *</Text>
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, backgroundColor: theme.background },
                  errors.title ? styles.inputError : null,
                ]}
                placeholder="Ej. Ultra Future Summit 2026"
                placeholderTextColor={theme.textSecondary}
                value={title}
                onChangeText={(t) => {
                  setTitle(t);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                }}
              />
              {errors.title && (
                <Text style={styles.errorText}>
                  <Ionicons name="alert-circle" size={12} color="#EF4444" /> {errors.title}
                </Text>
              )}
            </View>

            {/* Selector de Categoría */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Categoría *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.catRow}>
                {EVENT_CATEGORIES.map((cat) => {
                  const selected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catChip,
                        {
                          backgroundColor: selected ? Eventia.primary : theme.background,
                          borderColor: selected ? Eventia.primary : 'rgba(255,255,255,0.08)',
                        },
                      ]}
                      onPress={() => setCategory(cat)}>
                      <Text
                        style={[
                          styles.catChipText,
                          { color: selected ? '#FFFFFF' : theme.textSecondary },
                        ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Banner / Imagen */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelWithAction}>
                <Text style={[styles.label, { color: theme.text }]}>Imagen o Banner</Text>
                <TouchableOpacity
                  style={[styles.galleryBtn, { backgroundColor: Eventia.primaryContainer }]}
                  onPress={handlePickImage}>
                  <Ionicons name="images-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.galleryBtnText}>Galería</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
                placeholder="Ingresa URL o presiona 'Galería'..."
                placeholderTextColor={theme.textSecondary}
                value={imageUrl}
                onChangeText={setImageUrl}
              />
              {imageUrl ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: imageUrl }} style={styles.imagePreview} contentFit="cover" />
                  {isUploadingCloudinary && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.uploadingText}>Subiendo a Cloudinary...</Text>
                    </View>
                  )}
                  {cloudinaryService.isCloudinaryUrl(imageUrl) && !isUploadingCloudinary && (
                    <View style={styles.cloudinaryBadge}>
                      <Ionicons name="cloud-done-outline" size={12} color="#34D399" />
                      <Text style={styles.cloudinaryBadgeText}>Cloudinary</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.clearImageBtn}
                    onPress={() => setImageUrl('')}>
                    <Ionicons name="close" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>

            {/* Fecha con Calendario y Hora con Autoformato */}
            <View style={styles.rowTwo}>
              {/* Campo Fecha */}
              <View style={[styles.fieldGroup, { flex: 1.2 }]}>
                <Text style={[styles.label, { color: theme.text }]}>Fecha del Evento *</Text>
                <TouchableOpacity
                  style={[
                    styles.pickerBtn,
                    { backgroundColor: theme.background },
                    errors.date ? styles.inputError : null,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    const parsed = new Date(date || Date.now());
                    if (!isNaN(parsed.getTime())) {
                      setCalendarYear(parsed.getFullYear());
                      setCalendarMonth(parsed.getMonth());
                    }
                    setCalendarVisible(true);
                  }}>
                  <Ionicons name="calendar" size={16} color={Eventia.primary} />
                  <Text
                    style={[
                      styles.pickerBtnText,
                      { color: date ? theme.text : theme.textSecondary },
                    ]}>
                    {date || 'Seleccionar fecha'}
                  </Text>
                </TouchableOpacity>
                {errors.date && (
                  <Text style={styles.errorText}>
                    <Ionicons name="alert-circle" size={11} color="#EF4444" /> {errors.date}
                  </Text>
                )}
              </View>

              {/* Campo Hora con autoformato */}
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.text }]}>Hora (HH:MM) *</Text>
                <View style={styles.timeInputWrap}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={Eventia.primary}
                    style={styles.timeIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      styles.timeInput,
                      { color: theme.text, backgroundColor: theme.background },
                      errors.time ? styles.inputError : null,
                    ]}
                    placeholder="20:00"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="number-pad"
                    maxLength={5}
                    value={time}
                    onChangeText={handleTimeChange}
                  />
                </View>
                {errors.time && (
                  <Text style={styles.errorText}>
                    <Ionicons name="alert-circle" size={11} color="#EF4444" /> {errors.time}
                  </Text>
                )}
              </View>
            </View>

            {/* Chips de horas rápidas */}
            <View style={styles.quickHoursWrap}>
              <Text style={[styles.quickHoursLabel, { color: theme.textSecondary }]}>
                Sugerencias de hora:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickHoursRow}>
                {POPULAR_HOURS.map((h) => {
                  const active = time === h;
                  return (
                    <TouchableOpacity
                      key={h}
                      style={[
                        styles.quickHourChip,
                        {
                          backgroundColor: active ? Eventia.primary : theme.background,
                          borderColor: active ? Eventia.primary : 'rgba(255,255,255,0.08)',
                        },
                      ]}
                      onPress={() => {
                        setTime(h);
                        setErrors((prev) => ({ ...prev, time: '' }));
                      }}>
                      <Text
                        style={[
                          styles.quickHourText,
                          { color: active ? '#FFFFFF' : theme.textSecondary },
                        ]}>
                        {h}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Lugar y Ciudad */}
            <View style={styles.rowTwo}>
              <View style={[styles.fieldGroup, { flex: 2 }]}>
                <Text style={[styles.label, { color: theme.text }]}>Lugar / Recinto *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { color: theme.text, backgroundColor: theme.background },
                    errors.venue ? styles.inputError : null,
                  ]}
                  placeholder="Ej. Arena 1, Costa Verde"
                  placeholderTextColor={theme.textSecondary}
                  value={venue}
                  onChangeText={(t) => {
                    setVenue(t);
                    if (errors.venue) setErrors((prev) => ({ ...prev, venue: '' }));
                  }}
                />
                {errors.venue && (
                  <Text style={styles.errorText}>
                    <Ionicons name="alert-circle" size={12} color="#EF4444" /> {errors.venue}
                  </Text>
                )}
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.text }]}>Ciudad</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
                  placeholder="Lima"
                  placeholderTextColor={theme.textSecondary}
                  value={city}
                  onChangeText={setCity}
                />
              </View>
            </View>

            {/* Organizador */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Organizador</Text>
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
                placeholder="Ej. Live Nation & Eventia"
                placeholderTextColor={theme.textSecondary}
                value={organizer}
                onChangeText={setOrganizer}
              />
            </View>

            {/* Descripción */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Descripción Detallada *</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { color: theme.text, backgroundColor: theme.background },
                  errors.description ? styles.inputError : null,
                ]}
                placeholder="Detalle completo de la experiencia, accesos y horarios (mínimo 10 caracteres)..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={(t) => {
                  setDescription(t);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
                }}
              />
              {errors.description && (
                <Text style={styles.errorText}>
                  <Ionicons name="alert-circle" size={12} color="#EF4444" /> {errors.description}
                </Text>
              )}
            </View>
          </View>

          {/* Sección 2: Configuración de Entradas y Tarifas Propias del Evento */}
          <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.stockSummaryRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  2. Tarifas y Cupos por Categoría
                </Text>
                <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                  Define de forma independiente las tarifas y cupos de este evento:
                </Text>
              </View>
              <View style={[styles.totalStockBadge, { backgroundColor: Eventia.primary }]}>
                <Ionicons name="ticket" size={14} color="#FFFFFF" />
                <Text style={styles.totalStockBadgeText}>Total: {totalEventStock} cupos</Text>
              </View>
            </View>

            {/* Categoría General */}
            <View style={[styles.tierConfigBox, { backgroundColor: theme.background }]}>
              <View style={styles.tierHeader}>
                <View style={[styles.tierDot, { backgroundColor: '#3B82F6' }]} />
                <Text style={[styles.tierTitle, { color: theme.text }]}>Entrada General</Text>
              </View>
              <View style={styles.rowTwo}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: theme.text }]}>Precio (S/)</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { color: theme.text, backgroundColor: theme.backgroundElement },
                      errors.generalPrice ? styles.inputError : null,
                    ]}
                    placeholder="Ej. 50"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                    value={generalPrice}
                    onChangeText={(t) => {
                      setGeneralPrice(t);
                      if (errors.generalPrice) setErrors((prev) => ({ ...prev, generalPrice: '' }));
                    }}
                  />
                  {errors.generalPrice && <Text style={styles.errorText}>{errors.generalPrice}</Text>}
                </View>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: theme.text }]}>Stock Inicial</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { color: theme.text, backgroundColor: theme.backgroundElement },
                      errors.generalStock ? styles.inputError : null,
                    ]}
                    placeholder="Ej. 30"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="number-pad"
                    value={generalStock}
                    onChangeText={(t) => {
                      setGeneralStock(t);
                      if (errors.generalStock) setErrors((prev) => ({ ...prev, generalStock: '' }));
                    }}
                  />
                  {errors.generalStock && <Text style={styles.errorText}>{errors.generalStock}</Text>}
                </View>
              </View>
            </View>

            {/* Categoría VIP */}
            <View style={[styles.tierConfigBox, { backgroundColor: theme.background }]}>
              <View style={styles.tierHeader}>
                <View style={[styles.tierDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={[styles.tierTitle, { color: theme.text }]}>Entrada VIP</Text>
              </View>
              <View style={styles.rowTwo}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: theme.text }]}>Precio (S/)</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { color: theme.text, backgroundColor: theme.backgroundElement },
                      errors.vipPrice ? styles.inputError : null,
                    ]}
                    placeholder="Ej. 100"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                    value={vipPrice}
                    onChangeText={(t) => {
                      setVipPrice(t);
                      if (errors.vipPrice) setErrors((prev) => ({ ...prev, vipPrice: '' }));
                    }}
                  />
                  {errors.vipPrice && <Text style={styles.errorText}>{errors.vipPrice}</Text>}
                </View>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: theme.text }]}>Stock Inicial</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { color: theme.text, backgroundColor: theme.backgroundElement },
                      errors.vipStock ? styles.inputError : null,
                    ]}
                    placeholder="Ej. 20"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="number-pad"
                    value={vipStock}
                    onChangeText={(t) => {
                      setVipStock(t);
                      if (errors.vipStock) setErrors((prev) => ({ ...prev, vipStock: '' }));
                    }}
                  />
                  {errors.vipStock && <Text style={styles.errorText}>{errors.vipStock}</Text>}
                </View>
              </View>
            </View>

            {/* Categoría VIP+ */}
            <View style={[styles.tierConfigBox, { backgroundColor: theme.background }]}>
              <View style={styles.tierHeader}>
                <View style={[styles.tierDot, { backgroundColor: '#8B5CF6' }]} />
                <Text style={[styles.tierTitle, { color: theme.text }]}>Entrada VIP+</Text>
              </View>
              <View style={styles.rowTwo}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: theme.text }]}>Precio (S/)</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { color: theme.text, backgroundColor: theme.backgroundElement },
                      errors.vipPlusPrice ? styles.inputError : null,
                    ]}
                    placeholder="Ej. 150"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                    value={vipPlusPrice}
                    onChangeText={(t) => {
                      setVipPlusPrice(t);
                      if (errors.vipPlusPrice) setErrors((prev) => ({ ...prev, vipPlusPrice: '' }));
                    }}
                  />
                  {errors.vipPlusPrice && <Text style={styles.errorText}>{errors.vipPlusPrice}</Text>}
                </View>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: theme.text }]}>Stock Inicial</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { color: theme.text, backgroundColor: theme.backgroundElement },
                      errors.vipPlusStock ? styles.inputError : null,
                    ]}
                    placeholder="Ej. 10"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="number-pad"
                    value={vipPlusStock}
                    onChangeText={(t) => {
                      setVipPlusStock(t);
                      if (errors.vipPlusStock) setErrors((prev) => ({ ...prev, vipPlusStock: '' }));
                    }}
                  />
                  {errors.vipPlusStock && <Text style={styles.errorText}>{errors.vipPlusStock}</Text>}
                </View>
              </View>
            </View>
          </View>

          {/* Botón de Guardado */}
          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: eventLocked ? '#475569' : Eventia.primary },
              (submitting || eventLocked) && { opacity: 0.8 },
            ]}
            activeOpacity={0.85}
            disabled={submitting}
            onPress={handleSave}>
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : eventLocked ? (
              <>
                <Ionicons name="lock-closed" size={20} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>Bloqueado (Con ventas confirmadas)</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>
                  {isEditing ? 'Guardar Cambios del Evento' : 'Publicar Evento en Catálogo'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal Interactivo de Calendario */}
      <Modal
        visible={calendarVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCalendarVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.calendarModal, { backgroundColor: theme.backgroundElement }]}>
            {/* Header del Calendario */}
            <View style={styles.calHeader}>
              <TouchableOpacity onPress={prevMonth} style={styles.calNavBtn}>
                <Ionicons name="chevron-back" size={20} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.calMonthText, { color: theme.text }]}>
                {MONTH_NAMES[calendarMonth]} {calendarYear}
              </Text>
              <TouchableOpacity onPress={nextMonth} style={styles.calNavBtn}>
                <Ionicons name="chevron-forward" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Días de la semana */}
            <View style={styles.calWeekRow}>
              {DAYS_OF_WEEK.map((d) => (
                <Text key={d} style={[styles.calWeekDay, { color: theme.textSecondary }]}>
                  {d}
                </Text>
              ))}
            </View>

            {/* Grilla de días */}
            <View style={styles.calGrid}>
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <View key={`empty-${idx}`} style={styles.calDayBox} />;
                }
                const mStr = String(calendarMonth + 1).padStart(2, '0');
                const dStr = String(day).padStart(2, '0');
                const fullStr = `${calendarYear}-${mStr}-${dStr}`;
                const isSelected = date === fullStr;

                return (
                  <TouchableOpacity
                    key={`day-${day}`}
                    style={[
                      styles.calDayBox,
                      styles.calDayBtn,
                      isSelected && { backgroundColor: Eventia.primary },
                    ]}
                    onPress={() => selectDay(day)}>
                    <Text
                      style={[
                        styles.calDayNumber,
                        { color: isSelected ? '#FFFFFF' : theme.text },
                        isSelected && { fontWeight: '800' },
                      ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Botón cerrar modal */}
            <TouchableOpacity
              style={[styles.calCloseBtn, { backgroundColor: theme.background }]}
              onPress={() => setCalendarVisible(false)}>
              <Text style={[styles.calCloseBtnText, { color: theme.text }]}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    gap: 14,
    paddingBottom: 40,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  deniedTitle: { fontSize: 20, fontWeight: '800', marginTop: 12 },
  primaryBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, marginTop: 16 },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  lockedBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F59E0B',
    marginBottom: 2,
  },
  lockedBannerText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#FCD34D',
  },
  card: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  cardSubtitle: { fontSize: 12, marginTop: -4 },
  fieldGroup: { gap: 6 },
  labelWithAction: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  galleryBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6 },
  galleryBtnText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  previewContainer: { marginTop: 6, position: 'relative', borderRadius: 10, overflow: 'hidden' },
  imagePreview: { width: '100%', height: 120, borderRadius: 10 },
  clearImageBtn: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  uploadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
  },
  uploadingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cloudinaryBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cloudinaryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  label: { fontSize: 12, fontWeight: '700' },
  input: {
    height: 42,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  textArea: { height: 90, paddingVertical: 10, textAlignVertical: 'top' },
  rowTwo: { flexDirection: 'row', gap: 10 },
  catRow: { gap: 8, paddingVertical: 2 },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  catChipText: { fontSize: 12, fontWeight: '700' },
  tierConfigBox: {
    padding: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  tierHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tierDot: { width: 8, height: 8, borderRadius: 4 },
  tierTitle: { fontSize: 13, fontWeight: '800' },
  pickerBtn: {
    height: 42,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pickerBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  timeInputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  timeIcon: {
    position: 'absolute',
    left: 10,
    zIndex: 1,
  },
  timeInput: {
    paddingLeft: 34,
  },
  quickHoursWrap: {
    marginTop: -4,
    gap: 6,
  },
  quickHoursLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  quickHoursRow: {
    gap: 8,
  },
  quickHourChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickHourText: {
    fontSize: 11,
    fontWeight: '700',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: Eventia.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 6,
  },
  saveBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  // Modal de Calendario
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarModal: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  calHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calNavBtn: {
    padding: 8,
    borderRadius: 8,
  },
  calMonthText: {
    fontSize: 16,
    fontWeight: '800',
  },
  calWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 8,
  },
  calWeekDay: {
    width: 38,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calDayBox: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calDayBtn: {
    borderRadius: 18,
  },
  calDayNumber: {
    fontSize: 13,
    fontWeight: '600',
  },
  calCloseBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  calCloseBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  stockSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  totalStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  totalStockBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
