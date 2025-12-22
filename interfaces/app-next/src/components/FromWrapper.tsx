'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { match } from 'ts-pattern';
import { Textarea } from './ui/textarea';
import { Loader } from 'lucide-react';
import { ReactNode } from 'react';
import { ButtonLoading } from './buttons/ButtonLoading';
import { Checkbox } from '@radix-ui/themes';
import { Label } from './ui/label';

export type Field = {
  label: string;
  type?: "text" | "email" | "textarea" | "password" | "date" | "other" | "checkbox";
  placeholder?: string;
  get: string | string[];
  set: (e: string) => void;
  layout?: ReactNode;
  options?: { label: string; value: string }[];
}

interface AuthFormProps {
  title: string;
  fields: Field[];
  button: string;
  loading: boolean;
  message?: string;
}

export default function FormWrapper({ title, fields, button, loading, message }: AuthFormProps) {
  const handleCheckboxChange = (fieldSet: (e: string | string[]) => void, currentValues: string | string[], value: string) => {
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
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {fields.map((field, i) => (
          <Field key={i}>
            <FieldLabel>{field.label}</FieldLabel>
            {match(field.type)
              .with("textarea", () => (
                <Textarea
                  placeholder={field.placeholder}
                  onChange={(e) => field.set(e.target.value)}
                  required
                  value={field.get}
                />
              )).with("checkbox", () => (
                <div className="space-y-3">
                  {field.options?.map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${field.label}-${option.value}`}
                        checked={Array.isArray(field.get) && field.get.includes(option.value)}
                        onCheckedChange={() => handleCheckboxChange(field.set, field.get, option.value)}
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
                <Input
                  type={field.type ?? 'text'}
                  required
                  value={field.get}
                  onChange={(e) => field.set(e.target.value)}
                  placeholder={field.placeholder}
                />
              ))}
          </Field>
        ))}
        <ButtonLoading type="submit" loading={loading} className="w-full">
          {button}
        </ButtonLoading>

        {message && <p className="text-center mt-2 text-red-500">{message}</p>}
      </CardContent>
    </Card>
  );
}