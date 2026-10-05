export const toSentenceCase = (input: string): string => {
  const lower = input.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};
