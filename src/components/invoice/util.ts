import { generateInvoiceId } from "@/src/lib/invoice";
import { useUserStore } from "@/src/stores/userSlice";
import { InvoiceData } from "@/src/types/Invoice";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { Timestamp } from "firebase/firestore";

export type AnyDate =
  | string
  | number
  | Date
  | Timestamp
  | { seconds: number; nanoseconds: number }
  | undefined
  | null;

// ALWAYS return Date
export const toDate = (input: AnyDate): Date => {
  if (!input) return new Date();

  // Firestore Timestamp instance
  if (input instanceof Timestamp) return input.toDate();

  // Firestore plain object
  if (typeof input === "object" && "seconds" in input) {
    return new Date(input.seconds * 1000);
  }

  if (input instanceof Date) return input;

  if (typeof input === "number") return new Date(input);

  if (typeof input === "string") {
    const parsed = new Date(input);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  return new Date();
};

// ALWAYS return ISO
export const toISO = (input: AnyDate): string => {
  return toDate(input).toISOString();
};

// ALWAYS return display
export const toDisplay = (input: AnyDate): string => {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(toDate(input));
};

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
export function formatFirestoreTimestampToISO(ts?: {
  seconds: number;
  nanoseconds: number;
}): string {
  if (!ts?.seconds) return ts ? String(ts) : new Date().toISOString();

  const date = new Date(ts.seconds * 1000);
  return date.toISOString();
}

export const generateInvoiceHTML = (data: InvoiceData) => {
  // const userLogo = useUserStore.getState().user?.logo;
  const brandSetting = useUserStore.getState().brandSetting;

  const theme = data.themeColor ?? "#16988D";

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
        :root {
          --theme: ${theme};
          --theme-light: ${theme}22;  /* 13% opacity tint */
        }
  
        body { font-family: Arial, sans-serif; padding: 32px; color: #333; }
        .row { display: flex; justify-content: space-between; align-items: flex-start; }
        .header-left { display: block; }
        .logo { width: 70px; height: 70px; object-fit: contain; margin-bottom: 8px; }
        .business-name { font-size: 18px; font-weight: bold; }
        .business-address { color: #666; font-size: 13px; margin-top: 2px; max-width: 200px; }
        .padding-top { padding-top: 30px; }
        h1 { margin: 0; color: var(--theme); }  /* ← themed */
        .muted { color: #666; font-size: 13px; margin-top: 2px; }
  
        table { width: 100%; border-collapse: collapse; margin-top: 24px; }
        th, td { border-bottom: 1px solid #ddd; padding: 10px; font-size: 14px; }
        th {
          background: var(--theme);   /* ← was hardcoded #333 */
          color: white;
          text-align: left;
        }
        .right { text-align: right; }
        .right-gap { display: flex; flex-direction: column; gap: 15px; }
        .right-gap div { white-space: pre; }
  
        .summary { width: 40%; min-width: 300px; margin-left: auto; margin-top: 20px; }
        .summary-row { display: flex; justify-content: space-between; padding: 6px 0; }
        .summary-row.total-row { border-top: 2px solid var(--theme); margin-top: 8px; padding-top: 12px; }
  
        .balance-box {
          margin-top: 20px;
          width: 95%;
          background: var(--theme);    /* ← was #f1f1f1 */
          color: white;
          padding: 12px;
          padding-right: 20px;
          font-size: 18px;
          font-weight: bold;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          border-radius: 4px;
        }
  
        .invoice-label {
          color: var(--theme);
          font-size: 11px;
          font-weight: bold;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
      </style>
    </head>
    <body>
  
      <!-- HEADER -->
      <div class="row">
        <div class="header-left">
          ${
            brandSetting?.logoUrl
              ? `<img src="${brandSetting.logoUrl}" class="logo" alt="Logo" style="max-width:150px;height:auto;object-fit:contain;" />`
              : ""
          }
          <div class="business-name padding-top">${brandSetting?.businessName ?? ""}</div>
          <div class="business-address">${brandSetting?.businessAddress ?? ""}</div>
        </div>
        <div class="right">
          <h1>INVOICE</h1>
          <div># ${data?.invoiceNumber ? data.invoiceNumber.slice(0, 8) : generateInvoiceId().slice(0, 8)}</div>
        </div>
      </div>
  
      <br/>
  
      <!-- BILL INFO -->
      <div class="row padding-top">
        <div>
          <b>Bill To</b><br/>
          <div>${data.clientName}</div>
          <div>${data.clientPhone ?? ""}</div>
        </div>
        <div class="right right-gap">
          <div>Invoice Date:            ${toDisplay(data?.invoiceDate as any)}</div>
          <div>Due Date:            ${toDisplay(data.dueDate as any)}</div>
        </div>
      </div>
  
      <!-- TABLE -->
      <table>
        <tr>
          <th>#</th>
          <th>Item &amp; Description</th>
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
  
      ${data.notes?.length ? `<br/><b>Notes</b><br/>${data.notes.join("<br/>")}` : ""}
      ${data.termsAndConditions ? `<br/><br/><b>Terms &amp; Conditions</b><br/>${data.termsAndConditions}` : ""}
  
    </body>
    </html>
    `;
};
