import { useColorScheme } from 'react-native';

import { Eventia } from '@/constants/theme';

export type EventiaTheme = { [K in keyof typeof Eventia]: string };

/**
 * Paleta de marca Eventia adaptada al tema del sistema.
 * En modo oscuro se aclaran los acentos y superficies para mantener
 * contraste sobre fondos oscuros.
 */
export function useEventiaTheme(): EventiaTheme {
  return {
    ...Eventia,
    primary: '#818CF8',
    primaryContainer: '#4F46E5',
    price: '#A5A0FF',
    surfaceLow: '#212225',
  };
}
