export const formatRwf = (amount) => {
  const n = Number(amount || 0);
  return `${n.toLocaleString()} RWF`;
};
