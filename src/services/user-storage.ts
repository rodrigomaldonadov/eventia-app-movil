import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

import type { DocumentType, RegisterForm } from '@/types/register.types';

const STORAGE_KEY = '@eventia/users';

/**
 * Representación pública de un usuario guardado (sin contraseña ni salt).
 */
export interface StoredUserPublic {
  id: string;
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  birthDate: string;
  phoneNumber: string;
  email: string;
  createdAt: string;
}

/**
 * Estructura interna con credenciales hasheadas.
 */
interface StoredUserInternal extends StoredUserPublic {
  passwordHash: string;
  salt: string;
}

/**
 * Datos requeridos para registrar un usuario.
 */
export type RegisterUserData = Omit<RegisterForm, 'confirmPassword'>;

/**
 * Error personalizado para fallos de registro (duplicados de correo o documento).
 */
export class RegisterError extends Error {
  code: 'EMAIL_DUPLICATE' | 'DOCUMENT_DUPLICATE' | 'DUPLICATE_FIELDS';
  fields: Partial<Record<'email' | 'documentNumber', string>>;

  constructor(
    code: 'EMAIL_DUPLICATE' | 'DOCUMENT_DUPLICATE' | 'DUPLICATE_FIELDS',
    fields: Partial<Record<'email' | 'documentNumber', string>>,
    message: string,
  ) {
    super(message);
    this.name = 'RegisterError';
    this.code = code;
    this.fields = fields;
  }
}

// Cola de promesas para evitar condiciones de carrera en escrituras simultáneas
let writeQueue = Promise.resolve();

function withWriteLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(fn, fn);
  writeQueue = next.then(
    () => { },
    () => { },
  );
  return next;
}

/**
 * Lee la lista interna de usuarios de AsyncStorage.
 * Maneja JSON corrupto devolviendo un arreglo vacío y registrando el error.
 */
async function readUsersInternal(): Promise<StoredUserInternal[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as StoredUserInternal[];
  } catch (error) {
    console.error('[UserStorage Error]: Fallo al leer o parsear AsyncStorage', error);
    return [];
  }
}

/**
 * Guarda la lista interna de usuarios en AsyncStorage.
 */
async function saveUsersInternal(users: StoredUserInternal[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

/**
 * Genera el hash SHA-256 de (salt + password).
 */
async function hashPassword(password: string, salt: string): Promise<string> {
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, salt + password);
}

/**
 * Quita el passwordHash y salt de un usuario interno para retornar su versión pública.
 */
function sanitizeUser(user: StoredUserInternal): StoredUserPublic {
  const { passwordHash, salt, ...publicUser } = user;
  return publicUser;
}

/**
 * Registra un nuevo usuario en almacenamiento local.
 * Valida duplicados de correo y documento (normalizados).
 * Lanza `RegisterError` si existen duplicados.
 */
export async function registerUser(data: RegisterUserData): Promise<StoredUserPublic> {
  return withWriteLock(async () => {
    const normEmail = data.email.replace(/\s+/g, '').toLowerCase();
    const normDocNum = data.documentNumber.replace(/\s+/g, '').toUpperCase();

    const users = await readUsersInternal();

    const emailExists = users.some(
      (u) => u.email.replace(/\s+/g, '').toLowerCase() === normEmail,
    );
    const docExists = users.some(
      (u) =>
        u.documentType === data.documentType &&
        u.documentNumber.replace(/\s+/g, '').toUpperCase() === normDocNum,
    );

    if (emailExists || docExists) {
      const fields: Partial<Record<'email' | 'documentNumber', string>> = {};
      if (emailExists) fields.email = 'Este correo ya está registrado';
      if (docExists) fields.documentNumber = 'Este documento ya está registrado';

      let code: RegisterError['code'] = 'DUPLICATE_FIELDS';
      if (emailExists && !docExists) code = 'EMAIL_DUPLICATE';
      if (!emailExists && docExists) code = 'DOCUMENT_DUPLICATE';

      const msg = Object.values(fields).join('. ');
      throw new RegisterError(code, fields, msg);
    }

    const salt = Crypto.randomUUID();
    const passwordHash = await hashPassword(data.password, salt);
    const id = Crypto.randomUUID();

    const newUser: StoredUserInternal = {
      id,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      documentType: data.documentType,
      documentNumber: normDocNum,
      birthDate: data.birthDate.trim(),
      phoneNumber: data.phoneNumber.trim(),
      email: normEmail,
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await saveUsersInternal(users);

    return sanitizeUser(newUser);
  });
}

/**
 * Busca un usuario registrado por su correo electrónico.
 */
export async function findUserByEmail(email: string): Promise<StoredUserPublic | null> {
  const normEmail = email.replace(/\s+/g, '').toLowerCase();
  const users = await readUsersInternal();
  const found = users.find((u) => u.email.replace(/\s+/g, '').toLowerCase() === normEmail);
  return found ? sanitizeUser(found) : null;
}

/**
 * Busca un usuario registrado por tipo y número de documento.
 */
export async function findUserByDocument(
  documentType: DocumentType,
  documentNumber: string,
): Promise<StoredUserPublic | null> {
  const normDocNum = documentNumber.replace(/\s+/g, '').toUpperCase();
  const users = await readUsersInternal();
  const found = users.find(
    (u) =>
      u.documentType === documentType &&
      u.documentNumber.replace(/\s+/g, '').toUpperCase() === normDocNum,
  );
  return found ? sanitizeUser(found) : null;
}

/**
 * Verifica las credenciales de un usuario (email y contraseña).
 * Retorna el objeto `StoredUserPublic` sin contraseña si coinciden, o `null` si no.
 * (Para uso del Integrante 1 en el flujo de Login).
 */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<StoredUserPublic | null> {
  const normEmail = email.replace(/\s+/g, '').toLowerCase();
  const users = await readUsersInternal();
  const found = users.find((u) => u.email.replace(/\s+/g, '').toLowerCase() === normEmail);
  if (!found) return null;

  const inputHash = await hashPassword(password, found.salt);
  if (inputHash === found.passwordHash) {
    return sanitizeUser(found);
  }
  return null;
}

/**
 * Devuelve la lista completa de usuarios públicos (solo para pruebas/verificación).
 * NUNCA incluye passwordHash ni salt.
 */
export async function getAllUsers(): Promise<StoredUserPublic[]> {
  const users = await readUsersInternal();
  return users.map(sanitizeUser);
}
