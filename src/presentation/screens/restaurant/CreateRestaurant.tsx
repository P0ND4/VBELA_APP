import React, { useEffect } from "react";
import { useAppDispatch } from "application/store/hook";
import { StackNavigationProp } from "@react-navigation/stack";
import { RestaurantRouteProp } from "domain/entities/navigation/route.restaurant.entity";
import { Location } from "domain/entities/data/common";
import { add, edit } from "application/slice/restaurants/restaurants.slices";
import { RootRestaurant } from "domain/entities/navigation";
import { Visible } from "domain/enums/data/inventory/visible.enums";
import CreateLocation from "../common/sales/CreateLocation";

type CreateRestaurantProps = {
  navigation: StackNavigationProp<RootRestaurant>;
  route: RestaurantRouteProp<"CreateRestaurant">;
};

const CreateRestaurant: React.FC<CreateRestaurantProps> = ({ navigation, route }) => {
  const restaurant = route.params?.restaurant;

  const dispatch = useAppDispatch();

  useEffect(() => {
    navigation.setOptions({ title: `${restaurant ? "Editar" : "Crear"} restaurante` });
  }, []);

  const save = (data: Location) => {
    dispatch(add(data));
    navigation.pop();
  };

  const update = (data: Location) => {
    dispatch(edit(data));
    navigation.pop();
  };

  return <CreateLocation onSave={save} onUpdate={update} visible={Visible.Restaurant} defaultValue={restaurant} />;
};

export default CreateRestaurant;
