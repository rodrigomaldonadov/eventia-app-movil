import { Link, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountDataSection } from '@/components/register/account-data-section';
import { ERROR_COLOR } from '@/components/register/form-field';
import { PersonalDataSection } from '@/components/register/personal-data-section';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useEventiaTheme } from '@/hooks/use-eventia-theme';
import { useRegisterForm } from '@/hooks/use-register-form';
import { registerUser, RegisterError, type RegisterUserData } from '@/services/user-storage';
import type { RegisterForm } from '@/types/register.types';
import { validateForm } from '@/utils/register-validation';

const ERROR_FIELD_ORDER: (keyof RegisterForm)[] = [
  'firstName',
  'lastName',
  'documentNumber',
  'birthDate',
  'phoneNumber',
  'email',
  'password',
  'confirmPassword',
];

export default function RegisterScreen() {
  const router = useRouter();
  const eventia = useEventiaTheme();
  const form = useRegisterForm();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [validationNotice, setValidationNotice] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<{ personal?: number; account?: number }>({});

  const scrollToFirstError = () => {
    const fresh = validateForm(form.values);
    const first = ERROR_FIELD_ORDER.find((k) => fresh[k]);
    if (!first) return;
    let y: number | undefined;
    if (first === 'email' || first === 'password' || first === 'confirmPassword') {
      y = sectionY.current.account;
    } else {
      y = sectionY.current.personal;
    }
    if (y !== undefined) {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - Spacing.two), animated: true });
    }
  };

  const handleSubmit = async () => {
    setServerError(null);
    setValidationNotice(false);
    if (!form.validateAll()) {
      setValidationNotice(true);
      scrollToFirstError();
      return;
    }
    try {
      setSubmitting(true);
      const userData: RegisterUserData = {
        firstName: form.values.firstName,
        lastName: form.values.lastName,
        documentType: form.values.documentType,
        documentNumber: form.values.documentNumber,
        birthDate: form.values.birthDate,
        phoneNumber: form.values.phoneNumber,
        email: form.values.email,
        password: form.values.password,
      };
      await registerUser(userData);
      const fullName = `${form.values.firstName} ${form.values.lastName}`.trim();
      // TODO(Integrante 1): reemplazar este login automático por el flujo real de sesión (token y redirección por rol).
      await login({
        fullName: fullName || form.values.email.split('@')[0],
        email: form.values.email.trim().toLowerCase(),
      });
      router.replace('/');
    } catch (e) {
      if (e instanceof RegisterError) {
        if (e.fields.email) form.setFieldError('email', e.fields.email);
        if (e.fields.documentNumber) form.setFieldError('documentNumber', e.fields.documentNumber);
        return;
      }
      setServerError(e instanceof Error ? e.message : 'No pudimos crear tu cuenta. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <ThemedText type="subtitle">Crea tu cuenta</ThemedText>
            <ThemedText themeColor="textSecondary">
              Regístrate para comprar entradas y guardar tus eventos.
            </ThemedText>

            <View
              collapsable={false}
              onLayout={(e) => {
                sectionY.current.personal = e.nativeEvent.layout.y;
              }}>
              <PersonalDataSection {...form} />
            </View>
            <View
              collapsable={false}
              onLayout={(e) => {
                sectionY.current.account = e.nativeEvent.layout.y;
              }}>
              <AccountDataSection {...form} />
            </View>

            {serverError ? (
              <ThemedText type="small" style={{ color: ERROR_COLOR }}>
                {serverError}
              </ThemedText>
            ) : null}

            {validationNotice ? (
              <ThemedText type="small" style={{ color: ERROR_COLOR }}>
                Revisa los campos marcados en rojo
              </ThemedText>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={submitting}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.submit,
                { backgroundColor: eventia.primary },
                (pressed || submitting) && styles.pressed,
              ]}>
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText type="smallBold" style={styles.submitLabel}>
                  Crear cuenta
                </ThemedText>
              )}
            </Pressable>

            <Link href="/login" asChild>
              <Pressable style={styles.loginLink}>
                <ThemedText type="small" themeColor="textSecondary">
                  ¿Ya tienes cuenta?{' '}
                  <ThemedText type="smallBold" style={{ color: eventia.primary }}>
                    Inicia sesión
                  </ThemedText>
                </ThemedText>
              </Pressable>
            </Link>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, alignItems: 'center' },
  safeArea: { flex: 1, width: '100%', maxWidth: MaxContentWidth },
  content: { padding: Spacing.three, gap: Spacing.four, paddingBottom: Spacing.six },
  submit: { alignItems: 'center', borderRadius: 14, paddingVertical: 16 },
  submitLabel: { color: '#FFFFFF' },
  pressed: { opacity: 0.7 },
  loginLink: { alignItems: 'center', paddingVertical: Spacing.two },
});
