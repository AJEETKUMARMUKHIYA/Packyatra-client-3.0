import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import signature from "../assests/Images/signature.png";

export const generateBookingConfirmationPDF = async (bookingData) => {
  const {
    bookingId,
    price,
    customerName,
    customerEmail,
    customerPhone,
    shiftingDate,
    selectedTimeSlot,
    timeSlots = [],
    selectedItems = [],
    fromAddress,
    toAddress,
    totalCFT,
    quotationNumber,
    serviceLift,
    serviceLiftdrop,
  } = bookingData;

  const doc = new jsPDF("p", "mm", "a4");
  const PAGE_HEIGHT = doc.internal.pageSize.height;
  const PAGE_WIDTH = doc.internal.pageSize.width;
  const margin = 18;
  const FOOTER_HEIGHT = 22;
  let y = margin;

  const SAFE_BOTTOM = PAGE_HEIGHT - FOOTER_HEIGHT - 10; // footer buffer
  const TOP_MARGIN = 40;
  const CONTENT_WIDTH = 175;

  // Brand colors (matched to reference PDF)
  const BRAND_DARK = [17, 34, 68];      // navy header text / table head bg
  const BRAND_BLUE = [41, 128, 210];    // accent blue bar / links
  const BRAND_LIGHT_BLUE = [235, 245, 253];
  const TEXT_GREY = [90, 90, 90];
  const BORDER_GREY = [220, 220, 220];

  const addTextWithPageBreak = (textArray, yPos) => {
    const h = doc.getTextDimensions(textArray, { maxWidth: CONTENT_WIDTH }).h;

    if (yPos + h > SAFE_BOTTOM) {
      doc.addPage();
      yPos = TOP_MARGIN;
    }

    doc.text(textArray, margin, yPos, { maxWidth: CONTENT_WIDTH });
    return yPos + h + 8;
  };

  const loadImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        resolve(canvas.toDataURL("image/png"));
      };

      img.onerror = () => {
        reject(new Error("Image load failed"));
      };
    });
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const monthNames = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec",
    ];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  /* =================================
     HEADER
  ================================= */
  // top accent bar (dark navy + blue segment, like reference)
  doc.setFillColor(...BRAND_DARK);
  doc.rect(0, 0, PAGE_WIDTH, 3, "F");
  doc.setFillColor(...BRAND_BLUE);
  doc.rect(PAGE_WIDTH * 0.55, 0, PAGE_WIDTH * 0.45, 3, "F");

  // small square logo mark
  doc.setFillColor(...BRAND_DARK);
  doc.rect(margin, 14, 6, 6, "F");

  // Company name
  doc.setTextColor(...BRAND_DARK);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("PACKYATRA", margin + 10, 19);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_GREY);
  doc.text("RELOCATION PRIVATE LIMITED", margin + 10, 23.5);

  // Right side contact info
  doc.setFontSize(9);
  doc.setTextColor(...BRAND_BLUE);
  doc.setFont("helvetica", "bold");
  doc.text("www.packyatra.com", PAGE_WIDTH - margin, 16, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEXT_GREY);
  doc.text("Ph: +91 9071 535 535", PAGE_WIDTH - margin, 21, { align: "right" });
  doc.text("Email: info@packyatra.com", PAGE_WIDTH - margin, 26, { align: "right" });

  // divider line under header
  doc.setDrawColor(...BORDER_GREY);
  doc.setLineWidth(0.3);
  doc.line(margin, 32, PAGE_WIDTH - margin, 32);

  y = 42;

  /* =======================
     TITLE (with left accent bar)
  ======================= */
  doc.setFillColor(...BRAND_BLUE);
  doc.rect(margin, y - 5, 2, 7, "F");

  doc.setTextColor(...BRAND_DARK);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("OFFICIAL RELOCATION QUOTATION", margin + 6, y);
  y += 10;

  /* =======================
     CUSTOMER INFORMATION TABLE
  ======================= */
  autoTable(doc, {
    startY: y,
    body: [
      ["Quotation No:", quotationNumber || "-", "Pickup Date:", formatDate(shiftingDate) || "-"],
      ["Customer Name:", customerName || "-", "Preferred Slot:", selectedTimeSlot || "-"],
      ["Contact Phone:", customerPhone || "-", "Volume Estimate:", totalCFT ? `${totalCFT} CFT` : "-"],
      ["Service Lift at Pickup:", serviceLift || "-", "Service Lift at Drop:", serviceLiftdrop || "-"],
    ],
    theme: "grid",
    styles: {
      fontSize: 9.5,
      textColor: [30, 30, 30],
      lineColor: BORDER_GREY,
      lineWidth: 0.3,
      cellPadding: 3,
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: "bold", textColor: BRAND_DARK, fillColor: [248, 249, 251] },
      1: { cellWidth: 53 },
      2: { cellWidth: 40, fontStyle: "bold", textColor: BRAND_DARK, fillColor: [248, 249, 251] },
      3: { cellWidth: 40 },
    },
  });
  y = doc.lastAutoTable.finalY;

  // Moving route row (full width)
  autoTable(doc, {
    startY: y,
    body: [
      ["Moving Route:", `${fromAddress || "______"}  to  ${toAddress || "______"}`],
    ],
    theme: "grid",
    styles: {
      fontSize: 9.5,
      textColor: [30, 30, 30],
      lineColor: BORDER_GREY,
      lineWidth: 0.3,
      cellPadding: 3,
      valign: "middle",
    },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: "bold", textColor: BRAND_DARK, fillColor: [248, 249, 251] },
      1: { cellWidth: 133 },
    },
  });
  y = doc.lastAutoTable.finalY + 10;

  /* =======================
     INTRO TEXT
  ======================= */
  doc.setFontSize(10.5);
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "normal");
  doc.text("Dear Customer,", margin, y);
  y += 7;

  const introEnd =
    "Thank you for choosing PackYatra as your trusted shifting partner. We are pleased to provide our competitive relocation quote. Our package includes specialized multi-layer packing, certified transport cargo, and dedicated loading/unloading handlers to ensure a stress-free shifting experience.";
  y = addTextWithPageBreak(introEnd, y);

  /* =======================
     COST BREAKUP
  ======================= */
  doc.setFontSize(11.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BRAND_DARK);

  doc.setFillColor(...BRAND_BLUE);
  doc.rect(margin, y - 5, 2, 7, "F");
  doc.text("Commercial Cost Summary (INR)", margin + 6, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Service Description Details", "Billing Rate Status"]],
    body: [
      ["Professional Safe Transit & Logistics Freight Charges", "Included in Package"],
      ["Industrial Grade Multi-Layer Packing Materials & Labor", "Included in Package"],
      ["Safe Stacking, Systematic Loading & Unloading Services", "Included in Package"],
      ["Dedicated Vehicle Carrier / Allied Services (if applicable)", price?.car || "Included"],
      ["ESTIMATED ALL-INCLUSIVE ESTIMATE", price ? `INR ${price} /-` : "-"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: BRAND_DARK,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    styles: { fontSize: 9.5, cellPadding: 3.5, lineColor: BORDER_GREY, lineWidth: 0.3 },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 55, halign: "right" },
    },
    didParseCell: (data) => {
      // Bold + highlight the grand total row
      if (data.row.index === 4 && data.section === "body") {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = BRAND_LIGHT_BLUE;
        if (data.column.index === 1) {
          data.cell.styles.textColor = BRAND_BLUE;
        } else {
          data.cell.styles.textColor = BRAND_DARK;
        }
      }
    },
  });
  y = doc.lastAutoTable.finalY + 14;

  /* =======================
     SIGNATORY + COMPANY INFO (side by side)
  ======================= */
  if (y > SAFE_BOTTOM - 40) {
    doc.addPage();
    y = TOP_MARGIN;
  }

  const sigStartY = y;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text("Authorized Signatory,", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text("PackYatra Relocation Private Ltd.", margin, y + 5);

  let signatureBase64 = null;
  try {
    signatureBase64 = await loadImageAsBase64(signature);
  } catch (err) {
    console.warn("Signature image not found, skipping signature" + signatureBase64);
  }

  if (signatureBase64) {
    doc.addImage(signatureBase64, "PNG", margin, y + 8, 25, 25);
  }

  // Right column: corporate credentials
  const rightColX = margin + 100;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND_DARK);
  doc.text("Corporate Credentials", rightColX, sigStartY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text("CIN:  U68100KA2025PTC210677", rightColX, sigStartY + 6);
  doc.text("PAN:  AAXCP1234Q", rightColX, sigStartY + 11);
  doc.text("GST:  29AAQCP3437K1ZR", rightColX, sigStartY + 16);

  y = sigStartY + 40;

 /* =======================
     ITEMS TABLE
  ======================= */
  if (y > SAFE_BOTTOM - 30) {
    doc.addPage();
    y = TOP_MARGIN;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(...BRAND_DARK);
  doc.setFillColor(...BRAND_BLUE);
  doc.rect(margin, y - 5, 2, 7, "F");
  doc.text("Itemized Shifting Inventory Manifest", margin + 6, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [["Item Description", "Quantity"]],
    body:
      selectedItems.length > 0
        ? selectedItems.map((item) => [item.name || "-", item.quantity || 0])
        : [["-", "-"]],
    theme: "grid",
    headStyles: {
      fillColor: BRAND_DARK,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9.5,
    },
    styles: { fontSize: 9.5, cellPadding: 3, lineColor: BORDER_GREY, lineWidth: 0.3 },
    columnStyles: {
      0: { cellWidth: 140 },
      1: { cellWidth: 35, halign: "center" },
    },
    didParseCell: (data) => {
      // zebra striping for readability with many items
      if (data.section === "body" && data.row.index % 2 === 1) {
        data.cell.styles.fillColor = [248, 249, 251];
      }
    },
  });
  y = doc.lastAutoTable.finalY + 14;
  /* =======================
     PAYMENT TERMS
  ======================= */
  if (y > SAFE_BOTTOM - 20) {
    doc.addPage();
    y = TOP_MARGIN;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_DARK);
  doc.text("Payment Terms and Condition:", margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(40, 40, 40);
  const paymentTerms = [
    "1. Kindly note that to confirm your Packers & Movers booking and reserve your preferred slot, an advance payment of 10% of the total amount is required.",
    "2. After the initial 10% booking amount, the remaining 90% will be paid as 80% during loading and the final 10% before unloading.",
    "3. We support all major payment methods available in India, such as UPI, Credit/Debit Cards and Net Banking",
    "4. Kindly ensure that all payments are made only to Packyatra Relocation Private Limited. Payments made to any other individual or account will not be accepted.",
  ];
  y = addTextWithPageBreak(paymentTerms, y);

  /* =======================
     PROHIBITED ITEMS
  ======================= */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_DARK);
  doc.text("Prohibited Items for Transportation:", margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(40, 40, 40);
  const prohibitedItems = `For security reasons, the company does not accept cash, jewellery, valuables, or important documents for transportation. These
items must be kept in the client's personal custody. We do not accept to move perishable goods, arms & ammunitions, hazardous
material like crackers, explosives, chemicals, filled gas cylinder, battery acids, and inflammable oils; such as diesel, petrol, kerosene,
gasoline, narcotics & counter brand items.`;

  y = addTextWithPageBreak(prohibitedItems.split("\n"), y);

  /* =======================
     TERMS & CONDITIONS
  ======================= */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_DARK);
  doc.text("Terms and Conditions:", margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(40, 40, 40);

  const terms = [
    "• If you book a direct FTL (Full Truck Load), the expected daily movement will be approximately 300 km. For share-based bookings, delivery timelines will be as per the defined TAT.",
    "• Pickup and delivery days are excluded from the transit timeline.",
    "• Delivery timelines may vary due to traffic conditions, weather, or regulatory approvals.",
    "• Packyatra shall not be responsible for any pre-existing defects, damages, or functional issues identified before transportation.",
    "• Electrical, plumbing, carpentry, and AC services are not included unless specifically mentioned in the quotation or invoice.",
    "• Personal items such as goggles, mobile chargers, cartons, or belongings left inside the vehicle will be carried strictly at the owner's sole risk. No claims shall be entertained by Packyatra Relocation Private Limited.",
    "• Helmets or riding gear will be transported only if they are specifically mentioned and charged in the invoice.",
    "• Clients are advised to opt for Packyatra Relocation Private Limited risk coverage or obtain insurance for additional protection of their goods.",
    "• All consignments transported through our lorries are carried entirely at the owner's risk. Customers are advised to arrange insurance coverage for their consignments.",
    "• Charges for Mathadi (union labor and associated services) shall be borne by the client and are excluded from the quotation, wherever applicable (e.g., Mumbai, Pune, Kerala, etc.).",
    "• Unloading, unpacking, and rearranging services are not available in Kerala.",
    "• All packing materials remain the property of Packyatra and must be returned on the day of unloading. Retention of any boxes will incur a charge of Rs. 60 per carton.",
    "• The quotation does not include dismantling (carpentry work) or installation/fitting of electrical or electronic appliances unless specified.",
    "• Any permissions or fees required at the client's location to facilitate shifting—such as society charges, parking fees, or entry permissions—shall be borne by the client.",
    "• Rescheduling is permitted up to 24 hours prior to the scheduled move date at no additional cost, provided the support team is informed in advance.",
    "• For cancellations, clients are requested to contact the Packyatra support team.",
    "• If any third-party services are involved (e.g., AC dismantling) or if local transportation and labor are utilized, applicable charges for such services will be levied.",
  ];

  y = addTextWithPageBreak(terms, y);

  /* ================= FOOTER (all pages) ================= */
  const drawFooter = (pageNum, totalPages) => {
    const footerY = PAGE_HEIGHT - FOOTER_HEIGHT;

    doc.setDrawColor(...BORDER_GREY);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY, PAGE_WIDTH - margin, footerY);

    doc.setFillColor(248, 249, 251);
    doc.rect(0, footerY, PAGE_WIDTH, FOOTER_HEIGHT, "F");

    // mini brand lockup on footer left
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND_DARK);
    doc.text("PACKYATRA", margin, footerY + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...TEXT_GREY);
    doc.text("RELOCATION PRIVATE LIMITED", margin, footerY + 9.5);

    doc.setFontSize(7.5);
    doc.text("www.packyatra.com", PAGE_WIDTH - margin, footerY + 5, { align: "right" });
    doc.text("Ph: +91 9071 535 535", PAGE_WIDTH - margin, footerY + 9, { align: "right" });
    doc.text("Email: info@packyatra.com", PAGE_WIDTH - margin, footerY + 13, { align: "right" });

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text("© PackYatra Relocation Private Limited", margin, footerY + 17);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Regd. Office: 122, 4th Main, West of Chord Road, Manjunath Nagar, Bangalore - 560010, Karnataka, India",
      margin,
      footerY + 20.5
    );

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BRAND_DARK);
    doc.text(`Page ${pageNum} of ${totalPages}`, PAGE_WIDTH - margin, footerY + 20.5, {
      align: "right",
    });
  };

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(i, totalPages);
  }

  //doc.save("PackyatraQuotation.pdf");
  const blob = doc.output("blob");
  return blob;
};