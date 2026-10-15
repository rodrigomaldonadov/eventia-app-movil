import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function GlobalHeader({ withTopInset = true }: { withTopInset?: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={withTopInset ? { paddingTop: Math.max(insets.top, 12) } : undefined}
      className="w-full bg-white px-5 pb-4 border-b border-slate-100 shadow-xs"
    >
      <View className="flex-row items-center justify-between pt-2">
        {/* Logo / Nombre */}
        <Pressable onPress={() => router.push('/')} hitSlop={8}>
          <Text className="text-2xl font-extrabold text-indigo-700 tracking-tight">
            Eventia
          </Text>
        </Pressable>

{/* Botón Registro */}
        <Pressable
              onPress={() => router.push('/register')}
              className="bg-indigo-700 px-5 py-3 rounded-2xl flex-row items-center active:bg-slate-100"
            >
              <Text className="text-white font-bold text-sm ">
                Home
              </Text>
        </Pressable>
{/* Botón Login */}
        <Pressable
              onPress={() => router.push('/register')}
              className="bg-indigo-700 px-5 py-3 rounded-2xl flex-row items-center active:bg-slate-100"
            >
              <Text className="text-white font-bold text-sm ">
                Iniciar Sesión
              </Text>
        </Pressable>
        {/* Botón Registro */}
        <Pressable
              onPress={() => router.push('/register')}
              className="bg-indigo-700 px-5 py-3 rounded-2xl flex-row items-center active:bg-slate-100"
            >
              <Text className="text-white font-bold text-sm ">
                Registro
              </Text>
        </Pressable>
      </View>
    </View>
  );
}