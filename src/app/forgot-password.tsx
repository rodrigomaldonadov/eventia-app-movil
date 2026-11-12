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
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { authService } from '@/services/authService';
import { requestPasswordReset, resetPassword } from '@/services/user-storage';
import { normalizeEmail, validateEmail, validateNewPassword } from '@/utils/auth-validation';

const PRIMARY = '#4F46E5';
const INK = '#091A33';
const ERROR = '#B42318';
const isBackendConfigured = Boolean(process.env.EXPO_PUBLIC_API_URL);

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { logout } = useAuth();

  // Paso 1: 'EMAIL', Paso 2: 'OTP', Paso 3: 'DONE'
  const [step, setStep] = useState<'EMAIL' | 'OTP' | 'DONE'>('EMAIL');

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Paso 1: Solicitar código OTP al correo
  const handleRequestOtp = async () => {
    if (loading) return;
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setError(null);
    setInfoMessage(null);
    setLoading(true);

    const normEmail = normalizeEmail(email);

    try {
      const normalized = normalizeEmail(email);

      if (isBackendConfigured) {
        const response = await authService.requestPasswordReset(normalized);
        setDemoCode(response.code);
        return;
      }

      const nextCode = await requestPasswordReset(normalized);
      if (!nextCode) {
        setError('No hay una cuenta local con ese correo. Regístrate primero.');
        return;
      }
      setDemoCode(nextCode);
    } catch (caught) {
      setError(
        authService.getErrorMessage(caught) ||
          'No pudimos generar el código. Intenta de nuevo.',
      );
      setLoading(false);
    }
  };

  // Paso 2: Validar OTP y restablecer contraseña
  const handleResetWithOtp = async () => {
    if (loading) return;

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError('Ingresa el código OTP de 6 dígitos recibido.');
      return;
    }

    const passwordError = validateNewPassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setError(null);
    setLoading(true);

    const normEmail = normalizeEmail(email);

    try {
<<<<<<< HEAD
      const normalized = normalizeEmail(email);

      if (isBackendConfigured) {
        await authService.resetPassword(normalized, code.trim(), password);
      } else {
        await resetPassword(normalized, code, password);
      }

      await logout();
      setDone(true);
    } catch (caught) {
      setError(
        authService.getErrorMessage(caught) ||
          (caught instanceof Error ? caught.message : 'No pudimos cambiar la contraseña.'),
      );
=======
      let resetOk = false;

      // 1. Llamar al backend para validar OTP y actualizar contraseña
      try {
        const response = await api.post('/auth/reset-password', {
          email: normEmail,
          code: otpCode.trim(),
          newPassword: password,
        });
        if (response.data && response.data.success) {
          resetOk = true;
        }
      } catch (beErr: any) {
        const msg = beErr?.response?.data?.message;
        if (msg) {
          setError(msg);
          setLoading(false);
          return;
        }
      }

      // 2. Sincronizar en almacenamiento local
      try {
        await resetPasswordLocal(normEmail, otpCode.trim(), password);
        resetOk = true;
      } catch (localErr: any) {
        if (!resetOk) {
          await directResetPassword(normEmail, password);
        }
      }

      await logout();
      setStep('DONE');
    } catch (caught: any) {
      setError(caught?.message || 'No se pudo restablecer la contraseña. Verifica el código OTP.');
>>>>>>> origin/feat/implGeneral
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
            <View style={styles.content}>
              {/* Ícono de cabecera */}
              <View
                style={[
                  styles.icon,
                  {
                    backgroundColor:
                      step === 'DONE'
                        ? isDark
                          ? '#064E3B'
                          : '#D1FAE5'
                        : isDark
                        ? '#1E1B4B'
                        : '#E8EEFF',
                  },
                ]}>
                <Ionicons
                  name={
                    step === 'DONE'
                      ? 'checkmark-circle'
                      : step === 'OTP'
                      ? 'shield-checkmark'
                      : 'key'
                  }
                  size={32}
                  color={step === 'DONE' ? '#10B981' : PRIMARY}
                />
              </View>

              {/* Título y subtítulo dinámico */}
              <Text style={[styles.title, { color: theme.text }]}>
                {step === 'DONE'
                  ? '¡Contraseña restablecida!'
                  : step === 'OTP'
                  ? 'Verificación con OTP'
                  : 'Recuperar contraseña'}
              </Text>

              <Text style={[styles.description, { color: theme.textSecondary }]}>
                {step === 'DONE'
                  ? 'Tu contraseña ha sido actualizada con éxito y te enviamos una notificación de seguridad por correo. Ya puedes iniciar sesión.'
                  : step === 'OTP'
                  ? `Ingresa el código OTP de 6 dígitos enviado a ${email} y define tu nueva contraseña.`
                  : 'Ingresa el correo electrónico de tu cuenta. Si está registrada, te enviaremos un código OTP para cambiar tu contraseña.'}
              </Text>

              {/* PASO 1: Ingreso de correo para solicitar OTP */}
              {step === 'EMAIL' && (
                <View style={styles.form}>
                  <View style={styles.fieldGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Correo Electrónico</Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.backgroundElement,
                          color: theme.text,
                          borderColor: isDark ? '#374151' : '#CBD5E1',
                        },
                      ]}
                      value={email}
                      onChangeText={(value) => {
                        setEmail(value);
                        setError(null);
                      }}
                      placeholder="nombre@correo.com"
                      placeholderTextColor={theme.textSecondary}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                      accessibilityLabel="Correo electrónico"
                    />
                  </View>

                  <View
                    style={[
                      styles.securityInfo,
                      {
                        backgroundColor: isDark ? 'rgba(79, 70, 229, 0.12)' : '#EEF2FF',
                        borderColor: isDark ? 'rgba(79, 70, 229, 0.3)' : '#C7D2FE',
                      },
                    ]}>
                    <Ionicons name="mail-outline" size={16} color={PRIMARY} />
                    <Text style={[styles.securityText, { color: isDark ? '#C7D2FE' : '#3730A3' }]}>
                      El código OTP se enviará mediante la API REST de Gmail (puerto HTTPS 443).
                    </Text>
                  </View>

                  {error ? (
                    <Text style={styles.error} accessibilityRole="alert">
                      {error}
                    </Text>
                  ) : null}

                  <Pressable
                    style={({ pressed }) => [
                      styles.button,
                      (pressed || loading) && styles.pressed,
                    ]}
<<<<<<< HEAD
                    value={email}
                    onChangeText={(value) => { setEmail(value); setError(null); }}
                    editable={!demoCode}
                    placeholder="nombre@correo.com"
                    placeholderTextColor={theme.textSecondary}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    accessibilityLabel="Correo electrónico"
                  />

                  {demoCode ? (
                    <>
                      <View style={[styles.demoBox, { backgroundColor: isDark ? '#1E1B4B' : '#EDEBFF' }]}>
                        <Text style={styles.demoTitle}>Modo demostración</Text>
                        <Text style={[styles.demoText, { color: isDark ? '#C7D2FE' : '#403B68' }]}>
                          No hay servicio de correo configurado. Tu código de recuperación es <Text style={styles.demoCode}>{demoCode}</Text>. Vence en 10 minutos.
                        </Text>
                      </View>
                      <Text style={[styles.label, { color: theme.text }]}>Código de recuperación</Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: theme.backgroundElement,
                            color: theme.text,
                            borderColor: isDark ? '#374151' : '#CBD5E1',
                          },
                        ]}
                        value={code}
                        onChangeText={(value) => { setCode(value); setError(null); }}
                        placeholder="000000"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="number-pad"
                        maxLength={6}
                        accessibilityLabel="Código de recuperación"
                      />
                      <Text style={[styles.label, { color: theme.text }]}>Nueva contraseña</Text>
                      <View
                        style={[
                          styles.inputWrapper,
                          {
                            backgroundColor: theme.backgroundElement,
                            borderColor: isDark ? '#374151' : '#CBD5E1',
                          },
                        ]}>
                        <TextInput
                          style={[styles.inputInner, { color: theme.text }]}
                          value={password}
                          onChangeText={(value) => { setPassword(value); setError(null); }}
                          placeholder="Mínimo 8 caracteres, letras y números"
                          placeholderTextColor={theme.textSecondary}
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          accessibilityLabel="Nueva contraseña"
                        />
                        <Pressable
                          onPress={() => setShowPassword((v) => !v)}
                          hitSlop={8}
                          accessibilityRole="button"
                          accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                          <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={18}
                            color={theme.textSecondary}
                          />
                        </Pressable>
                      </View>
                      <Text style={[styles.label, { color: theme.text }]}>Confirmar contraseña</Text>
                      <View
                        style={[
                          styles.inputWrapper,
                          {
                            backgroundColor: theme.backgroundElement,
                            borderColor: isDark ? '#374151' : '#CBD5E1',
                          },
                        ]}>
                        <TextInput
                          style={[styles.inputInner, { color: theme.text }]}
                          value={confirmPassword}
                          onChangeText={(value) => { setConfirmPassword(value); setError(null); }}
                          placeholder="Repite tu contraseña"
                          placeholderTextColor={theme.textSecondary}
                          secureTextEntry={!showConfirmPassword}
                          autoCapitalize="none"
                          accessibilityLabel="Confirmar contraseña"
                        />
                        <Pressable
                          onPress={() => setShowConfirmPassword((v) => !v)}
                          hitSlop={8}
                          accessibilityRole="button"
                          accessibilityLabel={
                            showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'
                          }>
                          <Ionicons
                            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={18}
                            color={theme.textSecondary}
                          />
                        </Pressable>
                      </View>
                    </>
                  ) : null}

                  {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
                  <Pressable style={({ pressed }) => [styles.button, (pressed || loading) && styles.pressed]} disabled={loading} onPress={demoCode ? handleReset : handleRequest} accessibilityRole="button">
                    {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{demoCode ? 'Cambiar contraseña' : 'Continuar'}</Text>}
=======
                    disabled={loading}
                    onPress={handleRequestOtp}
                    accessibilityRole="button">
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.buttonText}>Enviar Código OTP</Text>
                    )}
>>>>>>> origin/feat/implGeneral
                  </Pressable>
                </View>
              )}

              {/* PASO 2: Ingreso de código OTP y nueva contraseña */}
              {step === 'OTP' && (
                <View style={styles.form}>
                  {infoMessage ? (
                    <View
                      style={[
                        styles.noticeBox,
                        {
                          backgroundColor: isDark ? '#1E293B' : '#F0FDF4',
                          borderColor: isDark ? '#334155' : '#BBF7D0',
                        },
                      ]}>
                      <Ionicons name="information-circle-outline" size={16} color="#16A34A" />
                      <Text style={[styles.noticeText, { color: isDark ? '#86EFAC' : '#15803D' }]}>
                        {infoMessage}
                      </Text>
                    </View>
                  ) : null}

                  {/* Campo de Código OTP */}
                  <View style={styles.fieldGroup}>
                    <View style={styles.fieldHeaderRow}>
                      <Text style={[styles.label, { color: theme.text }]}>Código OTP (6 dígitos)</Text>
                      <Pressable
                        onPress={() => {
                          setStep('EMAIL');
                          setError(null);
                        }}>
                        <Text style={[styles.inlineLink, { color: PRIMARY }]}>Cambiar correo</Text>
                      </Pressable>
                    </View>
                    <TextInput
                      style={[
                        styles.otpInput,
                        {
                          backgroundColor: theme.backgroundElement,
                          color: PRIMARY,
                          borderColor: isDark ? '#4338CA' : '#A5B4FC',
                        },
                      ]}
                      value={otpCode}
                      onChangeText={(value) => {
                        setOtpCode(value);
                        setError(null);
                      }}
                      placeholder="000000"
                      placeholderTextColor={theme.textSecondary}
                      keyboardType="number-pad"
                      maxLength={6}
                      accessibilityLabel="Código OTP de 6 dígitos"
                    />
                  </View>

                  {/* Nueva Contraseña */}
                  <View style={styles.fieldGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Nueva contraseña</Text>
                    <View
                      style={[
                        styles.passwordWrapper,
                        {
                          backgroundColor: theme.backgroundElement,
                          borderColor: isDark ? '#374151' : '#CBD5E1',
                        },
                      ]}>
                      <TextInput
                        style={[styles.passwordInput, { color: theme.text }]}
                        value={password}
                        onChangeText={(value) => {
                          setPassword(value);
                          setError(null);
                        }}
                        placeholder="Mínimo 8 caracteres, números y letras"
                        placeholderTextColor={theme.textSecondary}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        accessibilityLabel="Nueva contraseña"
                      />
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        hitSlop={8}
                        style={styles.eyeBtn}>
                        <Ionicons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={18}
                          color={theme.textSecondary}
                        />
                      </Pressable>
                    </View>
                  </View>

                  {/* Confirmar Contraseña */}
                  <View style={styles.fieldGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Confirmar contraseña</Text>
                    <View
                      style={[
                        styles.passwordWrapper,
                        {
                          backgroundColor: theme.backgroundElement,
                          borderColor: isDark ? '#374151' : '#CBD5E1',
                        },
                      ]}>
                      <TextInput
                        style={[styles.passwordInput, { color: theme.text }]}
                        value={confirmPassword}
                        onChangeText={(value) => {
                          setConfirmPassword(value);
                          setError(null);
                        }}
                        placeholder="Repite la nueva contraseña"
                        placeholderTextColor={theme.textSecondary}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        accessibilityLabel="Confirmar contraseña"
                      />
                      <Pressable
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        hitSlop={8}
                        style={styles.eyeBtn}>
                        <Ionicons
                          name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={18}
                          color={theme.textSecondary}
                        />
                      </Pressable>
                    </View>
                  </View>

                  {error ? (
                    <Text style={styles.error} accessibilityRole="alert">
                      {error}
                    </Text>
                  ) : null}

                  <Pressable
                    style={({ pressed }) => [
                      styles.button,
                      (pressed || loading) && styles.pressed,
                    ]}
                    disabled={loading}
                    onPress={handleResetWithOtp}
                    accessibilityRole="button">
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.buttonText}>Restablecer Contraseña</Text>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={handleRequestOtp}
                    disabled={loading}
                    style={styles.resendBtn}>
                    <Text style={[styles.resendText, { color: isDark ? '#818CF8' : PRIMARY }]}>
                      ¿No recibiste el código? Reenviar OTP
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* PASO 3: Éxito */}
              {step === 'DONE' && (
                <View style={styles.form}>
                  <Pressable
                    style={styles.button}
                    onPress={() => router.replace('/login')}
                    accessibilityRole="button">
                    <Text style={styles.buttonText}>Iniciar sesión ahora</Text>
                  </Pressable>
                </View>
              )}

              {step !== 'DONE' && (
                <Link href="/login" asChild>
                  <Pressable style={styles.backLink} accessibilityRole="link">
                    <Ionicons name="arrow-back" size={16} color={isDark ? '#818CF8' : PRIMARY} />
                    <Text style={[styles.backText, { color: isDark ? '#818CF8' : PRIMARY }]}>
                      Volver a iniciar sesión
                    </Text>
                  </Pressable>
                </Link>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', padding: 20 },
<<<<<<< HEAD
  content: { width: '100%', maxWidth: 420, paddingTop: 42 },
  icon: { width: 58, height: 58, borderRadius: 17, backgroundColor: '#E8EEFF', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 23, fontWeight: '800', color: INK, textAlign: 'center' },
  description: { fontSize: 13, color: '#626A7F', textAlign: 'center', lineHeight: 19, marginTop: 7, marginBottom: 27 },
  form: { gap: 8 },
  label: { color: INK, fontSize: 12, fontWeight: '600', marginTop: 5 },
  input: { height: 46, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8EAF2', borderRadius: 11, paddingHorizontal: 13, fontSize: 13, color: INK },
  inputWrapper: { height: 46, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 11, paddingHorizontal: 13 },
  inputInner: { flex: 1, height: '100%', paddingVertical: 0, fontSize: 13 },
  disabledInput: { backgroundColor: '#F0F1F7', color: '#626A7F' },
  demoBox: { borderRadius: 12, backgroundColor: '#EDEBFF', padding: 13, marginVertical: 8 },
  demoTitle: { fontSize: 12, fontWeight: '700', color: '#3525CD', marginBottom: 3 },
  demoText: { color: '#403B68', fontSize: 12, lineHeight: 18 },
  demoCode: { fontWeight: '800', letterSpacing: 2, color: '#3525CD' },
  error: { color: ERROR, fontSize: 12, marginTop: 4 },
  button: { minHeight: 46, borderRadius: 10, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', marginTop: 11 },
=======
  content: { width: '100%', maxWidth: 420, paddingTop: 36 },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 18,
  },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  description: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 8,
    marginBottom: 24,
  },
  form: { gap: 12 },
  fieldGroup: { gap: 4 },
  fieldHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inlineLink: {
    fontSize: 12,
    fontWeight: '600',
  },
  label: { fontSize: 12, fontWeight: '600' },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  otpInput: {
    height: 48,
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 8,
  },
  passwordWrapper: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    height: 44,
    fontSize: 13,
  },
  eyeBtn: {
    padding: 4,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  securityText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
  error: { color: ERROR, fontSize: 12, marginTop: 4, textAlign: 'center' },
  button: {
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
>>>>>>> origin/feat/implGeneral
  buttonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  pressed: { opacity: 0.75 },
  resendBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  resendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
    padding: 8,
  },
  backText: { fontSize: 13, fontWeight: '600' },
});