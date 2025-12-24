import { CalendarClock, CheckCircle, Clock, XCircle } from 'lucide-react';

export const statusConfig = {
  PENDING: {
    label: 'En attente',
    variant: 'secondary' as const,
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  ACCEPTED: {
    label: 'Accepté',
    variant: 'default' as const,
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  REFUSED: {
    label: 'Refusé',
    variant: 'destructive' as const,
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  COMPLETED: {
    label: 'Terminé',
    variant: 'outline' as const,
    icon: CheckCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  ACCEPTED_FUTURE: {
    label: 'Accepté - À venir',
    variant: 'secondary' as const,
    icon: CalendarClock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
};
