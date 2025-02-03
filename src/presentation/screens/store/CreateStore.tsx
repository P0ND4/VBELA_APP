import React, { useEffect } from "react";
import { RootStore, StoreRouteProp } from "domain/entities/navigation/route.store.entity";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAppDispatch } from "application/store/hook";
import { Location } from "domain/entities/data/common";
import { add, edit } from "application/slice/stores/stores.slice";
import { Visible } from "domain/enums/data/inventory/visible.enums";
import CreateLocation from "../common/sales/CreateLocation";
import apiClient, { endpoints } from "infrastructure/api/server";

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

  const save = async (data: Location) => {
    dispatch(add(data));
    navigation.pop();
    await apiClient({
      url: endpoints.store.post(),
      method: "POST",
      data,
    });
  };

  const update = async (data: Location) => {
    dispatch(edit(data));
    navigation.pop();
    await apiClient({
      url: endpoints.store.put(),
      method: "PUT",
      data,
    });
  };

  return (
    <CreateLocation onUpdate={update} onSave={save} visible={Visible.Store} defaultValue={store} />
  );
};

export default CreateStore;
