const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Ingresa tu correo electrónico.';
  if (!EMAIL_REGEX.test(email.trim())) return 'Ingresa un correo válido.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Ingresa tu contraseña.';
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  return null;
}

export function validateNewPassword(password: string): string | null {
  const required = validatePassword(password);
  if (required) return required;
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Incluye letras y números en la contraseña.';
  }
  return null;
}
