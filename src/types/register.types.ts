export type DocumentType = 'DNI' | 'CE';

export interface RegisterForm {
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  birthDate: string; // DD/MM/AAAA
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;

export const INITIAL_REGISTER_FORM: RegisterForm = {
  firstName: '',
  lastName: '',
  documentType: 'DNI',
  documentNumber: '',
  birthDate: '',
  phoneNumber: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
};