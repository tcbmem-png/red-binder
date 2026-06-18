// Bilingual microcopy. EN is verbatim from BRANDING — Build Handoff §2.
// ES is DRAFT and flagged for the phase-8 native bilingual review (neutral LatAm, ~8th grade) —
// do not treat ES as final. Voice: plain words, calm, dignity not fear; CTAs name the next action.
import type { DocKind } from '@red-binder/schema';

export type Locale = 'en' | 'es';

export interface PickerCardCopy {
  name: string;
  description: string;
}

export interface Strings {
  appName: string;
  tagline: string;
  pickerHeading: string;
  pickerHelper: string;
  pickerEmpty: string;
  continueCta: string;
  privacyShort: string;
  privacyWarm: string;
  langToggle: string;
  tcb: string;
  notLegalAdvice: string;
  nextStub: string;
  chosenLabel: string;
  cards: Record<DocKind, PickerCardCopy>;
}

export const STRINGS: Record<Locale, Strings> = {
  en: {
    appName: 'Red Binder Project',
    tagline: 'A plan, before the emergency.',
    pickerHeading: 'What do you want to create?',
    pickerHelper:
      "Pick what you need. You can choose more than one. You'll enter your information once.",
    pickerEmpty: 'Choose at least one to begin.',
    continueCta: 'Continue',
    privacyShort: 'Made on your device. We keep nothing.',
    privacyWarm: 'Your information never leaves your phone.',
    langToggle: 'Español',
    tcb: 'A TCB Law initiative. Built by Taylor C. Berger, attorney (MS/TN).',
    notLegalAdvice:
      'This is a free tool, not legal advice, and using it does not make us your lawyers.',
    nextStub: "Next, you'll enter your information once — and only what these documents need.",
    chosenLabel: "You're creating:",
    cards: {
      poa: {
        name: 'Power of attorney — who handles money & home',
        description:
          "Lets someone you trust pay rent, reach accounts, and keep the household running if you can't.",
      },
      rbp: {
        name: 'Red Binder Plan',
        description: 'A simple overview so a trusted person can step in fast.',
      },
      detention: {
        name: 'Pocket Plan',
        description:
          'A card you carry and a plan that helps your family reach a lawyer fast — set up before you ever need it.',
      },
    },
  },
  es: {
    appName: 'Proyecto La Carpeta Roja',
    tagline: 'Un plan, antes de la emergencia.',
    pickerHeading: '¿Qué quieres crear?',
    pickerHelper:
      'Elige lo que necesitas. Puedes elegir más de uno. Pondrás tu información una sola vez.',
    pickerEmpty: 'Elige al menos uno para empezar.',
    continueCta: 'Continuar',
    privacyShort: 'Se crea en tu teléfono. No guardamos nada.',
    privacyWarm: 'Tu información nunca sale de tu teléfono.',
    langToggle: 'English',
    tcb: 'Una iniciativa de TCB Law. Creado por Taylor C. Berger, abogado (MS/TN).',
    notLegalAdvice:
      'Esta es una herramienta gratuita, no es asesoría legal, y usarla no nos convierte en tus abogados.',
    nextStub:
      'Después, pondrás tu información una sola vez — y solo lo que estos documentos necesitan.',
    chosenLabel: 'Estás creando:',
    cards: {
      poa: {
        name: 'Poder legal — quién maneja el dinero y la casa',
        description:
          'Permite que alguien de confianza pague la renta, use las cuentas y mantenga el hogar si tú no puedes.',
      },
      rbp: {
        name: 'Plan de la Carpeta Roja',
        description: 'Un resumen sencillo para que una persona de confianza pueda ayudar rápido.',
      },
      detention: {
        name: 'Plan de Bolsillo',
        description:
          'Una tarjeta que llevas contigo y un plan para que tu familia localice a un abogado rápido — listo antes de que lo necesites.',
      },
    },
  },
};

/** Picker order — POA is presented first (ARCHITECTURE §3b). */
export const PICKER_ORDER: DocKind[] = ['poa', 'rbp', 'detention'];
