import React, { useCallback, useEffect, useState } from "react";
import { FlatList, ListRenderItem, StyleSheet, TouchableOpacity, View } from "react-native";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { useNavigation, useTheme } from "@react-navigation/native";
import { AppNavigationProp, RootStore } from "domain/entities/navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import { Location } from "domain/entities/data/common";
import { Swipeable } from "react-native-gesture-handler";
import { remove } from "application/slice/stores/stores.slice";
import {
  change,
  SalesNavigation,
} from "application/appState/navigation/sales.navigation.method.slice";
import Ionicons from "@expo/vector-icons/Ionicons";
import StyledText from "presentation/components/text/StyledText";
import Layout from "presentation/components/layout/Layout";
import LocationInformation from "../common/sales/LocationInformation";
import StyledButton from "presentation/components/button/StyledButton";
import apiClient, { endpoints } from "infrastructure/api/server";

type NavigationProps = StackNavigationProp<RootStore>;

const Card: React.FC<{ item: Location }> = ({ item }) => {
  const { colors } = useTheme();

  const [showInformation, setShowInformation] = useState<boolean>(false);

  const navigation = useNavigation<NavigationProps>();
  const dispatch = useAppDispatch();

  const RightSwipe = () => {
    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <StyledButton style={styles.option}>
          <Ionicons name="location-outline" color={colors.text} size={18} />
        </StyledButton>
        <StyledButton style={styles.option}>
          <Ionicons name="time-outline" color={colors.text} size={18} />
        </StyledButton>
      </View>
    );
  };

  const removeItem = async (id: string) => {
    dispatch(remove({ id }));
    await apiClient({
      url: endpoints.store.delete(id),
      method: "DELETE",
    });
  };

  return (
    <>
      {/* <Swipeable renderRightActions={RightSwipe}> */}
      <StyledButton
        onPress={() => {
          dispatch(change(SalesNavigation.Navigate));
          navigation.navigate("ProviderStoreRoutes", {
            screen: "CreateOrder",
            params: { storeID: item.id },
          });
        }}
        onLongPress={() => setShowInformation(true)}
        style={styles.card}
      >
        {item.highlight && (
          <Ionicons name="star" color={colors.primary} size={18} style={{ marginRight: 6 }} />
        )}
        <StyledText>{item.name}</StyledText>
      </StyledButton>
      {/* </Swipeable> */}
      <LocationInformation
        visible={showInformation}
        location={item}
        onClose={() => setShowInformation(false)}
        onPressDelete={() => removeItem(item.id)}
        onPressEdit={() => {
          navigation.navigate("StoreRoutes", { screen: "CreateStore", params: { store: item } });
        }}
      />
    </>
  );
};

const Store: React.FC<AppNavigationProp> = ({ navigation }) => {
  const { colors } = useTheme();

  const stores = useAppSelector((state) => state.stores);

  const [data, setData] = useState<Location[]>([]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ paddingRight: 20 }}
          onPress={() => navigation.navigate("StoreRoutes", { screen: "CreateStore" })}
        >
          <Ionicons name="add" color={colors.primary} size={30} />
        </TouchableOpacity>
      ),
    });
  }, []);

  useEffect(() => {
    setData([...stores].sort((a, b) => (b.highlight ? 1 : 0) - (a.highlight ? 1 : 0)));
  }, [stores]);

  const renderItem: ListRenderItem<Location> = useCallback(({ item }) => <Card item={item} />, []);

  return (
    <Layout>
      {!stores.length ? (
        <StyledText color={colors.primary}>NO HAY TIENDAS REGISTRADAS</StyledText>
      ) : (
        <FlatList
          data={data}
          contentContainerStyle={{ flexGrow: 1 }}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    flexGrow: 1,
    width: "auto",
  },
  option: {
    paddingHorizontal: 12,
    marginLeft: 4,
    width: "auto",
  },
});

export default React.memo(Store);
