import { ChecklistCategory } from '../types';

export const INITIAL_TE4_CATEGORIES: ChecklistCategory[] = [
  {
    id: 'cat-01',
    title: '1. Módulos Fotovoltaicos y Estructura de Montaje',
    iconName: 'Sun',
    items: [
      {
        id: 'item-101',
        code: '1.1',
        title: 'Anclaje y Estructura de Soporte',
        normaSec: 'RIC N°02 § 5.1 / RIC N°03',
        description: 'Verificar fijación estructural a techo/suelo, estanqueidad de perforaciones, resistencia al viento y estado anticorrosivo.',
        photoGuide: 'Foto general de la estructura y detalle de fijaciones/pernos al tejado o suelo.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-102',
        code: '1.2',
        title: 'Verificación de Cables Solares',
        normaSec: 'RIC N°02 § 5.2 / Ley 20.571',
        description: 'Verificación de cables solar sin tocar techumbre, asegurando la adecuada fijación y protección UV.',
        photoGuide: 'Foto de la canalización/tendido de cable solar verificando que no exista contacto directo con la techumbre.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-103',
        code: '1.3',
        title: 'Conexión de Paneles y Conectores MC4',
        normaSec: 'RIC N°02 § 6.3 / RIC N°04',
        description: 'Verificar que conectores MC4 queden bien armados y que no queden expuestos a la intemperie, protegidos bajo paneles.',
        photoGuide: 'Foto de conectores MC4 bien armados y protegidos bajo los paneles solares.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-104',
        code: '1.4',
        title: 'Puesta a Tierra de Marcos y Estructura',
        normaSec: 'RIC N°06 § 7.2',
        description: 'Comprobar conexión a tierra de cada marco de módulo mediante arandelas de presión/garras de tierra y conductor de protección PE.',
        photoGuide: 'Foto de empalme a tierra en la estructura o prensa de tierra en marco de panel.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      }
    ]
  },
  {
    id: 'cat-02',
    title: '2. Tableros Instalación Fotovoltaica',
    iconName: 'Zap',
    items: [
      {
        id: 'item-201',
        code: '2.1',
        title: 'Foto Tablero FV Interior y Exterior',
        normaSec: 'RIC N°02 § 8.1 / RIC N°09 IP65',
        description: 'Verificar gabinete con índice de protección mínimo IP65/IK08 para exterior, libre de condensación y con rotulado de seguridad.',
        photoGuide: 'Foto del tablero FV interior y exterior mostrando gabinete, componentes y rotulado.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-202',
        code: '2.2',
        title: 'Fotografías Tableros Existentes',
        normaSec: 'RIC N°02 § 8.3 gPV',
        description: 'Sacar fotografía en donde se vean claros la capacidad de las protecciones.',
        photoGuide: 'Foto en donde se aprecie claramente la capacidad y amperaje de las protecciones.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-203',
        code: '2.3',
        title: 'Fotografía Selector ATS',
        normaSec: 'RIC N°02 § 8.4 / RIC N°09',
        description: 'Verificar existencia de selector de GRID y BACKUP para conmutación en caso de mantención o fallo del sistema FV.',
        photoGuide: 'Foto del selector ATS/conmutador GRID y BACKUP mostrando su estado y posición.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-204',
        code: '2.4',
        title: 'Canalización String, Aterrizaje Tierra de Cajas Metálicas',
        normaSec: 'RIC N°04 / RIC N°06',
        description: 'Verificar canalización de String C.C. y el correcto aterrizaje a tierra de las cajas metálicas y canalizaciones.',
        photoGuide: 'Foto de la canalización de String y aterrizaje a tierra de las cajas metálicas.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      }
    ]
  },
  {
    id: 'cat-03',
    title: '3. Inversor Fotovoltaico y Unidades de Potencia',
    iconName: 'Cpu',
    items: [
      {
        id: 'item-301',
        code: '3.1',
        title: 'Ubicación, Montaje y Ventilación del Inversor',
        normaSec: 'RIC N°02 § 9.1',
        description: 'Verificar distancia mínima a muros, protección contra radiación solar directa, nivel de humedad y altitud de operación.',
        photoGuide: 'Foto frontal y lateral del inversor mostrando espacio de ventilación alrededor.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-302',
        code: '3.2',
        title: 'Placa de Características y Certificación SEC',
        normaSec: 'RIC N°02 § 9.2 / Protocolo PE N°8/01',
        description: 'Verificar que la marca, modelo y número de serie correspondan a la nómina de equipos autorizados por la SEC en Chile.',
        photoGuide: 'Foto legible en alta definición de la placa de características técnica e identificador del inversor.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-303',
        code: '3.3',
        title: 'Interruptor Desconectador Banco de baterias',
        normaSec: 'RIC N°02 § 9.4 / IEC 62116',
        description: 'Verificar instalación y funcionamiento del interruptor desconectador del banco de baterías, así como protección anti-isla y cortes de seguridad.',
        photoGuide: 'Foto del interruptor desconectador del banco de baterías y cortes de seguridad.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      }
    ]
  },
  {
    id: 'cat-04',
    title: '4. Tablero de Corriente Alterna (C.A.) y Protecciones Red',
    iconName: 'ShieldAlert',
    items: [
      {
        id: 'item-401',
        code: '4.1',
        title: 'Interruptor Automático Magnetotérmico C.A.',
        normaSec: 'RIC N°02 § 10.1 / RIC N°03',
        description: 'Verificar calibre (A) y curva de disparo (tipo C) del termomagnético de corte para la generación solar.',
        photoGuide: 'Foto del tablero de C.A. abierto mostrando el interruptor automático de generación.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-402',
        code: '4.2',
        title: 'Interruptor Diferencial C.A. (Clase A / Inmunizado)',
        normaSec: 'RIC N°02 § 10.2 / RIC N°05',
        description: 'Verificar presencia de protección diferencial de sensibilidad 30mA Tipo A o súper inmunizado para corriente continua pulsante.',
        photoGuide: 'Foto del diferencial Clase A con botón de prueba en tablero C.A.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      }
    ]
  },
  {
    id: 'cat-05',
    title: '5. Sistema de Puesta a Tierra (SPT) e Igualación',
    iconName: 'Radio',
    items: [
      {
        id: 'item-501',
        code: '5.1',
        title: 'Cámara de Inspección y Barra de Tierra',
        normaSec: 'RIC N°06 § 6.1 a 6.8',
        description: 'Verificar cámara de inspección registrable, electrodo jabalina o malla de tierra, conector de bronce tipo prensa con grasa de contacto.',
        photoGuide: 'Foto de la cámara de inspección abierta mostrando la prensa y electrodo de tierra.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-502',
        code: '5.2',
        title: 'Canalización Baterías Abierta y Cerrada',
        normaSec: 'RIC N°06 § 8.1 / RIC N°04',
        description: 'Verificar tipo de canalización de baterías (abierta y cerrada), su fijación, protección y aislamiento.',
        photoGuide: 'Foto de la canalización abierta y cerrada del banco de baterías.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-503',
        code: '5.3',
        title: 'Medición de Resistencia de Puesta a Tierra (Ω)',
        normaSec: 'RIC N°06 § 10.1 (Máx 20 Ohms)',
        description: 'Registrar la medición obtenida con telurómetro / medidor de bucle de tierra. Debe ser menor o igual a 20 Ohms (o norma aplicable).',
        photoGuide: 'Foto del telurómetro u instrumento mostrando el valor de lectura en Ohms (Ω).',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-504',
        code: '5.4',
        title: 'Video Comprobando Continuidad de Tierra en Canalizaciones AC y DC',
        normaSec: 'RIC N°06 § 7.2 / RIC N°04',
        description: 'Verificación mediante registro en video comprobando la continuidad de tierra de las canalizaciones de AC y DC con multímetro o instrumento de prueba.',
        photoGuide: 'Video o fotos comprobando la continuidad de tierra de las canalizaciones AC y DC.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      }
    ]
  },
  {
    id: 'cat-06',
    title: '6. Rotulados, Leyendas SEC y Esquema Unifilar',
    iconName: 'FileCheck',
    items: [
      {
        id: 'item-601',
        code: '6.1',
        title: 'Placas de Advertencia SEC "Generación Fotovoltaica"',
        normaSec: 'RIC N°02 § 12.1 / RIC N°10',
        description: 'Verificar etiquetas amarillas con símbolo de riesgo eléctrico y leyenda "ATENCIÓN: INSTALACIÓN CON GENERACIÓN PROPIA - GENERACIÓN DISTRIBUIDA".',
        photoGuide: 'Foto de las placas de advertencia pegadas en el tablero general y medidor.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-602',
        code: '6.2',
        title: 'Dibujo de Instalación (Distancias, Equipos y Empalme)',
        normaSec: 'RIC N°02 § 12.2 / RIC N°10',
        description: 'Dibujo de instalación con distancias de canalización, ubicación de equipos y punto de empalme, además del esquema unifilar.',
        photoGuide: 'Foto del dibujo o croquis de la instalación indicando distancias de canalización, equipos y empalme.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-603',
        code: '6.3',
        title: 'Medidor Distribuidora con Rotulación Normativa',
        normaSec: 'RIC N°02 § 13.1 / Ley 20.571 / RIC N°10',
        description: 'Verificar instalación, rotulación normativa y registro del medidor de la empresa distribuidora de energía eléctrica.',
        photoGuide: 'Foto en detalle del medidor de la empresa distribuidora, su rotulación normativa y empalme.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      },
      {
        id: 'item-604',
        code: '6.4',
        title: 'Fachada de la Propiedad y Numeración',
        normaSec: 'RIC N°02 / RIC N°10',
        description: 'Evidencia fotográfica de la fachada principal de la propiedad donde se aprecie claramente el inmueble y su numeración municipal.',
        photoGuide: 'Foto general de la fachada de la propiedad mostrando la numeración visible del inmueble.',
        status: 'PENDIENTE',
        observation: '',
        photos: []
      }
    ]
  }
];
