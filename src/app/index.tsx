import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import GlobalHeader from '@/components/GlobalHeader';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-slate-50">
      {/* Global Header */}
      <GlobalHeader />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View className="bg-indigo-600 rounded-3xl p-6 shadow-md mb-6">
          <View className="self-start bg-indigo-500/50 px-3 py-1 rounded-full mb-3">
            <Text className="text-white text-xs font-semibold">
              Bienvenido a Eventia
            </Text>
          </View>

          <Text className="text-2xl font-black text-white leading-tight">
            Descubre y vive los mejores eventos cerca de ti
          </Text>

          <Text className="text-indigo-100 text-sm mt-2 mb-6">
            Entradas digitales, accesos exclusivos y la mejor experiencia para tus eventos favoritos.
          </Text>

          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.push('/register')}
              className="bg-white px-5 py-3 rounded-2xl flex-row items-center active:bg-slate-100"
            >
              <Text className="text-indigo-700 font-bold text-sm mr-2">
                Crear Cuenta
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#4338CA" />
            </Pressable>

            <Pressable
              onPress={() => router.push('/explore')}
              className="bg-indigo-700/60 px-5 py-3 rounded-2xl flex-row items-center active:bg-indigo-700"
            >
              <Text className="text-white font-semibold text-sm">
                Explorar
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
