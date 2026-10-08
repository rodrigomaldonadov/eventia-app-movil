import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
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

export default function RegisterScreen() {
  const router = useRouter();
  const eventia = useEventiaTheme();
  const form = useRegisterForm();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setServerError(null);
    if (!form.validateAll()) return;

    try {
      setSubmitting(true);
      const fullName = `${form.values.firstName} ${form.values.lastName}`.trim();
      await login({
        fullName: fullName || form.values.email.split('@')[0],
        email: form.values.email.trim().toLowerCase(),
      });
      router.replace('/');
    } catch (e) {
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
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <ThemedText type="subtitle">Crea tu cuenta</ThemedText>
            <ThemedText themeColor="textSecondary">
              Regístrate para comprar entradas y guardar tus eventos.
            </ThemedText>

            <PersonalDataSection {...form} />
            <AccountDataSection {...form} />

            {serverError ? (
              <ThemedText type="small" style={{ color: ERROR_COLOR }}>
                {serverError}
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