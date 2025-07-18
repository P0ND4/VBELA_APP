import React, { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import GroupForm from "presentation/screens/common/group/GroupForm";
import { StackNavigationProp } from "@react-navigation/stack";
import { InventoryRouteProp, RootInventory } from "domain/entities/navigation";
import { useAppDispatch } from "application/store/hook";
import { add, edit, remove } from "application/slice/inventories/recipe.group.slice";
import { Group } from "domain/entities/data";
import apiClient from "infrastructure/api/server";
import { batch } from "react-redux";
import { removeCategory, updateSubcategories } from "application/slice/inventories/recipes.slice";
import { useTheme } from "@react-navigation/native";
import { useWebSocketContext } from "infrastructure/context/SocketContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import endpoints from "config/constants/api.endpoints";

type CreateGroupProps = {
  navigation: StackNavigationProp<RootInventory>;
  route: InventoryRouteProp<"CreateRecipeGroup">;
};

const CreateGroup: React.FC<CreateGroupProps> = ({ navigation, route }) => {
  const { emit } = useWebSocketContext();
  const { colors } = useTheme();

  const inventoryID = route.params.inventoryID;
  const group = route.params?.group;

  const dispatch = useAppDispatch();

  const removeItem = async (id: string) => {
    batch(() => {
      dispatch(remove({ id }));
      dispatch(removeCategory({ id }));
    });
    navigation.pop();
    await apiClient({
      url: endpoints.recipeGroup.delete(id),
      method: "DELETE",
    });
    emit("accessToInventory");
  };

  useEffect(() => {
    navigation.setOptions({
      title: `Receta: ${group ? "Editar" : "Crear"} grupo`,
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
      url: endpoints.recipeGroup.post(),
      method: "POST",
      data,
    });
  };

  const update = async (data: Group) => {
    batch(() => {
      dispatch(edit(data));
      dispatch(updateSubcategories(data));
    });
    navigation.pop();
    await apiClient({
      url: endpoints.recipeGroup.put(data.id),
      method: "PUT",
      data,
    });
  };

  return <GroupForm ownerID={inventoryID} onSave={save} onUpdate={update} defaultValue={group} />;
};

export default CreateGroup;
