export function formatDateFrench(isoString: string | Date): string {
  const date = typeof isoString === 'string' ? new Date(isoString) : isoString;
  console.log(date);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Mois commence à 0
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}
