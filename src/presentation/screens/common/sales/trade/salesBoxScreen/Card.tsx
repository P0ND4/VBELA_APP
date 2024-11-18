import React, { useState } from "react";
import { View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Element } from "domain/entities/data/common/element.entity";
import SalesCard from "../../components/SalesCard";
import CardModal from "./CardModal";

type CardProps = {
  item: Element;
  onPress?: () => void;
  onPressEdit: (data: Element) => void;
};

const Card: React.FC<CardProps> = ({ item, onPressEdit, onPress }) => {
  const { colors } = useTheme();

  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const onToggle = () => setModalVisible(!modalVisible);

  return (
    <>
      <SalesCard onLongPress={onToggle} data={item} onPress={onPress}/>
      <View style={{ borderBottomWidth: 1, borderColor: colors.border }} />
      <CardModal visible={modalVisible} onClose={onToggle} data={item} onPressEdit={onPressEdit} />
    </>
  );
};

export default Card;
