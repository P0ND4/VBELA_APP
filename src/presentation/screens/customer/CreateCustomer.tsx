import React, { useEffect, useState } from "react";
import { CustomerNavigationProp } from "domain/entities/navigation/root.customer.entity";
import CreationForm from "./common/CreationForm";

const CreateCustomer: React.FC<CustomerNavigationProp> = ({ navigation }) => {
  const [isAgency, setIsAgency] = useState<boolean>(false);

  useEffect(() => {
    navigation.setOptions({ title: `Crear ${isAgency ? "agencia" : "cliente"}` });
  }, [isAgency]);

  return <CreationForm onChageSwitchAgency={(value: boolean) => setIsAgency(value)} />;
};

export default CreateCustomer;
