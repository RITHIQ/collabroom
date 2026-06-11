import { jsPDF } from 'jspdf';

export interface ContractData {
  id: string;
  brandName: string;
  creatorName: string;
  totalAmount: number;
  date: string;
  clauses: { section: string; content: string }[];
  signatureDataUrl?: string; // canvas.toDataURL()
}

/** Build the full PDF document (used for download and in-browser preview). */
export function buildContractPdfDocument(contract: ContractData): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const PW = 210; // page width mm
  const PH = 297; // page height mm
  const ML = 20;  // margin left
  const MR = 20;  // margin right
  const TW = PW - ML - MR; // text width
  let y = 20;

  const addPageIfNeeded = (neededSpace: number) => {
    if (y + neededSpace > PH - 20) {
      doc.addPage();
      y = 20;
    }
  };

  // ── Header banner ──────────────────────────────────────────────
  doc.setFillColor(108, 62, 244);
  doc.rect(0, 0, PW, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('ColabRoom · Secured Digital Contract Platform', ML, 7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Contract ID: CR-${contract.id}`, ML, 12);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, PW - MR, 12, { align: 'right' });

  y = 30;

  // ── Title ──────────────────────────────────────────────────────
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('INFLUENCER COLLABORATION AGREEMENT', PW / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text(`Dated: ${contract.date}  ·  Between ${contract.brandName} and ${contract.creatorName}`, PW / 2, y, { align: 'center' });
  y += 4;

  // Divider
  doc.setDrawColor(108, 62, 244);
  doc.setLineWidth(0.5);
  doc.line(ML, y, PW - MR, y);
  y += 8;

  // ── Summary box ────────────────────────────────────────────────
  doc.setFillColor(245, 243, 255);
  doc.roundedRect(ML, y, TW, 22, 3, 3, 'F');
  doc.setDrawColor(167, 139, 250);
  doc.setLineWidth(0.3);
  doc.roundedRect(ML, y, TW, 22, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(108, 62, 244);
  doc.text('BRAND', ML + 6, y + 7);
  doc.text('CREATOR', ML + TW / 3 + 6, y + 7);
  doc.text('TOTAL VALUE', ML + (TW * 2) / 3 + 6, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text(contract.brandName, ML + 6, y + 15);
  doc.text(contract.creatorName, ML + TW / 3 + 6, y + 15);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(`Rs. ${contract.totalAmount.toLocaleString('en-IN')}`, ML + (TW * 2) / 3 + 6, y + 15);

  y += 30;

  // ── Clauses ────────────────────────────────────────────────────
  for (const clause of contract.clauses) {
    addPageIfNeeded(30);

    // Section heading
    doc.setFillColor(249, 250, 251);
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.2);
    doc.roundedRect(ML, y, TW, 8, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(108, 62, 244);
    doc.text(clause.section, ML + 3, y + 5.5);
    y += 10;

    // Content — wrap text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    const lines = doc.splitTextToSize(clause.content, TW - 4);
    for (const line of lines) {
      addPageIfNeeded(6);
      doc.text(line, ML + 2, y);
      y += 5;
    }
    y += 4;
  }

  // ── Signature block ────────────────────────────────────────────
  addPageIfNeeded(60);
  y += 4;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.line(ML, y, PW - MR, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text('SIGNATURES', ML, y);
  y += 8;

  const sigColW = TW / 2 - 4;

  // Brand side — already signed
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text('Brand Representative', ML, y);
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(17, 24, 39);
  doc.text(contract.brandName, ML, y);
  y += 5;
  // Brand script signature
  doc.setFont('times', 'italic');
  doc.setFontSize(16);
  doc.setTextColor(108, 62, 244);
  doc.text(contract.brandName.split(' ')[0], ML, y + 8);
  // underline
  doc.setDrawColor(108, 62, 244);
  doc.setLineWidth(0.4);
  doc.line(ML, y + 10, ML + sigColW, y + 10);

  // Creator side — drawn signature image
  const cx = ML + sigColW + 8;
  const sigY = y - 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text('Creator', cx, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(17, 24, 39);
  doc.text(contract.creatorName, cx, sigY + 5);

  if (contract.signatureDataUrl) {
    try {
      doc.addImage(contract.signatureDataUrl, 'PNG', cx, sigY + 8, sigColW, 18);
    } catch {
      doc.setFont('times', 'italic');
      doc.setFontSize(16);
      doc.setTextColor(108, 62, 244);
      doc.text(contract.creatorName.split(' ')[0], cx, sigY + 18);
    }
  } else {
    doc.setFont('times', 'italic');
    doc.setFontSize(16);
    doc.setTextColor(108, 62, 244);
    doc.text(contract.creatorName.split(' ')[0], cx, sigY + 18);
  }
  doc.setDrawColor(108, 62, 244);
  doc.setLineWidth(0.4);
  doc.line(cx, sigY + 28, cx + sigColW, sigY + 28);

  y += 40;

  // Date / timestamp
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(`Executed on: ${new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}`, ML, y);
  y += 5;
  doc.text('Both parties have agreed to the terms above via ColabRoom\'s secure digital signing platform.', ML, y);

  // ── Footer on every page ───────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(245, 243, 255);
    doc.rect(0, PH - 12, PW, 12, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(156, 163, 175);
    doc.text('ColabRoom · Secured Digital Contract · app.colabroom.io', ML, PH - 5);
    doc.text(`Page ${p} of ${totalPages}`, PW - MR, PH - 5, { align: 'right' });
  }

  doc.setPage(totalPages);
  return doc;
}

export function createContractPdfBlob(contract: ContractData): Blob {
  return buildContractPdfDocument(contract).output('blob');
}

export function generateContractPdf(contract: ContractData): void {
  const doc = buildContractPdfDocument(contract);
  const filename = `ColabRoom_Contract_${contract.brandName}_${contract.creatorName}_${contract.id}.pdf`
    .replace(/\s+/g, '_');
  doc.save(filename);
}
