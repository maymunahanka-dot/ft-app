import { useUserStore } from "@/src/stores/userSlice";
import { InvoiceData } from "@/src/types/Invoice";
import { GetDetailedDate } from "@/src/utils/random";

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

export function formatFirestoreTimestamp(ts?: {
  seconds: number;
  nanoseconds: number;
}): string {
  if (!ts?.seconds) return "";

  const date = new Date(ts.seconds * 1000);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const generateInvoiceHTML = (data: InvoiceData) => {
  const userLogo = useUserStore.getState().user?.logo;
  const brandSetting = useUserStore.getState().brandSetting;

  console.log("brand settings invoice", brandSetting);

  const subtotal = data.items.reduce((sum, i) => sum + i.quantity * i.price, 0);

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
      brandSetting?.logoUrl
        ? `<img 
      src="${brandSetting.logoUrl}" 
      class="logo" 
      alt="User Logo" 
      style="max-width: 150px; height: auto; object-fit: contain;" 
    />`
        : ""
    }
    <div class="business-name padding-top">${brandSetting?.businessName}</div>
    <div class="business-address">${brandSetting?.businessAddress}</div>
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
       <b>Bill To</b><br/>
        <div>${data.clientName}</div>
        <div>${data.clientPhone}</div>
      </div>

      <div class="right right-gap">
        <div>Invoice Date:            ${data?.invoiceDate ?? GetDetailedDate(new Date().toISOString())}</div>
       <div>Due Date:            ${GetDetailedDate(data.dueDate)}</div>

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
          <td>${item.description}</td>
          <td class="right">${item.quantity}</td>
          <td class="right">${formatMoney(item.price)}</td>
          <td class="right">${formatMoney(item.quantity * item.price)}</td>
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
