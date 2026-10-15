import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { verifyCredentials } from '@/services/user-storage';
import { normalizeEmail, validateEmail, validatePassword } from '@/utils/auth-validation';
import { useColorScheme } from 'react-native';

const PRIMARY = '#4F46E5';
const INK = '#091A33';
const MUTED = '#687086';
const ERROR = '#B42318';

export default function LoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) {
      setErrors({ email: emailError ?? undefined, password: passwordError ?? undefined });
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const account = await verifyCredentials(email, password);
      if (!account) {
        setErrors({ form: 'Correo o contraseña incorrectos. Intenta de nuevo.' });
        return;
      }
      await login({
        id: account.id,
        fullName: `${account.firstName} ${account.lastName}`.trim(),
        email: account.email,
      }, undefined, remember);
      router.replace('/');
    } catch {
      setErrors({ form: 'No pudimos iniciar sesión. Intenta de nuevo.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            <View style={styles.content}>
              <View style={styles.brandBlock}>
                <View style={styles.logoWrap}>
                  <View style={[styles.logo, { backgroundColor: isDark ? '#1E1B4B' : '#E8EEFF' }]}>
                    <Text style={styles.logoText}>E</Text>
                  </View>
                  <View style={[styles.logoDot, { borderColor: theme.background }]} />
                </View>
                <Text style={[styles.title, { color: theme.text }]}>Eventia</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Tu pasaporte a los mejores eventos y{'\n'}experiencias en vivo
                </Text>
              </View>

              <View style={styles.form}>
                <View>
                  <Text style={[styles.label, { color: theme.text }]}>Correo Electrónico</Text>
                  <View
                    style={[
                      styles.inputShell,
                      {
                        backgroundColor: theme.backgroundElement,
                        borderColor: isDark ? '#374151' : '#CBD5E1',
                      },
                      !!errors.email && styles.inputError,
                    ]}>
                    <Ionicons name="at-outline" size={18} color={theme.textSecondary} />
                    <TextInput
                      value={email}
                      onChangeText={(value) => {
                        setEmail(value);
                        setErrors((current) => ({ ...current, email: undefined, form: undefined }));
                      }}
                      placeholder="nombre@correo.com"
                      placeholderTextColor={theme.textSecondary}
                      style={[styles.input, { color: theme.text }]}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      textContentType="emailAddress"
                      returnKeyType="next"
                      accessibilityLabel="Correo electrónico"
                    />
                  </View>
                  {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                </View>

                <View>
                  <View style={styles.passwordHeading}>
                    <Text style={[styles.label, { color: theme.text }]}>Contraseña</Text>
                    <Link href="/forgot-password" asChild>
                      <Pressable accessibilityRole="link" hitSlop={8}>
                        <Text style={[styles.forgotLink, { color: isDark ? '#818CF8' : '#3929D4' }]}>
                          ¿Olvidaste tu contraseña?
                        </Text>
                      </Pressable>
                    </Link>
                  </View>
                  <View
                    style={[
                      styles.inputShell,
                      {
                        backgroundColor: theme.backgroundElement,
                        borderColor: isDark ? '#374151' : '#CBD5E1',
                      },
                      !!errors.password && styles.inputError,
                    ]}>
                    <Ionicons name="lock-closed-outline" size={18} color={theme.textSecondary} />
                    <TextInput
                      value={password}
                      onChangeText={(value) => {
                        setPassword(value);
                        setErrors((current) => ({ ...current, password: undefined, form: undefined }));
                      }}
                      placeholder="••••••••••••"
                      placeholderTextColor={theme.textSecondary}
                      style={[styles.input, { color: theme.text }]}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                      textContentType="password"
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit}
                      accessibilityLabel="Contraseña"
                    />
                    <Pressable
                      onPress={() => setShowPassword((value) => !value)}
                      accessibilityRole="button"
                      accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      hitSlop={8}>
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={19}
                        color={theme.textSecondary}
                      />
                    </Pressable>
                  </View>
                  {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                </View>

                <Pressable
                  style={styles.rememberRow}
                  onPress={() => setRemember((value) => !value)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: remember }}>
                  <View
                    style={[
                      styles.checkbox,
                      { borderColor: isDark ? '#4B5563' : '#9BA3B5' },
                      remember && styles.checkboxChecked,
                    ]}>
                    {remember && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                  </View>
                  <View style={styles.rememberCopy}>
                    <Text style={[styles.rememberTitle, { color: theme.text }]}>
                      Mantener sesión iniciada
                    </Text>
                    <Text style={[styles.rememberHint, { color: theme.textSecondary }]}>
                      Conserva tu acceso en este dispositivo
                    </Text>
                  </View>
                  <Ionicons name="lock-closed-outline" size={16} color={theme.text} />
                </Pressable>

                {errors.form ? (
                  <Text style={styles.formError} accessibilityRole="alert">
                    {errors.form}
                  </Text>
                ) : null}

                <Pressable
                  style={({ pressed }) => [styles.submit, (pressed || submitting) && styles.pressed]}
                  onPress={handleSubmit}
                  disabled={submitting}
                  accessibilityRole="button">
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <View style={styles.buttonInner}>
                      <Text style={styles.submitText}>Iniciar Sesión</Text>
                      <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                    </View>
                  )}
                </Pressable>
                <Link href="/register" asChild>
                  <Pressable style={styles.registerLink} accessibilityRole="link">
                    <Text style={[styles.registerText, { color: theme.textSecondary }]}>
                      ¿No tienes una cuenta?{' '}
                      <Text style={[styles.registerEmphasis, { color: isDark ? '#818CF8' : '#3929D4' }]}>
                        Regístrate
                      </Text>
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { flex: 1, backgroundColor: '#F8F9FF' },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 20, paddingBottom: 32 },
  content: { width: '100%', maxWidth: 420, paddingTop: 28 },
  brandBlock: { alignItems: 'center', marginBottom: 25 },
  logoWrap: { marginBottom: 11 },
  logo: { width: 52, height: 52, borderRadius: 15, backgroundColor: '#E8EEFF', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: PRIMARY, fontSize: 29, fontWeight: '800' },
  logoDot: { position: 'absolute', top: -4, right: -5, width: 12, height: 12, borderRadius: 6, backgroundColor: PRIMARY, borderWidth: 2, borderColor: '#F8F9FF' },
  title: { fontSize: 21, lineHeight: 28, fontWeight: '800', color: INK, letterSpacing: -0.4 },
  subtitle: { marginTop: 3, textAlign: 'center', color: '#535B73', fontSize: 12, lineHeight: 15 },
  form: { gap: 10 },
  label: { fontSize: 11, lineHeight: 12, fontWeight: '600', color: INK, marginBottom: 3 },
  inputShell: { minHeight: 40, borderRadius: 11, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EEF0F5', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputError: { borderColor: ERROR },
  input: { flex: 1, height: 40, paddingVertical: 0, color: INK, fontSize: 12 },
  passwordHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  forgotLink: { fontSize: 11, fontWeight: '600', color: '#3929D4', marginBottom: 3 },
  errorText: { color: ERROR, fontSize: 11, marginTop: 4 },
  formError: { color: ERROR, fontSize: 12, textAlign: 'center' },
  rememberRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 2, gap: 9, minHeight: 30 },
  checkbox: { width: 16, height: 16, borderRadius: 5, borderWidth: 1, borderColor: '#9BA3B5', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#3929D4', borderColor: '#3929D4' },
  rememberCopy: { flex: 1 },
  rememberTitle: { fontSize: 11, fontWeight: '600', color: INK },
  rememberHint: { fontSize: 10, color: MUTED },
  submit: { minHeight: 43, borderRadius: 9, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', shadowColor: '#3525CD', shadowOpacity: 0.2, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  pressed: { opacity: 0.75 },
  buttonInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  submitText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  registerLink: { alignItems: 'center', paddingVertical: 2 },
  registerText: { fontSize: 12, color: '#5B6076' },
  registerEmphasis: { color: '#3929D4', fontWeight: '700' },
});
