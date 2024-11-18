import React, { useEffect } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useTheme } from "@react-navigation/native";
import Layout from "presentation/components/layout/Layout";
import StyledButton from "presentation/components/button/StyledButton";
import StyledText from "presentation/components/text/StyledText";
import Ionicons from "@expo/vector-icons/Ionicons";

type MultipleScreenProps = {
  name: string;
  unregistered: string;
  addPress?: () => void;
  cardPress?: () => void;
};

const MultipleScreen: React.FC<MultipleScreenProps> = ({
  name,
  unregistered,
  cardPress = () => {},
  addPress = () => {},
}) => {
  const { colors } = useTheme();

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={{ paddingRight: 20 }} onPress={() => addPress()}>
          <Ionicons name="add" color={colors.primary} size={30} />
        </TouchableOpacity>
      ),
    });
  }, []);

  return (
    <Layout>
      {/* <StyledText color={colors.primary}>
        NO HAY RESTAURANTES REGISTRADOS
      </StyledText> */}
      <View>
        <StyledButton onPress={() => cardPress()}>
          <StyledText>{name}</StyledText>
        </StyledButton>
        <StyledButton onPress={() => cardPress()}>
          <StyledText>{name} 2</StyledText>
        </StyledButton>
        <StyledButton onPress={() => cardPress()}>
          <StyledText>{name} 3</StyledText>
        </StyledButton>
        <StyledButton onPress={() => cardPress()}>
          <StyledText>{name} 4</StyledText>
        </StyledButton>
        <StyledButton onPress={() => cardPress()}>
          <StyledText>{name} 5</StyledText>
        </StyledButton>
        <StyledButton onPress={() => cardPress()}>
          <StyledText>{name} 6</StyledText>
        </StyledButton>
      </View>
    </Layout>
  );
};

// const styles = StyleSheet.create({});

export default MultipleScreen;
