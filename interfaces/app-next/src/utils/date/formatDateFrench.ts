export function formatDateFrench(isoString: string | Date): string {
  const date = typeof isoString === 'string' ? new Date(isoString) : isoString;
<<<<<<< HEAD:interfaces/app-next/src/utils/date/formatDateFrench.ts
<<<<<<< HEAD:interfaces/app-next/src/utils/date/formatDateFrench.ts
=======
  console.log(date);
>>>>>>> 2ce9cab (thread):interfaces/web/app-next/src/utils/date/formatDateFrench.ts
=======
>>>>>>> a64ec38 (messages temps réels):interfaces/web/app-next/src/utils/date/formatDateFrench.ts
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Mois commence à 0
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}
