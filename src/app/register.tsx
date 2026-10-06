import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { FormInput } from '@/components/ui/FormInput';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { Checkbox } from '@/components/ui/Checkbox';
import { authService } from '@/services/authService';

export default function RegisterScreen() {
  const router = useRouter();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // UI state toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Field validation error states
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Por favor ingresa tu nombre completo';
    }

    if (!email.trim()) {
      newErrors.email = 'Por favor ingresa tu correo electrónico';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 8) {
      newErrors.password = 'La contraseña debe tener mínimo 8 caracteres';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Por favor confirma tu contraseña';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!termsAccepted) {
      newErrors.terms = 'Debes aceptar los términos y condiciones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await authService.register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        termsAccepted,
      });

      Alert.alert(
        '¡Registro Exitoso!',
        response.message || 'Tu cuenta en Eventia ha sido creada correctamente.',
        [
          {
            text: 'Continuar',
            onPress: () => router.push('/'),
          },
        ]
      );
    } catch (err) {
      const message = authService.getErrorMessage(err);
      Alert.alert(
        'Aviso de Registro',
        `${message}\n\n(Valores validados correctamente. Configura la URL de tu API backend en src/services/api.ts para conectarlo con tu base de datos)`,
        [{ text: 'Entendido' }]
      );
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
            Crear Cuenta
          </Text>

          {/* Subtitle */}
          <Text className="text-base text-slate-500 mt-1 mb-6">
            Únete a Eventia para conseguir tus entradas
          </Text>

          {/* Input: Nombre completo */}
          <FormInput
            label="Nombre completo"
            placeholder="ej. Sofía Martínez"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
            }}
            error={errors.fullName}
            leftIcon={<Ionicons name="person-outline" size={20} color="#94A3B8" />}
            autoCapitalize="words"
            returnKeyType="next"
          />

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
            placeholder="Mínimo 8 caracteres"
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
            returnKeyType="next"
          />

          {/* Password Strength Meter */}
          <PasswordStrength password={password} />

          {/* Input: Confirmar contraseña */}
          <FormInput
            label="Confirmar contraseña"
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) {
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }
            }}
            error={errors.confirmPassword}
            secureTextEntry={!showConfirmPassword}
            leftIcon={<Ionicons name="refresh-outline" size={20} color="#94A3B8" />}
            rightIcon={
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#64748B"
              />
            }
            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
            autoCapitalize="none"
            returnKeyType="done"
          />

          {/* Submit Button */}
          <Pressable
            onPress={handleRegister}
            disabled={loading}
            className={`w-full bg-indigo-600 py-4 rounded-2xl flex-row items-center justify-center mt-2 shadow-sm ${
              loading ? 'opacity-70' : 'active:opacity-85'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text className="text-white font-bold text-base mr-2">
                  Registrarme
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </>
            )}
          </Pressable>

          {/* Security Badge */}
          <View className="w-full bg-sky-50/70 rounded-2xl py-3 px-4 flex-row items-center justify-center mt-3 border border-sky-100/60">
            <Ionicons name="shield-checkmark-outline" size={18} color="#0D9488" />
            <Text className="text-xs text-slate-600 font-medium ml-2">
              Tus datos y compras protegidas con cifrado seguro
            </Text>
          </View>

          {/* Login Footer Link */}
          <View className="flex-row items-center justify-center mt-8 mb-4">
            <Text className="text-sm text-slate-600">
              ¿Ya tienes cuenta?{' '}
            </Text>
            <Pressable onPress={() => router.push('/')}>
              <Text className="text-sm text-indigo-600 font-bold">
                Iniciar Sesión
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
