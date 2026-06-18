import { useState } from 'react';
import type { Locale } from '../i18n/strings';
import { cn } from '../lib/utils';
import { Field, Section, TextInput } from './ui/form';

export interface RbpSelections {
  children: { name: string; dob: string; school: string }[];
  document_locations: { label: string; location: string }[];
}

const COPY = {
  en: {
    title: 'Your Red Binder Plan',
    intro:
      'A trusted adult uses this to step in fast. Your name, the people you trust, and who to call all come from what you already entered — add your children and where key papers are.',
    childrenTitle: 'Your children',
    childrenHelp: 'So a trusted adult knows who to pick up, and where.',
    childName: "Child's name",
    childDob: 'Date of birth',
    childSchool: 'School',
    addChild: 'Add a child',
    docsTitle: 'Where your important papers are',
    docsHelp: 'Passports, birth certificates, the lease, insurance — just where to find them.',
    docLabel: 'Document',
    docLocation: 'Where it is',
    addDoc: 'Add a document',
    remove: 'Remove',
    optional: 'Optional — only if it helps.',
    back: 'Back',
    continueCta: 'Continue',
  },
  es: {
    title: 'Tu Plan de la Carpeta Roja',
    intro:
      'Un adulto de confianza lo usa para ayudar rápido. Tu nombre, las personas en quienes confías y a quién llamar vienen de lo que ya pusiste — agrega a tus hijos y dónde están los papeles importantes.',
    childrenTitle: 'Tus hijos',
    childrenHelp: 'Para que un adulto de confianza sepa a quién recoger, y dónde.',
    childName: 'Nombre del niño/a',
    childDob: 'Fecha de nacimiento',
    childSchool: 'Escuela',
    addChild: 'Agregar un hijo/a',
    docsTitle: 'Dónde están tus papeles importantes',
    docsHelp: 'Pasaportes, actas de nacimiento, el contrato, el seguro — solo dónde encontrarlos.',
    docLabel: 'Documento',
    docLocation: 'Dónde está',
    addDoc: 'Agregar un documento',
    remove: 'Quitar',
    optional: 'Opcional — solo si ayuda.',
    back: 'Atrás',
    continueCta: 'Continuar',
  },
};

const linkBtn =
  'text-sm font-bold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded';

const emptyChild = () => ({ name: '', dob: '', school: '' });
const emptyDoc = () => ({ label: '', location: '' });

export function RBPSection({
  locale,
  initial,
  onBack,
  onContinue,
}: {
  locale: Locale;
  initial?: RbpSelections;
  onBack: () => void;
  onContinue: (data: RbpSelections) => void;
}) {
  const t = COPY[locale];
  const [children, setChildren] = useState(initial?.children ?? []);
  const [docs, setDocs] = useState(initial?.document_locations ?? []);

  const continueWith = () =>
    onContinue({
      // Drop blank rows so empty repeater entries never become tokens.
      children: children.filter((c) => c.name.trim() !== ''),
      document_locations: docs.filter((d) => d.label.trim() !== ''),
    });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
      <p className="text-sm text-muted-foreground">{t.intro}</p>

      <Section title={t.childrenTitle} help={t.childrenHelp}>
        {children.map((c, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: rows are positional and have no stable id
            key={i}
            className="space-y-3 border-border [&:not(:first-child)]:border-t [&:not(:first-child)]:pt-4"
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label={t.childName} htmlFor={`child.${i}.name`}>
                <TextInput
                  id={`child.${i}.name`}
                  value={c.name}
                  onChange={(e) =>
                    setChildren((p) =>
                      p.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)),
                    )
                  }
                />
              </Field>
              <Field label={t.childDob} htmlFor={`child.${i}.dob`} optionalText={t.optional}>
                <TextInput
                  id={`child.${i}.dob`}
                  type="date"
                  value={c.dob}
                  onChange={(e) =>
                    setChildren((p) =>
                      p.map((r, j) => (j === i ? { ...r, dob: e.target.value } : r)),
                    )
                  }
                />
              </Field>
              <Field label={t.childSchool} htmlFor={`child.${i}.school`} optionalText={t.optional}>
                <TextInput
                  id={`child.${i}.school`}
                  value={c.school}
                  onChange={(e) =>
                    setChildren((p) =>
                      p.map((r, j) => (j === i ? { ...r, school: e.target.value } : r)),
                    )
                  }
                />
              </Field>
            </div>
            <button
              type="button"
              className={linkBtn}
              onClick={() => setChildren((p) => p.filter((_, j) => j !== i))}
            >
              {t.remove}
            </button>
          </div>
        ))}
        {children.length < 20 && (
          <button
            type="button"
            className={linkBtn}
            onClick={() => setChildren((p) => [...p, emptyChild()])}
          >
            + {t.addChild}
          </button>
        )}
      </Section>

      <Section title={t.docsTitle} help={t.docsHelp}>
        {docs.map((d, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: rows are positional and have no stable id
            key={i}
            className="space-y-3 border-border [&:not(:first-child)]:border-t [&:not(:first-child)]:pt-4"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t.docLabel} htmlFor={`doc.${i}.label`}>
                <TextInput
                  id={`doc.${i}.label`}
                  value={d.label}
                  onChange={(e) =>
                    setDocs((p) => p.map((r, j) => (j === i ? { ...r, label: e.target.value } : r)))
                  }
                />
              </Field>
              <Field label={t.docLocation} htmlFor={`doc.${i}.location`} optionalText={t.optional}>
                <TextInput
                  id={`doc.${i}.location`}
                  value={d.location}
                  onChange={(e) =>
                    setDocs((p) =>
                      p.map((r, j) => (j === i ? { ...r, location: e.target.value } : r)),
                    )
                  }
                />
              </Field>
            </div>
            <button
              type="button"
              className={linkBtn}
              onClick={() => setDocs((p) => p.filter((_, j) => j !== i))}
            >
              {t.remove}
            </button>
          </div>
        ))}
        {docs.length < 30 && (
          <button
            type="button"
            className={linkBtn}
            onClick={() => setDocs((p) => [...p, emptyDoc()])}
          >
            + {t.addDoc}
          </button>
        )}
      </Section>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-11 items-center justify-center rounded-md border border-border px-5 font-bold hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t.back}
        </button>
        <button
          type="button"
          onClick={continueWith}
          className={cn(
            'inline-flex h-11 items-center justify-center rounded-md px-6 font-bold',
            'bg-primary text-primary-foreground hover:opacity-90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          )}
        >
          {t.continueCta}
        </button>
      </div>
    </div>
  );
}
