import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { type FieldValues, useFieldArray, useForm } from 'react-hook-form';
import { composeCoreSchema, coreFieldGroupsFor, type DocKind } from '@red-binder/schema';
import { STRINGS, type Locale } from '../i18n/strings';
import { cn } from '../lib/utils';
import { Field, Section, TextInput } from './ui/form';

function buildDefaults(groups: string[]): FieldValues {
  const d: FieldValues = {};
  if (groups.includes('identity'))
    Object.assign(d, { given_names: '', apellido_paterno: '', apellido_materno: '', dob: '' });
  if (groups.includes('contact'))
    Object.assign(d, { address: '', county: '', phone: '', email: '' });
  if (groups.includes('agentChain'))
    d.primary_agent = { first_name: '', last_name: '', relationship: '', address: '', phone: '' };
  if (groups.includes('emergencyContacts'))
    d.emergency_contacts = [{ name: '', relationship: '', phone: '' }];
  return d;
}

/** Safely pull a string error message out of react-hook-form's (dynamic) error shape. */
function msg(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'message' in error) {
    const m = (error as { message?: unknown }).message;
    if (typeof m === 'string') return m;
  }
  return undefined;
}

type ErrMap = Record<string, { message?: string } | undefined>;

const linkBtn =
  'text-sm font-bold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded';

export function CoreIntake({
  locale,
  selected,
  onBack,
  onSubmitted,
}: {
  locale: Locale;
  selected: DocKind[];
  onBack: () => void;
  onSubmitted: (data: FieldValues) => void;
}) {
  const t = STRINGS[locale];
  const L = t.intake.labels;
  const groups = useMemo(() => coreFieldGroupsFor(selected), [selected]);
  const schema = useMemo(() => composeCoreSchema(selected), [selected]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaults(groups),
    shouldUnregister: true,
    mode: 'onBlur',
  });

  const contacts = useFieldArray({ control, name: 'emergency_contacts' });
  const [showSuccessor, setShowSuccessor] = useState(false);
  const [showSecond, setShowSecond] = useState(false);

  const agentFields = (prefix: 'primary_agent' | 'successor_agent' | 'second_successor') => {
    const e = (errors[prefix] ?? {}) as ErrMap;
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={L.agentFirst} htmlFor={`${prefix}.first_name`} error={e.first_name?.message}>
          <TextInput id={`${prefix}.first_name`} {...register(`${prefix}.first_name`)} />
        </Field>
        <Field label={L.agentLast} htmlFor={`${prefix}.last_name`} error={e.last_name?.message}>
          <TextInput id={`${prefix}.last_name`} {...register(`${prefix}.last_name`)} />
        </Field>
        <Field
          label={L.agentRelationship}
          htmlFor={`${prefix}.relationship`}
          error={e.relationship?.message}
        >
          <TextInput id={`${prefix}.relationship`} {...register(`${prefix}.relationship`)} />
        </Field>
        <Field label={L.agentPhone} htmlFor={`${prefix}.phone`} optionalText={t.intake.optional}>
          <TextInput id={`${prefix}.phone`} {...register(`${prefix}.phone`)} />
        </Field>
        <div className="sm:col-span-2">
          <Field
            label={L.agentAddress}
            htmlFor={`${prefix}.address`}
            optionalText={t.intake.optional}
          >
            <TextInput id={`${prefix}.address`} {...register(`${prefix}.address`)} />
          </Field>
        </div>
      </div>
    );
  };

  const ecErrors = (errors.emergency_contacts ?? []) as Array<ErrMap | undefined>;

  return (
    <form onSubmit={handleSubmit(onSubmitted)} className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{t.intake.heading}</h2>

      {groups.includes('identity') && (
        <Section title={t.intake.identityTitle}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={L.given_names} htmlFor="given_names" error={msg(errors.given_names)}>
              <TextInput id="given_names" autoComplete="given-name" {...register('given_names')} />
            </Field>
            <Field label={L.dob} htmlFor="dob" error={msg(errors.dob)}>
              <TextInput id="dob" type="date" {...register('dob')} />
            </Field>
            <Field
              label={L.apellido_paterno}
              htmlFor="apellido_paterno"
              error={msg(errors.apellido_paterno)}
            >
              <TextInput id="apellido_paterno" {...register('apellido_paterno')} />
            </Field>
            <Field
              label={L.apellido_materno}
              htmlFor="apellido_materno"
              optionalText={t.intake.optional}
            >
              <TextInput id="apellido_materno" {...register('apellido_materno')} />
            </Field>
          </div>
        </Section>
      )}

      {groups.includes('contact') && (
        <Section title={t.intake.contactTitle}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label={L.address} htmlFor="address" error={msg(errors.address)}>
                <TextInput id="address" autoComplete="street-address" {...register('address')} />
              </Field>
            </div>
            <Field label={L.county} htmlFor="county" error={msg(errors.county)}>
              <TextInput id="county" {...register('county')} />
            </Field>
            <Field label={L.phone} htmlFor="phone" error={msg(errors.phone)}>
              <TextInput id="phone" type="tel" autoComplete="tel" {...register('phone')} />
            </Field>
            <div className="sm:col-span-2">
              <Field
                label={L.email}
                htmlFor="email"
                optionalText={t.intake.optional}
                error={msg(errors.email)}
              >
                <TextInput id="email" type="email" autoComplete="email" {...register('email')} />
              </Field>
            </div>
          </div>
        </Section>
      )}

      {groups.includes('agentChain') && (
        <Section title={t.intake.agentsTitle} help={t.intake.agentsHelp}>
          <p className="font-bold text-foreground">{t.intake.primaryAgent}</p>
          {agentFields('primary_agent')}

          {showSuccessor ? (
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <p className="font-bold text-foreground">{t.intake.successorAgent}</p>
                <button
                  type="button"
                  className={linkBtn}
                  onClick={() => {
                    setShowSuccessor(false);
                    setShowSecond(false);
                  }}
                >
                  {t.intake.remove}
                </button>
              </div>
              {agentFields('successor_agent')}

              {showSecond ? (
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-foreground">{t.intake.secondSuccessor}</p>
                    <button type="button" className={linkBtn} onClick={() => setShowSecond(false)}>
                      {t.intake.remove}
                    </button>
                  </div>
                  {agentFields('second_successor')}
                </div>
              ) : (
                <button type="button" className={linkBtn} onClick={() => setShowSecond(true)}>
                  + {t.intake.addSecondBackup}
                </button>
              )}
            </div>
          ) : (
            <button type="button" className={linkBtn} onClick={() => setShowSuccessor(true)}>
              + {t.intake.addBackup}
            </button>
          )}
        </Section>
      )}

      {groups.includes('emergencyContacts') && (
        <Section title={t.intake.emergencyTitle} help={t.intake.emergencyHelp}>
          {contacts.fields.map((field, i) => {
            const e = ecErrors[i] ?? {};
            return (
              <div
                key={field.id}
                className="space-y-3 border-border [&:not(:first-child)]:border-t [&:not(:first-child)]:pt-4"
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label={L.ecName} htmlFor={`ec.${i}.name`} error={e.name?.message}>
                    <TextInput id={`ec.${i}.name`} {...register(`emergency_contacts.${i}.name`)} />
                  </Field>
                  <Field
                    label={L.ecRelationship}
                    htmlFor={`ec.${i}.relationship`}
                    error={e.relationship?.message}
                  >
                    <TextInput
                      id={`ec.${i}.relationship`}
                      {...register(`emergency_contacts.${i}.relationship`)}
                    />
                  </Field>
                  <Field label={L.ecPhone} htmlFor={`ec.${i}.phone`} error={e.phone?.message}>
                    <TextInput
                      id={`ec.${i}.phone`}
                      {...register(`emergency_contacts.${i}.phone`)}
                    />
                  </Field>
                </div>
                {contacts.fields.length > 1 && (
                  <button type="button" className={linkBtn} onClick={() => contacts.remove(i)}>
                    {t.intake.remove}
                  </button>
                )}
              </div>
            );
          })}
          {contacts.fields.length < 5 && (
            <button
              type="button"
              className={linkBtn}
              onClick={() => contacts.append({ name: '', relationship: '', phone: '' })}
            >
              + {t.intake.addContact}
            </button>
          )}
        </Section>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-11 items-center justify-center rounded-md border border-border px-5 font-bold hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t.intake.back}
        </button>
        <button
          type="submit"
          className={cn(
            'inline-flex h-11 items-center justify-center rounded-md px-6 font-bold',
            'bg-primary text-primary-foreground hover:opacity-90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          )}
        >
          {t.intake.continueCta}
        </button>
      </div>
    </form>
  );
}
