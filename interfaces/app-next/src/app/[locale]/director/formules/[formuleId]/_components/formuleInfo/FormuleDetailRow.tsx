interface FormuleDetailRowProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
}

export const FormuleDetailRow = ({ label, value, icon }: FormuleDetailRowProps) => (
    <div className="flex items-start justify-between py-2 border-b last:border-0">
        <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium text-muted-foreground">
                {label}
            </span>
        </div>
        <span className="text-sm font-semibold text-right">
            {value}
        </span>
    </div>
);