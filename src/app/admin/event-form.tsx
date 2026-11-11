import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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
import { EVENT_CATEGORIES } from '@/data/events';
import type { EventCategory, EventItem, TicketType } from '@/types/event.types';

export default function AdminEventFormScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  // Campos principales del evento
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Música');
  const [imageUrl, setImageUrl] = useState('');
  const [date, setDate] = useState('2025-11-20');
  const [time, setTime] = useState('19:00');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('Lima');
  const [organizer, setOrganizer] = useState('Eventia Live');
  const [description, setDescription] = useState('');

  const handlePickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setImageUrl(res.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'No se pudo seleccionar la imagen de la galería.');
    }
  };

  // Configuración de Entradas: General, VIP, VIP+
  const [generalPrice, setGeneralPrice] = useState('80');
  const [generalStock, setGeneralStock] = useState('150');

  const [vipPrice, setVipPrice] = useState('160');
  const [vipStock, setVipStock] = useState('50');

  const [vipPlusPrice, setVipPlusPrice] = useState('280');
  const [vipPlusStock, setVipPlusStock] = useState('20');

  useEffect(() => {
    if (isEditing && id) {
      eventService
        .getEventById(id)
        .then((evt) => {
          if (evt) {
            setTitle(evt.title);
            setCategory(evt.category);
            setImageUrl(evt.imageUrl || '');
            setDate(evt.date);
            setTime(evt.time);
            setVenue(evt.venue);
            setCity(evt.city);
            setOrganizer(evt.organizer);
            setDescription(evt.description);

            // Precios y stocks de tickets
            const gen = evt.tickets.find((t) => t.id === 'general' || t.name.includes('General'));
            const vip = evt.tickets.find((t) => t.id === 'vip' || t.name.includes('VIP'));
            const vipP = evt.tickets.find((t) => t.id === 'vip_plus' || t.name.includes('+'));

            if (gen) {
              setGeneralPrice(String(gen.price));
              setGeneralStock(String(gen.available));
            }
            if (vip) {
              setVipPrice(String(vip.price));
              setVipStock(String(vip.available));
            }
            if (vipP) {
              setVipPlusPrice(String(vipP.price));
              setVipPlusStock(String(vipP.available));
            }
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Campo requerido', 'Ingresa el título del evento.');
      return;
    }
    if (!venue.trim()) {
      Alert.alert('Campo requerido', 'Ingresa el lugar o recinto del evento.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Campo requerido', 'Ingresa la descripción del evento.');
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
        Alert.alert('Éxito', 'Nuevo evento publicado en el catálogo.');
      }
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'No se pudo guardar el evento.');
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
          {/* Sección 1: Información General */}
          <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              1. Información Principal del Evento
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Título del Evento *</Text>
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
                placeholder="Ej. Ultra Future Summit 2026"
                placeholderTextColor={theme.textSecondary}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Categoría</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
                {EVENT_CATEGORIES.map((cat) => {
                  const selected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catChip,
                        {
                          backgroundColor: selected ? Eventia.primary : theme.background,
                          borderColor: selected ? Eventia.primary : 'rgba(255,255,255,0.1)',
                        },
                      ]}
                      onPress={() => setCategory(cat)}>
                      <Text style={[styles.catChipText, { color: selected ? '#FFFFFF' : theme.text }]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

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
                  <TouchableOpacity
                    style={styles.clearImageBtn}
                    onPress={() => setImageUrl('')}>
                    <Ionicons name="close" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>

            <View style={styles.rowTwo}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.text }]}>Fecha (YYYY-MM-DD)</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
                  placeholder="2025-11-20"
                  placeholderTextColor={theme.textSecondary}
                  value={date}
                  onChangeText={setDate}
                />
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.text }]}>Hora (HH:MM)</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
                  placeholder="19:00"
                  placeholderTextColor={theme.textSecondary}
                  value={time}
                  onChangeText={setTime}
                />
              </View>
            </View>

            <View style={styles.rowTwo}>
              <View style={[styles.fieldGroup, { flex: 2 }]}>
                <Text style={[styles.label, { color: theme.text }]}>Lugar / Recinto *</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
                  placeholder="Ej. Jockey Club del Perú"
                  placeholderTextColor={theme.textSecondary}
                  value={venue}
                  onChangeText={setVenue}
                />
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

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Descripción Detallada *</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { color: theme.text, backgroundColor: theme.background },
                ]}
                placeholder="Detalle completo de la experiencia, accesos y horarios..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>

          {/* Sección 2: Configuración de Entradas (General, VIP, VIP+) */}
          <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              2. Precios y Cupos por Categoría
            </Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
              Configura de forma individual el precio en soles (PEN) y el stock de cada categoría:
            </Text>

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
                    style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
                    keyboardType="numeric"
                    value={generalPrice}
                    onChangeText={setGeneralPrice}
                  />
                </View>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: theme.text }]}>Stock Inicial</Text>
                  <TextInput
                    style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
                    keyboardType="number-pad"
                    value={generalStock}
                    onChangeText={setGeneralStock}
                  />
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
                    style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
                    keyboardType="numeric"
                    value={vipPrice}
                    onChangeText={setVipPrice}
                  />
                </View>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: theme.text }]}>Stock Inicial</Text>
                  <TextInput
                    style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
                    keyboardType="number-pad"
                    value={vipStock}
                    onChangeText={setVipStock}
                  />
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
                    style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
                    keyboardType="numeric"
                    value={vipPlusPrice}
                    onChangeText={setVipPlusPrice}
                  />
                </View>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: theme.text }]}>Stock Inicial</Text>
                  <TextInput
                    style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
                    keyboardType="number-pad"
                    value={vipPlusStock}
                    onChangeText={setVipPlusStock}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Botón de Guardado */}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: Eventia.primary }, submitting && { opacity: 0.7 }]}
            activeOpacity={0.85}
            disabled={submitting}
            onPress={handleSave}>
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
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
  clearImageBtn: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 12, fontWeight: '700' },
  input: {
    height: 42,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
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
});

