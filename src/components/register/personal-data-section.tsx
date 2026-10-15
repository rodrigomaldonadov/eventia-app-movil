import { StyleSheet, View } from 'react-native';

import { FormField } from '@/components/register/form-field';
import { SectionTitle } from '@/components/register/section-title';
import { SegmentedField } from '@/components/register/segmented-field';
import { Spacing } from '@/constants/theme';
import type { DocumentType, RegisterErrors, RegisterForm } from '@/types/register.types';

const DOCUMENT_OPTIONS = [
  { value: 'DNI', label: 'DNI' },
  { value: 'CE', label: 'Carnet de extranjería' },
] as const;

export interface SectionProps {
  values: RegisterForm;
  errors: RegisterErrors;
  setValue: <K extends keyof RegisterForm>(name: K, value: RegisterForm[K]) => void;
  markTouched: (name: keyof RegisterForm) => void;
}

export function PersonalDataSection({ values, errors, setValue, markTouched }: SectionProps) {
  return (
    <View style={styles.section}>
      <SectionTitle title="Datos personales" hint="* Obligatorios" />

      <FormField
        label="Nombres"
        required
        value={values.firstName}
        error={errors.firstName}
        onChangeText={(t) => setValue('firstName', t)}
        onBlur={() => markTouched('firstName')}
        placeholder="Carlos Eduardo"
        autoCapitalize="words"
        autoComplete="given-name"
        textContentType="givenName"
        returnKeyType="next"
      />

      <FormField
        label="Apellidos"
        required
        value={values.lastName}
        error={errors.lastName}
        onChangeText={(t) => setValue('lastName', t)}
        onBlur={() => markTouched('lastName')}
        placeholder="Mendoza Salazar"
        autoCapitalize="words"
        autoComplete="family-name"
        textContentType="familyName"
        returnKeyType="next"
      />

      <SegmentedField<DocumentType>
        label="Tipo de documento"
        options={DOCUMENT_OPTIONS}
        value={values.documentType}
        onChange={(v) => setValue('documentType', v)}
      />

      <FormField
        label="Número de documento"
        required
        value={values.documentNumber}
        error={errors.documentNumber}
        onChangeText={(t) => setValue('documentNumber', t)}
        onBlur={() => markTouched('documentNumber')}
        placeholder={values.documentType === 'DNI' ? 'Ej. 72891044' : 'Ej. 001234567'}
        keyboardType={values.documentType === 'DNI' ? 'number-pad' : 'default'}
        autoCapitalize="characters"
        maxLength={values.documentType === 'DNI' ? 8 : 12}
      />

      <FormField
        label="Fecha de nacimiento"
        required
        value={values.birthDate}
        error={errors.birthDate}
        onChangeText={(t) => setValue('birthDate', t)}
        onBlur={() => markTouched('birthDate')}
        placeholder="DD/MM/AAAA"
        keyboardType="number-pad"
        maxLength={10}
      />

      <FormField
        label="Celular"
        required
        prefix="+51"
        value={values.phoneNumber}
        error={errors.phoneNumber}
        onChangeText={(t) => setValue('phoneNumber', t)}
        onBlur={() => markTouched('phoneNumber')}
        placeholder="987654321"
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        maxLength={9}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.three },
});