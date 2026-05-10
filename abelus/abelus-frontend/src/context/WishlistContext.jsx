import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext(null);
const KEY = "Impressa_wishlist";

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  });

  useEffect(()=>{
    localStorage.setItem(KEY, JSON.stringify(ids));
  }, [ids]);

  const toggle = (id) => setIds((prev) => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  const remove = (id) => setIds((prev) => prev.filter(x=>x!==id));
  const clear = () => setIds([]);
  const has = (id) => ids.includes(id);

  return (
    <WishlistContext.Provider value={{ ids, toggle, remove, clear, has }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
