import LottieView from "lottie-react-native";
import splash from "../../assets/splash.json";

const SplashScreen: React.FC<{ onFinish?: (isCancelled: boolean) => void }> = ({
  onFinish = (isCancelled) => {},
}) => {
  return (
    <LottieView
      source={splash}
      onAnimationFinish={onFinish}
      autoPlay
      resizeMode="cover"
      loop={false}
      style={{ flex: 1, width: "100%" }}
    />
  );
};

export default SplashScreen;
