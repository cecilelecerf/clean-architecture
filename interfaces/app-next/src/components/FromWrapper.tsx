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
import { AlertCircle, Calendar, CheckCircle2, Mail, User, Lock, DollarSign, ArrowLeft } from 'lucide-react';
import { ButtonLoading } from './buttons/ButtonLoading';
import { Flex } from '@radix-ui/themes';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

export type Field = {
  label: string;
  type?: "text" | "email" | "textarea" | "password" | "date" | "checkbox" | "radio" | "select" | "number" | "other" | "icon";
  placeholder?: string;
  get: string | string[];
  set: (e: string | string[]) => void;
  layout?: ReactNode;
  disabled?: boolean
  options?: { label: string; value: string, icon?: string }[];
  numberOptions?: {
    min?: number | string;
    max?: number | string;
    step?: number;
  }
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
    case 'number':
      return DollarSign;
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
  description,
}: AuthFormProps) {
  const router = useRouter()
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
    <Card className="min-w-2/3 rounded-2xl shadow-lg border-0 bg-linear-to-br from-gray-50 to-gray-100">
      <CardHeader>
        <CardTitle className="capitalize flex gap-1 items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          {title}</CardTitle>
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
                      disabled={loading || field.disabled}
                      className="min-h-[100px]"

                    />
                  ))
                  .with("number", () => (
                    <div className="relative">
                      <Icon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        required
                        value={field.get as string}
                        onChange={(e) => field.set(e.target.value)}
                        placeholder={field.placeholder}
                        disabled={loading || field.disabled}
                        className="pl-10"
                        min={field.numberOptions.min}
                        max={field.numberOptions.max}
                        step={field.numberOptions.step ?? 1}
                      />
                    </div>
                  ))
                  .with("select", () => (
                    <Select
                      value={field.get as string}
                      onValueChange={(value) => field.set(value)}
                      disabled={loading || field.disabled}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={field.placeholder ?? "Sélectionnez une option"} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option, idx) => (
                          <SelectItem key={idx} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ))
                  .with("checkbox", () => (
                    <Flex gap="5">
                      {field.options?.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${field.label}-${option.value}`}
                            checked={Array.isArray(field.get) && field.get.includes(option.value)}
                            onCheckedChange={() => handleCheckboxChange(field.set, field.get, option.value)}
                            disabled={loading || field.disabled}
                          />
                          <Label
                            htmlFor={`${field.label}-${option.value}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </Flex>
                  ))
                  .with("radio", () => (
                    <RadioGroup
                      value={field.get as string}
                      onValueChange={(value) => field.set(value)}
                      disabled={loading || field.disabled}
                      className="flex gap-5"
                    >
                      {field.options?.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={option.value}
                            id={`${field.label}-${option.value}`}
                          />
                          <Label
                            htmlFor={`${field.label}-${option.value}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ))
                  .with("icon", () => (
                    <div className="grid grid-cols-8 gap-2">
                      {field.options?.map((option, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => field.set(option.value)}
                          className={` h-12 w-12 text-2xl rounded-lg border-2 transition-all  hover:scale-110 hover:shadow-md  ${field.get === option.value
                            ? 'border-primary bg-primary/10 scale-110'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                          disabled={loading}
                        >
                          {option.icon ?? option.value}
                        </button>
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
                        disabled={loading || field.disabled}
                        className="pl-10"
                        min={field.numberOptions?.min}
                        max={field.numberOptions?.max}
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