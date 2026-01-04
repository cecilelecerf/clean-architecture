import { CalendarClock, CheckCircle, Clock, LucideIcon, XCircle } from 'lucide-react';

type Status = Record<string, {
  label: string,
  variant: "default" | "destructive" | "outline" | "secondary",
  icon: LucideIcon,
  color: string,
  bgColor: string,
  borderColor: string,
  message?: { client: string, advisor: string }

}>

export const statusConfig: Status = {
  PENDING: {
    label: 'En attente',
    variant: 'secondary' as const,
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    message: {
      client:
        "⏳ Votre demande est en cours d'examen par nos conseillers. Vous recevrez une réponse prochainement.",
      advisor: "⏳ Cette demande est en attente de validation. Examinez les informations ci-dessous avant de prendre une décision."
    }
  },
  ACCEPTED: {
    label: 'Accepté',
    variant: 'default' as const,
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  REFUSED: {
    label: 'Refusé',
    variant: 'destructive' as const,
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    message: {
      client: "❌ Votre demande de crédit n'a pas été acceptée. Contactez votre conseiller pour plus d'informations.",
      advisor: "❌ Refus"

    }
  },
  COMPLETED: {
    label: 'Terminé',
    variant: 'outline' as const,
    icon: CheckCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    message: {
      client: "✅ Félicitations ! Votre crédit est entièrement remboursé.",
      advisor: "✅ Ce crédit est entièrement remboursé."

    }
  },
  ACCEPTED_FUTURE: {
    label: 'Accepté - À venir',
    variant: 'secondary' as const,
    icon: CalendarClock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
};
