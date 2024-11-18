import React, { createContext, useContext, useState, ReactNode } from "react";
import { Selection } from "domain/entities/data/common/order.entity";
import { Element } from "domain/entities/data/common/element.entity";

type InfoType = {
  discount: number;
  observation: string;
};

interface OrderContextType {
  info: InfoType;
  selection: Selection[];
  addSelection: (data: Element, registered: boolean, count: number) => void;
  updateSelection: (data: Selection) => void;
  removeSelection: (id: string) => void;
  updateInfo: (data: { discount?: number; observation?: string }) => void;
  clean: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [info, setInfo] = useState<InfoType>({ discount: 0, observation: "" });
  const [selection, setSelection] = useState<Selection[]>([]);

  const addSelection = (data: Element, registered: boolean, count: number) => {
    const exists = selection.find((s) => s.id === data.id);
    if (exists) {
      const quantity = exists.quantity + count;
      const newObj = { ...exists, quantity, total: quantity * data?.price };
      const changed = selection.map((s) => (s.id === exists.id ? newObj : s));
      setSelection(changed);
    } else {
      const newObj = {
        id: data.id,
        name: data.name,
        discount: 0,
        quantity: count,
        value: data.price,
        unit: data?.unit,
        total: data.price * count,
        registered,
      };
      setSelection([...selection, newObj]);
    }
  };

  const updateSelection = (data: Selection) => {
    const changed = selection.map((s) => (s.id === data.id ? data : s));
    setSelection(changed);
  };

  const updateInfo = (data: { discount?: number; observation?: string }) => {
    setInfo({ ...info, ...data });
  };

  const removeSelection = (id: string) => {
    const changed = selection.filter((s) => s.id !== id);
    setSelection(changed);
  };

  const clean = () => {
    setInfo({ discount: 0, observation: "" });
    setSelection([]);
  };

  return (
    <OrderContext.Provider
      value={{
        info,
        selection,
        addSelection,
        clean,
        updateSelection,
        updateInfo,
        removeSelection,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useUser debe ser usado dentro de un UserProvider");
  }
  return context;
};

export { OrderProvider, useOrder };
