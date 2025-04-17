import React, { createContext, useContext, useState, ReactNode } from "react";
import { Order, Selection } from "domain/entities/data/common/order.entity";
import { Element } from "domain/entities/data/common/element.entity";

type InfoType = {
  discount: number;
  observation: string;
  tip: number;
  tax: number;
};

interface OrderContextType {
  info: InfoType;
  selection: Selection[];
  order: Order | null;
  addSelection: (data: Element, registered: boolean, count: number) => void;
  updateSelection: (data: Selection) => void;
  removeSelection: (id: string) => void;
  updateInfo: (data: Partial<InfoType>) => void;
  change: (data: Order) => void;
  clean: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [info, setInfo] = useState<InfoType>({ discount: 0, tip: 0, tax: 0, observation: "" });
  const [order, setOrder] = useState<Order | null>(null);
  const [selection, setSelection] = useState<Selection[]>([]);

  const updateInfo = (data: Partial<InfoType>) => {
    setInfo({ ...info, ...data });
  };

  const change = (data: Order) => {
    setOrder(data);
    setInfo({
      discount: data.discount,
      observation: data.observation,
      tip: data.tip,
      tax: data.tax,
    });
    setSelection(data.selection);
  };

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
        activeStock: data.activeStock,
        stockIDS: data.stockIDS,
        packageIDS: data.packageIDS,
        value: data.price,
        unit: data.unit,
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

  const removeSelection = (id: string) => {
    const changed = selection.filter((s) => s.id !== id);
    setSelection(changed);
  };

  const clean = () => {
    setInfo({ discount: 0, observation: "", tip: 0, tax: 0 });
    setSelection([]);
  };

  return (
    <OrderContext.Provider
      value={{
        info,
        selection,
        order,
        addSelection,
        clean,
        updateSelection,
        updateInfo,
        removeSelection,
        change,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder debe ser usado dentro de un UserProvider");
  }
  return context;
};

export { OrderProvider, useOrder };
