import React, { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import GroupForm from "presentation/screens/common/group/GroupForm";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStore, StoreRouteProp } from "domain/entities/navigation";
import { useAppDispatch } from "application/store/hook";
import { add, edit, remove } from "application/slice/stores/product.group.slice";
import { Group } from "domain/entities/data";
import apiClient from "infrastructure/api/server";
import { batch } from "react-redux";
import { removeCategory, updateSubcategories } from "application/slice/stores/products.slice";
import { useWebSocketContext } from "infrastructure/context/SocketContext";
import { useTheme } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import endpoints from "config/constants/api.endpoints";

type CreateGroupProps = {
  navigation: StackNavigationProp<RootStore>;
  route: StoreRouteProp<"CreateGroup">;
};

const CreateGroup: React.FC<CreateGroupProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { emit } = useWebSocketContext();

  const storeID = route.params.storeID;
  const group = route.params?.group;

  const dispatch = useAppDispatch();

  const removeItem = async (id: string) => {
    batch(() => {
      dispatch(remove({ id }));
      dispatch(removeCategory({ id }));
    });
    navigation.pop();
    await apiClient({
      url: endpoints.productGroup.delete(id),
      method: "DELETE",
    });
    emit("accessToStore");
  };

  useEffect(() => {
    navigation.setOptions({
      title: `Tienda: ${group ? "Editar" : "Crear"} grupo`,
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
      url: endpoints.productGroup.post(),
      method: "POST",
      data,
    });
    emit("accessToStore");
  };

  const update = async (data: Group) => {
    batch(() => {
      dispatch(edit(data));
      dispatch(updateSubcategories(data));
    });
    navigation.pop();
    await apiClient({
      url: endpoints.productGroup.put(data.id),
      method: "PUT",
      data,
    });
    emit("accessToStore");
  };

  return <GroupForm ownerID={storeID} onSave={save} onUpdate={update} defaultValue={group} />;
};

export default CreateGroup;
