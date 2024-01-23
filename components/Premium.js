import { useSelector } from "react-redux";
import {
  Modal,
  View,
  StyleSheet,
  Text,
  Dimensions,
  Animated,
  TouchableOpacity,
} from "react-native";
import Basic from "@assets/plan/Basic.png";
import PremiumIMG from "@assets/plan/Premium.png";
import Business from "@assets/plan/Business.png";
import Vip from "@assets/plan/Vip.jpg";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "@theme";
import { useRef } from "react";
import TextStyle from "./TextStyle";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const DOT_SIZE = 40;
const TICKER_HEIGHT = 40;
const CIRCLE_SIZE = SCREEN_WIDTH * 0.6;

const { light, dark } = theme();

const data = [
  {
    type: "Básico",
    heading: "Mensualmente 3 USD",
    subtitle: "1 mes de prueba",
    improvements: [
      "Máxima 3 grupos",
      "Máxima 20 nomenclaturas",
      "No hay limitaciones en reservaciones",
      "Estadística con gráfica",
    ],
    imageSRC: Basic,
    key: "first",
    color: "#00D1FF",
  },
  {
    type: "Premium",
    heading: "Mensualmente 6 USD",
    subtitle: "1 mes de prueba",
    improvements: [
      "Máxima 6 grupos",
      "Máxima 25 nomenclaturas",
      "No hay limitaciones en reservaciones",
      "Estadística con gráfica",
      "Creación de compra y gasto",
    ],
    imageSRC: PremiumIMG,
    key: "second",
    color: "#85ed61",
  },
  {
    type: "Negocios",
    heading: "Mensualmente 12 USD",
    subtitle: "15 días de prueba",
    improvements: [
      "Máxima 10 grupos",
      "Máxima 30 nomenclaturas",
      "No hay limitaciones en reservaciones",
      "Estadística con gráfica",
      "Creación de compra y gasto",
      "Creación de grupos de trabajo",
      "Creación de mesas",
    ],
    imageSRC: Business,
    key: "third",
    color: "#ffd268",
  },
  {
    type: "VIP",
    heading: "Mensualmente 14 USD",
    subtitle: "7 días de prueba",
    improvements: [
      "No hay limitaciones en grupos",
      "No hay limitaciones en nomenclaturas",
      "No hay limitaciones en reservaciones",
      "Estadística con gráfica",
      "Creación de compra y gasto",
      "Creación de grupos de trabajo",
      "Creación de mesas",
    ],
    month: 18,
    imageSRC: Vip,
    key: "fourth",
    color: "#0ffff8",
  },
];

const Circle = ({ scrollX }) => {
  return (
    <View style={[StyleSheet.absoluteFillObject, styles.circleContainer]}>
      {data.map(({ color }, index) => {
        const inputRange = [
          (index - 0.55) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 0.55) * SCREEN_WIDTH,
        ];
        const scale = scrollX.interpolate({
          inputRange,
          outputRange: [0, 1, 0],
          extrapolate: "clamp",
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0, 0.2, 0],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.circle,
              { opacity, backgroundColor: color, transform: [{ scale }] },
            ]}
          />
        );
      })}
    </View>
  );
};

const Ticker = ({ scrollX }) => {
  const inputRange = [-SCREEN_WIDTH, 0, SCREEN_WIDTH];

  const translateY = scrollX.interpolate({
    inputRange,
    outputRange: [TICKER_HEIGHT + 9, 0, -TICKER_HEIGHT + 9],
  });

  return (
    <View style={styles.tickerContainer}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        {data.map(({ type, color }, index) => {
          return (
            <Text key={index} style={[styles.tickerText, { color }]}>
              {type}
            </Text>
          );
        })}
      </Animated.View>
    </View>
  );
};

const Item = ({
  imageSRC,
  heading,
  improvements,
  color,
  index,
  scrollX,
  subtitle,
}) => {
  const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];
  const inputRangeOpacity = [
    (index - 0.3) * SCREEN_WIDTH,
    index * SCREEN_WIDTH,
    (index + 0.3) * SCREEN_WIDTH,
  ];
  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0, 1, 0],
  });

  const translateXHeading = scrollX.interpolate({
    inputRange,
    outputRange: [SCREEN_WIDTH * 0.1, 0, -SCREEN_WIDTH * 0.1],
  });

  const translateXSubtitle = scrollX.interpolate({
    inputRange,
    outputRange: [SCREEN_WIDTH * 0.4, 0, -SCREEN_WIDTH * 0.4],
  });

  const translateXDescription = scrollX.interpolate({
    inputRange,
    outputRange: [SCREEN_WIDTH * 0.7, 0, -SCREEN_WIDTH * 0.7],
  });

  const opacity = scrollX.interpolate({
    inputRange: inputRangeOpacity,
    outputRange: [0, 1, 0],
  });

  return (
    <View style={styles.itemStyle}>
      <Animated.Image
        source={imageSRC}
        style={[styles.imageStyle, { transform: [{ scale }] }]}
      />
      <View style={styles.textContainer}>
        <Animated.Text
          style={[
            styles.heading,
            { opacity, transform: [{ translateX: translateXHeading }], color },
          ]}
        >
          {heading}
        </Animated.Text>
        <Animated.Text
          style={[
            styles.subtitle,
            { opacity, transform: [{ translateX: translateXSubtitle }], lineHeight: 18 },
          ]}
        >
          {subtitle}
        </Animated.Text>
        {improvements.map((improvement) => (
          <Animated.View
            key={improvement}
            style={{
              opacity,
              transform: [{ translateX: translateXDescription }],
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons size={25} color={color} name="checkmark-circle" />
            <Text style={styles.description}>{improvement}</Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const Pagination = ({ scrollX }) => {
  const inputRange = [-SCREEN_WIDTH, 0, SCREEN_WIDTH];
  const translateX = scrollX.interpolate({
    inputRange,
    outputRange: [-DOT_SIZE, 0, DOT_SIZE],
  });

  return (
    <View style={[styles.pagination]}>
      <Animated.View
        style={[
          styles.paginationIndicator,
          {
            position: "absolute",
            left: 0,
            transform: [{ translateX }],
          },
        ]}
      />
      {data.map((item) => {
        return (
          <View key={item.key} style={styles.paginationDotContainer}>
            <View
              style={[styles.paginationDot, { backgroundColor: item.color }]}
            />
          </View>
        );
      })}
    </View>
  );
};

const Button = ({ scrollX }) => {
  const inputRange = [-SCREEN_WIDTH, 0, SCREEN_WIDTH];

  const translateYText = scrollX.interpolate({
    inputRange,
    outputRange: [-25, 0, 25],
  });

  const translateYBackground = scrollX.interpolate({
    inputRange,
    outputRange: [-Math.floor(SCREEN_HEIGHT / 15.8), 0, Math.floor(SCREEN_HEIGHT / 15.8)],
  });

  return (
    <View style={[styles.button]}>
      <TouchableOpacity style={styles.buttonStyle}>
        <View style={styles.buttonContent}>
          <TextStyle style={{ position: "absolute", left: "25%" }}>
            Suscribirse a
          </TextStyle>
          <View style={styles.buttonContainer}>
            <Animated.View
              style={{
                transform: [{ translateY: translateYText }],
                position: "relative",
                bottom: 78,
              }}
            >
              {[...data].reverse().map(({ type }, index) => {
                return (
                  <TextStyle
                    key={index}
                    color={light.main4}
                    style={styles.buttonText}
                  >
                    {type}
                  </TextStyle>
                );
              })}
            </Animated.View>
          </View>
        </View>
        <Animated.View
          style={[
            styles.containerBackgroundColor,
            { transform: [{ translateY: translateYBackground }] },
          ]}
        >
          {[...data].reverse().map(({ color }, index) => {
            return (
              <View
                key={index}
                style={[
                  styles.backgroundColorButton,
                  { backgroundColor: color },
                ]}
              />
            );
          })}
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const Premium = () => {
  const mode = useSelector((state) => state.mode);

  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={() => {
        //Alert.alert("Modal has been closed.");
        //setModalVisible(!modalVisible);
      }}
    >
      <View
        style={[
          styles.centeredView,
          { backgroundColor: mode === "light" ? light.main4 : dark.main1 },
        ]}
      >
        <Circle scrollX={scrollX} />
        <Animated.FlatList
          keyExtractor={(item) => item.key}
          data={data}
          renderItem={({ item, index }) => (
            <Item {...item} index={index} scrollX={scrollX} />
          )}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          horizontal
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
        />
        <Button scrollX={scrollX} />
        <Pagination scrollX={scrollX} />
        <Ticker scrollX={scrollX} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: { flex: 1 },
  itemStyle: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  imageStyle: {
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_WIDTH * 0.75,
    resizeMode: "contain",
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  heading: {
    textAlign: "center",
    color: "#444",
    textTransform: "uppercase",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 5,
  },
  subtitle: {
    textAlign: "center",
    color: "#AAAAAA",
    fontSize: 18,
    textTransform: "uppercase",
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 5,
  },
  description: {
    color: "#ccc",
    fontWeight: "600",
    textAlign: "left",
    width: SCREEN_WIDTH * 0.75,
    marginRight: 10,
    fontSize: 15,
  },
  pagination: {
    position: "absolute",
    right: 20,
    bottom: 20,
    flexDirection: "row",
    height: DOT_SIZE,
  },
  paginationDot: {
    width: DOT_SIZE * 0.3,
    height: DOT_SIZE * 0.3,
    borderRadius: DOT_SIZE * 0.15,
  },
  paginationDotContainer: {
    width: DOT_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  paginationIndicator: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  tickerContainer: {
    position: "absolute",
    top: 40,
    left: 20,
    overflow: "hidden",
    height: TICKER_HEIGHT - 10,
  },
  tickerText: {
    fontSize: TICKER_HEIGHT,
    lineHeight: TICKER_HEIGHT,
    textTransform: "uppercase",
    fontWeight: "800",
  },
  circleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    position: "absolute",
    top: "15%",
  },
  button: {
    position: "absolute",
    bottom: "11%",
    left: 0,
    right: 0,
    paddingHorizontal: 18,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 12,
    right: "17%",
    overflow: "hidden",
    height: Math.floor(SCREEN_HEIGHT / 34),
  },
  buttonStyle: {
    borderRadius: 8,
    overflow: "hidden",
  },
  buttonContent: {
    width: "100%",
    height: Math.floor(SCREEN_HEIGHT / 15.8),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    textTransform: "uppercase",
    fontWeight: "800",
  },
  containerBackgroundColor: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
  backgroundColorButton: {
    height: Math.floor(SCREEN_HEIGHT / 15.8),
  },
});

export default Premium;
