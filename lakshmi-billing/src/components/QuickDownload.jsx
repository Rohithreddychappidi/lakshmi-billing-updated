import React, { useRef, useState } from "react";
import { verifyDocument } from "../lib/verify";
import { downloadNodeAsPdf } from "../lib/pdf";
import DocumentTemplate from "./DocumentTemplate";
import QuotationTemplate from "./QuotationTemplate";
import VerifyModal from "./VerifyModal";
import { Download } from "lucide-react";

export default function QuickDownload({ doc, type, label = "Download" }) {
  const originalRef = useRef(null);
  const duplicateRef = useRef(null);
  const defaultRef = useRef(null);
  const [result, setResult] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [selectedCopy, setSelectedCopy] = useState("original");

  async function handleDownload() {
    setDownloading(true);
    try {
      if (type === "invoice") {
        const targetRef = selectedCopy === "duplicate" ? duplicateRef : originalRef;
        const suffix = selectedCopy === "duplicate" ? "-Duplicate" : "";
        await downloadNodeAsPdf(targetRef.current, `${doc.number.replace(/\//g, "-")}${suffix}.pdf`);
      } else {
        await downloadNodeAsPdf(defaultRef.current, `${doc.number.replace(/\//g, "-")}.pdf`);
      }
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setSelectedCopy(doc.invoiceCopyType || (doc.duplicateCopyForTransport ? "duplicate" : "original"));
          setResult(verifyDocument(doc, type));
        }}
        className="flex items-center gap-1 text-brand-600 text-xs font-semibold hover:text-brand-700"
      >
        <Download size={13} /> {label}
      </button>
      <div className="fixed -left-[9999px] top-0">
        {type === "quotation" ? (
          <QuotationTemplate ref={defaultRef} doc={doc} />
        ) : type === "invoice" ? (
          <>
            <DocumentTemplate ref={originalRef} doc={doc} type="invoice" copyType="original" />
            <DocumentTemplate ref={duplicateRef} doc={doc} type="invoice" copyType="duplicate" />
          </>
        ) : (
          <DocumentTemplate ref={defaultRef} doc={doc} type={type} />
        )}
      </div>
      {result && (
        <VerifyModal
          result={result}
          downloading={downloading}
          onDownload={handleDownload}
          onClose={() => setResult(null)}
          type={type}
          selectedCopy={selectedCopy}
          onSelectCopy={setSelectedCopy}
        />
      )}
    </>
  );
}
