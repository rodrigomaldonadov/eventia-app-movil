import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/use-auth';
import { requestPasswordReset, resetPassword } from '@/services/user-storage';
import { normalizeEmail, validateEmail, validateNewPassword } from '@/utils/auth-validation';

const PRIMARY = '#4F46E5';
const INK = '#091A33';
const ERROR = '#B42318';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleRequest = async () => {
    if (loading) return;
    const emailError = validateEmail(email);
    if (emailError) { setError(emailError); return; }
    setError(null);
    setLoading(true);
    try {
      const nextCode = await requestPasswordReset(normalizeEmail(email));
      if (!nextCode) {
        setError('No hay una cuenta local con ese correo. Regístrate primero.');
        return;
      }
      setDemoCode(nextCode);
    } catch {
      setError('No pudimos generar el código. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (loading) return;
    if (!/^\d{6}$/.test(code.trim())) { setError('Ingresa el código de 6 dígitos.'); return; }
    const passwordError = validateNewPassword(password);
    if (passwordError) { setError(passwordError); return; }
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden.'); return; }
    setError(null);
    setLoading(true);
    try {
      await resetPassword(normalizeEmail(email), code, password);
      await logout();
      setDone(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No pudimos cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.page}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
            <View style={styles.content}>
              <View style={styles.icon}><Ionicons name={done ? 'checkmark-circle-outline' : 'key-outline'} size={30} color={PRIMARY} /></View>
              <Text style={styles.title}>{done ? 'Contraseña actualizada' : 'Recupera tu contraseña'}</Text>
              <Text style={styles.description}>
                {done ? 'Ya puedes iniciar sesión con tu nueva contraseña.' : 'Ingresa el correo de tu cuenta para restablecer tu contraseña.'}
              </Text>

              {!done && (
                <View style={styles.form}>
                  <Text style={styles.label}>Correo Electrónico</Text>
                  <TextInput
                    style={[styles.input, !!demoCode && styles.disabledInput]}
                    value={email}
                    onChangeText={(value) => { setEmail(value); setError(null); }}
                    editable={!demoCode}
                    placeholder="nombre@correo.com"
                    placeholderTextColor="#8B91A1"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    accessibilityLabel="Correo electrónico"
                  />

                  {demoCode ? (
                    <>
                      <View style={styles.demoBox}>
                        <Text style={styles.demoTitle}>Modo demostración</Text>
                        <Text style={styles.demoText}>No hay servicio de correo configurado. Tu código local es <Text style={styles.demoCode}>{demoCode}</Text>. Vence en 10 minutos.</Text>
                      </View>
                      <Text style={styles.label}>Código de recuperación</Text>
                      <TextInput
                        style={styles.input}
                        value={code}
                        onChangeText={(value) => { setCode(value); setError(null); }}
                        placeholder="000000"
                        placeholderTextColor="#8B91A1"
                        keyboardType="number-pad"
                        maxLength={6}
                        accessibilityLabel="Código de recuperación"
                      />
                      <Text style={styles.label}>Nueva contraseña</Text>
                      <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={(value) => { setPassword(value); setError(null); }}
                        placeholder="Mínimo 8 caracteres, letras y números"
                        placeholderTextColor="#8B91A1"
                        secureTextEntry
                        autoCapitalize="none"
                        accessibilityLabel="Nueva contraseña"
                      />
                      <Text style={styles.label}>Confirmar contraseña</Text>
                      <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={(value) => { setConfirmPassword(value); setError(null); }}
                        placeholder="Repite tu contraseña"
                        placeholderTextColor="#8B91A1"
                        secureTextEntry
                        autoCapitalize="none"
                        accessibilityLabel="Confirmar contraseña"
                      />
                    </>
                  ) : null}

                  {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
                  <Pressable style={({ pressed }) => [styles.button, (pressed || loading) && styles.pressed]} disabled={loading} onPress={demoCode ? handleReset : handleRequest} accessibilityRole="button">
                    {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{demoCode ? 'Cambiar contraseña' : 'Continuar'}</Text>}
                  </Pressable>
                  {demoCode ? (
                    <Pressable onPress={handleRequest} disabled={loading} accessibilityRole="button" style={styles.secondaryButton}>
                      <Text style={styles.secondaryText}>Generar otro código</Text>
                    </Pressable>
                  ) : null}
                </View>
              )}

              {done ? (
                <Pressable style={styles.button} onPress={() => router.replace('/login')} accessibilityRole="button">
                  <Text style={styles.buttonText}>Iniciar sesión</Text>
                </Pressable>
              ) : (
                <Link href="/login" asChild>
                  <Pressable style={styles.backLink} accessibilityRole="link">
                    <Ionicons name="arrow-back" size={16} color={PRIMARY} />
                    <Text style={styles.backText}>Volver a iniciar sesión</Text>
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
  page: { flex: 1, backgroundColor: '#F8F9FF' },
  safeArea: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', padding: 20 },
  content: { width: '100%', maxWidth: 420, paddingTop: 42 },
  icon: { width: 58, height: 58, borderRadius: 17, backgroundColor: '#E8EEFF', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 23, fontWeight: '800', color: INK, textAlign: 'center' },
  description: { fontSize: 13, color: '#626A7F', textAlign: 'center', lineHeight: 19, marginTop: 7, marginBottom: 27 },
  form: { gap: 8 },
  label: { color: INK, fontSize: 12, fontWeight: '600', marginTop: 5 },
  input: { height: 46, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8EAF2', borderRadius: 11, paddingHorizontal: 13, fontSize: 13, color: INK },
  disabledInput: { backgroundColor: '#F0F1F7', color: '#626A7F' },
  demoBox: { borderRadius: 12, backgroundColor: '#EDEBFF', padding: 13, marginVertical: 8 },
  demoTitle: { fontSize: 12, fontWeight: '700', color: '#3525CD', marginBottom: 3 },
  demoText: { color: '#403B68', fontSize: 12, lineHeight: 18 },
  demoCode: { fontWeight: '800', letterSpacing: 2, color: '#3525CD' },
  error: { color: ERROR, fontSize: 12, marginTop: 4 },
  button: { minHeight: 46, borderRadius: 10, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', marginTop: 11 },
  buttonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  pressed: { opacity: 0.7 },
  secondaryButton: { alignItems: 'center', padding: 8 },
  secondaryText: { color: PRIMARY, fontSize: 12, fontWeight: '600' },
  backLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 22, padding: 8 },
  backText: { color: PRIMARY, fontSize: 12, fontWeight: '600' },
});
