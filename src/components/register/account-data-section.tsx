import { StyleSheet, View } from 'react-native';

import { FormField } from '@/components/register/form-field';
import type { SectionProps } from '@/components/register/personal-data-section';
import { SectionTitle } from '@/components/register/section-title';
import { Spacing } from '@/constants/theme';

export function AccountDataSection({ values, errors, setValue, markTouched }: SectionProps) {
  return (
    <View style={styles.section}>
      <SectionTitle title="Datos de la cuenta" />

      <FormField
        label="Correo electrónico"
        required
        value={values.email}
        error={errors.email}
        onChangeText={(t) => setValue('email', t)}
        onBlur={() => markTouched('email')}
        placeholder="correo@ejemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
      />

      <FormField
        label="Contraseña"
        required
        value={values.password}
        error={errors.password}
        onChangeText={(t) => setValue('password', t)}
        onBlur={() => markTouched('password')}
        placeholder="Mínimo 8 caracteres, letras y números"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
      />

      <FormField
        label="Confirmar contraseña"
        required
        value={values.confirmPassword}
        error={errors.confirmPassword}
        onChangeText={(t) => setValue('confirmPassword', t)}
        onBlur={() => markTouched('confirmPassword')}
        placeholder="Repite tu contraseña"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.three },
});