'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface AuthFormProps {
  title: string;
  fields: {
    label: string;
    type?: string;
    get: string;
    set: (e: string) => void;
  }[];
  button: string;
  loading: boolean;
  message?: string;
}

export default function AuthForm({ title, fields, button, loading, message }: AuthFormProps) {
  return (
    <Card className="min-w-2/3">
      <CardHeader>
        <CardTitle className="capitalize">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {fields.map((field, i) => (
          <Field key={i}>
            <FieldLabel>{field.label}</FieldLabel>
            <Input
              type={field.type ?? 'text'}
              required
              value={field.get}
              onChange={(e) => field.set(e.target.value)}
            />
          </Field>
        ))}
        <Button type="submit" disabled={loading} className="w-full">
          {button}
        </Button>

        {message && <p className="text-center mt-2 text-red-500">{message}</p>}
      </CardContent>
    </Card>
  );
}
