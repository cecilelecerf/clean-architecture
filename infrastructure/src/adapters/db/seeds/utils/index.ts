export const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
export const pick = <T>(arr: T[]) =>
  arr[Math.floor(Math.random() * arr.length)];

export const generateFrenchIBAN = (): string => {
  const countryCode = "FR";

  const bankCode = String(Math.floor(10000 + Math.random() * 89999)).padStart(
    5,
    "0"
  );
  const branchCode = String(Math.floor(10000 + Math.random() * 89999)).padStart(
    5,
    "0"
  );
  const accountNumber = String(
    Math.floor(1000000000 + Math.random() * 8999999999)
  ).padStart(10, "0");
  const ribKey = String(Math.floor(10 + Math.random() * 89)).padStart(2, "0");

  // Pour calculer le check digits, remplacer FR00 par 00 + reste
  const bban = `${bankCode}${branchCode}${accountNumber}${ribKey}`;
  const checkIban = `${bban}${countryCode}00`;

  // Convert letters to numbers (A=10, B=11...)
  const numericIban = checkIban
    .split("")
    .map((c) => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) return (code - 55).toString();
      return c;
    })
    .join("");

  // Calcul du modulo 97 pour les chiffres de contrôle
  let remainder = "";
  for (let i = 0; i < numericIban.length; i += 7) {
    const block = remainder + numericIban.substr(i, 7);
    remainder = (parseInt(block, 10) % 97).toString();
  }

  const checkDigits = (98 - parseInt(remainder, 10))
    .toString()
    .padStart(2, "0");

  return `${countryCode}${checkDigits}${bban}`;
};
