import React, { useEffect, useState, useCallback } from "react";
import { FlatList, ListRenderItem, StyleSheet, TouchableOpacity, View } from "react-native";
import { useAppDispatch, useAppSelector } from "application/store/hook";
import { useNavigation, useTheme } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppNavigationProp, RootApp } from "domain/entities/navigation";
import { Location } from "domain/entities/data/common";
import { remove } from "application/slice/restaurants/restaurants.slices";
import Layout from "presentation/components/layout/Layout";
import StyledButton from "presentation/components/button/StyledButton";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";
import LocationInformation from "../common/sales/LocationInformation";
import { Swipeable } from "react-native-gesture-handler";

type NavigationProps = StackNavigationProp<RootApp>;

const Card: React.FC<{ item: Location }> = ({ item }) => {
  const { colors } = useTheme();

  const [showInformation, setShowInformation] = useState<boolean>(false);

  const navigation = useNavigation<NavigationProps>();
  const dispatch = useAppDispatch();

  const RightSwipe = () => {
    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <StyledButton style={styles.option}>
          <Ionicons name="flame-outline" color={colors.text} size={18} />
        </StyledButton>
        <StyledButton style={styles.option}>
          <Ionicons name="location-outline" color={colors.text} size={18} />
        </StyledButton>
        <StyledButton style={styles.option}>
          <Ionicons name="time-outline" color={colors.text} size={18} />
        </StyledButton>
      </View>
    );
  };

  return (
    <>
      <Swipeable renderRightActions={RightSwipe}>
        <StyledButton
          onPress={() =>
            navigation.navigate("RestaurantRoutes", {
              screen: "Table",
              params: { restaurantID: item.id },
            })
          }
          onLongPress={() => setShowInformation(true)}
          style={styles.card}
        >
          {item.highlight && (
            <Ionicons name="star" color={colors.primary} size={18} style={{ marginRight: 6 }} />
          )}
          <StyledText>{item.name}</StyledText>
        </StyledButton>
      </Swipeable>
      <LocationInformation
        visible={showInformation}
        location={item}
        onClose={() => setShowInformation(false)}
        onPressDelete={() => dispatch(remove({ id: item.id }))}
        onPressEdit={() => {
          navigation.navigate("RestaurantRoutes", {
            screen: "CreateRestaurant",
            params: { restaurant: item },
          });
        }}
      />
    </>
  );
};

const Restaurant: React.FC<AppNavigationProp> = ({ navigation }) => {
  const { colors } = useTheme();

  const restaurants = useAppSelector((state) => state.restaurants);

  const [data, setData] = useState<Location[]>([]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ paddingRight: 20 }}
          onPress={() => navigation.navigate("RestaurantRoutes", { screen: "CreateRestaurant" })}
        >
          <Ionicons name="add" color={colors.primary} size={30} />
        </TouchableOpacity>
      ),
    });
  }, []);

  useEffect(() => {
    setData([...restaurants].sort((a, b) => (b.highlight ? 1 : 0) - (a.highlight ? 1 : 0)));
  }, [restaurants]);

  const renderItem: ListRenderItem<Location> = useCallback(({ item }) => <Card item={item} />, []);

  return (
    <Layout>
      {!restaurants.length ? (
        <StyledText color={colors.primary}>NO HAY RESTAURANTES REGISTRADOS</StyledText>
      ) : (
        <FlatList
          data={data}
          contentContainerStyle={{ flexGrow: 1 }}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
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

export default React.memo(Restaurant);
