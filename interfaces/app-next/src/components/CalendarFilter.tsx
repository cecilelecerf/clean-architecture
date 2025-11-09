"use client"

import * as React from "react"
import { CalendarIcon, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatDateFrench } from "@/utils/date/formatDateFrench"



const isValidDate = (date: Date | undefined) => {
    return !!date && !isNaN(date.getTime())
}

type Props = { dateIso: string, onDateChange: (date: Date) => void, label?: string, placeholder?: string }

export const CalendarFilter = ({ dateIso, onDateChange, label, placeholder = String(formatDateFrench(new Date())) }: Props) => {
    const initialDate = dateIso ? new Date(dateIso) : undefined
    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(initialDate)
    const [month, setMonth] = React.useState<Date | undefined>(initialDate)
    const [displayValue, setDisplayValue] = React.useState(
        initialDate ? formatDateFrench(initialDate) : ""
    )

    return (
        <div className="flex flex-col gap-1">
            {label && <Label htmlFor="date" className="px-1">{label}</Label>}
            <div className="relative flex gap-2">
                <div className="relative flex w-full items-center">
                    <Input
                        id="date"
                        value={displayValue}
                        placeholder={placeholder}
                        className="pr-10 "
                        onChange={(e) => {
                            const parsed = new Date(e.target.value)
                            setDisplayValue(e.target.value)
                            if (isValidDate(parsed)) {
                                setDate(parsed)
                                setMonth(parsed)
                                onDateChange(parsed)
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "ArrowDown") {
                                e.preventDefault()
                                setOpen(true)
                            }
                        }}
                    />
                    {date &&
                        <Button size="icon" variant="ghost" className="absolute right-7"
                            onClick={() => {
                                setDate(undefined)
                                setMonth(undefined)
                                onDateChange(undefined)
                                setDisplayValue("")
                            }}><X />
                        </Button>
                    }
                </div>

                <Popover open={open} onOpenChange={setOpen} >
                    <PopoverTrigger asChild>
                        <Button
                            id="date-picker"
                            variant="ghost"
                            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                        >
                            <CalendarIcon className="size-3.5" />
                            <span className="sr-only">Select date</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="center" alignOffset={-8} sideOffset={10}>
                        <Calendar
                            mode="single"
                            selected={date}
                            captionLayout="dropdown"
                            month={month}
                            onMonthChange={setMonth}
                            onSelect={(selectedDate) => {
                                setDate(selectedDate)
                                setMonth(selectedDate)
                                setDisplayValue(formatDateFrench(selectedDate))
                                onDateChange(selectedDate)
                                setOpen(false)
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>

        </div>
    )
}
