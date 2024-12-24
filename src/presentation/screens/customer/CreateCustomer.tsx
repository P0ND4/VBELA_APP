import React, { useEffect } from "react";
import { useAppDispatch } from "application/store/hook";
import { CustomerNavigationProp } from "domain/entities/navigation/root.customer.entity";
import { Customer } from "domain/entities/data/customers";
import { add } from "application/slice/customers/customers.slice";
import CreationForm from "./common/CreationForm";

const CreateCustomer: React.FC<CustomerNavigationProp> = ({ navigation }) => {
  const dispatch = useAppDispatch();

  useEffect(() => navigation.setOptions({ title: "Crear Agencia/Cliente" }), []);

  const save = (data: Customer) => {
    dispatch(add(data));
    navigation.pop();
  };

  return <CreationForm onSubmit={save} />;
};

export default CreateCustomer;
