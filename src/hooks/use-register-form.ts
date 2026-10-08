import { useMemo, useState } from 'react';

import {
  INITIAL_REGISTER_FORM,
  type RegisterErrors,
  type RegisterForm,
} from '@/types/register.types';
import { validateForm } from '@/utils/register-validation';

function sanitize<K extends keyof RegisterForm>(
  name: K,
  value: RegisterForm[K],
  form: RegisterForm,
): RegisterForm[K] {
  if (typeof value !== 'string') return value;
  let v: string = value;
  if (name === 'phoneNumber') v = v.replace(/\D/g, '').slice(0, 9);
  if (name === 'documentNumber')
    v =
      form.documentType === 'DNI'
        ? v.replace(/\D/g, '').slice(0, 8)
        : v.replace(/[^A-Za-z0-9]/g, '').slice(0, 12);
  if (name === 'birthDate') {
    const d = v.replace(/\D/g, '').slice(0, 8);
    v = [d.slice(0, 2), d.slice(2, 4), d.slice(4, 8)].filter(Boolean).join('/');
  }
  return v as RegisterForm[K];
}

export function useRegisterForm() {
  const [values, setValues] = useState<RegisterForm>(INITIAL_REGISTER_FORM);
  const [touched, setTouched] = useState<Partial<Record<keyof RegisterForm, boolean>>>({});
  // Errores de servidor (duplicados) por campo; se muestran junto al campo.
  const [fieldErrors, setFieldErrors] = useState<RegisterErrors>({});

  const allErrors = useMemo(() => validateForm(values), [values]);

  const errors: RegisterErrors = useMemo(() => {
    const visible: RegisterErrors = {};
    (Object.keys(allErrors) as (keyof RegisterForm)[]).forEach((key) => {
      if (touched[key]) visible[key] = allErrors[key];
    });
    return { ...visible, ...fieldErrors };
  }, [allErrors, touched, fieldErrors]);

  const setValue = <K extends keyof RegisterForm>(name: K, value: RegisterForm[K]) => {
    setValues((prev) => {
      const next = { ...prev, [name]: sanitize(name, value, prev) };
      // al cambiar el tipo de documento, el número anterior ya no aplica
      if (name === 'documentType') next.documentNumber = '';
      return next;
    });
    // al editar un campo, se borra su error de servidor (ej. duplicado)
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const nextErrors = { ...prev };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const markTouched = (name: keyof RegisterForm) =>
    setTouched((prev) => ({ ...prev, [name]: true }));

  /** Marca todo como tocado y devuelve true si el formulario es válido. */
  const validateAll = () => {
    const all = Object.keys(values) as (keyof RegisterForm)[];
    setTouched(Object.fromEntries(all.map((k) => [k, true])));
    // recalcula sobre el estado actual para no depender de un memo obsoleto
    return Object.keys(validateForm(values)).length === 0;
  };

  /** Muestra un error de servidor (ej. duplicado) junto a un campo. */
  const setFieldError = (name: keyof RegisterForm, message: string) => {
    setFieldErrors((prev) => ({ ...prev, [name]: message }));
  };

  return { values, errors, setValue, markTouched, validateAll, setFieldError };
}
