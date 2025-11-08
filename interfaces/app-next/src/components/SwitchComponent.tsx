import { Label } from "./ui/label"
import { Switch } from "./ui/switch"

type Props = { label: string, id: string, checked: boolean, onChange: (checkoud: boolean) => void }

export const SwitchComponent = ({ id, label, checked, onChange }: Props) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id}>{label}</Label>
    </div>
  )
}
