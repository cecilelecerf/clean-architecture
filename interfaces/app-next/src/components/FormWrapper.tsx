'use client'

import { Path, UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Calendar, Check, DollarSign, Eye, EyeClosed, Lock, LucideIcon, Mail, Phone, User, X } from "lucide-react"
import { match } from "ts-pattern"
import clsx from "clsx"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"
import { Checkbox } from "./ui/checkbox"
import { Flex } from "@radix-ui/themes"
import { Textarea } from "./ui/textarea"
import { ReactNode, useState } from "react"
import { Badge } from "./ui/badge"
import { bgColorClasses, borderColorClasses, textColorClasses } from "@/utils/color"
import { CommandInput, CommandList, Command, CommandGroup, CommandItem, CommandEmpty } from "@/components/ui/command";
import { UserId } from "@infrastructure/types/user"
import { Avatar } from "./ui/avatar"
import { AvatarFallback } from "@radix-ui/react-avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { useRouter } from "next/navigation"
import { ButtonLoading } from "./buttons/ButtonLoading"
import { Switch } from "./ui/switch"

type FieldType = "text" | "number" | "select" | "checkbox" | "radio" | "textarea" | "phone" | "email" | "password" | "date" | 'icon' | "tag" | "command" | "switch";

export type Info = {
    label: string;
    placeholder?: string,
    type: FieldType,
    icon?: LucideIcon,
    withIcon?: boolean,
    notRequired?: boolean,
    options?: { label: string; value: string; icon?: string, tagColor?: string }[];
    commandOption?: { name: string, infos: { id: UserId; firstname: string; lastname: string, }[] }[]
}
export type DataInfo<T> = Record<keyof T, Info>

export type Section<T> = {
    title: string,
    icon: LucideIcon,
    description: string,
    data: Partial<DataInfo<T>>
}

type ProfileFormProps<T> = {
    form: UseFormReturn<T>
    onSubmit: (values: T) => void
    data: DataInfo<T> | (Section<T>)[]
    showBackButton?: boolean
    title: string
    description?: string
    labelButton: string,
    loading: boolean
    children?: ReactNode
};

export default function FormWrapper<T>({
    form, onSubmit, data, showBackButton, title, description, children, labelButton, loading }:
    ProfileFormProps<T>) {
    const router = useRouter()
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                <Card className="min-w-2/3 rounded shadow-lg border-0 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700">
                    <CardHeader>
                        <CardTitle className="capitalize flex gap-2 items-center text-gray-900 dark:text-gray-100">
                            {showBackButton && (
                                <Button variant="ghost" size="icon" onClick={() => router.back()} type="button">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            )}
                            {title}
                        </CardTitle>
                        {description && <CardDescription className="dark:text-gray-300">{description}</CardDescription>}
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {Array.isArray(data) ?
                            <div className="space-y-18">
                                {data.map((section, sectionIndex) => (
                                    <Card key={sectionIndex} className="bg-transparent shadow-none border-none p-0">
                                        {(section.title || section.description) && (
                                            <CardHeader className="p-4 bg-gray-200/50 rounded dark:bg-gray-700/50">
                                                {section.title && (
                                                    <CardTitle className="text-base flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                                        {section.icon && <section.icon className="w-5 h-5" />}
                                                        {section.title}
                                                    </CardTitle>
                                                )}
                                                {section.description && (
                                                    <CardDescription className="text-sm dark:text-gray-300">
                                                        {section.description}
                                                    </CardDescription>
                                                )}
                                            </CardHeader>
                                        )}
                                        <CardContent className="space-y-4 p-0">
                                            {(Object.entries(section.data) as [keyof T, Info][]).map(([key, other], i) =>
                                                <Field
                                                    name={String(key)}
                                                    info={other}
                                                    form={form}
                                                    key={i}
                                                    loading={loading}
                                                />)
                                            }
                                        </CardContent>
                                    </Card>
                                ))}
                            </div> :
                            (Object.entries(data) as [keyof T, Info][]).map(([key, other], i) =>
                                <Field
                                    name={String(key)}
                                    info={other}
                                    form={form}
                                    key={i}
                                    loading={loading}
                                />)
                        }

                        <div className="pt-2">
                            <ButtonLoading loading={loading} className="w-full" type="submit">
                                {labelButton}
                            </ButtonLoading>
                        </div>

                        {children && (
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                {children}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </form>
        </Form>
    )
}

type FieldProps<T> = { name: string, info: Info, form: UseFormReturn<T>, loading: boolean }

const Field = <T,>({ name, info, form, loading }: FieldProps<T>) => {
    const Icon = getFieldIcon(info.icon, info.type);
    const withIcon = info.withIcon || info.icon
    const [showPassword, setShowPassword] = useState(false)

    return (
        <FormField
            key={name}
            control={form.control}
            name={name as Path<T>}
            render={({ field }) => {
                const globalProps = {
                    className: clsx(withIcon && "pl-10"),
                    required: !info.notRequired,
                    disabled: field.disabled || loading,
                    placeholder: info.placeholder
                }
                return (
                    <FormItem>
                        <FormLabel className="text-gray-900 dark:text-gray-100">
                            {info.label}
                            {!info.notRequired && <span className="text-red-500 ml-1">*</span>}
                        </FormLabel>
                        <FormControl>
                            <div className="relative">
                                {withIcon && <Icon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground dark:text-gray-400" />}
                                {match(info.type)
                                    .with("select", () => (
                                        <Select
                                            value={field.value as string}
                                            onValueChange={field.onChange}
                                            {...globalProps}
                                        >
                                            <SelectTrigger className="w-80">
                                                <SelectValue placeholder={info.placeholder ?? "Sélectionnez une option"} />
                                            </SelectTrigger>
                                            <SelectContent
                                            >
                                                {info.options?.map((option, idx) => (
                                                    <SelectItem key={idx} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ))
                                    .with("number", () =>
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value as number}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                field.onChange(val === "" ? undefined : Number(val));
                                            }}
                                            {...globalProps}
                                        />
                                    )
                                    .with("icon", () => (
                                        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                                            {info.options?.map((option, idx) => (
                                                <button
                                                    {...globalProps}
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => field.onChange(option.value)}
                                                    className={`h-12 w-12 text-2xl rounded-lg border-2 transition-all hover:scale-110 hover:shadow-md ${field.value === option.value
                                                        ? 'border-primary bg-primary/10 scale-110'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    {option.icon ?? option.value}
                                                </button>
                                            ))}
                                        </div>
                                    ))
                                    .with("radio", () => (
                                        <RadioGroup
                                            value={field.value as string}
                                            onValueChange={field.onChange}
                                            {...globalProps}
                                            className="flex gap-5 flex-wrap"
                                        >
                                            {info.options?.map((option, idx) => (
                                                <div key={idx} className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value={option.value}
                                                        id={`${info.label}-${option.value}`}
                                                    />
                                                    <Label
                                                        htmlFor={`${info.label}-${option.value}`}
                                                        className="text-sm font-normal cursor-pointer"
                                                    >
                                                        {option.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    ))
                                    .with("checkbox", () => (
                                        <Flex className="flex gap-5 flex-wrap">
                                            {info.options?.map((option, idx) => {
                                                const isChecked = Array.isArray(field.value) && field.value.includes(option.value);
                                                const valueArray = (field.value as string[]) ?? [];

                                                return (
                                                    <div key={idx} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`${info.label}-${option.value}`}
                                                            checked={isChecked}
                                                            onCheckedChange={(checked) => {
                                                                let newValue: string[];
                                                                if (checked) {
                                                                    newValue = [...valueArray, option.value];
                                                                } else {
                                                                    newValue = valueArray.filter((v) => v !== option.value);
                                                                }
                                                                field.onChange(newValue);
                                                            }}
                                                        />
                                                        <Label htmlFor={`${info.label}-${option.value}`} className="text-sm font-normal cursor-pointer">
                                                            {option.label}
                                                        </Label>
                                                    </div>
                                                );
                                            })}
                                        </Flex>
                                    ))
                                    .with("tag", () => (
                                        <Flex className="flex gap-5 flex-wrap">
                                            {info.options?.map((option, idx) => {
                                                const isSelected = Array.isArray(field.value) && field.value.includes(option.value);
                                                const valueArray = (field.value as string[]) ?? [];
                                                return (
                                                    <Badge
                                                        key={idx}
                                                        variant={isSelected ? "default" : "outline"}
                                                        className={clsx(
                                                            "cursor-pointer transition-all hover:scale-105",
                                                            borderColorClasses[400][option.tagColor],
                                                            isSelected && [
                                                                "ring-2 ring-offset-1",
                                                                bgColorClasses[400][option.tagColor],
                                                                "text-white"
                                                            ],
                                                            !isSelected && textColorClasses[400][option.tagColor]
                                                        )}
                                                        onClick={() => {
                                                            let newValue: string[];
                                                            if (!isSelected) {
                                                                newValue = [...valueArray, option.value];
                                                            } else {
                                                                newValue = valueArray.filter((v) => v !== option.value);
                                                            }
                                                            field.onChange(newValue);
                                                        }}
                                                    >
                                                        {option.label}
                                                        {isSelected && (
                                                            <X className="ml-1 h-3 w-3" />
                                                        )}
                                                    </Badge>
                                                );
                                            })}
                                        </Flex>
                                    ))
                                    .with("command", () => {
                                        const valueArray = (field.value as string[]) ?? [];
                                        return (
                                            <Command>
                                                <CommandInput placeholder="Rechercher un utilisateur..." />
                                                <CommandList>
                                                    <CommandEmpty>Aucun utilisateur trouvé.</CommandEmpty>
                                                    {info.commandOption.map((command) => {
                                                        if (command.infos.length === 0) return
                                                        return <CommandGroup heading={command.name}>
                                                            {command.infos.map((info) => (
                                                                <CommandItem
                                                                    key={info.id}
                                                                    value={`${info.firstname} ${info.lastname}`}
                                                                    onSelect={() => {
                                                                        let newValue: string[];
                                                                        if (valueArray.includes(info.id)) {
                                                                            newValue = [...valueArray, info.id];
                                                                        } else {
                                                                            newValue = valueArray.filter((v) => v !== info.id);
                                                                        }
                                                                        field.onChange(newValue);
                                                                    }}
                                                                >
                                                                    <Flex align="center" gap="2" className="flex-1">
                                                                        <Avatar className="h-8 w-8">
                                                                            <AvatarFallback>
                                                                                {info.firstname[0]}{info.lastname[0]}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <span>
                                                                            {info.firstname} {info.lastname}
                                                                        </span>
                                                                    </Flex>
                                                                    <Check
                                                                        className={clsx(
                                                                            "ml-auto h-4 w-4",
                                                                            valueArray.includes(info.id) ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    }
                                                    )}
                                                </CommandList>
                                            </Command>)
                                    })
                                    .with("textarea", () => (
                                        <Textarea
                                            {...field}
                                            {...globalProps}
                                            value={field.value as string}
                                            className={clsx("w-full max-w-full break-all", globalProps.className)}
                                        />
                                    ))
                                    .with("password", () => (
                                        <>
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                {...globalProps}
                                                {...field}
                                                value={field.value as string}
                                            />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-0 top-1/2 -translate-y-1/2  "
                                            >
                                                {!showPassword ? <EyeClosed /> : <Eye />}
                                            </Button>
                                        </>
                                    ))
                                    .with(("switch"), () =>
                                        <Switch
                                            id={name}
                                            checked={field.value as boolean}
                                            onCheckedChange={field.onChange}
                                            disabled={globalProps.disabled}
                                        />)
                                    .otherwise(() =>
                                        <Input
                                            type={info.type}
                                            {...globalProps}
                                            {...field}
                                            value={field.value as string}
                                        />

                                    )}
                            </div>
                        </FormControl>
                        <FormMessage className="dark:text-gray-300" />
                    </FormItem>
                )
            }}
        />
    )
}

const getFieldIcon = (icon?: LucideIcon, type?: FieldType) => {
    if (icon) return icon
    switch (type) {
        case 'email':
            return Mail;
        case 'password':
            return Lock;
        case 'date':
            return Calendar;
        case 'number':
            return DollarSign;
        case 'phone':
            return Phone;
        case 'text':
        default:
            return User;
    }
};
