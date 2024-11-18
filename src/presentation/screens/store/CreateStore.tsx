import React, { useEffect } from "react";
import { RootStore, StoreRouteProp } from "domain/entities/navigation/route.store.entity";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAppDispatch } from "application/store/hook";
import { Location } from "domain/entities/data/common";
import { addMultiple, edit } from "application/slice/stores/store.slice";
import CreateLocation from "../common/sales/CreateLocation";

type CreateStoreProps = {
  navigation: StackNavigationProp<RootStore>;
  route: StoreRouteProp<"CreateStore">;
};

const CreateStore: React.FC<CreateStoreProps> = ({ navigation, route }) => {
  const store = route.params?.store;

  const dispatch = useAppDispatch();

  useEffect(() => {
    navigation.setOptions({ title: `${store ? "Editar" : "Crear"} tienda` });
  }, []);

  const save = (multiple: Location[]) => {
    dispatch(addMultiple(multiple));
    navigation.pop();
  };

  const update = (data: Location) => {
    dispatch(edit(data));
    navigation.pop();
  };

  return <CreateLocation onUpdate={update} onSave={save} defaultValue={store} />;
};

export default CreateStore;
