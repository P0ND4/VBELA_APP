import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { editOrder, editSale } from "@api";
import { edit as editO } from "@features/tables/ordersSlice";
import { edit as editS } from "@features/sales/salesSlice";
import { random } from "@helpers/libs";
import PaymentManager from "@utils/order/preview/PaymentManager";

const EventPayment = ({ item, modalVisible, setModalVisible }) => {
  const orders = useSelector((state) => state.orders);
  const sales = useSelector((state) => state.sales);

  const [order, setOrder] = useState(null);
  const [previews, setPreviews] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    (() => {
      if (!order) return;
      const filtered = order?.selection.filter((s) => s.method.some((m) => m.method === "credit"));
      const previews = filtered.map((s) => {
        const quantity = s.method.reduce((a, b) => (b.method === "credit" ? a + b.quantity : a), 0);
        return { ...s, quantity, paid: 0 };
      });
      setPreviews(previews);
    })();
  }, [order]);

  useEffect(() => {
    if (item.details === "sale") setOrder(sales.find((s) => s.id === item.id));
    if (item.details === "order") setOrder(orders.find((o) => o.id === item.id));
  }, [item, orders, sales]);

  const saveOrder = async ({ order, change }) => {
    const quantity = change.reduce((a, b) => a + b.quantity, 0);
    const paid = change.reduce((a, b) => a + b.paid, 0);

    if (item.details === "sale") dispatch(editS({ id: order.id, data: order }));
    else dispatch(editO({ id: order.id, data: order }));

    const orderStatus = {
      ...order,
      selection: change,
      total: change.reduce((a, b) => a + b.total, 0),
    };

    navigation.navigate("OrderStatus", {
      data: orderStatus,
      status: quantity === paid ? "paid" : "pending",
    });

    if (item.details === "sale") {
      //TODO QUE PUEDA HABER UN GESTOR DE ORDENES DE LOS 2 PARA EVIAR LA CONDICIONAL
      await editSale({
        identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
        sale: order,
        helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
      });
    } else {
      await editOrder({
        identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
        order,
        helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
      });
    }
  };

  return (
    <PaymentManager
      key={modalVisible}
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      toPay={previews || []}
      tax={order?.tax}
      tip={order?.tip}
      discount={order?.discount}
      code={order?.invoice}
      paymentMethodActive={true}
      onSubmit={async ({ change, paymentMethod }) => {
        const selection = order?.selection.map((s) => {
          const found = change.find((c) => c.id === s.id);
          if (!found) return s;
          const getTotal = (quantity) => quantity * s.price * (1 - s.discount || 0);
          const total = getTotal(found?.paid);

          let remaining = found.paid;
          const method = s.method.reduce((acc, m) => {
            if (m.method !== "credit") return [...acc, m];
            const currentQuantity = m.quantity - remaining;
            if (currentQuantity > 0) {
              const total = getTotal(currentQuantity);
              acc.push({ ...m, quantity: currentQuantity, total });
              remaining = 0;
            } else remaining -= m.quantity;
            return acc;
          }, []);

          return {
            ...s,
            status: found.paid !== found.quantity ? "credit" : "paid",
            method: [...method, { id: random(6), method: paymentMethod, total, quantity: found?.paid }],
          };
        });
        await saveOrder({ order: { ...order, selection }, change });
      }}
    />
  );
};

export default EventPayment;
