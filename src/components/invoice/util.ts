import { useUserStore } from "@/src/stores/userSlice";
import { InvoiceData } from "@/src/types/Invoice";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export const createAndShareInvoice = async (invoice: InvoiceData) => {
  const html = generateInvoiceHTML(invoice);

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  await Sharing.shareAsync(uri);
};

export const generateInvoiceHTML = (data: InvoiceData) => {
  const userLogo = useUserStore.getState().user?.logo;

  const subtotal = data.items.reduce((sum, i) => sum + i.qty * i.rate, 0);

  const TAX_RATE = 7.5; // 7.5%
  const taxAmount = (subtotal * TAX_RATE) / 100;
  const total = subtotal + taxAmount;

  const formatMoney = (n: number) =>
    `${data.currency ?? "NGN"}${n.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
    })}`;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 32px;
        color: #333;
      }

      .row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }


  .header-left {
  display: block;
}

.logo {
  width: 70px;
  height: 70px;
  object-fit: contain;
  margin-bottom: 8px;
}

.business-name {
  font-size: 18px;
  font-weight: bold;
}

.business-address {
  color: #666;
  font-size: 13px;
  margin-top: 2px;
  max-width: 200px
}

.padding-top {
padding-top: 30px
}


      .logo {
        width: 60px;
        height: 60px;
        object-fit: contain;
      }

      h1, h2 {
        margin: 0;
      }

      .muted {
        color: #666;
        font-size: 13px;
        margin-top: 2px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 24px;
      }

      th, td {
        border-bottom: 1px solid #ddd;
        padding: 10px;
        font-size: 14px;
      }

      th {
        background: #333;
        color: white;
        text-align: left;
      }

      .right {
        text-align: right;
      }
      .right-gap {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .right-gap div {
        white-space: pre;
      }

      .summary {
        width: 40%;
        min-width: 300px;
        margin-left: auto;
        margin-top: 20px;
      }

      .summary-row {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
      }

      .summary-row.total-row {
        border-top: 1px solid #ddd;
        margin-top: 8px;
        padding-top: 12px;
      }

      .balance-box {
        margin-top: 20px;
        width: 95%;
        background: #f1f1f1;
        padding: 12px;
        padding-right: 20px;
        font-size: 18px;
        font-weight: bold;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 30px;
      }
    </style>
  </head>

  <body>

<!-- HEADER -->
<div class="row">
  <div class="header-left">
    ${
      userLogo
        ? `<img 
      src="${userLogo}" 
      class="logo" 
      alt="User Logo" 
      style="max-width: 150px; height: auto; object-fit: contain;" 
    />`
        : ""
    }
    <div class="business-name padding-top">${data.businessName}</div>
    <div class="business-address">${data.businessAddress}</div>
  </div>

  <div class="right">
    <h1>INVOICE</h1>
    <div># ${data.invoiceNumber}</div>
  </div>
</div>



    <br/>

    <!-- BILL INFO -->
    <div class="row padding-top">
      <div>
       Bill To<br/>
        <b>${data.billTo}</b>
      </div>

      <div class="right right-gap">
        <div>Invoice Date:            ${data.invoiceDate}</div>
        <div>Due Date:            ${data.dueDate}</div>
        <div>Terms:            ${data.terms}</div>
      </div>
    </div>


    <!-- TABLE -->
    <table>
      <tr>
        <th>#</th>
        <th>Item & Description</th>
        <th class="right">Qty</th>
        <th class="right">Rate</th>
        <th class="right">Amount</th>
      </tr>

      ${data.items
        .map(
          (item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${item.name}</td>
          <td class="right">${item.qty}</td>
          <td class="right">${formatMoney(item.rate)}</td>
          <td class="right">${formatMoney(item.qty * item.rate)}</td>
        </tr>
      `,
        )
        .join("")}
    </table>


    <!-- SUMMARY -->
    <div class="summary">
      <div class="summary-row">
        <span><b>Subtotal</b></span>
        <span><strong>${formatMoney(subtotal)}</strong></span>
      </div>

      <div class="summary-row">
        <span><b>Tax (${TAX_RATE}%)</b></span>
        <span><strong>${formatMoney(taxAmount)}</strong></span>
      </div>

      <div class="summary-row total-row">
        <span><b>Total</b></span>
        <span><strong>${formatMoney(total)}</strong></span>
      </div>

      <div class="balance-box">
        <span>Balance Due:</span>
        <span><strong>${formatMoney(total)}</strong></span>
      </div>
    </div>


    ${data.notes ? `<br/><b>Notes</b><br/>${data.notes.join("<br/>")}` : ""}

    ${
      data.termsAndConditions
        ? `<br/><br/><b>Terms & Conditions</b><br/>${data.termsAndConditions}`
        : ""
    }

  </body>
  </html>
  `;
};
