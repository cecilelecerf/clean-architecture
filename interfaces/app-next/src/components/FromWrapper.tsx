'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { match } from 'ts-pattern';
import { Textarea } from './ui/textarea';
import { Mail, Lock, User, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ButtonLoading } from './buttons/ButtonLoading';
import { ButtonBack } from './buttons/ButtonBack';

export type Field = {
  label: string;
  type?: "text" | "email" | "textarea" | "password" | "date";
  placeholder?: string;
  get: string;
  set: (e: string) => void;
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
  description,
  fields,
  button,
  loading,
  message,
  messageType = 'error',
  children
}: AuthFormProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="">
          <ButtonBack disabledMarginBottom />
          <CardTitle className="text-2xl mb-1">{title}</CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
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
                  <FieldLabel>{field.label}</FieldLabel>
                  {match(field.type)
                    .with("textarea", () => (
                      <Textarea
                        placeholder={field.placeholder}
                        onChange={(e) => field.set(e.target.value)}
                        required
                        value={field.get}
                        disabled={loading}
                        className="min-h-[100px]"
                      />
                    ))
                    .otherwise(() => (
                      <div className="relative">
                        <Icon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={field.type ?? 'text'}
                          required
                          value={field.get}
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
            <ButtonLoading loading={loading} className='w-full'> {button}</ButtonLoading>
          </div>

          {/* Contenu additionnel (liens, etc.) */}
          {children && (
            <div className="mt-6">
              {children}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}