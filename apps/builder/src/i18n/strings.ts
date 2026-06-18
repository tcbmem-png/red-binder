// Bilingual microcopy. EN is verbatim from BRANDING — Build Handoff §2 where given, else authored
// in the handoff voice. ES is DRAFT and flagged for the phase-8 native bilingual review (neutral
// LatAm, ~8th grade) — do not treat ES as final. Voice: plain words, calm, dignity not fear.
import type { DocKind } from '@red-binder/schema';

export type Locale = 'en' | 'es';

export interface PickerCardCopy {
  name: string;
  description: string;
}

export interface IntakeStrings {
  heading: string;
  identityTitle: string;
  contactTitle: string;
  agentsTitle: string;
  agentsHelp: string;
  emergencyTitle: string;
  emergencyHelp: string;
  primaryAgent: string;
  successorAgent: string;
  secondSuccessor: string;
  addBackup: string;
  addSecondBackup: string;
  addContact: string;
  remove: string;
  optional: string;
  back: string;
  continueCta: string;
  reviewStub: string;
  labels: {
    given_names: string;
    apellido_paterno: string;
    apellido_materno: string;
    dob: string;
    address: string;
    county: string;
    phone: string;
    email: string;
    agentFirst: string;
    agentLast: string;
    agentRelationship: string;
    agentAddress: string;
    agentPhone: string;
    ecName: string;
    ecRelationship: string;
    ecPhone: string;
  };
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
  cards: Record<DocKind, PickerCardCopy>;
  intake: IntakeStrings;
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
    intake: {
      heading: 'About you and your people',
      identityTitle: 'About you',
      contactTitle: 'Where you live',
      agentsTitle: 'Who you trust',
      agentsHelp: 'The person who can act for you — and backups, in case they can’t.',
      emergencyTitle: 'People to call',
      emergencyHelp: 'Who should be called first.',
      primaryAgent: 'The person you trust most',
      successorAgent: 'Backup person',
      secondSuccessor: 'Second backup',
      addBackup: 'Add a backup person',
      addSecondBackup: 'Add a second backup',
      addContact: 'Add another contact',
      remove: 'Remove',
      optional: 'Optional — only if it helps.',
      back: 'Back',
      continueCta: 'Continue',
      reviewStub:
        'Next: your document details, then a review before anything is made. (Coming in the next phases.)',
      labels: {
        given_names: 'First (and middle) name',
        apellido_paterno: 'First surname (apellido paterno)',
        apellido_materno: 'Second surname (apellido materno)',
        dob: 'Date of birth',
        address: 'Home address',
        county: 'County',
        phone: 'Phone',
        email: 'Email',
        agentFirst: 'First name',
        agentLast: 'Last name',
        agentRelationship: 'Relationship to you',
        agentAddress: 'Address',
        agentPhone: 'Phone',
        ecName: 'Name',
        ecRelationship: 'Relationship',
        ecPhone: 'Phone',
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
    intake: {
      heading: 'Sobre ti y tu gente',
      identityTitle: 'Sobre ti',
      contactTitle: 'Dónde vives',
      agentsTitle: 'En quién confías',
      agentsHelp: 'La persona que puede actuar por ti — y reemplazos, por si no puede.',
      emergencyTitle: 'Personas para llamar',
      emergencyHelp: 'A quién se debe llamar primero.',
      primaryAgent: 'La persona en quien más confías',
      successorAgent: 'Persona de reemplazo',
      secondSuccessor: 'Segundo reemplazo',
      addBackup: 'Agregar una persona de reemplazo',
      addSecondBackup: 'Agregar un segundo reemplazo',
      addContact: 'Agregar otro contacto',
      remove: 'Quitar',
      optional: 'Opcional — solo si ayuda.',
      back: 'Atrás',
      continueCta: 'Continuar',
      reviewStub:
        'Sigue: los detalles de tus documentos y una revisión antes de crear algo. (Próximamente.)',
      labels: {
        given_names: 'Nombre (y segundo nombre)',
        apellido_paterno: 'Apellido paterno',
        apellido_materno: 'Apellido materno',
        dob: 'Fecha de nacimiento',
        address: 'Dirección',
        county: 'Condado',
        phone: 'Teléfono',
        email: 'Correo electrónico',
        agentFirst: 'Nombre',
        agentLast: 'Apellido',
        agentRelationship: 'Relación contigo',
        agentAddress: 'Dirección',
        agentPhone: 'Teléfono',
        ecName: 'Nombre',
        ecRelationship: 'Relación',
        ecPhone: 'Teléfono',
      },
    },
  },
};

/** Picker order — POA is presented first (ARCHITECTURE §3b). */
export const PICKER_ORDER: DocKind[] = ['poa', 'rbp', 'detention'];
