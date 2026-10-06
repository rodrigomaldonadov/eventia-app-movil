import { useColorScheme } from 'react-native';

import { Eventia } from '@/constants/theme';

export type EventiaTheme = { [K in keyof typeof Eventia]: string };

/**
 * Paleta de marca Eventia adaptada al tema del sistema.
 * En modo oscuro se aclaran los acentos y superficies para mantener
 * contraste sobre fondos oscuros.
 */
export function useEventiaTheme(): EventiaTheme {
  const scheme = useColorScheme();
  if (scheme !== 'dark') return Eventia;
  return {
    ...Eventia,
    primary: '#B7B2FF',
    primaryContainer: '#6E6BF2',
    price: '#A5A0FF',
    surfaceLow: '#252B38',
  };
}
