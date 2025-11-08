'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { match } from 'ts-pattern';
import { Textarea } from './ui/textarea';
import { Loader } from 'lucide-react';
export type Field = {
  label: string;
  type?: "text" | "email" | "textarea" | "password" | "date";
  placeholder?: string
  get: string;
  set: (e: string) => void;
}
interface AuthFormProps {
  title: string;
  fields: Field[];
  button: string;
  loading: boolean;
  message?: string;
}

export default function FormWrapper({ title, fields, button, loading, message }: AuthFormProps) {
  return (
    <Card className="min-w-2/3">
      <CardHeader>
        <CardTitle className="capitalize">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {fields.map((field, i) => (
          <Field key={i}>
            <FieldLabel>{field.label}</FieldLabel>
            {match(field.type)
              .with(("textarea"), () =>
                <Textarea
                  placeholder={field.placeholder}
                  onChange={(e) => field.set(e.target.value)}
                  required
                  value={field.get} />
              )
              .otherwise(() =>
                <Input
                  type={field.type ?? 'text'}
                  required
                  value={field.get}
                  onChange={(e) => field.set(e.target.value)}
                  placeholder={field.placeholder}
                />
              )}
          </Field>
        ))}
        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader />}  {button}
        </Button>

        {message && <p className="text-center mt-2 text-red-500">{message}</p>}
      </CardContent>
    </Card>
  );
}
