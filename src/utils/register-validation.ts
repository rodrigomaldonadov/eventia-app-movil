import type { RegisterErrors, RegisterForm } from '@/types/register.types';

const MIN_AGE = 18; // cámbialo si tu plataforma permite menores
const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function parseBirthDate(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, d, m, y] = match.map(Number);
  const date = new Date(y, m - 1, d);
  const isReal =
    date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  return isReal ? date : null;
}

function ageFrom(date: Date): number {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const hadBirthday =
    today.getMonth() > date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() >= date.getDate());
  if (!hadBirthday) age -= 1;
  return age;
}

export function validateForm(f: RegisterForm): RegisterErrors {
  const errors: RegisterErrors = {};

  const first = f.firstName.trim();
  if (!first) errors.firstName = 'Ingresa tus nombres';
  else if (first.length < 2) errors.firstName = 'Debe tener al menos 2 letras';
  else if (!NAME_REGEX.test(first)) errors.firstName = 'Solo letras y espacios';

  const last = f.lastName.trim();
  if (!last) errors.lastName = 'Ingresa tus apellidos';
  else if (last.length < 2) errors.lastName = 'Debe tener al menos 2 letras';
  else if (!NAME_REGEX.test(last)) errors.lastName = 'Solo letras y espacios';

  const doc = f.documentNumber.trim();
  if (!doc) errors.documentNumber = 'Ingresa tu número de documento';
  else if (f.documentType === 'DNI' && !/^\d{8}$/.test(doc))
    errors.documentNumber = 'El DNI debe tener 8 dígitos';
  else if (f.documentType === 'CE' && !/^[A-Za-z0-9]{9,12}$/.test(doc))
    errors.documentNumber = 'El carnet debe tener entre 9 y 12 caracteres';

  if (!f.birthDate) errors.birthDate = 'Ingresa tu fecha de nacimiento';
  else {
    const date = parseBirthDate(f.birthDate);
    if (!date) errors.birthDate = 'Fecha inválida. Usa DD/MM/AAAA';
    else if (date > new Date()) errors.birthDate = 'La fecha no puede ser futura';
    else if (ageFrom(date) < MIN_AGE)
      errors.birthDate = `Debes tener al menos ${MIN_AGE} años`;
    else if (ageFrom(date) > 120) errors.birthDate = 'Revisa el año de nacimiento';
  }

  if (!f.phoneNumber) errors.phoneNumber = 'Ingresa tu celular';
  else if (!/^9\d{8}$/.test(f.phoneNumber))
    errors.phoneNumber = 'Debe tener 9 dígitos y empezar con 9';

  const email = f.email.trim();
  if (!email) errors.email = 'Ingresa tu correo';
  else if (!EMAIL_REGEX.test(email)) errors.email = 'Correo con formato inválido';

  if (!f.password) errors.password = 'Crea una contraseña';
  else if (f.password.length < 8) errors.password = 'Mínimo 8 caracteres';
  else if (!/[A-Za-z]/.test(f.password) || !/\d/.test(f.password))
    errors.password = 'Debe incluir letras y números';

  if (!f.confirmPassword) errors.confirmPassword = 'Confirma tu contraseña';
  else if (f.confirmPassword !== f.password)
    errors.confirmPassword = 'Las contraseñas no coinciden';

  if (!f.acceptTerms) errors.acceptTerms = 'Debes aceptar los términos para continuar';

  return errors;
}