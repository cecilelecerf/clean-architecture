'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { match } from 'ts-pattern';
import { Textarea } from './ui/textarea';
import { ReactNode } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from './ui/label';
import { AlertCircle, Calendar, CheckCircle2, Mail, User, Lock } from 'lucide-react';
import { ButtonLoading } from './buttons/ButtonLoading';

export type Field = {
  label: string;
  type?: "text" | "email" | "textarea" | "password" | "date" | "checkbox" | "other";
  placeholder?: string;
  get: string | string[];
  set: (e: string | string[]) => void;
  layout?: ReactNode;
  options?: { label: string; value: string }[];
}

interface AuthFormProps {
  title: string;
  description?: string;
  fields: Field[];
  button: string;
  loading: boolean;
  message?: string;
  messageType?: 'error' | 'success' | 'info';
  children?: React.ReactNode;
}

const getFieldIcon = (type?: string) => {
  switch (type) {
    case 'email':
      return Mail;
    case 'password':
      return Lock;
    case 'date':
      return Calendar;
    case 'text':
    default:
      return User;
  }
};

export default function FormWrapper({
  title,
  fields,
  button,
  loading,
  message,
  children,
  messageType,
  description
}: AuthFormProps) {
  const handleCheckboxChange = (
    fieldSet: (e: string | string[]) => void,
    currentValues: string | string[],
    value: string
  ) => {
    const values = Array.isArray(currentValues) ? currentValues : [];
    const newValues = values.includes(value)
      ? values.filter(v => v !== value)
      : [...values, value];
    fieldSet(newValues);
  };

  return (
    <Card className="min-w-2/3">
      <CardHeader>
        <CardTitle className="capitalize">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Message d'alerte */}
        {message && (
          <Alert
            variant={messageType === 'error' ? 'destructive' : undefined}
            className={match(messageType)
              .with('success', () => 'border-green-200 bg-green-50 dark:bg-green-950/20')
              .with('info', () => 'border-blue-200 bg-blue-50 dark:bg-blue-950/20')
              .otherwise(() => '')}
          >
            {match(messageType)
              .with('error', () => <AlertCircle className="h-4 w-4" />)
              .with('success', () => <CheckCircle2 className="h-4 w-4 text-green-600" />)
              .otherwise(() => <AlertCircle className="h-4 w-4 text-blue-600" />)}
            <AlertDescription
              className={match(messageType)
                .with('success', () => 'text-green-700 dark:text-green-300')
                .with('info', () => 'text-blue-700 dark:text-blue-300')
                .otherwise(() => '')}
            >
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Formulaire */}
        <div className="space-y-4">
          {fields.map((field, i) => {
            const Icon = getFieldIcon(field.type);

            return (
              <Field key={i}>
                {field.type !== "other" && <FieldLabel>{field.label}</FieldLabel>}
                {match(field.type)
                  .with("textarea", () => (
                    <Textarea
                      placeholder={field.placeholder}
                      onChange={(e) => field.set(e.target.value)}
                      required
                      value={field.get as string}
                      disabled={loading}
                      className="min-h-[100px]"
                    />
                  ))
                  .with("checkbox", () => (
                    <div className="space-y-3">
                      {field.options?.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${field.label}-${option.value}`}
                            checked={Array.isArray(field.get) && field.get.includes(option.value)}
                            onCheckedChange={() => handleCheckboxChange(field.set, field.get, option.value)}
                            disabled={loading}
                          />
                          <Label
                            htmlFor={`${field.label}-${option.value}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ))
                  .with("other", () => field.layout)
                  .otherwise(() => (
                    <div className="relative">
                      <Icon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={field.type ?? 'text'}
                        required
                        value={field.get as string}
                        onChange={(e) => field.set(e.target.value)}
                        placeholder={field.placeholder}
                        disabled={loading}
                        className="pl-10"
                      />
                    </div>
                  ))}
              </Field>
            );
          })}

          <ButtonLoading loading={loading} className='w-full' type="submit">
            {button}
          </ButtonLoading>
        </div>

        {children && (
          <div className="mt-6">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}