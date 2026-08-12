import React, { useState } from 'react';
import { User, MapPin, Cpu, ChevronDown, ChevronUp, UserCheck, Phone, ShieldCheck, Loader2, Check } from 'lucide-react';
import { InstallerInfo, ClientInfo, TechnicalInfo, SystemType } from '../types';

interface InstallerFormProps {
  installer: InstallerInfo;
  client: ClientInfo;
  technical: TechnicalInfo;
  onChangeInstaller: (data: InstallerInfo) => void;
  onChangeClient: (data: ClientInfo) => void;
  onChangeTechnical: (data: TechnicalInfo) => void;
}

export const InstallerForm: React.FC<InstallerFormProps> = ({
  installer,
  client,
  technical,
  onChangeInstaller,
  onChangeClient,
  onChangeTechnical,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isFetchingGps, setIsFetchingGps] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  const systemTypes: SystemType[] = ['On-Grid (Netbilling)', 'Off-Grid (Aislado)', 'Híbrido (Con Baterías)'];
  const installerNames = [
    'FELIPE VERAGUA',
    'SEBASTIAN LEIVA',
    'CARLOS HUMERES',
    'XAVIER CORNEJO',
    'BASTIAN HIDALGO'
  ];

  const inverterPowers = [
    '1 kW', '1.5 kW', '2 kW', '2.5 kW', '3 kW', '3.6 kW', '4 kW', '4.6 kW',
    '5 kW', '6 kW', '7 kW', '8 kW', '9 kW', '10 kW', '12 kW', '15 kW',
    '17 kW', '20 kW', '25 kW', '30 kW', '33 kW', '36 kW', '40 kW', '50 kW',
    '60 kW', '75 kW', '80 kW', '90 kW', '100 kW'
  ];

  const mpptOptions = [
    '1 MPPT', '2 MPPTs', '3 MPPTs', '4 MPPTs', '6 MPPTs', '8 MPPTs', '10 MPPTs', '12 MPPTs'
  ];

  const stringOptions = [
    '1 String', '2 Strings', '3 Strings', '4 Strings', '5 Strings', '6 Strings', '8 Strings', '10 Strings', '12 Strings', '16 Strings', '20 Strings'
  ];

  const parseNumStrings = (val?: string): number => {
    if (!val) return 0;
    const match = val.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const extractPanelWattage = (modelStr?: string): number => {
    if (!modelStr) return 550;
    const wMatch = modelStr.match(/(\d{3,4})\s*W/i);
    if (wMatch && wMatch[1]) {
      const val = parseInt(wMatch[1], 10);
      if (val >= 100 && val <= 1000) return val;
    }
    const numMatches = modelStr.match(/(?:-|\s|^)(\d{3})(?:M|T|MS|W|BC|SN|DG|MB|AG|\b)/gi);
    if (numMatches) {
      for (const m of numMatches) {
        const digits = m.match(/\d{3}/);
        if (digits) {
          const val = parseInt(digits[0], 10);
          if (val >= 300 && val <= 800) return val;
        }
      }
    }
    const genericMatch = modelStr.match(/\b(3\d\d|4\d\d|5\d\d|6\d\d|7\d\d)\b/);
    if (genericMatch) {
      return parseInt(genericMatch[1], 10);
    }
    return 550;
  };

  const unitPanelWattage = extractPanelWattage(technical.panelsCountAndPower);

  const formatPanelsSummary = (numStrings: number, counts: number[], customWatts?: number): string => {
    if (numStrings === 0 || counts.length === 0) return '';
    const totalPanels = counts.reduce((acc, curr) => acc + (curr || 0), 0);
    const wattsPerPanel = customWatts !== undefined ? customWatts : unitPanelWattage;
    const totalWatts = totalPanels * wattsPerPanel;
    const kwp = (totalWatts / 1000).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const allSame = counts.length > 0 && counts.every(c => c === counts[0]);
    let panelsText = '';
    if (allSame && (counts[0] || 0) > 0) {
      panelsText = `${counts[0]} paneles por string (${totalPanels} total)`;
    } else {
      const breakdown = counts.map((c, i) => `S${i + 1}: ${c || 0}p`).join(', ');
      panelsText = `${breakdown} (Total: ${totalPanels} paneles)`;
    }

    if (totalPanels > 0) {
      return `${panelsText} | Potencia Total: ${totalWatts.toLocaleString('es-CL')} W (${kwp} kWp)`;
    }
    return panelsText;
  };

  const numStrings = parseNumStrings(technical.stringsCount);
  const totalPanelsCalculated = (technical.stringPanelCounts || []).slice(0, numStrings).reduce((acc, curr) => acc + (curr || 0), 0);
  const totalPvWattsCalculated = totalPanelsCalculated * unitPanelWattage;
  const totalPvKwpCalculated = (totalPvWattsCalculated / 1000).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const secCertifiedPvBrands = [
    'Jinko Solar',
    'Canadian Solar',
    'LONGi Solar',
    'Trina Solar',
    'JA Solar',
    'Risen Energy',
    'Astronergy (Chint)',
    'SunPower / Maxeon',
    'Hanwha Q CELLS',
    'Seraphim',
    'Talesun',
    'DAH Solar',
    'Yingli Solar',
    'Luxen Solar',
    'Leapton Solar',
    'Hyundai Solar',
    'Anhui Solar',
    'Ulica Solar',
    'Otra Marca (Certificada SEC)'
  ];

  const secCertifiedPvModels: Record<string, string[]> = {
    'Jinko Solar': [
      'JKM415N-54HL4-V (415W Tiger Neo N-Type - Esol / Gobantes)',
      'JKM420N-54HL4-V (420W Tiger Neo N-Type - Esol / Gobantes)',
      'JKM425N-54HL4-V (425W Tiger Neo N-Type - Esol / Gobantes)',
      'JKM430N-54HL4-V (430W Tiger Neo N-Type - Esol / Gobantes)',
      'JKM440N-54HL4-V (440W Tiger Neo N-Type - Esol / Gobantes)',
      'JKM450M-72HL4 (450W Mono PERC - Esol / Gobantes)',
      'JKM500M-72HL4 (500W Mono PERC 144-Cell - Esol / Gobantes)',
      'JKM540M-72HL4 (540W Mono PERC Half-Cell 20.9% - Esol / Gobantes)',
      'JKM550M-72HL4 (550W Mono PERC Half-Cell 21.3% - Esol / Gobantes)',
      'JKM555M-72HL4 (555W Mono PERC Half-Cell 21.5% - Esol / Gobantes)',
      'JKM560M-72HL4 (560W Mono PERC Half-Cell 21.7% - Esol / Gobantes)',
      'JKM565M-72HL4-V (565W Mono PERC 1500V - Esol / Gobantes)',
      'JKM570M-72HL4-V (570W Mono PERC 1500V - Esol / Gobantes)',
      'JKM575M-72HL4-V (575W Mono PERC 1500V - Esol / Gobantes)',
      'JKM580M-72HL4-V (580W Mono PERC 1500V - Esol / Gobantes)',
      'Tiger Neo N-type JKM585N-72HL4-V (585W TOPCon N-Type 22.6% - Esol / Gobantes)',
      'Tiger Neo N-type JKM590N-72HL4-V (590W TOPCon N-Type 22.8% - Esol / Gobantes)',
      'Tiger Neo N-type JKM595N-72HL4-V (595W TOPCon N-Type - Esol)',
      'Tiger Neo N-type JKM600N-72HL4-V (600W TOPCon N-Type 23.2% - Esol / Gobantes)',
      'Tiger Neo N-type JKM615N-78HL4-V (615W TOPCon N-Type 22.0% - Esol)',
      'Tiger Neo N-type JKM620N-78HL4-V (620W TOPCon N-Type 22.2% - Esol / Gobantes)',
      'Tiger Neo N-type JKM625N-78HL4-V (625W TOPCon N-Type - Esol)',
      'Tiger Neo N-type JKM630N-78HL4-V (630W TOPCon N-Type 22.5% - Esol / Gobantes)',
      'Otro Modelo Jinko (Catálogo Esol / Gobantes)'
    ],
    'Canadian Solar': [
      'CS6R-405MS (405W HiKu6 Monofásico - Esol / Gobantes)',
      'CS6R-410MS (410W HiKu6 Monofásico - Esol / Gobantes)',
      'CS6R-415MS (415W HiKu6 Monofásico - Esol / Gobantes)',
      'CS6W-450MS (450W HiKu Mono PERC - Esol / Gobantes)',
      'HiKu6 CS6W-530MS (530W Mono PERC Half-Cut 20.7% - Esol / Gobantes)',
      'HiKu6 CS6W-540MS (540W Mono PERC Half-Cut 21.1% - Esol / Gobantes)',
      'HiKu6 CS6W-545MS (545W Mono PERC Half-Cut 21.3% - Esol / Gobantes)',
      'HiKu6 CS6W-550MS (550W Mono PERC Half-Cut 21.5% - Esol / Gobantes)',
      'HiKu6 CS6W-555MS (555W Mono PERC Half-Cut 21.7% - Esol / Gobantes)',
      'CS6W-585T (585W TOPCon N-Type High Efficiency)',
      'CS6.2-66TB-615 (615W TOPCon Bifacial)',
      'CS6.2-66TB-620 (620W TOPCon Bifacial)',
      'LR7-72HVH-640M (640W High Power)',
      'BiHiKu6 CS6W-540MB-AG (540W Bifacial Dual Glass - Esol)',
      'BiHiKu6 CS6W-550MB-AG (550W Bifacial Dual Glass - Esol / Gobantes)',
      'BiHiKu6 CS6W-555MB-AG (555W Bifacial Dual Glass - Gobantes)',
      'HiKu7 CS7N-650MS (650W High Power Mono PERC 20.9% - Esol / Gobantes)',
      'HiKu7 CS7N-655MS (655W High Power Mono PERC 21.1% - Esol / Gobantes)',
      'HiKu7 CS7N-660MS (660W High Power Mono PERC 21.2% - Esol / Gobantes)',
      'HiKu7 CS7N-670MS (670W High Power Mono PERC 21.6% - Esol / Gobantes)',
      'BiHiKu7 CS7N-665TB-AG (665W TOPCon Bifacial Dual Glass - Esol)',
      'BiHiKu7 CS7N-690TB-AG (690W TOPCon Bifacial 22.2% - Esol / Gobantes)',
      'Otro Modelo Canadian Solar (Catálogo Esol / Gobantes)'
    ],
    'LONGi Solar': [
      'Hi-MO 4 LR4-72HPH-450M (450W Mono PERC - Esol / Gobantes)',
      'Hi-MO 5 LR5-54HPH-410M (410W Mono PERC - Esol / Gobantes)',
      'Hi-MO 5 LR5-54HPH-415M (415W Mono PERC - Esol / Gobantes)',
      'Hi-MO 5 LR5-72HPH-535M (535W Mono PERC Half-Cell 20.9% - Esol / Gobantes)',
      'Hi-MO 5 LR5-72HPH-540M (540W Mono PERC Half-Cell 21.1% - Esol / Gobantes)',
      'Hi-MO 5 LR5-72HPH-545M (545W Mono PERC Half-Cell 21.3% - Esol / Gobantes)',
      'Hi-MO 5 LR5-72HPH-550M (550W Mono PERC Half-Cell 21.5% - Esol / Gobantes)',
      'Hi-MO 5 LR5-72HPH-555M (555W Mono PERC Half-Cell 21.7% - Esol / Gobantes)',
      'Hi-MO 6 Explorer LR5-72HTH-565M (565W HPBC Tech 21.9% - Esol / Gobantes)',
      'Hi-MO 6 Explorer LR5-72HTH-570M (570W HPBC Tech 22.1% - Esol / Gobantes)',
      'Hi-MO 6 Explorer LR5-72HTH-575M (575W HPBC Tech 22.3% - Esol / Gobantes)',
      'Hi-MO 6 Explorer LR5-72HTH-580M (580W HPBC Tech 22.5% - Esol / Gobantes)',
      'Hi-MO 7 LR5-72HGB-590M (590W HPDC Bifacial Dual Glass - Esol / Gobantes)',
      'Hi-MO 7 LR5-72HGB-600M (600W HPDC Bifacial Dual Glass 22.8% - Esol / Gobantes)',
      'LR8-66HGD-615M (615W HPBC / TOPCon N-Type Bifacial)',
      'LR8-66HGD-620M (620W HPBC / TOPCon N-Type Bifacial)',
      'LR8-66HGD-625M (625W HPBC / TOPCon N-Type Bifacial)',
      'LR7-72HVH-640M (640W High Efficiency)',
      'Otro Modelo LONGi (Catálogo Esol / Gobantes)'
    ],
    'Trina Solar': [
      'Vertex S TSM-DE09.08 (400W Mono PERC - Esol / Gobantes)',
      'Vertex S TSM-DE09R.05 (415W Mono PERC - Esol / Gobantes)',
      'Vertex S TSM-DE09R.08 (425W Mono PERC - Esol / Gobantes)',
      'Vertex TSM-DE19 (540W Mono PERC 21.0% - Esol / Gobantes)',
      'Vertex TSM-DE19 (545W Mono PERC 21.2% - Esol / Gobantes)',
      'Vertex TSM-DE19 (550W Mono PERC 21.4% - Esol / Gobantes)',
      'Vertex TSM-DE19 (555W Mono PERC 21.6% - Esol / Gobantes)',
      'Vertex TSM-DE19 (560W Mono PERC 21.8% - Esol / Gobantes)',
      'Vertex TSM-DE21 (650W 210mm Ultra High Power 20.9% - Esol / Gobantes)',
      'Vertex TSM-DE21 (655W 210mm Ultra High Power 21.1% - Esol / Gobantes)',
      'Vertex TSM-DE21 (660W 210mm Ultra High Power 21.2% - Esol / Gobantes)',
      'Vertex N TSM-NEG21C.20 (690W TOPCon N-Type Bifacial 22.2% - Esol / Gobantes)',
      'Vertex N TSM-NEG21C.20 (700W TOPCon N-Type Bifacial 22.5% - Esol / Gobantes)',
      'Vertex N TSM-NEG21C.20 (710W TOPCon N-Type Bifacial 22.8% - Esol / Gobantes)',
      'Otro Modelo Trina (Catálogo Esol / Gobantes)'
    ],
    'JA Solar': [
      'JAM54S30-410/GR (410W Mono PERC - Esol / Gobantes)',
      'JAM54S30-415/GR (415W Mono PERC - Esol / Gobantes)',
      'JAM54S30-420/GR (420W Mono PERC - Esol / Gobantes)',
      'JAM72S30-535/MR (535W Mono PERC 144 Half-Cell - Esol / Gobantes)',
      'JAM72S30-540/MR (540W Mono PERC 144 Half-Cell 20.9% - Esol / Gobantes)',
      'JAM72S30-545/MR (545W Mono PERC 144 Half-Cell 21.1% - Esol / Gobantes)',
      'JAM72S30-550/MR (550W Mono PERC 144 Half-Cell 21.3% - Esol / Gobantes)',
      'JAM72S30-555/MR (555W Mono PERC 144 Half-Cell 21.5% - Esol / Gobantes)',
      'JAM72S30-560/MR (560W Mono PERC 144 Half-Cell 21.7% - Esol / Gobantes)',
      'JAM72D30-540/MB (540W Bifacial Double Glass - Esol / Gobantes)',
      'JAM72D30-550/MB (550W Bifacial Double Glass - Esol / Gobantes)',
      'JAM72D40-570/GB (570W TOPCon N-Type Bifacial 22.1% - Esol / Gobantes)',
      'JAM72D40-580/GB (580W TOPCon N-Type Bifacial 22.5% - Esol / Gobantes)',
      'JAM72D42-620/LB (620W n-type Bifacial 22.9% - Esol / Gobantes)',
      'Otro Modelo JA Solar (Catálogo Esol / Gobantes)'
    ],
    'Risen Energy': [
      'Titan RSM40-8-400M (400W Mono PERC - Esol / Gobantes)',
      'Titan RSM40-8-410M (410W Mono PERC - Esol / Gobantes)',
      'Titan RSM110-8-535M (535W Mono PERC 110-Cell 20.7% - Esol / Gobantes)',
      'Titan RSM110-8-540M (540W Mono PERC 110-Cell 20.9% - Esol / Gobantes)',
      'Titan RSM110-8-545M (545W Mono PERC 110-Cell 21.1% - Esol / Gobantes)',
      'Titan RSM110-8-550M (550W Mono PERC 110-Cell 21.3% - Esol / Gobantes)',
      'Titan RSM110-8-555M (555W Mono PERC 110-Cell 21.5% - Esol / Gobantes)',
      'Titan RSM130-8-650M (650W 130-Cell High Power 20.9% - Esol / Gobantes)',
      'Titan RSM130-8-660M (660W 130-Cell High Power 21.2% - Esol / Gobantes)',
      'Titan HJT Hyper-ion RSM110-8-700H (700W Heterojunción HJT 22.5% - Esol / Gobantes)',
      'Otro Modelo Risen (Catálogo Esol / Gobantes)'
    ],
    'Astronergy (Chint)': [
      'CHSM54M-HC 410W (Mono PERC - Gobantes)',
      'CHSM54M-HC 415W (Mono PERC - Gobantes)',
      'CHSM72M-HC 540W (Mono PERC Half-Cell 20.9% - Gobantes)',
      'CHSM72M-HC 545W (Mono PERC Half-Cell 21.1% - Gobantes)',
      'CHSM72M-HC 550W (Mono PERC Half-Cell 21.3% - Gobantes)',
      'CHSM72M-HC 555W (Mono PERC Half-Cell 21.5% - Gobantes)',
      'Astro N5 CHSM72N(DG)/F-BH 570W (TOPCon N-Type Bifacial - Gobantes)',
      'Astro N5 CHSM72N(DG)/F-BH 575W (TOPCon N-Type Bifacial 22.3% - Gobantes)',
      'Astro N5 CHSM72N(DG)/F-BH 580W (TOPCon N-Type Bifacial 22.5% - Gobantes)',
      'Otro Modelo Astronergy (Catálogo Esol / Gobantes)'
    ],
    'SunPower / Maxeon': [
      'Performance 3 SPR-P3-415-BLK (415W Black - Gobantes)',
      'Performance 6 SPR-P6-545-UPP (545W Shingled Bifacial 21.1% - Esol / Gobantes)',
      'Performance 6 SPR-P6-550-UPP (550W Shingled Bifacial 21.3% - Esol / Gobantes)',
      'Performance 6 SPR-P6-555-UPP (555W Shingled Bifacial 21.5% - Esol / Gobantes)',
      'Performance 6 SPR-P6-590-UPP (590W Shingled Commercial 21.8% - Esol / Gobantes)',
      'Maxeon 3 SPR-MAX3-400 (400W IBC - Gobantes)',
      'Maxeon 6 SPR-MAX6-430 (430W IBC - Gobantes)',
      'Maxeon 7 Commercial 500W+ (IBC Cell Tech - Esol / Gobantes)',
      'Otro Modelo SunPower (Catálogo Esol / Gobantes)'
    ],
    'Hanwha Q CELLS': [
      'Q.PEAK DUO M-G11 400W (Q.ANTUM DUO Tech - Gobantes)',
      'Q.PEAK DUO M-G11 410W (Q.ANTUM DUO Tech - Gobantes)',
      'Q.PEAK DUO XL-G10.d 535W (Q.ANTUM DUO Tech 20.6% - Gobantes)',
      'Q.PEAK DUO XL-G10.d 540W (Q.ANTUM DUO Tech 20.8% - Gobantes)',
      'Q.PEAK DUO XL-G11.7 580W (Zero-Gap Cell Layout 21.4% - Gobantes)',
      'Q.PEAK DUO XL-G11.7 585W (Zero-Gap Cell Layout 21.6% - Gobantes)',
      'Q.PEAK DUO XL-G11.7 590W (Zero-Gap Cell Layout 21.8% - Gobantes)',
      'Q.TRON XL-G2.d 620W (Q.ANTUM NEO N-type TOPCon - Gobantes)',
      'Otro Modelo Q CELLS (Catálogo Esol / Gobantes)'
    ],
    'Seraphim': [
      'SRP-410-BMA (410W Mono PERC - Gobantes)',
      'SRP-415-BMA (415W Mono PERC - Gobantes)',
      'SRP-535-BMA-HV (535W Mono PERC Half-Cell - Gobantes)',
      'SRP-540-BMA-HV (540W Mono PERC Half-Cell 20.9% - Gobantes)',
      'SRP-545-BMA-HV (545W Mono PERC Half-Cell 21.1% - Gobantes)',
      'SRP-550-BMA-HV (550W Mono PERC Half-Cell 21.3% - Gobantes)',
      'SRP-555-BMA-HV (555W Mono PERC Half-Cell 21.5% - Gobantes)',
      'SRP-670-BMC-BG (670W Bifacial Dual Glass 21.57% - Gobantes)',
      'Otro Modelo Seraphim (Catálogo Esol / Gobantes)'
    ],
    'Talesun': [
      'Bistar TP660M-410W (410W Mono PERC - Gobantes)',
      'Bistar TP6L72M-535W (Mono PERC 144 Half-Cell - Gobantes)',
      'Bistar TP6L72M-540W (Mono PERC 144 Half-Cell 20.9% - Gobantes)',
      'Bistar TP6L72M-545W (Mono PERC 144 Half-Cell 21.1% - Gobantes)',
      'Bistar TP6L72M-550W (Mono PERC 144 Half-Cell 21.3% - Gobantes)',
      'Bistar TP7G72M-580W (TOPCon N-Type High Eff 22.4% - Gobantes)',
      'Otro Modelo Talesun (Catálogo Esol / Gobantes)'
    ],
    'DAH Solar': [
      'DHM-60X10/FS-410W (Full-Screen Patented No-Dust - Esol / Gobantes)',
      'DHM-72X10/FS-540W (Full-Screen Patented No-Dust Tech 20.9% - Esol / Gobantes)',
      'DHM-72X10/FS-545W (Full-Screen Patented No-Dust Tech 21.1% - Esol / Gobantes)',
      'DHN-72X16/FS-550W (TOPCon Full-Screen 21.3% - Esol / Gobantes)',
      'DHN-72X16/FS-555W (TOPCon Full-Screen 21.5% - Esol / Gobantes)',
      'DHN-72X16/FS-560W (TOPCon Full-Screen 21.7% - Esol / Gobantes)',
      'DHN-72X16/DG-585W (TOPCon Bifacial Double Glass 22.6% - Esol / Gobantes)',
      'Otro Modelo DAH (Catálogo Esol / Gobantes)'
    ],
    'Yingli Solar': [
      'YL410D-34e (410W Mono PERC - Gobantes)',
      'YLM 108Cell (530W Mono PERC - Gobantes)',
      'YL540D-49e (540W P-Type Monocristalino 20.9% - Gobantes)',
      'YL545D-49e (545W P-Type Monocristalino 21.1% - Gobantes)',
      'YL550D-49e (550W P-Type Monocristalino 21.3% - Gobantes)',
      'YL555D-49e (555W P-Type Monocristalino 21.5% - Gobantes)',
      'Panda 3.0 N-Type YL570D-49e (570W TOPCon 22.1% - Gobantes)',
      'Otro Modelo Yingli (Catálogo Esol / Gobantes)'
    ],
    'Luxen Solar': [
      'LNSK-410M (410W Mono PERC - Gobantes)',
      'LNSK-540M (540W Mono PERC 144-Cell 20.9% - Gobantes)',
      'LNSK-545M (545W Mono PERC 144-Cell 21.1% - Gobantes)',
      'LNSK-550M (550W Mono PERC 144-Cell 21.3% - Gobantes)',
      'LNSK-555M (555W Mono PERC 144-Cell 21.5% - Gobantes)',
      'LNSK-570N (570W TOPCon N-Type 22.1% - Gobantes)',
      'LNSK-585N (585W TOPCon N-Type 22.6% - Gobantes)',
      'Otro Modelo Luxen (Catálogo Esol / Gobantes)'
    ],
    'Leapton Solar': [
      'LP182*182-M-54-MH 410W (Mono PERC - Esol / Gobantes)',
      'LP182*182-M-72-MH 535W (Mono PERC 144-Cell - Esol / Gobantes)',
      'LP182*182-M-72-MH 540W (Mono PERC 144-Cell 20.9% - Esol / Gobantes)',
      'LP182*182-M-72-MH 545W (Mono PERC 144-Cell 21.1% - Esol / Gobantes)',
      'LP182*182-M-72-MH 550W (Mono PERC 144-Cell 21.3% - Esol / Gobantes)',
      'LP182*182-M-72-MH 555W (Mono PERC 144-Cell 21.5% - Esol / Gobantes)',
      'LP210*210-M-66-MH 650W (210mm High Efficiency 20.9% - Esol / Gobantes)',
      'LP182*182-N-72-MH 580W (TOPCon N-Type 22.5% - Esol / Gobantes)',
      'Otro Modelo Leapton (Catálogo Esol / Gobantes)'
    ],
    'Hyundai Solar': [
      'HiE-S400VG (400W Shingled - Gobantes)',
      'HiE-S410VG (410W Shingled - Gobantes)',
      'HiE-S480VI (480W Shingled - Gobantes)',
      'HiE-S530VI (530W Shingled Tech High Reliability - Gobantes)',
      'HiE-S540VI (540W Shingled Tech 20.9% - Gobantes)',
      'HiE-S545VI (545W Shingled Tech 21.1% - Gobantes)',
      'HiE-S550VI (550W Shingled Tech 21.3% - Gobantes)',
      'HiE-S580DN (580W TOPCon N-Type 22.4% - Gobantes)',
      'HiE-S600DN (600W TOPCon N-Type 22.8% - Gobantes)',
      'Otro Modelo Hyundai (Catálogo Esol / Gobantes)'
    ],
    'Anhui Solar': [
      'PF620M-SN (620W N-Type Mono)',
      'PF625BC-SN (625W Back Contact / Bifacial)',
      'Otro Modelo Anhui Solar'
    ],
    'Ulica Solar': [
      'PF620MDG-UL (620W Bifacial Dual Glass)',
      'Otro Modelo Ulica Solar'
    ],
    'Otra Marca (Certificada SEC)': [
      'Monocristalino PERC 400W - 450W (Residencial - Esol / Gobantes)',
      'Monocristalino PERC 500W - 560W (Esol / Gobantes)',
      'TOPCon N-Type 570W - 600W (Esol / Gobantes)',
      'Bifacial PERC/TOPCon 540W - 700W (Esol / Gobantes)',
      'Otro Modelo Panel Fotovoltaico (Esol / Gobantes)'
    ]
  };

  const secCertifiedInverterBrands = [
    'Victron Energy (Off-Grid / Híbrido)',
    'Voltronic Power / Axpert (Off-Grid)',
    'Huawei (SUN2000)',
    'Growatt',
    'Fronius',
    'GoodWe',
    'SMA Solar Technology',
    'Deye Inverter',
    'Solis (Ginlong)',
    'Sungrow',
    'Enphase Energy (Microinversores)',
    'Hoymiles (Microinversores)',
    'Must Energy (Off-Grid)',
    'Schneider Electric (Conext)',
    'Otra Marca Inversor'
  ];

  const secInverterModels: Record<string, string[]> = {
    'Victron Energy (Off-Grid / Híbrido)': [
      'MultiPlus-II 48/3000/35-32 (3 kVA)',
      'MultiPlus-II 48/5000/70-50 (5 kVA)',
      'MultiPlus-II 48/8000/110-100 (8 kVA)',
      'MultiPlus-II 48/10000/140-100 (10 kVA)',
      'MultiPlus-II 24/3000/70-32 (3 kVA)',
      'Quattro 48/8000/110-100/100 (8 kVA)',
      'Quattro 48/10000/140-100/100 (10 kVA)',
      'Quattro 48/15000/200-100/100 (15 kVA)',
      'EasySolar-II 48/3000/35-32 MPPT 250/70',
      'EasySolar-II 48/5000/70-50 MPPT 250/100',
      'Phoenix Inverter VE.Direct 12V 1200VA',
      'Phoenix Inverter VE.Direct 24V 3000VA',
      'Phoenix Inverter VE.Direct 48V 5000VA',
      'RS Smart Solar 48/6000',
      'Inverter RS Smart Solar 48/6000 230V',
      'Otro Modelo Victron Energy'
    ],
    'Voltronic Power / Axpert (Off-Grid)': [
      'Axpert VM III 3000W-24V',
      'Axpert VM III 5000W-48V',
      'Axpert VM IV 3600W-24V',
      'Axpert VM IV 5600W-48V',
      'Axpert KING II 5KW 48V',
      'Axpert KING II 6KW 48V',
      'Axpert MAX 7200W-48V Dual MPPT',
      'Axpert MAX II 8000W-48V',
      'Axpert MAX II 11000W-48V',
      'Axpert MKS III 3000W 24V',
      'Axpert MKS III 5000W 48V',
      'InfiniSolar V II 3KW (Híbrido)',
      'InfiniSolar V II 5KW (Híbrido)',
      'InfiniSolar WP 10KW Three Phase',
      'InfiniSolar WP 15KW Three Phase',
      'Otro Modelo Voltronic / Axpert'
    ],
    'Huawei (SUN2000)': [
      'SUN2000-2KTL-L1 (2kW Monofásico)',
      'SUN2000-3KTL-L1 (3kW Monofásico)',
      'SUN2000-4KTL-L1 (4kW Monofásico)',
      'SUN2000-4.6KTL-L1 (4.6kW Monofásico)',
      'SUN2000-5KTL-L1 (5kW Monofásico)',
      'SUN2000-6KTL-L1 (6kW Monofásico)',
      'SUN2000-3KTL-M1 (3kW Trifásico Híbrido)',
      'SUN2000-4KTL-M1 (4kW Trifásico Híbrido)',
      'SUN2000-5KTL-M1 (5kW Trifásico Híbrido)',
      'SUN2000-6KTL-M1 (6kW Trifásico Híbrido)',
      'SUN2000-8KTL-M1 (8kW Trifásico Híbrido)',
      'SUN2000-10KTL-M1 (10kW Trifásico Híbrido)',
      'SUN2000-12KTL-M3 (12kW Trifásico)',
      'SUN2000-15KTL-M3 (15kW Trifásico)',
      'SUN2000-17KTL-M3 (17kW Trifásico)',
      'SUN2000-20KTL-M3 (20kW Trifásico)',
      'SUN2000-30KTL-M3 (30kW Trifásico)',
      'SUN2000-40KTL-M3 (40kW Trifásico)',
      'SUN2000-50KTL-M3 (50kW Trifásico)',
      'SUN2000-100KTL-M2 (100kW Trifásico)',
      'SUN2000-115KTL-M1 (115kW Trifásico)',
      'Otro Modelo Huawei'
    ],
    'Growatt': [
      'MIN 3000TL-X (3kW Monofásico)',
      'MIN 3600TL-X (3.6kW Monofásico)',
      'MIN 4200TL-X (4.2kW Monofásico)',
      'MIN 4600TL-X (4.6kW Monofásico)',
      'MIN 5000TL-X (5kW Monofásico)',
      'MIN 6000TL-X (6kW Monofásico)',
      'MOD 3000TL3-X (3kW Trifásico)',
      'MOD 5000TL3-X (5kW Trifásico)',
      'MOD 6000TL3-X (6kW Trifásico)',
      'MOD 8000TL3-X (8kW Trifásico)',
      'MOD 10KTL3-X (10kW Trifásico)',
      'MOD 12KTL3-X (12kW Trifásico)',
      'MOD 15KTL3-X (15kW Trifásico)',
      'SPF 3000TL LVM-24 (Off-Grid 3kW 24V)',
      'SPF 5000ES (Off-Grid 5kW 48V)',
      'SPF 6000ES Plus (Off-Grid 6kW 48V)',
      'SPH 3000TL BL-UP (Híbrido 3kW)',
      'SPH 5000TL BL-UP (Híbrido 5kW)',
      'SPH 6000TL BL-UP (Híbrido 6kW)',
      'SPH 10000TL3 BH-UP (Híbrido 10kW Trifásico)',
      'MID 20KTL3-X1 (20kW Trifásico)',
      'MID 25KTL3-X1 (25kW Trifásico)',
      'MID 30KTL3-X (30kW Trifásico)',
      'MAX 50KTL3-LV (50kW Trifásico)',
      'MAX 80KTL3-LV (80kW Trifásico)',
      'MAX 100KTL3-LV (100kW Trifásico)',
      'Otro Modelo Growatt'
    ],
    'Fronius': [
      'Primo 3.0-1 (3kW Monofásico)',
      'Primo 3.6-1 (3.6kW Monofásico)',
      'Primo 4.0-1 (4kW Monofásico)',
      'Primo 4.6-1 (4.6kW Monofásico)',
      'Primo 5.0-1 (5kW Monofásico)',
      'Primo 6.0-1 (6kW Monofásico)',
      'Primo 8.2-1 (8.2kW Monofásico)',
      'Primo GEN24 3.0 Plus (Híbrido 3kW)',
      'Primo GEN24 4.0 Plus (Híbrido 4kW)',
      'Primo GEN24 5.0 Plus (Híbrido 5kW)',
      'Primo GEN24 6.0 Plus (Híbrido 6kW)',
      'Symo 3.0-3-M (3kW Trifásico)',
      'Symo 4.5-3-M (4.5kW Trifásico)',
      'Symo 5.0-3-M (5kW Trifásico)',
      'Symo 6.0-3-M (6kW Trifásico)',
      'Symo 8.2-3-M (8.2kW Trifásico)',
      'Symo 10.0-3-M (10kW Trifásico)',
      'Symo 12.5-3-M (12.5kW Trifásico)',
      'Symo 15.0-3-M (15kW Trifásico)',
      'Symo 20.0-3-M (20kW Trifásico)',
      'Symo GEN24 6.0 Plus (Híbrido 6kW)',
      'Symo GEN24 8.0 Plus (Híbrido 8kW)',
      'Symo GEN24 10.0 Plus (Híbrido 10kW)',
      'Tauro 50-3-P (50kW Industrial)',
      'Tauro ECO 50-3-P (50kW Eco)',
      'Tauro ECO 100-3-P (100kW Eco)',
      'Otro Modelo Fronius'
    ],
    'GoodWe': [
      'GW3000D-NS (3kW Monofásico)',
      'GW4200D-NS (4.2kW Monofásico)',
      'GW5000D-NS (5kW Monofásico)',
      'GW6000D-NS (6kW Monofásico)',
      'GW5000-MS (5kW Monofásico)',
      'GW8500-MS (8.5kW Monofásico)',
      'GW3000-EH (3kW Híbrido Monofásico)',
      'GW5000-EH (5kW Híbrido Monofásico)',
      'GW6000-EH (6kW Híbrido Monofásico)',
      'GW5K-ET (5kW Híbrido Trifásico)',
      'GW8K-ET (8kW Híbrido Trifásico)',
      'GW10K-ET (10kW Híbrido Trifásico)',
      'GW5000-ES-20 (5kW Off-Grid / Hybrid)',
      'GW10K-DT (10kW Trifásico)',
      'GW15K-DT (15kW Trifásico)',
      'GW20K-DT (20kW Trifásico)',
      'GW25K-DT (25kW Trifásico)',
      'GW50KS-MT (50kW Trifásico)',
      'GW80KS-MT (80kW Trifásico)',
      'GW100K-HT (100kW Trifásico)',
      'Otro Modelo GoodWe'
    ],
    'SMA Solar Technology': [
      'Sunny Boy 3.0 (3kW Monofásico)',
      'Sunny Boy 3.6 (3.6kW Monofásico)',
      'Sunny Boy 4.0 (4kW Monofásico)',
      'Sunny Boy 5.0 (5kW Monofásico)',
      'Sunny Boy 6.0 (6kW Monofásico)',
      'Sunny Tripower 3.0 (3kW Trifásico)',
      'Sunny Tripower 4.0 (4kW Trifásico)',
      'Sunny Tripower 5.0 (5kW Trifásico)',
      'Sunny Tripower 6.0 (6kW Trifásico)',
      'Sunny Tripower 8.0 (8kW Trifásico)',
      'Sunny Tripower 10.0 (10kW Trifásico)',
      'Sunny Tripower 15000TL (15kW Trifásico)',
      'Sunny Tripower 20000TL (20kW Trifásico)',
      'Sunny Tripower 25000TL (25kW Trifásico)',
      'Sunny Tripower CORE1 50kW (STP 50-40)',
      'Sunny Tripower CORE2 110kW',
      'Sunny Island 4.4M (4.4kW Off-Grid)',
      'Sunny Island 6.0H (6kW Off-Grid)',
      'Sunny Island 8.0H (8kW Off-Grid)',
      'Otro Modelo SMA'
    ],
    'Deye Inverter': [
      'SUN-3.6K-SG03LP1-EU (3.6kW Híbrido 48V)',
      'SUN-5K-SG03LP1-EU (5kW Híbrido Monofásico 48V)',
      'SUN-6K-SG03LP1-EU (6kW Híbrido Monofásico 48V)',
      'SUN-8K-SG01LP1-EU (8kW Híbrido Monofásico 48V)',
      'SUN-10K-SG02LP1-EU (10kW Híbrido Monofásico 48V)',
      'SUN-12K-SG04LP3-EU (12kW Híbrido Trifásico 48V)',
      'SUN-15K-SG01HP3-EU-AM2 (15kW Alta Tensión)',
      'SUN-20K-SG01HP3-EU-AM2 (20kW Alta Tensión)',
      'SUN-30K-SG01HP3-EU-BM3 (30kW Alta Tensión)',
      'SUN-50K-SG01HP3-EU-BM4 (50kW Trifásico)',
      'SUN-600G3-EU-230 (600W Microinversor)',
      'SUN-1000G3-EU-230 (1000W Microinversor)',
      'SUN-2000G3-EU-230 (2000W Microinversor)',
      'Otro Modelo Deye'
    ],
    'Solis (Ginlong)': [
      'S6-EH1P3K-L-PLUS (3kW Híbrido Monofásico 48V)',
      'S6-EH1P3.6K-L-PLUS (3.6kW Híbrido Monofásico 48V)',
      'S6-EH1P4.6K-L-PLUS (4.6kW Híbrido Monofásico 48V)',
      'S6-EH1P5K-L-PLUS (5kW Híbrido Monofásico 48V)',
      'S6-EH1P6K-L-PLUS (6kW Híbrido Monofásico 48V)',
      'S6-EH1P8K-L-PLUS (8kW Híbrido Monofásico 48V)',
      'S6-EH1P5K-L-PRO (5kW Híbrido Pro Monofásico)',
      'S6-EH1P6K-L-PRO (6kW Híbrido Pro Monofásico)',
      'S6-EH1P8K-L-PRO (8kW Híbrido Pro Monofásico)',
      'RHI-3K-48ES-5G (3kW Híbrido 48V)',
      'RHI-3.6K-48ES-5G (3.6kW Híbrido 48V)',
      'RHI-4.6K-48ES-5G (4.6kW Híbrido 48V)',
      'RHI-5K-48ES-5G (5kW Híbrido 48V)',
      'RHI-6K-48ES-5G (6kW Híbrido 48V)',
      'S6-EH3P3K-H-EU (3kW Híbrido Trifásico HV)',
      'S6-EH3P4K-H-EU (4kW Híbrido Trifásico HV)',
      'S6-EH3P5K-H-EU (5kW Híbrido Trifásico HV)',
      'S6-EH3P6K-H-EU (6kW Híbrido Trifásico HV)',
      'S6-EH3P8K-H-EU (8kW Híbrido Trifásico HV)',
      'S6-EH3P10K-H-EU (10kW Híbrido Trifásico HV)',
      'S6-EH3P12K-H-EU (12kW Híbrido Trifásico HV)',
      'S6-EH3P15K-H-EU (15kW Híbrido Trifásico HV)',
      'S6-EH3P20K-H-EU (20kW Híbrido Trifásico HV)',
      'S6-EH3P30K-H-EU (30kW Híbrido Trifásico HV)',
      'S6-EH3P40K-H-EU (40kW Híbrido Comercial HV)',
      'S6-EH3P50K-H-EU (50kW Híbrido Comercial HV)',
      'RHI-3P5K-HPE-5G / RHI-3P10K-HPE-5G (Trifásico Híbrido)',
      'RAI-3K-48ES-5G (3kW AC-Coupled Retrofit)',
      'S6-GR1P2.5K-M (2.5kW Monofásico On-Grid)',
      'S6-GR1P3K-M (3kW Monofásico On-Grid)',
      'S6-GR1P4K-M (4kW Monofásico On-Grid)',
      'S6-GR1P5K-M (5kW Monofásico On-Grid)',
      'S6-GR1P6K-M (6kW Monofásico On-Grid)',
      'S5-GC15K (15kW Trifásico On-Grid)',
      'S5-GC20K (20kW Trifásico On-Grid)',
      'S5-GC30K (30kW Trifásico On-Grid)',
      'S5-GC50K (50kW Trifásico On-Grid)',
      'S5-GC80K (80kW Trifásico On-Grid)',
      'S5-GC110K (110kW Trifásico On-Grid)',
      'Otro Modelo Solis'
    ],
    'Sungrow': [
      'SG3.0RS (3kW Monofásico)',
      'SG4.0RS (4kW Monofásico)',
      'SG5.0RS (5kW Monofásico)',
      'SG6.0RS (6kW Monofásico)',
      'SG8.0RS (8kW Monofásico)',
      'SH5.0RT (5kW Híbrido Trifásico)',
      'SH6.0RT (6kW Híbrido Trifásico)',
      'SH8.0RT (8kW Híbrido Trifásico)',
      'SH10RT (10kW Híbrido Trifásico)',
      'SG5.0RT (5kW Trifásico)',
      'SG10RT (10kW Trifásico)',
      'SG12RT (12kW Trifásico)',
      'SG15RT (15kW Trifásico)',
      'SG20RT (20kW Trifásico)',
      'SG30CX (30kW Comercial)',
      'SG50CX (50kW Comercial)',
      'SG110CX (110kW Comercial)',
      'SG125CX (125kW Comercial)',
      'Otro Modelo Sungrow'
    ],
    'Enphase Energy (Microinversores)': [
      'IQ7 Microinverter (250VA)',
      'IQ7+ Microinverter (295VA)',
      'IQ7A Microinverter (366VA)',
      'IQ7X Microinverter (320VA)',
      'IQ8 Microinverter (245VA)',
      'IQ8+ Microinverter (300VA)',
      'IQ8M Microinverter (330VA)',
      'IQ8A Microinverter (366VA)',
      'IQ8HC Microinverter (384VA)',
      'IQ Combiner 4 / Enphase System Controller 2',
      'Otro Modelo Enphase'
    ],
    'Hoymiles (Microinversores)': [
      'HM-300 (300W 1 Panel)',
      'HM-400 (400W 1 Panel)',
      'HM-600 (600W 2 Paneles)',
      'HM-800 (800W 2 Paneles)',
      'HM-1200 (1200W 4 Paneles)',
      'HM-1500 (1500W 4 Paneles)',
      'HMS-500-1T (500W 1 Panel)',
      'HMS-1000-2T (1000W 2 Paneles)',
      'HMS-1800-4T (1800W 4 Paneles)',
      'HMS-2000-4T (2000W 4 Paneles)',
      'HMT-1800-6T (1800W Trifásico 6 Paneles)',
      'HMT-2250-6T (2250W Trifásico 6 Paneles)',
      'Otro Modelo Hoymiles'
    ],
    'Must Energy (Off-Grid)': [
      'PV18-1012 VPM (1KW 12V Off-Grid)',
      'PV18-3024 VPM (3KW 24V Off-Grid)',
      'PV18-5048 VPK (5KW 48V Off-Grid)',
      'PV18-5248 VHM (5.2KW 48V Off-Grid)',
      'PH18-3024 PRO (3KW 24V Híbrido Off-Grid)',
      'PH18-5048 PRO (5KW 48V Híbrido Off-Grid)',
      'PH18-5548 PRO (5.5KW 48V Híbrido Off-Grid)',
      'Otro Modelo Must Energy'
    ],
    'Schneider Electric (Conext)': [
      'Conext XW Pro 6848 NA (6.8kW 48V)',
      'Conext XW Pro 8548 IEC (8.5kW 48V)',
      'Conext SW 2524 (2.5kW 24V)',
      'Conext SW 4024 (4kW 24V)',
      'Conext MPPT 60 150 Solar Charge Controller',
      'Conext MPPT 80 600 Solar Charge Controller',
      'Otro Modelo Schneider'
    ],
    'Otra Marca Inversor': [
      'Inversor Monofásico On-Grid (1kW - 6kW)',
      'Inversor Monofásico On-Grid (7kW - 10kW)',
      'Inversor Trifásico On-Grid (5kW - 20kW)',
      'Inversor Trifásico On-Grid (25kW - 100kW)',
      'Inversor Híbrido Monofásico Con Baterías',
      'Inversor Híbrido Trifásico Con Baterías',
      'Inversor Off-Grid Aislado (12V / 24V / 48V)',
      'Microinversor Fotovoltaico',
      'Otro Modelo Inversor'
    ]
  };

  const lithiumBatteryBrands = [
    'Sin Baterías (On-Grid / Sin almacenamiento)',
    'Dyness',
    'Pylontech',
    'Nimac',
    'Narada',
    'Huawei',
    'BYD',
    'Growatt',
    'Deye',
    'Felicitysolar',
    'GoodWe',
    'Victron Energy',
    'Tesla',
    'LG Energy Solution',
    'FreedomWon',
    'Sofar Solar / AMASS',
    'Shoto',
    'Alpha ESS',
    'Otra marca / Personalizado'
  ];

  const lithiumBatteryModels: Record<string, string[]> = {
    'Dyness': [
      'DL5.0C, 100Ah - 5.12 kWh',
      'PowerBrick wheel-Top cover Battery 51.2V 280Ah 14.341 kWh',
      'PowerBrick SC Battery 51.2V 314Ah 16.076 kWh'
    ],
    'Pylontech': [
      'Fidus Plus 16 kWh',
      '48V UP5000 4.8 kWh',
      '48V US5000 4.8 kWh'
    ],
    'Nimac': [
      '48V - 100AH NM48100 (4.8 kWh)',
      '51.2V NM51.2-200 10.24 kWh',
      '51.2V NM51.2-300 15.36 kWh',
      '51.2V NM51.2-400 20.48 kWh'
    ],
    'Narada': [
      '48V - 100AH NESR48100 (4.8 kWh)'
    ],
    'GoodWe': [
      'Lynx Home U Series (5.4 kWh Low Voltage)',
      'Lynx Home F Series (6.6 kWh - 16.4 kWh High Voltage)',
      'Lynx Home F Plus+ Series'
    ],
    'Victron Energy': [
      'Lithium Battery Smart 12.8V / 200Ah (2.56 kWh)',
      'Lithium Battery Smart 25.6V / 200Ah (5.12 kWh)',
      'SuperPack 12.8V / 100Ah (1.28 kWh LFP con BMS integrado)',
      'SuperPack 25.6V / 50Ah (1.28 kWh LFP)'
    ],
    'Tesla': [
      'Powerwall 2 (13.5 kWh / 5 kW AC)',
      'Powerwall 3 (13.5 kWh / 11.5 kW AC)'
    ],
    'LG Energy Solution': [
      'RESU10H Prime (9.6 kWh High Voltage)',
      'RESU16H Prime (16.0 kWh High Voltage)',
      'RESU Flex (8.6 kWh - 17.2 kWh Modular)'
    ],
    'FreedomWon': [
      'LiTE Home 5/4 (5 kWh / 48V LFP)',
      'LiTE Home 10/8 (10 kWh / 48V LFP)',
      'LiTE Home 15/12 (15 kWh / 48V LFP)'
    ],
    'Sofar Solar / AMASS': [
      'GTX3000 (2.5 kWh LFP High Voltage)',
      'GTX5000 (5.12 kWh - 48V / 100Ah LFP Low Voltage)'
    ],
    'Shoto': [
      'SDA10-48100 (4.8 kWh - 48V / 100Ah LFP RACK)'
    ],
    'Alpha ESS': [
      'SMILE-BAT-5kW (5.04 kWh LFP)',
      'SMILE-BAT-8.2kW (8.2 kWh LFP High Voltage)'
    ],
    'Otra marca / Personalizado': [
      'Batería Litio LFP 48V / 100Ah (5.12 kWh)',
      'Batería Litio LFP 48V / 200Ah (10.24 kWh)',
      'Batería Litio LFP 24V / 100Ah (2.56 kWh)',
      'Batería Litio High Voltage (HV)',
      'Banco de Baterías de Litio Personalizado'
    ]
  };

  const parseBrandAndModel = (val: string) => {
    if (!val) return { brand: '', model: '' };
    const foundBrand = secCertifiedPvBrands.find(b => val.startsWith(b));
    if (foundBrand) {
      const remainder = val.slice(foundBrand.length).replace(/^ - /, '').trim();
      return { brand: foundBrand, model: remainder };
    }
    return { brand: '', model: val };
  };

  const parseInverterBrandAndModel = (val: string) => {
    if (!val) return { brand: '', model: '' };
    const foundBrand = secCertifiedInverterBrands.find(b => val.startsWith(b));
    if (foundBrand) {
      const remainder = val.slice(foundBrand.length).replace(/^ - /, '').trim();
      return { brand: foundBrand, model: remainder };
    }
    return { brand: '', model: val };
  };

  const parseBatteryBrandAndModel = (val: string) => {
    if (!val) return { brand: '', model: '' };
    const foundBrand = lithiumBatteryBrands.find(b => val.startsWith(b));
    if (foundBrand) {
      const remainder = val.slice(foundBrand.length).replace(/^ - /, '').replace(/ x \d+ u\..*$/, '').trim();
      return { brand: foundBrand, model: remainder };
    }
    return { brand: '', model: val };
  };

  const extractBatteryKwh = (modelStr?: string): number => {
    if (!modelStr) return 0;
    const match = modelStr.match(/(\d+(?:[\.,]\d+)?)\s*kWh/i);
    if (match && match[1]) {
      const val = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(val) && val > 0) return val;
    }
    return 0;
  };

  const formatBatteryInfo = (brand: string, model: string, count: number) => {
    if (!brand || brand.startsWith('Sin Baterías')) {
      return {
        info: 'Sin Baterías',
        totalKwhStr: '0.00 kWh'
      };
    }
    const unitKwh = extractBatteryKwh(model);
    const totalKwhNum = unitKwh * count;
    const totalKwhFormatted = totalKwhNum.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const totalKwhStr = `${totalKwhFormatted} kWh`;

    const modelPart = model ? `${brand} - ${model}` : brand;
    let info = modelPart;
    if (unitKwh > 0) {
      info = `${modelPart} x ${count} u. | Capacidad Total: ${totalKwhStr}`;
    } else if (count > 1) {
      info = `${modelPart} x ${count} u.`;
    }

    return { info, totalKwhStr };
  };

  const { brand: currentBrand, model: currentModel } = parseBrandAndModel(technical.panelsCountAndPower);
  const availableModels = currentBrand ? (secCertifiedPvModels[currentBrand] || []) : [];

  const { brand: currentInverterBrand, model: currentInverterModel } = parseInverterBrandAndModel(technical.inverterBrandModel);
  const availableInverterModels = currentInverterBrand ? (secInverterModels[currentInverterBrand] || []) : [];

  const { brand: currentBatteryBrand, model: currentBatteryModel } = parseBatteryBrandAndModel(technical.batteryInfo || '');
  const availableBatteryModels = currentBatteryBrand ? (lithiumBatteryModels[currentBatteryBrand] || []) : [];

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada por su navegador o dispositivo.');
      return;
    }
    setIsFetchingGps(true);
    setGpsMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const formattedCoords = `Lat: ${lat}, Long: ${lng}`;
        onChangeTechnical({
          ...technical,
          gpsCoordinates: formattedCoords,
        });
        setIsFetchingGps(false);
        setGpsMessage('¡Coordenadas GPS capturadas exitosamente!');
        setTimeout(() => setGpsMessage(null), 3000);
      },
      (error) => {
        console.error('Error al obtener GPS:', error);
        setIsFetchingGps(false);
        let msg = 'Error al obtener la ubicación GPS.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Permiso de geolocalización denegado en el navegador.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Información de ubicación no disponible.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Tiempo de espera agotado al obtener la ubicación GPS.';
        }
        alert(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div id="installer-client-form-card" className="bg-white border border-[#15803D]/40 mb-4 overflow-hidden shadow-xs">
      {/* Header Toggle */}
      <button
        id="btn-toggle-form"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gradient-to-r from-[#0F172A] via-[#14532D] to-[#15803D] text-white px-4 sm:px-6 py-2.5 flex items-center justify-between transition-colors cursor-pointer border-b border-[#25A238]"
      >
        <div className="flex items-center gap-3">
          <div className="text-left">
            <h2 className="text-sm sm:text-base font-serif italic text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#25A238]" />
              Información de Proyecto, Instalador & Cliente
            </h2>
            <p className="text-[10px] uppercase tracking-wider text-emerald-100/80 font-sans">
              {client.name ? `${client.name} — ${client.address || 'Sin dirección'}` : 'Requisitos de la declaración TE4 ante la SEC'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {installer.name && client.name ? (
            <span className="bg-[#25A238] text-white border border-[#25A238] text-[9px] font-mono uppercase tracking-wider px-2.5 py-0.5 font-bold shadow-xs">
              ✓ Registrado
            </span>
          ) : (
            <span className="border border-white/60 text-white text-[9px] font-mono uppercase tracking-wider px-2.5 py-0.5">
              Pendiente
            </span>
          )}
          {isOpen ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
        </div>
      </button>

      {/* Form Fields */}
      {isOpen && (
        <div className="p-3 sm:p-5 space-y-4 bg-[#F8FAF9]">
          {/* Grid 1: Instalador Certificado SEC */}
          <div className="bg-white p-3.5 border-l-4 border-l-[#15803D] border border-[#15803D]/20 space-y-2.5 shadow-2xs">
            <div className="border-b border-[#15803D]/30 pb-1.5 flex items-baseline justify-between">
              <h3 className="text-base font-serif italic text-[#14532D] font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                Datos del Instalador Certificado SEC
              </h3>
              <label className="text-[9px] uppercase font-mono tracking-wider text-[#15803D] font-bold">Sección 01</label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Nombre Completo Instalador *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-2.5 top-2.5 opacity-40 pointer-events-none z-10" />
                  <select
                    id="select-installer-name"
                    value={installer.name}
                    onChange={(e) => onChangeInstaller({ ...installer, name: e.target.value })}
                    className="w-full pl-8 pr-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer"
                  >
                    <option value="">Seleccione Instalador...</option>
                    {installerNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Grid 2: Cliente y Dirección de la Instalación */}
          <div className="bg-white p-3.5 border-l-4 border-l-[#15803D] border border-[#15803D]/20 space-y-2.5 shadow-2xs">
            <div className="border-b border-[#15803D]/30 pb-1.5 flex items-baseline justify-between">
              <h3 className="text-base font-serif italic text-[#14532D] font-bold flex items-center gap-2">
                <User className="w-4 h-4 text-[#15803D]" />
                Datos del Cliente & Ubicación del Proyecto
              </h3>
              <label className="text-[9px] uppercase font-mono tracking-wider text-[#15803D] font-bold">Sección 02</label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Nombre Completo Cliente *
                </label>
                <input
                  id="input-client-name"
                  type="text"
                  value={client.name}
                  onChange={(e) => onChangeClient({ ...client, name: e.target.value })}
                  placeholder="Ej. Inmobiliaria San Pedro"
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
                />
              </div>



              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Dirección de Instalación *
                </label>
                <input
                  id="input-client-address"
                  type="text"
                  value={client.address}
                  onChange={(e) => onChangeClient({ ...client, address: e.target.value })}
                  placeholder="Ej. Calle de los Álamos 450"
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Comuna *
                </label>
                <input
                  id="input-client-comuna"
                  type="text"
                  value={client.comuna}
                  onChange={(e) => onChangeClient({ ...client, comuna: e.target.value })}
                  placeholder="Ej. Vitacura / Colina / Rancagua"
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Grid 3: Especificaciones Técnicas Solar */}
          <div className="bg-white p-3.5 border-l-4 border-l-[#15803D] border border-[#15803D]/20 space-y-2.5 shadow-2xs">
            <div className="border-b border-[#15803D]/30 pb-1.5 flex items-baseline justify-between">
              <h3 className="text-base font-serif italic text-[#14532D] font-bold flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#15803D]" />
                Especificaciones del Sistema Fotovoltaico
              </h3>
              <label className="text-[9px] uppercase font-mono tracking-wider text-[#15803D] font-bold">Sección 03</label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Tipo de Sistema *
                </label>
                <select
                  id="select-system-type"
                  value={technical.systemType}
                  onChange={(e) => onChangeTechnical({ ...technical, systemType: e.target.value as SystemType })}
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer"
                >
                  {systemTypes.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>



              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Marca Panel Fotovoltaico *
                </label>
                <select
                  id="select-pv-module-brand"
                  value={currentBrand}
                  onChange={(e) => {
                    const newBrand = e.target.value;
                    if (!newBrand) {
                      onChangeTechnical({ ...technical, panelsCountAndPower: '' });
                    } else {
                      const firstModel = secCertifiedPvModels[newBrand]?.[0] || '';
                      const fullStr = firstModel ? `${newBrand} - ${firstModel}` : newBrand;
                      const newWatts = extractPanelWattage(fullStr);
                      const updatedSummary = formatPanelsSummary(numStrings, technical.stringPanelCounts || [], newWatts);
                      onChangeTechnical({
                        ...technical,
                        panelsCountAndPower: fullStr,
                        panelsPerString: updatedSummary || technical.panelsPerString
                      });
                    }
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer"
                >
                  <option value="">Seleccione Marca de Panel (Certificado SEC)...</option>
                  {secCertifiedPvBrands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Modelo Panel Fotovoltaico *
                </label>
                <select
                  id="select-pv-module-model"
                  value={currentModel}
                  disabled={!currentBrand}
                  onChange={(e) => {
                    const newModel = e.target.value;
                    const brandPrefix = currentBrand || '';
                    const fullStr = newModel ? `${brandPrefix} - ${newModel}` : brandPrefix;
                    const newWatts = extractPanelWattage(fullStr);
                    const updatedSummary = formatPanelsSummary(numStrings, technical.stringPanelCounts || [], newWatts);
                    onChangeTechnical({
                      ...technical,
                      panelsCountAndPower: fullStr,
                      panelsPerString: updatedSummary || technical.panelsPerString
                    });
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {currentBrand ? 'Seleccione Modelo...' : 'Primero seleccione marca...'}
                  </option>
                  {availableModels.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Marca Inversor *
                </label>
                <select
                  id="select-inverter-brand"
                  value={currentInverterBrand}
                  onChange={(e) => {
                    const newBrand = e.target.value;
                    if (!newBrand) {
                      onChangeTechnical({ ...technical, inverterBrandModel: '' });
                    } else {
                      const firstModel = secInverterModels[newBrand]?.[0] || '';
                      onChangeTechnical({
                        ...technical,
                        inverterBrandModel: firstModel ? `${newBrand} - ${firstModel}` : newBrand
                      });
                    }
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer"
                >
                  <option value="">Seleccione Marca Inversor (Certificado / Off-Grid)...</option>
                  {secCertifiedInverterBrands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Modelo Inversor *
                </label>
                <select
                  id="select-inverter-model"
                  value={currentInverterModel}
                  disabled={!currentInverterBrand}
                  onChange={(e) => {
                    const newModel = e.target.value;
                    const brandPrefix = currentInverterBrand || '';
                    onChangeTechnical({
                      ...technical,
                      inverterBrandModel: newModel ? `${brandPrefix} - ${newModel}` : brandPrefix
                    });
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {currentInverterBrand ? 'Seleccione Modelo...' : 'Primero seleccione marca...'}
                  </option>
                  {availableInverterModels.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>



              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Marca Baterías Litio
                </label>
                <select
                  id="select-battery-brand"
                  value={currentBatteryBrand}
                  onChange={(e) => {
                    const newBrand = e.target.value;
                    if (!newBrand || newBrand.startsWith('Sin Baterías')) {
                      onChangeTechnical({
                        ...technical,
                        batteryBrand: newBrand,
                        batteryModel: '',
                        batteryCount: 0,
                        batteryTotalKwh: '0.00 kWh',
                        batteryInfo: newBrand || 'Sin Baterías'
                      });
                    } else {
                      const firstModel = lithiumBatteryModels[newBrand]?.[0] || '';
                      const count = technical.batteryCount || 1;
                      const { info, totalKwhStr } = formatBatteryInfo(newBrand, firstModel, count);
                      onChangeTechnical({
                        ...technical,
                        batteryBrand: newBrand,
                        batteryModel: firstModel,
                        batteryCount: count,
                        batteryTotalKwh: totalKwhStr,
                        batteryInfo: info
                      });
                    }
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer"
                >
                  <option value="">Seleccione Marca de Batería de Litio...</option>
                  {lithiumBatteryBrands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Modelo Batería de Litio
                </label>
                <select
                  id="select-battery-model"
                  value={currentBatteryModel}
                  disabled={!currentBatteryBrand || currentBatteryBrand.startsWith('Sin Baterías')}
                  onChange={(e) => {
                    const newModel = e.target.value;
                    const count = technical.batteryCount || 1;
                    const { info, totalKwhStr } = formatBatteryInfo(currentBatteryBrand, newModel, count);
                    onChangeTechnical({
                      ...technical,
                      batteryModel: newModel,
                      batteryCount: count,
                      batteryTotalKwh: totalKwhStr,
                      batteryInfo: info
                    });
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!currentBatteryBrand
                      ? 'Primero seleccione marca de batería...'
                      : currentBatteryBrand.startsWith('Sin Baterías')
                      ? 'No aplica'
                      : 'Seleccione Modelo / Capacidad...'}
                  </option>
                  {availableBatteryModels.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Cantidad de Baterías
                </label>
                <select
                  id="select-battery-count"
                  value={technical.batteryCount || 1}
                  disabled={!currentBatteryBrand || currentBatteryBrand.startsWith('Sin Baterías')}
                  onChange={(e) => {
                    const newCount = parseInt(e.target.value, 10) || 1;
                    const { info, totalKwhStr } = formatBatteryInfo(currentBatteryBrand, currentBatteryModel, newCount);
                    onChangeTechnical({
                      ...technical,
                      batteryCount: newCount,
                      batteryTotalKwh: totalKwhStr,
                      batteryInfo: info
                    });
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!currentBatteryBrand || currentBatteryBrand.startsWith('Sin Baterías') ? (
                    <option value={0}>0 (No aplica)</option>
                  ) : (
                    Array.from({ length: 32 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Batería' : 'Baterías'}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5 text-[#15803D]">
                  Suma Total Capacidad Baterías (kWh)
                </label>
                <input
                  id="input-battery-total-kwh"
                  type="text"
                  readOnly
                  value={
                    !currentBatteryBrand || currentBatteryBrand.startsWith('Sin Baterías')
                      ? 'Sin Baterías (0 kWh)'
                      : (() => {
                          const count = technical.batteryCount || 1;
                          const unitKwh = extractBatteryKwh(currentBatteryModel);
                          const total = (unitKwh * count).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                          return `${total} kWh (${count} x ${unitKwh} kWh)`;
                        })()
                  }
                  placeholder="Total capacidad acumulada"
                  className="w-full px-2.5 py-1.5 bg-[#ECFDF5] border border-[#15803D]/40 text-xs font-bold text-[#14532D] focus:outline-none cursor-default"
                />
              </div>



              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  N° Total de Strings (Cadenas)
                </label>
                <select
                  id="select-strings-count"
                  value={technical.stringsCount || ''}
                  onChange={(e) => {
                    const newStrCountVal = e.target.value;
                    const num = parseNumStrings(newStrCountVal);
                    const currentArray = technical.stringPanelCounts || [];
                    let updatedArray: number[] = [];
                    if (num > 0) {
                      updatedArray = Array.from({ length: num }, (_, i) => currentArray[i] !== undefined ? currentArray[i] : 10);
                    }
                    const summary = formatPanelsSummary(num, updatedArray);
                    onChangeTechnical({
                      ...technical,
                      stringsCount: newStrCountVal,
                      stringPanelCounts: updatedArray,
                      panelsPerString: summary
                    });
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer"
                >
                  <option value="">Seleccione N° Strings...</option>
                  {stringOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Paneles por String / Resumen
                </label>
                <input
                  id="input-panels-per-string"
                  type="text"
                  value={technical.panelsPerString || ''}
                  onChange={(e) => onChangeTechnical({ ...technical, panelsPerString: e.target.value })}
                  placeholder="Ej. 10 paneles por string (Total: 20)"
                  className="w-full px-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5 text-[#15803D]">
                  Potencia Total FV (Watts Suma Strings)
                </label>
                <input
                  id="input-total-pv-watts"
                  type="text"
                  readOnly
                  value={totalPanelsCalculated > 0 ? `${totalPvWattsCalculated.toLocaleString('es-CL')} Watts (${totalPvKwpCalculated} kWp)` : ''}
                  placeholder="Suma de todos los strings en Watts"
                  className="w-full px-2.5 py-1.5 bg-[#ECFDF5] border border-[#15803D]/40 text-xs font-bold text-[#14532D] focus:outline-none cursor-default"
                />
              </div>

              {numStrings > 0 && (
                <div className="sm:col-span-2 md:col-span-4 bg-[#F0FDF4] p-3 border border-[#15803D]/30 space-y-2 mt-1 rounded-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#15803D]/20 pb-1.5 gap-1.5">
                    <span className="text-[11px] font-bold text-[#15803D] uppercase tracking-wide flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                      </svg>
                      Configuración por String ({numStrings} String{numStrings > 1 ? 's' : ''})
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-[#15803D] bg-white px-2 py-0.5 border border-[#15803D]/30 rounded-xs">
                        Total: {totalPanelsCalculated} Paneles
                      </span>
                      <span className="text-[10px] font-bold text-[#14532D] bg-[#DCFCE7] px-2.5 py-0.5 border border-[#15803D]/40 rounded-xs">
                        Potencia Total: {totalPvWattsCalculated.toLocaleString('es-CL')} W ({totalPvKwpCalculated} kWp)
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pt-1">
                    {Array.from({ length: numStrings }).map((_, idx) => {
                      const stringNum = idx + 1;
                      const currentPanels = (technical.stringPanelCounts && technical.stringPanelCounts[idx] !== undefined)
                        ? technical.stringPanelCounts[idx]
                        : 0;
                      return (
                        <div key={stringNum} className="flex flex-col bg-white p-2 border border-[#15803D]/20 shadow-2xs">
                          <label className="text-[10px] font-bold text-[#0F172A] mb-1 flex items-center justify-between">
                            <span>String #{stringNum}</span>
                            {currentPanels > 0 && (
                              <span className="text-[9px] text-[#15803D] font-normal">
                                {currentPanels} {currentPanels === 1 ? 'panel' : 'paneles'} ({currentPanels * unitPanelWattage}W)
                              </span>
                            )}
                          </label>
                          <select
                            id={`select-string-${stringNum}-panels`}
                            value={currentPanels}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 0;
                              const newArray = [...(technical.stringPanelCounts || [])];
                              while (newArray.length < numStrings) newArray.push(0);
                              newArray[idx] = val;
                              const summary = formatPanelsSummary(numStrings, newArray);
                              onChangeTechnical({
                                ...technical,
                                stringPanelCounts: newArray,
                                panelsPerString: summary
                              });
                            }}
                            className="w-full px-2 py-1 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none cursor-pointer"
                          >
                            <option value={0}>Seleccione paneles...</option>
                            {Array.from({ length: 45 }).map((_, pIndex) => {
                              const pVal = pIndex + 1;
                              return (
                                <option key={pVal} value={pVal}>
                                  {pVal} {pVal === 1 ? 'panel' : 'paneles'} ({pVal * unitPanelWattage}W)
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[9px] text-[#15803D] italic pt-0.5">
                    * La potencia total se calcula automáticamente multiplicando {totalPanelsCalculated} paneles por {unitPanelWattage}W (potencia del modelo seleccionado).
                  </p>
                </div>
              )}





              <div className="sm:col-span-2 md:col-span-2">
                <label className="block text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-0.5">
                  Coordenadas GPS de la Instalación
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <MapPin className="w-3.5 h-3.5 absolute left-2.5 top-2.5 opacity-60 text-emerald-600" />
                    <input
                      id="input-gps-coordinates"
                      type="text"
                      value={technical.gpsCoordinates || ''}
                      onChange={(e) => onChangeTechnical({ ...technical, gpsCoordinates: e.target.value })}
                      placeholder="Ej. Lat: -33.437200, Long: -70.650600"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-[#F8FAF9] border border-[#15803D]/30 text-xs text-[#0F172A] focus:bg-white focus:border-[#15803D] focus:outline-none"
                    />
                  </div>
                  <button
                    id="btn-capture-gps"
                    type="button"
                    onClick={handleCaptureGps}
                    disabled={isFetchingGps}
                    className="px-3 py-1.5 bg-[#15803D] text-white border border-[#14532D] text-xs uppercase font-mono tracking-wider font-bold flex items-center gap-1.5 hover:bg-[#25A238] transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap shadow-2xs"
                    title="Obtener ubicación GPS en vivo del dispositivo"
                  >
                    {isFetchingGps ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Capturando...</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Capturar GPS</span>
                      </>
                    )}
                  </button>
                </div>
                {gpsMessage && (
                  <p className="text-[10px] font-mono text-emerald-700 font-bold mt-1">
                    ✓ {gpsMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

