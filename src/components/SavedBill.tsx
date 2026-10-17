import { useState } from "react";
import type { Bill } from "../types/bill";
import { BillPreview } from "./BillPreview";
import {
  buildBillMessage,
  buildWhatsAppUrl,
  copyBillToClipboard,
} from "../services/whatsappService";
import { downloadBillPdf, shareBillPdf } from "../services/pdfService";
import { formatCurrency } from "../utils/formatCurrency";

interface SavedBillProps {
  bill: Bill;
  duplicate: boolean;
  onNewBill: () => void;
}

export function SavedBill({ bill, duplicate, onNewBill }: SavedBillProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const [fallbackText, setFallbackText] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);

  // Step 1: Marathi greeting. Opens a chat with this number even if it is not in your contacts.
  const greetingUrl = buildWhatsAppUrl(
    bill.customer.phone,
    `सह्याद्री शॉपमध्ये आपले स्वागत आहे!! 🎆\nआपल्या खरेदीबद्दल धन्यवाद.\nबिल क्र.: ${bill.billId}\nएकूण रक्कम: ${formatCurrency(bill.total)}`,
  );

  async function handleCopy() {
    if (await copyBillToClipboard(bill)) setNotice("Bill details copied.");
    else {
      setFallbackText(buildBillMessage(bill));
      setNotice("Copy failed. Select the text below and copy it manually.");
    }
  }

  async function handleSharePdf() {
    setPdfBusy(true);
    try {
      const result = await shareBillPdf(bill);
      if (result === "shared")
        setNotice(
          "Share sheet completed. Confirm in WhatsApp that the PDF was actually sent.",
        );
      else if (result === "downloaded")
        setNotice(
          "PDF saved to this device. Open the customer’s chat and attach it with the paperclip.",
        );
    } catch {
      setNotice("Could not create the PDF. Try again.");
    } finally {
      setPdfBusy(false);
    }
  }

  async function handleDownloadPdf() {
    setPdfBusy(true);
    try {
      await downloadBillPdf(bill);
      setNotice("PDF saved to this device.");
    } catch {
      setNotice("Could not create the PDF. Try again.");
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <section className="card checkout" aria-labelledby="saved-title">
      <div className="alert alert--success" role="status">
        <strong id="saved-title">
          {duplicate ? "Bill was already saved." : "Bill saved."}
        </strong>{" "}
        {bill.billId}
      </div>
      <BillPreview
        billId={bill.billId}
        createdAt={bill.createdAt}
        customerName={bill.customer.name}
        customerPhone={bill.customer.phone}
        items={bill.items}
        subtotal={bill.subtotal}
        total={bill.total}
      />
      <div className="row row--wrap">
        <a
          className="btn btn--primary"
          href={greetingUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          1. Send greeting (+{bill.customer.phone})
        </a>
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleSharePdf}
          disabled={pdfBusy}
        >
          {pdfBusy ? "Preparing PDF…" : "2. Share PDF"}
        </button>
        <button
          type="button"
          className="btn"
          onClick={handleDownloadPdf}
          disabled={pdfBusy}
        >
          Download PDF
        </button>
        <button type="button" className="btn" onClick={handleCopy}>
          Copy bill details
        </button>
        <button type="button" className="btn btn--ghost" onClick={onNewBill}>
          Start new bill
        </button>
      </div>
      <p className="notice">
        Step 1: press send in WhatsApp so the chat exists. Step 2: choose
        WhatsApp, then tap that customer’s chat at the top.
      </p>
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      {fallbackText && (
        <textarea
          className="input fallback"
          readOnly
          rows={10}
          value={fallbackText}
          aria-label="Bill text to copy"
        />
      )}
    </section>
  );
}
