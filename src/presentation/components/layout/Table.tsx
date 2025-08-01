import React, { createContext, useContext, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import StyledText from "../text/StyledText";
import InformationModal from "../modal/InformationModal";

// Contextos para validar el uso correcto de los componentes
const TableContext = createContext<boolean>(false);
const TableHeaderContext = createContext<boolean>(false);

// Interfaces para TypeScript
interface TableProps {
  full?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  width?: number;
  scrollHorizontalEnable?: boolean;
  scrollVerticalEnable?: boolean;
  children?: React.ReactNode;
}

const TablePropsContext = createContext<TableProps>({});

interface TableHeaderProps {
  data: (string | { text: string; onPress?: () => void; style?: StyleProp<TextStyle> })[];
  children?: React.ReactNode;
  cellColor?: string;
}

interface TableBodyProps {
  onPressCompleteData?: boolean;
  data: (string | { text: string; onPress?: () => void; style?: StyleProp<TextStyle> })[];
  cellColor?: string;
}

interface TableComponent extends React.FC<TableProps> {
  Header: React.FC<TableHeaderProps>;
  Body: React.FC<TableBodyProps>;
}

// Componente Table
const Table: TableComponent = ({
  children,
  full = false,
  style = {},
  containerStyle = {},
  width,
  scrollHorizontalEnable = true,
  scrollVerticalEnable = true,
  headerStyle = {},
  bodyStyle = {},
}) => {
  const isInsideTable = useContext(TableContext);

  if (isInsideTable) throw "Table no debe usarse dentro de otro Table.";

  return (
    <TableContext.Provider value={true}>
      <TablePropsContext.Provider
        value={{
          full,
          style,
          width,
          scrollVerticalEnable,
          headerStyle,
          bodyStyle,
        }}
      >
        <View style={[containerStyle, { flex: 1 }]}>
          <ScrollView
            horizontal
            contentContainerStyle={{ flexGrow: 1 }}
            scrollEnabled={scrollHorizontalEnable}
          >
            <View style={{ width: "100%" }}>{children}</View>
          </ScrollView>
        </View>
      </TablePropsContext.Provider>
    </TableContext.Provider>
  );
};

const defaultStyles = (tableProps: TableProps, borderColor: string) => [
  styles.cell,
  tableProps.style,
  !!tableProps.width && { width: tableProps.width },
  tableProps.full && { flexGrow: 1 },
  { borderColor },
];

interface TableCellProps {
  item: string | { text: string; onPress?: () => void; style?: StyleProp<TextStyle> };
  onPressCompleteData?: boolean;
  defaultStyle: StyleProp<ViewStyle>;
  color?: string;
}

const TableCell: React.FC<TableCellProps> = ({
  item,
  defaultStyle,
  color,
  onPressCompleteData,
}) => {
  const { colors } = useTheme();

  const [showDataModal, setShowDataModal] = useState<boolean>(false);

  const text = typeof item === "string" ? item : item.text;
  const style = typeof item === "object" ? item.style : undefined;
  const onPress = typeof item === "object" ? item.onPress : undefined;

  const renderContent = (text: string, style: StyleProp<ViewStyle>, color?: string) => (
    <StyledText
      smallParagraph
      style={style}
      color={color || colors.text}
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {text}
    </StyledText>
  );

  return onPress || onPressCompleteData ? (
    <>
      <TouchableOpacity
        style={[defaultStyle, style]}
        onPress={() => {
          if (onPress) onPress();
          else setShowDataModal(true);
        }}
      >
        {renderContent(text, [], color)}
      </TouchableOpacity>
      <InformationModal
        title="INFORMACIÓN"
        animationType="fade"
        visible={showDataModal}
        onClose={() => setShowDataModal(false)}
      >
        <StyledText color={colors.primary}>{text}</StyledText>
      </InformationModal>
    </>
  ) : (
    renderContent(text, [defaultStyle, style], color)
  );
};
// Componente Table.Header
const TableHeader: React.FC<TableHeaderProps> = ({ data, children, cellColor }) => {
  const isInsideTable = useContext(TableContext);
  const isInsideHeader = useContext(TableHeaderContext);
  const tableProps = useContext(TablePropsContext);

  if (!isInsideTable || isInsideHeader) throw "Table.Header debe usarse dentro de un Table.";

  const { colors } = useTheme();

  return (
    <TableHeaderContext.Provider value={true}>
      <View style={{ flexDirection: "row" }}>
        {data.map((item, index) => (
          <TableCell
            key={index}
            item={item}
            defaultStyle={[tableProps.headerStyle, ...defaultStyles(tableProps, colors.border)]}
            color={cellColor || colors.primary}
          />
        ))}
      </View>
      <ScrollView scrollEnabled={tableProps.scrollVerticalEnable}>{children}</ScrollView>
    </TableHeaderContext.Provider>
  );
};

// Componente Table.Body
const TableBody: React.FC<TableBodyProps> = ({ data, onPressCompleteData, cellColor }) => {
  const isInsideTable = useContext(TableContext);
  const isInsideHeader = useContext(TableHeaderContext);
  const tableProps = useContext(TablePropsContext);

  if (!isInsideTable) throw "Table.Body debe usarse dentro de un Table.";
  if (!isInsideHeader) throw "Table.Body debe usarse dentro de un Table.Header.";

  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: "row" }}>
      {data.map((item, index) => (
        <TableCell
          key={index}
          item={item}
          color={cellColor}
          defaultStyle={[tableProps.bodyStyle, ...defaultStyles(tableProps, colors.border)]}
          onPressCompleteData={onPressCompleteData}
        />
      ))}
    </View>
  );
};

// Asignamos los subcomponentes
Table.Header = TableHeader;
Table.Body = TableBody;

// Estilos
const styles = StyleSheet.create({
  cell: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderWidth: 1,
    width: 100,
  },
});

export default Table;
