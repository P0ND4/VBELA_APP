import { useAppSelector } from "application/store/hook";
import { Order } from "domain/entities/data";
import { changeDate, formatDecimals, thousandsSystem } from "shared/utils";

export const useInvoiceHtml = () => {
  const information = useAppSelector((state) => state.invoiceInformation);

  const getHtml = (order: Order) => {
    const totalNoDiscount = order.selection.reduce((a, b) => a + b.total, 0);

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
              color: #000000
            }
            
            .space {
              padding: 20px 0;
              border-bottom: 1px solid #AAAAAA;
            }
  
            .row {
              display: flex;
              justify-content: space-between;
            }
  
            .title { text-align: center; }
  
            .text {
              font-size: 22px;
              font-weight: bold;
            }
  
            @page { margin: 50px; } 
          </style>
        </head>
        <body>
          <div>
            ${information.company ? `<p class="title text">${information.company}</p>` : ""}
            ${information.business ? `<p class="title text">${information.business}</p>` : ""}
            ${information.identification ? `<p class="title text">${information.identification}</p>` : ""}
            ${information.address ? `<p class="title text">${information.address}</p>` : ""}
            ${information.phoneNumber ? `<p class="title text">${information.phoneNumber}</p>` : ""}
            ${information.complement ? `<p class="title text">${information.complement}</p>` : ""}
          </div>
          <div style="margin-top: 10px;">
            <div class="space">
              <div class="row">
                <span class="text">FACTURA #</span>
                <span class="text">${order.invoice}</span>
              </div>
              <div class="row">
                <span class="text">FECHA</span>
                <span class="text">${changeDate(new Date(order.creationDate), true)}</span>
              </div>
            </div>
            <div class="space">
              <span class="text">SU NÚMERO DE ORDEN ES: ${order.order}</span>
            </div>
            <div class="space">
              ${order.selection.reduce((a, tr) => {
                return (
                  a +
                  `
                  <div class="row">
                    <span class="text">${`${tr.quantity}x ${tr.name}`}</span>
                    <span class="text">${!!tr.discount ? `(${formatDecimals(tr.discount * 100, 2)}%) (-${tr.value * tr.quantity * tr.discount})` : ""} ${!tr.total ? "GRATIS" : thousandsSystem(tr.total)}</span>
                  </div>
                `
                );
              }, "")}
              <span class="text">Chq #${order.order} Orden #${thousandsSystem(order.selection.length)}</span>
            </div>
            ${
              order.observation
                ? `
                <div class="space">
                  <p class="text" style="text-align: justify">${
                    order.observation.slice(0, 200) + (order.observation.length > 200 ? "..." : "")
                  }</p>
                </div>`
                : ""
            }
            <div style="margin-top: 20px">
              ${
                !!order.discount
                  ? `
                <div class="row">
                  <span class="text">DESCUENTO (${formatDecimals(order.discount * 100, 2)}%)</span>
                  <span class="text">${thousandsSystem(totalNoDiscount * order.discount)}</span>
                </div>
              `
                  : ""
              }
              <div class="row">
                <span class="text">TOTAL:</span>
                <span class="text">${!order.total ? "GRATIS" : thousandsSystem(order.total)}</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  return { getHtml };
};
