import jsPDF from 'jspdf';
import { Inspection } from '../types';

/**
 * Generates an official Chilean SEC TE4 Solar Inspection PDF Report
 */
export async function generateTE4PdfReport(inspection: Inspection): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Colors
  const primaryNavy = [15, 32, 67]; // #0F2043 Navy SEC Chile
  const secRed = [200, 30, 30]; // Chile SEC Red
  const textDark = [33, 37, 41];
  const bgLight = [245, 247, 250];
  const borderGray = [210, 215, 222];
  const greenPass = [34, 139, 34];
  const redFail = [220, 53, 69];

  // Helper functions
  const checkAddPage = (requiredHeight: number) => {
    if (y + requiredHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawHeaderFooter();
    }
  };

  const drawHeaderFooter = () => {
    // Top banner line
    doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.rect(0, 0, pageWidth, 5, 'F');

    // Page footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    const footerText = `Informe de Inspección Técnica TE4 SEC - Instalaciones Fotovoltaicas Ley 20.571 / 21.118`;
    doc.text(footerText, margin, pageHeight - 8);
    const pageNum = doc.getNumberOfPages();
    doc.text(`Página ${pageNum}`, pageWidth - margin - 15, pageHeight - 8);
  };

  // -------------------------------------------------------------
  // HEADER
  // -------------------------------------------------------------
  drawHeaderFooter();

  // SEC Title Header Box
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.roundedRect(margin, y, contentWidth, 22, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('INFORME DE INSPECCIÓN TÉCNICA - DECLARACIÓN TE4', margin + 5, y + 7, { maxWidth: 132 });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(76, 175, 80);
  doc.text('SERVILEC ENERGÍA', margin + 5, y + 12.5);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(210, 220, 230);
  doc.text('Normativa SEC Chile - Pliegos Técnicos RPTD N°01 a N°19 / Ley 20.571', margin + 5, y + 17);

  // Red SEC Badge
  const badgeWidth = 32;
  const badgeX = margin + contentWidth - badgeWidth - 3;
  doc.setFillColor(secRed[0], secRed[1], secRed[2]);
  doc.roundedRect(badgeX, y + 2.5, badgeWidth, 17, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('CHILE SEC', badgeX + badgeWidth / 2, y + 9, { align: 'center' });
  doc.setFontSize(7);
  doc.text('Acreditado', badgeX + badgeWidth / 2, y + 14, { align: 'center' });

  y += 26;

  // -------------------------------------------------------------
  // SECTION 1: DATOS GENERALES (Instalador & Cliente)
  // -------------------------------------------------------------
  const sec1Col1X = margin + 4;
  const sec1Col2X = margin + 96;

  const sec1Rows = [
    {
      col1: { label: 'Instalador SEC:', val: inspection.installer.name || 'N/A', valWidth: 54 },
      col2: { label: 'RUT / Licencia:', val: `${inspection.installer.rut ? `RUT: ${inspection.installer.rut} | ` : ''}Lic. ${inspection.installer.secLicenceNumber || 'N/A'}`, valWidth: 54 }
    },
    {
      col1: { label: 'Cliente / Propietario:', val: `${inspection.client.name || 'N/A'}${inspection.client.rut ? ` (RUT: ${inspection.client.rut})` : ''}`, valWidth: 54 },
      col2: { label: 'Dirección:', val: `${inspection.client.address || 'N/A'}${inspection.client.comuna ? `, ${inspection.client.comuna}` : ''}`, valWidth: 54 }
    },
    {
      col1: { label: 'Teléfono Contacto:', val: inspection.client.phone || 'N/A', valWidth: 54 },
      col2: { label: 'Email:', val: inspection.client.email || 'N/A', valWidth: 54 }
    }
  ];

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  const sec1RowHeights = sec1Rows.map((row) => {
    const lines1 = doc.splitTextToSize(row.col1.val, row.col1.valWidth).length;
    const lines2 = doc.splitTextToSize(row.col2.val, row.col2.valWidth).length;
    const maxLines = Math.max(1, lines1, lines2);
    return (maxLines * 3.8) + 2.5;
  });

  const totalSec1ContentHeight = sec1RowHeights.reduce((sum, h) => sum + h, 0);
  const sec1HeaderHeight = 9;
  const sec1BoxHeight = sec1HeaderHeight + totalSec1ContentHeight + 2;

  checkAddPage(sec1BoxHeight + 5);

  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, sec1BoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text('1. INFORMACIÓN DEL INSTALADOR Y CLIENTE', margin + 4, y + 6);

  let sec1RowY = y + sec1HeaderHeight + 2;

  sec1Rows.forEach((row, idx) => {
    const rHeight = sec1RowHeights[idx];

    // Col 1
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(row.col1.label, sec1Col1X, sec1RowY);

    const lbl1Width = doc.getTextWidth(row.col1.label) + 2.5;
    doc.setFont('helvetica', 'normal');
    const split1 = doc.splitTextToSize(row.col1.val, row.col1.valWidth);
    doc.text(split1, sec1Col1X + lbl1Width, sec1RowY);

    // Col 2
    doc.setFont('helvetica', 'bold');
    doc.text(row.col2.label, sec1Col2X, sec1RowY);

    const lbl2Width = doc.getTextWidth(row.col2.label) + 2.5;
    doc.setFont('helvetica', 'normal');
    const split2 = doc.splitTextToSize(row.col2.val, row.col2.valWidth);
    doc.text(split2, sec1Col2X + lbl2Width, sec1RowY);

    sec1RowY += rHeight;
  });

  y += sec1BoxHeight + 6;

  // -------------------------------------------------------------
  // SECTION 2: FICHA TÉCNICA DEL SISTEMA SOLAR
  // -------------------------------------------------------------
  const sec2Col1X = margin + 4;
  const sec2Col2X = margin + 96;

  const rawPower = inspection.technical.installedPowerKwp || 'N/A';
  const displayPower = rawPower !== 'N/A' && !rawPower.toLowerCase().includes('kw') ? `${rawPower} kW` : rawPower;
  const mpptStr = inspection.technical.mpptCount 
    ? `${inspection.technical.mpptCount} MPPT | ${inspection.technical.stringsCount || 'N/A'} Str | ${inspection.technical.panelsPerString || 'N/A'} Pan`
    : `${inspection.technical.stringsCount || 'N/A'} Str | ${inspection.technical.panelsPerString || 'N/A'} Pan`;

  const specRows = [
    {
      col1: { label: 'Tipo de Sistema:', val: inspection.technical.systemType || 'On-Grid (Netbilling)', valWidth: 52 },
      col2: { label: 'Potencia Instalada:', val: displayPower, valWidth: 52 }
    },
    {
      col1: { label: 'Módulos Paneles:', val: inspection.technical.panelsCountAndPower || 'N/A', valWidth: 52 },
      col2: { label: 'Inversor Marca/Mod:', val: inspection.technical.inverterBrandModel || 'N/A', valWidth: 52 }
    },
    {
      col1: { label: 'N° Serie Inversor:', val: inspection.technical.inverterSerialNumber || 'N/A', valWidth: 52 },
      col2: { label: 'Resistencia Tierra:', val: `${inspection.technical.groundingResistanceOhm || '< 20'} Ω`, valWidth: 52 }
    },
    {
      col1: { label: 'Config. Strings/MPPT:', val: mpptStr, valWidth: 52 },
      col2: { label: 'Baterías / Litio:', val: inspection.technical.batteryInfo || 'Sin Baterías', valWidth: 52 }
    },
    {
      col1: { label: 'Empresa Distribuidora:', val: inspection.technical.distributionCompany || 'Enel / CGE / Chilquinta', valWidth: 52 },
      col2: { label: 'Fecha Inspección:', val: inspection.technical.inspectionDate || new Date().toISOString().slice(0, 10), valWidth: 52 }
    }
  ];

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  const rowHeights = specRows.map((row) => {
    const lines1 = doc.splitTextToSize(row.col1.val, row.col1.valWidth).length;
    const lines2 = doc.splitTextToSize(row.col2.val, row.col2.valWidth).length;
    const maxLines = Math.max(1, lines1, lines2);
    return (maxLines * 3.8) + 2.5;
  });

  const totalSpecsContentHeight = rowHeights.reduce((sum, h) => sum + h, 0);
  const sec2HeaderHeight = 9;
  const sec2SpecsBoxHeight = sec2HeaderHeight + totalSpecsContentHeight + 3;

  const mapsCardHeight = 25;
  const totalSec2CombinedHeight = sec2SpecsBoxHeight + mapsCardHeight + 8;

  checkAddPage(totalSec2CombinedHeight);

  // Main Specs Box
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, sec2SpecsBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text('2. ESPECIFICACIONES TÉCNICAS DE LA INSTALACIÓN FOTOVOLTAICA', margin + 4, y + 6);

  let rowY = y + sec2HeaderHeight + 2;

  specRows.forEach((row, idx) => {
    const rHeight = rowHeights[idx];

    // Col 1
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(row.col1.label, sec2Col1X, rowY);

    const lbl1Width = doc.getTextWidth(row.col1.label) + 2.5;
    doc.setFont('helvetica', 'normal');
    const split1 = doc.splitTextToSize(row.col1.val, row.col1.valWidth);
    doc.text(split1, sec2Col1X + lbl1Width, rowY);

    // Col 2
    doc.setFont('helvetica', 'bold');
    doc.text(row.col2.label, sec2Col2X, rowY);

    const lbl2Width = doc.getTextWidth(row.col2.label) + 2.5;
    doc.setFont('helvetica', 'normal');
    const split2 = doc.splitTextToSize(row.col2.val, row.col2.valWidth);
    doc.text(split2, sec2Col2X + lbl2Width, rowY);

    rowY += rHeight;
  });

  y += sec2SpecsBoxHeight + 6;

  // -------------------------------------------------------------
  // GOOGLE MAPS LOCATION CARD
  // -------------------------------------------------------------
  const mapsBoxY = y;
  doc.setFillColor(240, 249, 255); // Sky blue light tint
  doc.setDrawColor(2, 132, 199); // Google maps sky blue border
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, mapsBoxY, contentWidth, mapsCardHeight, 2, 2, 'FD');

  // Vector Map Graphic Background (Left Side Map simulation)
  const mapGraphicX = margin + 3.5;
  const mapGraphicY = mapsBoxY + 3.5;
  const mapGraphicW = 20;
  const mapGraphicH = 18;

  // Map Background
  doc.setFillColor(226, 232, 240); // Map road base
  doc.roundedRect(mapGraphicX, mapGraphicY, mapGraphicW, mapGraphicH, 1.5, 1.5, 'F');

  // Park area on map
  doc.setFillColor(220, 252, 231); // Green park rect
  doc.rect(mapGraphicX + 1, mapGraphicY + 1, 8, 6, 'F');

  // Water area on map
  doc.setFillColor(224, 242, 254); // Blue river rect
  doc.rect(mapGraphicX + 10, mapGraphicY + 10, 9, 7, 'F');

  // Road grid lines
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(1.2);
  doc.line(mapGraphicX, mapGraphicY + 9, mapGraphicX + mapGraphicW, mapGraphicY + 9);
  doc.line(mapGraphicX + 11, mapGraphicY, mapGraphicX + 11, mapGraphicY + mapGraphicH);

  // Red Map Pin (Drop Pin)
  const pinX = mapGraphicX + 11;
  const pinY = mapGraphicY + 7;

  // Pin Shadow
  doc.setFillColor(148, 163, 184);
  doc.ellipse(pinX, pinY + 7.5, 3.2, 1, 'F');

  // Pin Red Body
  doc.setFillColor(234, 67, 53); // Google Red #EA4335
  doc.circle(pinX, pinY, 3.5, 'F');
  
  // Pin Pointer triangle
  doc.triangle(pinX - 3.2, pinY + 1, pinX + 3.2, pinY + 1, pinX, pinY + 7, 'F');

  // Pin Center Dot (White)
  doc.setFillColor(255, 255, 255);
  doc.circle(pinX, pinY, 1.3, 'F');

  // Text inside Google Maps Card
  const mapTextX = margin + 27;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42); // Navy
  doc.text('UBICACIÓN GEOGRÁFICA Y COORDENADAS GPS (GOOGLE MAPS)', mapTextX, mapsBoxY + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(2, 132, 199); // Sky blue
  doc.text('Coordenadas SEC:', mapTextX, mapsBoxY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const gpsCoordVal = inspection.technical.gpsCoordinates || 'No registradas (Requerido SEC)';
  doc.text(gpsCoordVal, mapTextX + 28, mapsBoxY + 12, { maxWidth: 84 });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Dirección Instalación:', mapTextX, mapsBoxY + 18);
  doc.setFont('helvetica', 'normal');
  const fullAddressStr = `${inspection.client.address || 'Sin Dirección'}${inspection.client.comuna ? `, ${inspection.client.comuna}` : ''}`;
  doc.text(fullAddressStr, mapTextX + 28, mapsBoxY + 18, { maxWidth: 84 });

  // Right Side Google Maps Verification Badge
  const mapBadgeW = 44;
  const mapBadgeH = 16;
  const mapBadgeX = margin + contentWidth - mapBadgeW - 3;
  const mapBadgeY = mapsBoxY + 4.5;

  doc.setFillColor(26, 115, 232); // Google Blue #1A73E8
  doc.roundedRect(mapBadgeX, mapBadgeY, mapBadgeW, mapBadgeH, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('GOOGLE MAPS', mapBadgeX + mapBadgeW / 2, mapBadgeY + 6.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(224, 242, 254);
  doc.text('GEOREFERENCIADO SEC', mapBadgeX + mapBadgeW / 2, mapBadgeY + 12, { align: 'center' });

  y += mapsCardHeight + 8;

  // -------------------------------------------------------------
  // SECTION 3: RESUMEN DE CHECKLIST NORMATIVO SEC
  // -------------------------------------------------------------
  checkAddPage(15);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text('3. CHECKLIST NORMATIVO DE INSPECCIÓN TE4 SEC', margin, y);

  y += 4;

  // Table Header
  doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.rect(margin, y, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Cód.', margin + 2, y + 5);
  doc.text('Ítem de Inspección y Referencia SEC', margin + 14, y + 5);
  doc.text('Estado', margin + 133.5, y + 5, { align: 'center' });
  doc.text('Fotos', margin + 154, y + 5, { align: 'center' });
  doc.text('Obs.', margin + 173, y + 5, { align: 'center' });

  y += 7;

  let alternateBg = false;

  inspection.categories.forEach((cat) => {
    // Category Header Row
    checkAddPage(8);
    doc.setFillColor(225, 232, 242);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.text(cat.title, margin + 2, y + 4.5);
    y += 6;

    cat.items.forEach((item) => {
      checkAddPage(7);

      if (alternateBg) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, 6.5, 'F');
      }
      alternateBg = !alternateBg;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(item.code, margin + 2, y + 4.5);

      doc.setFont('helvetica', 'normal');
      const cleanTitle = item.title.trim();
      doc.text(cleanTitle, margin + 14, y + 4.5, { maxWidth: 108 });

      // Status Badge
      const badgeX = margin + 124;
      const badgeW = 19;
      if (item.status === 'C') {
        doc.setFillColor(greenPass[0], greenPass[1], greenPass[2]);
        doc.roundedRect(badgeX, y + 1, badgeW, 4.5, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('Conforme', badgeX + badgeW / 2, y + 4.2, { align: 'center' });
      } else if (item.status === 'NC') {
        doc.setFillColor(redFail[0], redFail[1], redFail[2]);
        doc.roundedRect(badgeX, y + 1, badgeW, 4.5, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('No Conf.', badgeX + badgeW / 2, y + 4.2, { align: 'center' });
      } else if (item.status === 'NA') {
        doc.setFillColor(150, 150, 150);
        doc.roundedRect(badgeX, y + 1, badgeW, 4.5, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('N/A', badgeX + badgeW / 2, y + 4.2, { align: 'center' });
      } else {
        doc.setFillColor(220, 220, 220);
        doc.roundedRect(badgeX, y + 1, badgeW, 4.5, 1, 1, 'F');
        doc.setTextColor(80, 80, 80);
        doc.setFont('helvetica', 'normal');
        doc.text('Pendiente', badgeX + badgeW / 2, y + 4.2, { align: 'center' });
      }

      // Photos Count
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(60, 60, 60);
      doc.text(`${item.photos.length} foto(s)`, margin + 154, y + 4.5, { align: 'center' });

      // Observation indicator
      const obsText = item.observation ? (item.observation.length > 12 ? item.observation.slice(0, 10) + '..' : item.observation) : '-';
      doc.text(obsText, margin + 173, y + 4.5, { align: 'center', maxWidth: 18 });

      y += 6.5;
    });
  });

  y += 6;

  // -------------------------------------------------------------
  // SECTION 4: OBSERVACIONES Y CONCLUSIÓN TÉCNICA
  // -------------------------------------------------------------
  const generalObs = inspection.generalNotes || 'La instalación cumple con todos los parámetros exigidos por los pliegos técnicos normativos RPTD / RIC de la SEC para la tramitación de la Declaración TE4.';
  const splitObs = doc.splitTextToSize(generalObs, contentWidth - 8);
  const obsBoxHeight = Math.max(22, 10 + splitObs.length * 4);

  checkAddPage(obsBoxHeight + 6);

  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, y, contentWidth, obsBoxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
  doc.text('4. OBSERVACIONES Y OBSERVACIÓN FINAL DEL INSTALADOR', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(splitObs, margin + 4, y + 11);

  y += obsBoxHeight + 8;

  // -------------------------------------------------------------
  // SIGNATURE AREA
  // -------------------------------------------------------------
  checkAddPage(38);

  const sigCol1Center = margin + 45;
  const sigCol2Center = margin + 137;

  // Signature lines
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.line(margin + 10, y + 20, margin + 80, y + 20);
  doc.line(margin + 102, y + 20, margin + 172, y + 20);

  // Installer Signature Image if present
  if (inspection.signatureDataUrl) {
    try {
      doc.addImage(inspection.signatureDataUrl, 'PNG', margin + 20, y + 2, 50, 16);
    } catch (err) {
      console.warn('Could not render signature on PDF:', err);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);

  doc.text('Firma Instalador Certificado SEC', sigCol1Center, y + 25, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${inspection.installer.name || 'Instalador Certificado'}`, sigCol1Center, y + 29, { align: 'center' });
  doc.text(`Lic. SEC: ${inspection.installer.secLicenceNumber || 'N/A'}${inspection.installer.rut ? ` | RUT: ${inspection.installer.rut}` : ''}`, sigCol1Center, y + 33, { align: 'center' });

  // Client Signature
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Firma / Recepción Cliente', sigCol2Center, y + 25, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${inspection.client.name || 'Propietario / Representante'}`, sigCol2Center, y + 29, { align: 'center' });
  doc.text(`RUT: ${inspection.client.rut || 'N/A'}`, sigCol2Center, y + 33, { align: 'center' });

  y += 40;

  // -------------------------------------------------------------
  // ANEXO FOTOGRÁFICO
  // -------------------------------------------------------------
  // Collect all photos
  const photoList: { code: string; title: string; normaSec: string; photo: any }[] = [];
  inspection.categories.forEach((cat) => {
    cat.items.forEach((item) => {
      item.photos.forEach((ph) => {
        photoList.push({
          code: item.code,
          title: item.title,
          normaSec: item.normaSec,
          photo: ph,
        });
      });
    });
  });

  if (photoList.length > 0) {
    doc.addPage();
    y = margin;
    drawHeaderFooter();

    doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('ANEXO FOTOGRÁFICO - EVIDENCIA DE INSPECCIÓN TE4', margin + 6, y + 8);

    y += 18;

    const imgWidth = 82;
    const imgHeight = 62;
    const itemsPerRow = 2;

    for (let i = 0; i < photoList.length; i++) {
      const item = photoList[i];
      const col = i % itemsPerRow;
      const posX = margin + col * (imgWidth + 10);

      if (col === 0 && i > 0 && i % 4 === 0) {
        doc.addPage();
        y = margin;
        drawHeaderFooter();

        doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
        doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('ANEXO FOTOGRÁFICO (Continuación)', margin + 6, y + 8);
        y += 18;
      }

      // Draw Photo Card Container
      doc.setFillColor(250, 251, 253);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.roundedRect(posX, y, imgWidth, imgHeight + 16, 2, 2, 'FD');

      // Title header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
      doc.text(`Ítem ${item.code}: ${item.title}`, posX + 3, y + 5, { maxWidth: imgWidth - 6 });

      // Image / Video
      const isVideoFile = item.photo.id.startsWith('vid-') || item.photo.url.startsWith('data:video/') || /\.(mp4|webm|mov|m4v|avi|mkv)$/i.test(item.photo.name || '');

      if (isVideoFile) {
        doc.setFillColor(240, 244, 250);
        doc.rect(posX + 3, y + 8, imgWidth - 6, imgHeight - 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
        doc.text('[REGISTRO DE VIDEO ADJUNTO]', posX + 8, y + 28);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(`Archivo: ${(item.photo.name || 'Video').substring(0, 28)}`, posX + 8, y + 35);
        doc.text(`Fecha/Hora: ${item.photo.timestamp}`, posX + 8, y + 41);
      } else {
        try {
          doc.addImage(item.photo.url, 'JPEG', posX + 3, y + 8, imgWidth - 6, imgHeight - 2);
        } catch (e) {
          // Fallback placeholder box
          doc.setFillColor(230, 230, 230);
          doc.rect(posX + 3, y + 8, imgWidth - 6, imgHeight - 2, 'F');
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text('Archivo adjunto', posX + 20, y + 35);
        }
      }

      // Footer note
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(`Norma: ${item.normaSec} | ${item.photo.timestamp || ''}`, posX + 3, y + imgHeight + 11, { maxWidth: imgWidth - 6 });

      if (col === itemsPerRow - 1 || i === photoList.length - 1) {
        y += imgHeight + 22;
      }
    }
  }

  return doc.output('blob');
}
