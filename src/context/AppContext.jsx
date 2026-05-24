import { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [activeShop, setActiveShop] = useState(null);
  const [shopList, setShopList] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // Load shop list on mount — shared across all views
  useEffect(() => {
    fetch('/api/shops', { headers: { 'X-Admin-Token': import.meta.env.VITE_ADMIN_TOKEN || 'YUNFAN_ADMIN_2026' } })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length) setShopList(data); })
      .catch(() => {});
  }, []);

  return (
    <AppContext.Provider value={{ activeShop, setActiveShop, shopList, setShopList, toast, showToast }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
