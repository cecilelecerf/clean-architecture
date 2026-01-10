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
    variant: 'secondary',
    icon: Clock,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-500/10',
    borderColor: 'border-yellow-200 dark:border-yellow-700',
    message: {
      client:
        "⏳ Votre demande est en cours d'examen par nos conseillers. Vous recevrez une réponse prochainement.",
      advisor: "⏳ Cette demande est en attente de validation. Examinez les informations ci-dessous avant de prendre une décision."
    }
  },
  ACCEPTED: {
    label: 'Accepté',
    variant: 'default',
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-700',
  },
  REFUSED: {
    label: 'Refusé',
    variant: 'destructive',
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-500/10',
    borderColor: 'border-red-200 dark:border-red-900',
    message: {
      client: "❌ Votre demande de crédit n'a pas été acceptée. Contactez votre conseiller pour plus d'informations.",
      advisor: "❌ Refus"
    }
  },
  COMPLETED: {
    label: 'Terminé',
    variant: 'outline',
    icon: CheckCircle,
    color: 'text-blue-600 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-700',
    message: {
      client: "✅ Félicitations ! Votre crédit est entièrement remboursé.",
      advisor: "✅ Ce crédit est entièrement remboursé."
    }
  },
  ACCEPTED_FUTURE: {
    label: 'Accepté - À venir',
    variant: 'secondary',
    icon: CalendarClock,
    color: 'text-blue-600 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-700',
  },
};
