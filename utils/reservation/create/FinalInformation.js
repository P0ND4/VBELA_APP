import { useSelector } from "react-redux";
import { thousandsSystem } from "@helpers/libs";
import TextStyle from "@components/TextStyle";
import theme from "@theme";

const { light, dark } = theme();

const TotalPrice = ({ discount, amount, amountWithDiscount, hosted, totalText = ""}) => {
  const mode = useSelector((state) => state.mode);

  return (
    <>
      <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
        Huéspedes:{" "}
        <TextStyle color={light.main2} smallSubtitle>
          {thousandsSystem(hosted.length)}
        </TextStyle>
      </TextStyle>
      <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
        {totalText}:{" "}
        <TextStyle color={light.main2} smallSubtitle>
          {thousandsSystem(amount || "0")}
        </TextStyle>
      </TextStyle>
      {discount && (
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Descuento:{" "}
          <TextStyle color={light.main2} smallSubtitle>
            {discount}
          </TextStyle>
        </TextStyle>
      )}
      {discount && (
        <TextStyle color={mode === "light" ? light.textDark : dark.textWhite}>
          Total a pagar:{" "}
          <TextStyle color={light.main2} smallSubtitle>
            {thousandsSystem(amountWithDiscount)}
          </TextStyle>
        </TextStyle>
      )}
    </>
  );
};

export default TotalPrice;
