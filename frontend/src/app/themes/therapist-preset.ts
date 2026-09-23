import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Therapist Platform — Design System v1
 * Direction: "Calma estruturada"
 *
 * PrimeNG consumes the same sage/stone language exposed by the global CSS tokens.
 */
const TherapistPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#F3F7F5',
      100: '#E4EEE9',
      200: '#C9DED3',
      300: '#A5C8B7',
      400: '#7EAE98',
      500: '#5B947B',
      600: '#477762',
      700: '#385E4E',
      800: '#304D42',
      900: '#293F37',
      950: '#15231E'
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.600}',
          inverseColor: '#ffffff',
          hoverColor: '{primary.700}',
          activeColor: '{primary.800}'
        },
        highlight: {
          background: '{primary.50}',
          focusBackground: '{primary.100}',
          color: '{primary.800}',
          focusColor: '{primary.900}'
        }
      },
      dark: {
        primary: {
          color: '{primary.400}',
          inverseColor: '{primary.950}',
          hoverColor: '{primary.300}',
          activeColor: '{primary.200}'
        },
        highlight: {
          background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
          focusBackground: 'color-mix(in srgb, {primary.400}, transparent 74%)',
          color: '#F3F3EE',
          focusColor: '#FFFFFF'
        }
      }
    }
  }
});

export default TherapistPreset;
