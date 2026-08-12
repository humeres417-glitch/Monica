export type SecClass = 'Clase A' | 'Clase B' | 'Clase C' | 'Clase D';

export type SystemType = 'On-Grid (Netbilling)' | 'Off-Grid (Aislado)' | 'Híbrido (Con Baterías)';

export type ItemStatus = 'C' | 'NC' | 'NA' | 'PENDIENTE';

export interface PhotoItem {
  id: string;
  url: string; // base64 or blob URL
  name: string;
  timestamp: string;
  location?: string;
  note?: string;
  driveFileId?: string;
  driveViewLink?: string;
}

export interface ChecklistItem {
  id: string;
  code: string;
  title: string;
  normaSec: string;
  description: string;
  photoGuide: string;
  status: ItemStatus;
  observation: string;
  photos: PhotoItem[];
}

export interface ChecklistCategory {
  id: string;
  title: string;
  iconName: string;
  items: ChecklistItem[];
}

export interface InstallerInfo {
  name: string;
  rut: string;
  secClass: SecClass;
  secLicenceNumber: string;
  phone: string;
  email: string;
  companyName: string;
}

export interface ClientInfo {
  name: string;
  rut: string;
  address: string;
  comuna: string;
  region: string;
  phone: string;
  email: string;
}

export interface TechnicalInfo {
  systemType: SystemType;
  installedPowerKwp: string;
  inverterBrandModel: string;
  inverterSerialNumber: string;
  panelsCountAndPower: string;
  batteryInfo?: string;
  batteryBrand?: string;
  batteryModel?: string;
  batteryCount?: number;
  batteryTotalKwh?: string;
  groundingResistanceOhm: string;
  gpsCoordinates?: string;
  inspectionDate: string;
  distributionCompany?: string;
  mpptCount?: string;
  stringsCount?: string;
  panelsPerString?: string;
  stringPanelCounts?: number[];
}

export interface Inspection {
  id: string;
  createdAt: string;
  updatedAt: string;
  installer: InstallerInfo;
  client: ClientInfo;
  technical: TechnicalInfo;
  categories: ChecklistCategory[];
  generalNotes: string;
  signatureDataUrl?: string;
  driveFolderId?: string;
  driveFolderUrl?: string;
  status: 'Borrador' | 'Completado' | 'Subido a Drive';
}

export interface UploadProgress {
  currentStep: string;
  totalFiles: number;
  completedFiles: number;
  currentFileName: string;
  isComplete: boolean;
  error?: string;
  driveFolderUrl?: string;
}
