import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { MaxContentWidth, Spacing, Eventia } from '@/constants/theme';
import { userService, type AdminUserItem } from '@/services/userService';
import { formatShortDate } from '@/data/events';

export default function AdminUsersScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user: currentAdmin, isAdmin, isLoading: authLoading } = useAuth();

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (e) {
      console.error('[AdminUsers Error]:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const handleToggleStatus = (u: AdminUserItem) => {
    const isCurrentUser =
      String(u.id) === String(currentAdmin?.id) ||
      u.email.toLowerCase() === currentAdmin?.email?.toLowerCase();

    if (isCurrentUser) {
      Alert.alert(
        'Acción no permitida',
        'No puedes inactivar tu propia cuenta de administrador en sesión activa.'
      );
      return;
    }

    const isCurrentlyActive = u.status === 'ACTIVE';
    const nextActive = !isCurrentlyActive;
    const actionLabel = isCurrentlyActive ? 'Inactivar Usuario' : 'Activar Usuario';
    const actionDesc = isCurrentlyActive
      ? `¿Deseas inactivar la cuenta de ${u.firstName} ${u.lastName}? El usuario no podrá iniciar sesión en la aplicación.`
      : `¿Deseas reactivar la cuenta de ${u.firstName} ${u.lastName}? El usuario podrá volver a ingresar al sistema normalmente.`;

    Alert.alert(actionLabel, actionDesc, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: actionLabel,
        style: isCurrentlyActive ? 'destructive' : 'default',
        onPress: async () => {
          try {
            const updated = await userService.updateUserStatus(u.id, nextActive);
            setUsers((prev) =>
              prev.map((item) =>
                String(item.id) === String(u.id)
                  ? { ...item, status: updated.status }
                  : item
              )
            );
            Alert.alert(
              'Estado Actualizado',
              nextActive
                ? 'La cuenta ha sido reactivada con éxito en la base de datos.'
                : 'La cuenta ha sido inactivada correctamente en la base de datos.'
            );
          } catch {
            Alert.alert('Error', 'No se pudo actualizar el estado de la cuenta en el servidor.');
          }
        },
      },
    ]);
  };

  const filteredUsers = users.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const doc = u.documentNumber || '';
    const role = (u.role || '').toLowerCase();
    return (
      fullName.includes(q) ||
      email.includes(q) ||
      doc.includes(q) ||
      role.includes(q)
    );
  });

  if (authLoading) {
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
          title: 'Gestión de Usuarios',
          headerShown: true,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
        }}
      />

      <View style={styles.contentWrap}>
        {/* Buscador de Usuarios */}
        <View style={styles.searchRow}>
          <View style={[styles.searchBox, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="search" size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Buscar por nombre, correo o DNI..."
              placeholderTextColor={theme.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={Eventia.primary} style={{ marginTop: 24 }} />
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Eventia.primary]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Ionicons name="people-outline" size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No se encontraron usuarios</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  Intenta cambiar el término de búsqueda.
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isCurrentUser =
                String(item.id) === String(currentAdmin?.id) ||
                item.email.toLowerCase() === currentAdmin?.email?.toLowerCase();
              const isActive = item.status === 'ACTIVE';
              const isUserAdmin = item.role === 'ADMIN';

              const initials = `${(item.firstName?.[0] || 'U').toUpperCase()}${(item.lastName?.[0] || '').toUpperCase()}`;

              return (
                <View
                  style={[
                    styles.userCard,
                    { backgroundColor: theme.backgroundElement },
                    !isActive && styles.inactiveCard,
                  ]}>
                  {/* Encabezado del usuario */}
                  <View style={styles.userTopRow}>
                    <View
                      style={[
                        styles.avatarCircle,
                        {
                          backgroundColor: isUserAdmin
                            ? Eventia.primary
                            : isActive
                              ? '#3B82F6'
                              : '#6B7280',
                        },
                      ]}>
                      <Text style={styles.avatarInitials}>{initials}</Text>
                    </View>

                    <View style={styles.userInfo}>
                      <View style={styles.userNameRow}>
                        <Text style={[styles.userName, { color: theme.text }]}>
                          {item.firstName} {item.lastName}
                        </Text>
                        {isCurrentUser && (
                          <View style={styles.youBadge}>
                            <Text style={styles.youBadgeText}>Tú</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                        {item.email}
                      </Text>
                    </View>

                    {/* Badges de Rol y Estado */}
                    <View style={styles.badgesCol}>
                      <View
                        style={[
                          styles.roleBadge,
                          {
                            backgroundColor: isUserAdmin
                              ? 'rgba(99, 102, 241, 0.15)'
                              : 'rgba(59, 130, 246, 0.1)',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.roleBadgeText,
                            { color: isUserAdmin ? Eventia.primary : '#3B82F6' },
                          ]}>
                          {item.role}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: isActive
                              ? 'rgba(16, 185, 129, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.statusBadgeText,
                            { color: isActive ? '#10B981' : '#EF4444' },
                          ]}>
                          {isActive ? 'ACTIVO' : 'INACTIVO'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Fila con detalles: Documento, Teléfono, Fecha */}
                  <View style={[styles.detailsRow, { backgroundColor: theme.background }]}>
                    <View style={styles.detailItem}>
                      <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                        {item.documentType || 'DNI'}
                      </Text>
                      <Text style={[styles.detailValue, { color: theme.text }]}>
                        {item.documentNumber || 'N/D'}
                      </Text>
                    </View>

                    <View style={styles.detailDivider} />

                    <View style={styles.detailItem}>
                      <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                        Teléfono
                      </Text>
                      <Text style={[styles.detailValue, { color: theme.text }]}>
                        {item.phoneNumber || 'N/D'}
                      </Text>
                    </View>

                    <View style={styles.detailDivider} />

                    <View style={styles.detailItem}>
                      <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                        Registro
                      </Text>
                      <Text style={[styles.detailValue, { color: theme.text }]}>
                        {item.createdAt ? formatShortDate(String(item.createdAt).slice(0, 10)) : 'Reciente'}
                      </Text>
                    </View>
                  </View>

                  {/* Botón único de Acción: Inactivar o Activar */}
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={[
                        styles.statusActionBtn,
                        {
                          backgroundColor: isActive
                            ? 'rgba(239, 68, 68, 0.12)'
                            : 'rgba(16, 185, 129, 0.12)',
                          borderColor: isActive
                            ? 'rgba(239, 68, 68, 0.35)'
                            : 'rgba(16, 185, 129, 0.35)',
                        },
                        isCurrentUser && { opacity: 0.4 },
                      ]}
                      disabled={isCurrentUser}
                      activeOpacity={0.8}
                      onPress={() => handleToggleStatus(item)}>
                      <Ionicons
                        name={
                          isCurrentUser
                            ? 'shield-checkmark'
                            : isActive
                              ? 'ban-outline'
                              : 'checkmark-circle-outline'
                        }
                        size={16}
                        color={isCurrentUser ? theme.textSecondary : isActive ? '#EF4444' : '#10B981'}
                      />
                      <Text
                        style={[
                          styles.statusActionBtnText,
                          {
                            color: isCurrentUser
                              ? theme.textSecondary
                              : isActive
                                ? '#EF4444'
                                : '#10B981',
                          },
                        ]}>
                        {isCurrentUser
                          ? 'Tu Sesión Actual (Protegida)'
                          : isActive
                            ? 'Inactivar Usuario'
                            : 'Activar Usuario'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  deniedTitle: { fontSize: 20, fontWeight: '800', marginTop: 12 },
  primaryBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, marginTop: 16 },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  contentWrap: {
    flex: 1,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  searchRow: { marginBottom: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  searchInput: { flex: 1, fontSize: 13, height: '100%' },
  listContent: { gap: 12, paddingBottom: 32 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySubtitle: { fontSize: 12 },
  userCard: {
    padding: 14,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  inactiveCard: {
    opacity: 0.75,
    borderStyle: 'dashed',
  },
  userTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  userInfo: { flex: 1, gap: 2 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { fontSize: 14, fontWeight: '800' },
  youBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    backgroundColor: 'rgba(99,102,241,0.2)',
  },
  youBadgeText: { color: Eventia.primary, fontSize: 10, fontWeight: '800' },
  userEmail: { fontSize: 12 },
  badgesCol: { alignItems: 'flex-end', gap: 4 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  roleBadgeText: { fontSize: 10, fontWeight: '800' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusBadgeText: { fontSize: 9, fontWeight: '800' },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  detailItem: { flex: 1, alignItems: 'center', gap: 2 },
  detailLabel: { fontSize: 10, fontWeight: '600' },
  detailValue: { fontSize: 11, fontWeight: '700' },
  detailDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.08)' },
  actionsRow: {
    flexDirection: 'row',
  },
  statusActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
