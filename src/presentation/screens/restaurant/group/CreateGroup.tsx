import React, { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import GroupForm from "presentation/screens/common/group/GroupForm";
import { StackNavigationProp } from "@react-navigation/stack";
import { RestaurantRouteProp, RootRestaurant } from "domain/entities/navigation";
import { useAppDispatch } from "application/store/hook";
import { add, edit, remove } from "application/slice/restaurants/menu.group.slice";
import { Group } from "domain/entities/data";
import apiClient from "infrastructure/api/server";
import { batch } from "react-redux";
import { removeCategory, updateSubcategories } from "application/slice/restaurants/menu.slice";
import { useWebSocketContext } from "infrastructure/context/SocketContext";
import { useTheme } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import endpoints from "config/constants/api.endpoints";

type CreateGroupProps = {
  navigation: StackNavigationProp<RootRestaurant>;
  route: RestaurantRouteProp<"CreateGroup">;
};

const CreateGroup: React.FC<CreateGroupProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { emit } = useWebSocketContext();

  const restaurantID = route.params.restaurantID;
  const group = route.params?.group;

  const dispatch = useAppDispatch();

  const removeItem = async (id: string) => {
    batch(() => {
      dispatch(remove({ id }));
      dispatch(removeCategory({ id }));
    });
    navigation.pop();
    await apiClient({
      url: endpoints.menuGroup.delete(id),
      method: "DELETE",
    });
    emit("accessToRestaurant");
  };

  useEffect(() => {
    navigation.setOptions({
      title: `Restaurante: ${group ? "Editar" : "Crear"} grupo`,
      ...(group && {
        headerRight: () => (
          <TouchableOpacity style={{ paddingRight: 15 }} onPress={() => removeItem(group.id)}>
            <Ionicons name="trash-outline" color={colors.text} size={25} />
          </TouchableOpacity>
        ),
      }),
    });
  }, []);

  const save = async (data: Group) => {
    dispatch(add(data));
    navigation.pop();
    await apiClient({
      url: endpoints.menuGroup.post(),
      method: "POST",
      data,
    });
    emit("accessToRestaurant");
  };

  const update = async (data: Group) => {
    batch(() => {
      dispatch(edit(data));
      dispatch(updateSubcategories(data));
    });
    navigation.pop();
    await apiClient({
      url: endpoints.menuGroup.put(data.id),
      method: "PUT",
      data,
    });
    emit("accessToRestaurant");
  };

  return <GroupForm ownerID={restaurantID} onSave={save} onUpdate={update} defaultValue={group} />;
};

export default CreateGroup;
