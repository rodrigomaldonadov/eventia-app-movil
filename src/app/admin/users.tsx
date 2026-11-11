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
import {
  getAllUsers,
  toggleUserStatus,
  updateUserRole,
  type StoredUserPublic,
} from '@/services/user-storage';
import { formatShortDate } from '@/data/events';

export default function AdminUsersScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user: currentAdmin, isAdmin, isLoading: authLoading } = useAuth();

  const [users, setUsers] = useState<StoredUserPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      const data = await getAllUsers();
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

  const handleToggleRole = (u: StoredUserPublic) => {
    if (u.id === currentAdmin?.id) {
      Alert.alert('Acción no permitida', 'No puedes cambiar tu propio rol de administrador.');
      return;
    }

    const nextRole = u.role === 'ADMIN' ? 'CLIENT' : 'ADMIN';
    Alert.alert(
      'Cambiar Rol de Usuario',
      `¿Deseas cambiar el rol de ${u.firstName} ${u.lastName} a ${nextRole}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const updated = await updateUserRole(u.id, nextRole);
              setUsers((prev) => prev.map((item) => (item.id === u.id ? updated : item)));
              Alert.alert('Rol Actualizado', `El usuario ahora tiene rol ${nextRole}.`);
            } catch {
              Alert.alert('Error', 'No se pudo cambiar el rol.');
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = (u: StoredUserPublic) => {
    if (u.id === currentAdmin?.id) {
      Alert.alert('Acción no permitida', 'No puedes desactivar tu propia cuenta activa.');
      return;
    }

    const isCurrentlyActive = u.status === 'ACTIVE';
    const nextStatus = isCurrentlyActive ? 'INACTIVE' : 'ACTIVE';
    const actionLabel = isCurrentlyActive ? 'Desactivar Cuenta' : 'Restaurar Cuenta';
    const actionDesc = isCurrentlyActive
      ? `¿Deseas desactivar la cuenta de ${u.firstName} ${u.lastName}? El usuario no podrá iniciar sesión hasta que sea restaurado.`
      : `¿Deseas restaurar la cuenta de ${u.firstName} ${u.lastName}? Volverá a tener acceso normal a la app.`;

    Alert.alert(actionLabel, actionDesc, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: actionLabel,
        style: isCurrentlyActive ? 'destructive' : 'default',
        onPress: async () => {
          try {
            const updated = await toggleUserStatus(u.id, nextStatus);
            setUsers((prev) => prev.map((item) => (item.id === u.id ? updated : item)));
            Alert.alert(
              'Estado Actualizado',
              isCurrentlyActive
                ? 'La cuenta ha sido desactivada correctamente.'
                : 'La cuenta ha sido restaurada con éxito.'
            );
          } catch {
            Alert.alert('Error', 'No se pudo actualizar el estado de la cuenta.');
          }
        },
      },
    ]);
  };

  const filteredUsers = users.filter((u) => {
    const q = search.trim().toLowerCase();
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    return (
      q.length === 0 ||
      fullName.includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.documentNumber.includes(q) ||
      u.role.toLowerCase().includes(q)
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
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Eventia.primary]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Ionicons name="people-outline" size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No se encontraron usuarios</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isCurrentUser = item.id === currentAdmin?.id;
              const isActive = item.status === 'ACTIVE';
              const isUserAdmin = item.role === 'ADMIN';

              return (
                <View
                  style={[
                    styles.userCard,
                    { backgroundColor: theme.backgroundElement },
                    !isActive && styles.inactiveCard,
                  ]}>
                  {/* Encabezado del usuario */}
                  <View style={styles.userTopRow}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarInitials}>
                        {item.firstName[0]}
                        {item.lastName[0]}
                      </Text>
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
                              ? 'rgba(79, 70, 229, 0.15)'
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
                        {item.documentType}
                      </Text>
                      <Text style={[styles.detailValue, { color: theme.text }]}>
                        {item.documentNumber}
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
                        {item.createdAt ? formatShortDate(item.createdAt.slice(0, 10)) : 'N/D'}
                      </Text>
                    </View>
                  </View>

                  {/* Botones de Gestión (Cambio de Rol y Desactivación / Restauración) */}
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}
                      onPress={() => handleToggleRole(item)}>
                      <Ionicons name="shield-outline" size={15} color={Eventia.primary} />
                      <Text style={[styles.actionBtnText, { color: Eventia.primary }]}>
                        {isUserAdmin ? 'Cambiar a CLIENT' : 'Hacer ADMIN'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        {
                          backgroundColor: isActive
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'rgba(16, 185, 129, 0.1)',
                        },
                      ]}
                      onPress={() => handleToggleStatus(item)}>
                      <Ionicons
                        name={isActive ? 'power-outline' : 'refresh-outline'}
                        size={15}
                        color={isActive ? '#EF4444' : '#10B981'}
                      />
                      <Text
                        style={[
                          styles.actionBtnText,
                          { color: isActive ? '#EF4444' : '#10B981' },
                        ]}>
                        {isActive ? 'Inactivar' : 'Restaurar Cuenta'}
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
    gap: 8,
    height: 42,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, fontSize: 13, paddingVertical: 0 },
  listContent: { paddingBottom: 32, gap: 14 },
  userCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 12,
  },
  inactiveCard: { opacity: 0.8, borderColor: 'rgba(239, 68, 68, 0.3)' },
  userTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Eventia.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  userInfo: { flex: 1 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { fontSize: 15, fontWeight: '800' },
  youBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  youBadgeText: { fontSize: 10, fontWeight: '700', color: '#10B981' },
  userEmail: { fontSize: 12, marginTop: 1 },
  badgesCol: { alignItems: 'flex-end', gap: 4 },
  roleBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  roleBadgeText: { fontSize: 10, fontWeight: '800' },
  statusBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  statusBadgeText: { fontSize: 9, fontWeight: '800' },
  detailsRow: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: { flex: 1, alignItems: 'center' },
  detailDivider: { width: 1, height: 22, backgroundColor: 'rgba(255,255,255,0.08)' },
  detailLabel: { fontSize: 10, fontWeight: '600' },
  detailValue: { fontSize: 12, fontWeight: '700', marginTop: 1 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  actionBtnText: { fontSize: 12, fontWeight: '700' },
  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '800' },
});

