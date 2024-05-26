import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { add, edit, remove } from "@features/tables/menuSlice";
import { addMenu, editMenu, removeMenu } from "@api";
import { random } from "@helpers/libs";
import Create from "@utils/product/screens/Create";

const CreateProduct = ({ navigation, route }) => {
  const menu = useSelector((state) => state.menu);
  const helperStatus = useSelector((state) => state.helperStatus);
  const user = useSelector((state) => state.user);
  const groups = useSelector((state) => state.groups);

  const [categoryOptions, setCategoryOptions] = useState([]);

  const onSubmit = route.params?.onSubmit;
  const item = route.params?.item;

  const dispatch = useDispatch();

  useEffect(() => {
    const filtered = groups.filter((g) => g.type === "menu");
    setCategoryOptions(filtered.map((g) => ({ ...g, name: g.category })));
  }, [groups]);

  const onSubmitCreate = async (data) => {
    const id = random(20);
    if (menu.find((m) => m.id === id)) return onSubmitCreate(data);
    data.id = id;
    data.creationDate = new Date().getTime();
    data.modificationDate = new Date().getTime();

    dispatch(add(data));
    navigation.pop();
    await addMenu({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      menu: data,
      helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
    });
  };

  const onSubmitEdit = async (data) => {
    data.id = item.id;
    data.group = null;
    data.creationDate = item.creationDate;
    data.modificationDate = new Date().getTime();
    onSubmit();
    dispatch(edit({ id: item.id, data }));
    navigation.pop();
    await editMenu({
      identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
      menu: data,
      helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
    });
  };

  const onSubmitRemove = async () => {
    Alert.alert("Eliminar", "¿Esta seguro que desea eliminar el producto?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Si",
        onPress: async () => {
          onSubmit();
          dispatch(remove({ id: item.id }));
          navigation.pop();
          await removeMenu({
            identifier: helperStatus.active ? helperStatus.identifier : user.identifier,
            id: item.id,
            helpers: helperStatus.active ? [helperStatus.id] : user.helpers.map((h) => h.id),
          });
        },
      },
    ]);
  };

  return (
    <>
      <Create
        item={item}
        categoryOptions={categoryOptions}
        type="menu"
        onRemove={() => onSubmitRemove()}
        onSubmit={!item ? onSubmitCreate : onSubmitEdit}
      />
    </>
  );
};

export default CreateProduct;
