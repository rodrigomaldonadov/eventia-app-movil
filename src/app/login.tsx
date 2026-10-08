import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormInput } from '@/components/ui/FormInput';
import { useAuth } from '@/hooks/use-auth';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Por favor ingresa tu correo electrónico';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const nameFromEmail = email.trim().split('@')[0];
      const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
      await login({
        fullName: formattedName,
        email: email.trim().toLowerCase(),
      });
      router.replace('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 32,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Navigation Bar with Back Button */}
          <View className="flex-row items-center justify-between mb-4">
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.push('/'))}
              className="w-10 h-10 rounded-full bg-white border border-slate-100 items-center justify-center shadow-xs active:bg-slate-100"
              accessibilityLabel="Volver"
            >
              <Ionicons name="arrow-back" size={20} color="#334155" />
            </Pressable>
          </View>

          {/* Heading */}
          <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Iniciar Sesión
          </Text>

          {/* Subtitle */}
          <Text className="text-base text-slate-500 mt-1 mb-6">
            Bienvenido de nuevo a Eventia
          </Text>

          {/* Input: Correo electrónico */}
          <FormInput
            label="Correo electrónico"
            placeholder="tu@correo.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={errors.email}
            leftIcon={<Ionicons name="at-outline" size={20} color="#94A3B8" />}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          {/* Input: Contraseña */}
          <FormInput
            label="Contraseña"
            placeholder="Tu contraseña"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors.password}
            secureTextEntry={!showPassword}
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#94A3B8" />}
            rightIcon={
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#64748B"
              />
            }
            onRightIconPress={() => setShowPassword(!showPassword)}
            autoCapitalize="none"
            returnKeyType="done"
          />

          {/* Submit Button */}
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            className={`w-full bg-indigo-600 py-4 rounded-2xl flex-row items-center justify-center mt-4 shadow-sm ${loading ? 'opacity-70' : 'active:opacity-85'
              }`}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text className="text-white font-bold text-base mr-2">
                  Ingresar
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </>
            )}
          </Pressable>

          {/* Register Footer Link */}
          <View className="flex-row items-center justify-center mt-8 mb-4">
            <Text className="text-sm text-slate-600">
              ¿No tienes una cuenta?{' '}
            </Text>
            <Pressable onPress={() => router.push('/register')}>
              <Text className="text-sm text-indigo-600 font-bold">
                Crear Cuenta
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
