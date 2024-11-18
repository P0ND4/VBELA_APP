import { Image } from "react-native";
import { thousandsSystem, changeDate } from "@helpers/libs";
import Logo from "@assets/logo.png";

export default ({ previews, total, event, invoiceInformation, code, equivalence }) => {
  const date = new Date();
  const invoiceInfo = [invoiceInformation?.name, invoiceInformation?.address, invoiceInformation?.number, invoiceInformation?.complement].filter(
    Boolean
  );

  const text = previews.reduce((a, item) => {
    const count = equivalence ? item.quantity - item.paid : item.paid;
    const total = Math.floor(item.total * (1 - item.discount || 0));

    return (
      a +
      `<tr>
            <td style="text-align: left;">
              <p style="font-size: 28px; font-weight: 600;">${thousandsSystem(count)}x ${item.name}</p>
            </td>
            <td style="text-align: right;">
              <p style="font-size: 28px; font-weight: 600; display: inline-block; margin-right: 5px;">
              ${total ? thousandsSystem(total) : "GRATIS"}
              </p>
              ${
                item.discount
                  ? `<p style="font-size: 28px; font-weight: 600; display: inline-block;">
              (${thousandsSystem(item.discount * 100)}% DESCUENTO)
              </p>`
                  : ""
              }
            </td>
          </tr>`
    );
  }, "");

  return `
    <html lang="en">
  
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style type="text/css">
      * {
        padding: 0;
        margin: 0;
        box-sizing: 'border-box';
        font-family: sans-serif;
        color: #444444
      }
  
      @page { margin: 20px; } 
    </style>
  </head>
  
  <body>
  <view style="padding: 20px; width: 100vw; display: block; margin: 20px auto; background-color: #FFFFFF;">
      <view>
        <img
        src="${Image.resolveAssetSource(Logo).uri}"
        style="width: 22vw; display: block; margin: 0 auto; border-radius: 8px" />
        <p style="font-size: 30px; text-align: center">vbelapp.com</p>
      </view>
      <p style="font-size: 30px; text-align: center; margin: 20px 0; background-color: #444444; padding: 10px 0; color: #FFFFFF">ALQUILERES Y RESTAURANTES</p>
        
      <p style="font-size: 25px; font-weight: 600;">
        ${invoiceInfo.join(" - ").trim()}
      </p>
        <p style="text-align: center; color: #444444; font-size: 40px; font-weight: 800; margin-top: 20px">
          ${invoiceInformation?.name || "SIN NOMBRE"}
        </p>
        <p style="text-align: center; color: #444444; font-size: 30px; font-weight: 800; margin-bottom: 20px">
          TICKET N°: ${code}
        </p>
      <view>
        <table style="width: 95vw">
          <tr>
            <td>
              <p style="font-size: 25px; font-weight: 600; color: #444444; margin-bottom: 12px;">${previews.reduce(
                (a, b) => {
                  const value = equivalence ? b.quantity - b.paid : b.paid;
                  return a + value;
                },
                0
              )} Artículos
              </p>
            </td>
            <td>
              <p style="font-size: 25px; font-weight: 600; color: #444444; margin-bottom: 12px; text-align: center">
                Fecha: ${changeDate(date)}
              </p>
            </td>
            <td>
              <p style="font-size: 25px; font-weight: 600; color: #444444; margin-bottom: 12px; text-align: right">
              Hora: ${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${(
    "0" + date.getSeconds()
  ).slice(-2)}
              </p>
            </td>
          </tr>
        </table>
      </view>
      <hr/>
      <view>
        <table style="width: 95vw; margin: 10px 0;">
          ${text.replace(/,/g, "")}
        </table>
      </view>
      <hr/>
      <view style="width: 94vw">
      <p style="margin-top: 10px;"/>
      ${
        event.discount
          ? `<p style="text-align: right; font-size: 30px; font-weight: 600; width: 95vw;">
            Descuento: ${thousandsSystem(event.discount * 100)}%
          </p>`
          : ""
      }
      ${
        event.tip
          ? `<p style="text-align: right; font-size: 30px; font-weight: 600; width: 95vw;">
            Propina: ${thousandsSystem(event.tip * 100)}%
          </p>`
          : ""
      }
      ${
        event.tax
          ? `<p style="text-align: right; font-size: 30px; font-weight: 600; width: 95vw;">
            Impuesto: ${thousandsSystem(event.tax * 100)}%
          </p>`
          : ""
      }
      <p style="text-align: right; font-size: 30px; font-weight: 600; margin-bottom: 10px; width: 95vw;">Total: ${(() => {
        let totalWithEvent = total;
        if (event.discount) totalWithEvent *= 1 - event.discount;
        if (event.tip) totalWithEvent *= 1 + event.tip;
        if (event.tax) totalWithEvent *= 1 + event.tax;
        return thousandsSystem(totalWithEvent);
      })()}</p>
      </view>
      <hr/>
      <p style="text-align: center; font-size: 25px; font-weight: 600; margin-top: 15px; width: 95vw;">ESTA ES UNA FACTURA HECHA POR ${
        invoiceInformation?.name || "SIN NOMBRE"
      } RECUERDE VISITAR vbelapp.com</p>
    </view>
  </body>
  
  </html>
    `;
};
