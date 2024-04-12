export const generateSessionID = (): string => {
  const min = 10000000; // Smallest 8-digit number
  const max = 99999999; // Largest 8-digit number

  return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
};
