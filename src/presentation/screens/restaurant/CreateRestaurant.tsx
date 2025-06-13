import React, { useEffect } from "react";
import { useAppDispatch } from "application/store/hook";
import { StackNavigationProp } from "@react-navigation/stack";
import { RestaurantRouteProp } from "domain/entities/navigation/route.restaurant.entity";
import { Location } from "domain/entities/data/common";
import { add, edit } from "application/slice/restaurants/restaurants.slices";
import { RootRestaurant } from "domain/entities/navigation";
import { Visible } from "domain/enums/data/inventory/visible.enums";
import { useWebSocketContext } from "infrastructure/context/SocketContext";
import CreateLocation from "../common/sales/CreateLocation";
import apiClient from "infrastructure/api/server";
import endpoints from "config/constants/api.endpoints";

type CreateRestaurantProps = {
  navigation: StackNavigationProp<RootRestaurant>;
  route: RestaurantRouteProp<"CreateRestaurant">;
};

const CreateRestaurant: React.FC<CreateRestaurantProps> = ({ navigation, route }) => {
  const restaurant = route.params?.restaurant;

  const { emit } = useWebSocketContext();

  const dispatch = useAppDispatch();

  useEffect(() => {
    navigation.setOptions({ title: `${restaurant ? "Editar" : "Crear"} restaurante` });
  }, []);

  const save = async (data: Location) => {
    dispatch(add(data));
    navigation.pop();
    await apiClient({
      url: endpoints.restaurant.post(),
      method: "POST",
      data,
    });
    emit("accessToRestaurant");
  };

  const update = async (data: Location) => {
    dispatch(edit(data));
    navigation.pop();
    await apiClient({
      url: endpoints.restaurant.put(data.id),
      method: "PUT",
      data,
    });
    emit("accessToRestaurant");
  };

  return (
    <CreateLocation
      onSave={save}
      onUpdate={update}
      visible={Visible.Restaurant}
      defaultValue={restaurant}
    />
  );
};

export default CreateRestaurant;
