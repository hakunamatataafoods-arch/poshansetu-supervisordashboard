/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Clock,
  MapPin,
  Activity,
  ArrowUpDown,
  Boxes,
  ShieldCheck,
  AlertOctagon,
  Download,
  FileText,
  Search,
  Smartphone,
  PlusCircle,
  MinusCircle,
  AlertTriangle,
  UserCheck,
  Server,
  Inbox,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  X,
  Languages,
  ChevronDown,
  Layers,
  Phone,
  RefreshCw,
  Eye,
  Camera,
  Upload
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Transaction {
  id: string;
  timestampStr: string;
  village: string;
  action: string;
  change: number;
  balance: number;
  isNew?: boolean;
}

interface TalukaInfo {
  id: string;
  nameGu: string;
  nameEn: string;
}

interface SectorInfo {
  id: string;
  code: string;
  nameGu: string;
  nameEn: string;
  talukaId: string;
}

interface AnganwadiCentre {
  id: string;
  code: string;
  nameGu: string;
  nameEn: string;
  sectorId: string;
  talukaId: string;
  workerNameGu: string;
  workerNameEn: string;
  workerPhone: string;
  supervisorGu: string;
  supervisorEn: string;
  stockBalance: number;
  isFirebaseLive?: boolean;
  history: {
    actionGu: string;
    actionEn: string;
    change: number;
    balance: number;
    timeOffsetHours: number;
  }[];
}

const TALUKAS: TalukaInfo[] = [
  { id: 'anand_rural', nameGu: 'આણંદ ગ્રામ્ય', nameEn: 'Anand Rural' },
  { id: 'petlad_rural', nameGu: 'પેટલાદ ગ્રામ્ય', nameEn: 'Petlad Rural' },
  { id: 'tarapur_rural', nameGu: 'તારાપુર ગ્રામ્ય', nameEn: 'Tarapur Rural' },
  { id: 'sojitra_rural', nameGu: 'સોજિત્રા ગ્રામ્ય', nameEn: 'Sojitra Rural' },
];

const SECTORS: SectorInfo[] = [
  { id: 'vadtal_01', code: 'SEC-VAD-01', nameGu: 'વડતાલ-૧ (Vadtal-01)', nameEn: 'Vadtal-01', talukaId: 'anand_rural' },
  { id: 'karamsad_01', code: 'SEC-KRM-01', nameGu: 'કરમસદ ૦૧ (Karamsad 01)', nameEn: 'Karamsad 01', talukaId: 'anand_rural' },
  { id: 'karamsad_02', code: 'SEC-KRM-02', nameGu: 'કરમસદ ૦૨ (Karamsad 02)', nameEn: 'Karamsad 02', talukaId: 'anand_rural' },
  { id: 'petlad_007', code: 'SEC-PET-007', nameGu: 'પેટલાદ ૦૦૭ (Petlad 007)', nameEn: 'Petlad 007', talukaId: 'petlad_rural' },
  { id: 'tarapur_003', code: 'SEC-TAR-003', nameGu: 'તારાપુર ૦૦૩ (Tarapur 003)', nameEn: 'Tarapur 003', talukaId: 'tarapur_rural' },
  { id: 'sojitra_009', code: 'SEC-SOJ-009', nameGu: 'સોજિત્રા ૦૦૯ (Sojitra 009)', nameEn: 'Sojitra 009', talukaId: 'sojitra_rural' },
];

const CENTRES: AnganwadiCentre[] = [
  // Vadtal-01
  {
    id: 'aw_vad_04',
    code: 'AW-VAD-04',
    nameGu: '૦૪ - વડતાલ (આણંદ)',
    nameEn: '04 - Vadtal (Anand)',
    sectorId: 'vadtal_01',
    talukaId: 'anand_rural',
    workerNameGu: 'શ્રીમતી ભાવનાબેન પટેલ',
    workerNameEn: 'Smt. Bhavanaben Patel',
    workerPhone: '+91 98251 44210',
    supervisorGu: 'શારદાબેન શાહ',
    supervisorEn: 'Shardaben Shah',
    stockBalance: 150,
    isFirebaseLive: true,
    history: [
      { actionGu: 'પ્રારંભિક સ્ટોક સિંક (Initial Sync)', actionEn: 'Initial Stock Sync', change: 150, balance: 150, timeOffsetHours: 2 }
    ]
  },
  {
    id: 'aw_vad_02',
    code: 'AW-VAD-02',
    nameGu: '૦૨ - વડતાલ સ્ટેશન વિસ્તાર',
    nameEn: '02 - Vadtal Station Area',
    sectorId: 'vadtal_01',
    talukaId: 'anand_rural',
    workerNameGu: 'શ્રીમતી જયાબેન આર. પરમાર',
    workerNameEn: 'Smt. Jayaben R. Parmar',
    workerPhone: '+91 98251 44212',
    supervisorGu: 'શારદાબેન શાહ',
    supervisorEn: 'Shardaben Shah',
    stockBalance: 72,
    history: [
      { actionGu: 'વિતરણ - બાળભોગ આપેલ (Distribution)', actionEn: 'Distribution (-18 pkts)', change: -18, balance: 72, timeOffsetHours: 1 },
      { actionGu: 'આવક - નવો સ્ટોક જમા (Inward)', actionEn: 'Inward (+50 Stock)', change: 50, balance: 90, timeOffsetHours: 12 },
      { actionGu: 'પ્રારંભિક સ્ટોક (Initial Balance)', actionEn: 'Initial Stock', change: 40, balance: 40, timeOffsetHours: 48 },
    ]
  },

  // Karamsad 01
  {
    id: 'aw_krm_01',
    code: 'AW-KRM-01',
    nameGu: '૦૧ - કરમસદ સરદાર ચોક',
    nameEn: '01 - Karamsad Sardar Chowk',
    sectorId: 'karamsad_01',
    talukaId: 'anand_rural',
    workerNameGu: 'શ્રીમતી કલ્પનાબેન કે. પટેલ',
    workerNameEn: 'Smt. Kalpanaben K. Patel',
    workerPhone: '+91 94280 12345',
    supervisorGu: 'કવિતાબેન પંડ્યા',
    supervisorEn: 'Kavitaben Pandya',
    stockBalance: 68,
    history: [
      { actionGu: 'વિતરણ - લાભાર્થી બાળકો (Distribution)', actionEn: 'Distribution (-12 pkts)', change: -12, balance: 68, timeOffsetHours: 2 },
      { actionGu: 'આવક - બ્લોક ગોડાઉન (Inward)', actionEn: 'Inward (+40 pkts)', change: 40, balance: 80, timeOffsetHours: 24 },
      { actionGu: 'પ્રારંભિક સ્ટોક (Initial Balance)', actionEn: 'Initial Stock', change: 40, balance: 40, timeOffsetHours: 72 },
    ]
  },
  {
    id: 'aw_krm_03',
    code: 'AW-KRM-03',
    nameGu: '૦૩ - કરમસદ નવો વાસ',
    nameEn: '03 - Karamsad Navo Vas',
    sectorId: 'karamsad_01',
    talukaId: 'anand_rural',
    workerNameGu: 'શ્રીમતી દક્ષાબેન સોલંકી',
    workerNameEn: 'Smt. Dakshaben Solanki',
    workerPhone: '+91 94280 12346',
    supervisorGu: 'કવિતાબેન પંડ્યા',
    supervisorEn: 'Kavitaben Pandya',
    stockBalance: 45,
    history: [
      { actionGu: 'વિતરણ - બાળભોગ આપેલ (Distribution)', actionEn: 'Distribution (-15 pkts)', change: -15, balance: 45, timeOffsetHours: 3 },
      { actionGu: 'આવક - નવો સ્ટોક જમા (Inward)', actionEn: 'Inward (+30 pkts)', change: 30, balance: 60, timeOffsetHours: 36 },
    ]
  },

  // Karamsad 02
  {
    id: 'aw_krm_02',
    code: 'AW-KRM-02',
    nameGu: '૦૨ - કરમસદ પશ્ચિમ વિસ્તાર',
    nameEn: '02 - Karamsad West Area',
    sectorId: 'karamsad_02',
    talukaId: 'anand_rural',
    workerNameGu: 'શ્રીમતી હંસાબેન વી. વણકર',
    workerNameEn: 'Smt. Hansaben V. Vankar',
    workerPhone: '+91 94280 98765',
    supervisorGu: 'કવિતાબેન પંડ્યા',
    supervisorEn: 'Kavitaben Pandya',
    stockBalance: 11, // CRITICAL LOW STOCK (<15)
    history: [
      { actionGu: 'વિતરણ - તાત્કાલિક વિતરણ (Distribution)', actionEn: 'Distribution (-14 pkts)', change: -14, balance: 11, timeOffsetHours: 1 },
      { actionGu: 'વિતરણ - બાળભોગ આપેલ (Distribution)', actionEn: 'Distribution (-10 pkts)', change: -10, balance: 25, timeOffsetHours: 18 },
      { actionGu: 'આવક - ગોડાઉનમાંથી (Inward)', actionEn: 'Inward (+20 pkts)', change: 20, balance: 35, timeOffsetHours: 40 },
    ]
  },
  {
    id: 'aw_krm_05',
    code: 'AW-KRM-05',
    nameGu: '૦૫ - કરમસદ ઇન્દિરા નગર',
    nameEn: '05 - Karamsad Indira Nagar',
    sectorId: 'karamsad_02',
    talukaId: 'anand_rural',
    workerNameGu: 'શ્રીમતી મનીષાબેન રાઠોડ',
    workerNameEn: 'Smt. Manishaben Rathod',
    workerPhone: '+91 94280 98766',
    supervisorGu: 'કવિતાબેન પંડ્યા',
    supervisorEn: 'Kavitaben Pandya',
    stockBalance: 38,
    history: [
      { actionGu: 'વિતરણ - બાળભોગ આપેલ (Distribution)', actionEn: 'Distribution (-8 pkts)', change: -8, balance: 38, timeOffsetHours: 4 },
      { actionGu: 'આવક - નવો સ્ટોક જમા (Inward)', actionEn: 'Inward (+25 pkts)', change: 25, balance: 46, timeOffsetHours: 28 },
    ]
  },

  // Petlad 007
  {
    id: 'aw_pet_07',
    code: 'AW-PET-07',
    nameGu: '૦૭ - પેટલાદ કસ્બા આંગણવાડી',
    nameEn: '07 - Petlad Kasba Anganwadi',
    sectorId: 'petlad_007',
    talukaId: 'petlad_rural',
    workerNameGu: 'શ્રીમતી રેખાબેન પી. જોષી',
    workerNameEn: 'Smt. Rekhaben P. Joshi',
    workerPhone: '+91 99092 34567',
    supervisorGu: 'અલ્પાબેન દેસાઈ',
    supervisorEn: 'Alpaben Desai',
    stockBalance: 84,
    history: [
      { actionGu: 'આવક - પેટલાદ તાલુકા ગોડાઉન (Inward)', actionEn: 'Inward (+50 pkts)', change: 50, balance: 84, timeOffsetHours: 3 },
      { actionGu: 'વિતરણ - બાળભોગ આપેલ (Distribution)', actionEn: 'Distribution (-16 pkts)', change: -16, balance: 34, timeOffsetHours: 20 },
      { actionGu: 'પ્રારંભિક સ્ટોક (Initial Balance)', actionEn: 'Initial Stock', change: 50, balance: 50, timeOffsetHours: 60 },
    ]
  },
  {
    id: 'aw_pet_03',
    code: 'AW-PET-03',
    nameGu: '૦૩ - રંગાઈપુરા પેટલાદ',
    nameEn: '03 - Rangaipura Petlad',
    sectorId: 'petlad_007',
    talukaId: 'petlad_rural',
    workerNameGu: 'શ્રીમતી કોકિલાબેન એમ. બારૈયા',
    workerNameEn: 'Smt. Kokilaben M. Baraiya',
    workerPhone: '+91 99092 34568',
    supervisorGu: 'અલ્પાબેન દેસાઈ',
    supervisorEn: 'Alpaben Desai',
    stockBalance: 8, // CRITICAL LOW STOCK (<15)
    history: [
      { actionGu: 'વિતરણ - લાભાર્થી બાળકો (Distribution)', actionEn: 'Distribution (-12 pkts)', change: -12, balance: 8, timeOffsetHours: 1 },
      { actionGu: 'વિતરણ - વિતરણ નોંધણી (Distribution)', actionEn: 'Distribution (-15 pkts)', change: -15, balance: 20, timeOffsetHours: 14 },
      { actionGu: 'આવક - નવો સ્ટોક જમા (Inward)', actionEn: 'Inward (+25 pkts)', change: 25, balance: 35, timeOffsetHours: 42 },
    ]
  },

  // Tarapur 003
  {
    id: 'aw_tar_03',
    code: 'AW-TAR-03',
    nameGu: '૦૩ - તારાપુર ગામતળિયું',
    nameEn: '03 - Tarapur Gamtaliyu',
    sectorId: 'tarapur_003',
    talukaId: 'tarapur_rural',
    workerNameGu: 'શ્રીમતી ગીતાબેન એસ. સોલંકી',
    workerNameEn: 'Smt. Gitaben S. Solanki',
    workerPhone: '+91 97230 45678',
    supervisorGu: 'વંદનાબેન ત્રિવેદી',
    supervisorEn: 'Vandanaben Trivedi',
    stockBalance: 125,
    history: [
      { actionGu: 'આવક - તારાપુર સપ્લાય સેન્ટર (Inward)', actionEn: 'Inward (+60 pkts)', change: 60, balance: 125, timeOffsetHours: 2 },
      { actionGu: 'વિતરણ - બાળભોગ આપેલ (Distribution)', actionEn: 'Distribution (-20 pkts)', change: -20, balance: 65, timeOffsetHours: 26 },
      { actionGu: 'પ્રારંભિક સ્ટોક (Initial Balance)', actionEn: 'Initial Stock', change: 85, balance: 85, timeOffsetHours: 80 },
    ]
  },
  {
    id: 'aw_tar_01',
    code: 'AW-TAR-01',
    nameGu: '૦૧ - મોરજ આંગણવાડી કેન્દ્ર',
    nameEn: '01 - Moraj Anganwadi Centre',
    sectorId: 'tarapur_003',
    talukaId: 'tarapur_rural',
    workerNameGu: 'શ્રીમતી શીલાબેન ડી. ઝાલા',
    workerNameEn: 'Smt. Shilaben D. Zala',
    workerPhone: '+91 97230 45679',
    supervisorGu: 'વંદનાબેન ત્રિવેદી',
    supervisorEn: 'Vandanaben Trivedi',
    stockBalance: 52,
    history: [
      { actionGu: 'વિતરણ - લાભાર્થી બાળકો (Distribution)', actionEn: 'Distribution (-14 pkts)', change: -14, balance: 52, timeOffsetHours: 5 },
      { actionGu: 'આવક - નવો સ્ટોક જમા (Inward)', actionEn: 'Inward (+30 pkts)', change: 30, balance: 66, timeOffsetHours: 32 },
    ]
  },

  // Sojitra 009
  {
    id: 'aw_soj_09',
    code: 'AW-SOJ-09',
    nameGu: '૦૯ - સોજિત્રા બજાર ચોક',
    nameEn: '09 - Sojitra Bazar Chowk',
    sectorId: 'sojitra_009',
    talukaId: 'sojitra_rural',
    workerNameGu: 'શ્રીમતી ઉષાબેન એચ. પ્રજાપતિ',
    workerNameEn: 'Smt. Ushaben H. Prajapati',
    workerPhone: '+91 96010 56789',
    supervisorGu: 'પૂર્વીબેન વ્યાસ',
    supervisorEn: 'Purviben Vyas',
    stockBalance: 14, // CRITICAL LOW STOCK (<15)
    history: [
      { actionGu: 'વિતરણ - બાળભોગ વિતરણ (Distribution)', actionEn: 'Distribution (-11 pkts)', change: -11, balance: 14, timeOffsetHours: 2 },
      { actionGu: 'વિતરણ - બાળભોગ આપેલ (Distribution)', actionEn: 'Distribution (-15 pkts)', change: -15, balance: 25, timeOffsetHours: 19 },
      { actionGu: 'આવક - સોજિત્રા ડેપો (Inward)', actionEn: 'Inward (+25 pkts)', change: 25, balance: 40, timeOffsetHours: 44 },
    ]
  },
  {
    id: 'aw_soj_04',
    code: 'AW-SOJ-04',
    nameGu: '૦૪ - ડાભૌ આંગણવાડી',
    nameEn: '04 - Dabhou Anganwadi',
    sectorId: 'sojitra_009',
    talukaId: 'sojitra_rural',
    workerNameGu: 'શ્રીમતી કલ્પનાબેન એન. ઠાકોર',
    workerNameEn: 'Smt. Kalpanaben N. Thakor',
    workerPhone: '+91 96010 56790',
    supervisorGu: 'પૂર્વીબેન વ્યાસ',
    supervisorEn: 'Purviben Vyas',
    stockBalance: 60,
    history: [
      { actionGu: 'વિતરણ - બાળભોગ આપેલ (Distribution)', actionEn: 'Distribution (-10 pkts)', change: -10, balance: 60, timeOffsetHours: 6 },
      { actionGu: 'આવક - નવો સ્ટોક જમા (Inward)', actionEn: 'Inward (+40 pkts)', change: 40, balance: 70, timeOffsetHours: 35 },
    ]
  },
];

const FIREBASE_DB_URL = 'https://poshan-setu-default-rtdb.firebaseio.com/';
const LOW_STOCK_THRESHOLD = 15;

const I18N = {
  gu: {
    govTitle: 'ગુજરાત સરકાર',
    govSub: 'Government of Gujarat',
    dept: 'WCDD (આઈ.સી.ડી.એસ)',
    portalTitle: 'પોષણસેતુ ડેસ્કટોપ મોનિટરિંગ પોર્ટલ',
    portalSubtitle: 'બાળ વિકાસ યોજના અધિકારી (CDPO) અને કલેક્ટર કચેરી, આણંદ — બાળભોગ લાઇવ સ્ટોક ટ્રેકર',
    langBtn: 'English',
    rtdbConnected: 'RTDB કનેક્ટેડ (Live)',
    rtdbConnecting: 'કનેક્ટ થઈ રહ્યું છે...',
    rtdbDemo: 'ડેમો મોડ (Demo Mode)',
    clockLabel: 'ભારતીય માનક સમય (IST)',
    pdfBtn: 'PDF ઓડિટ રિપોર્ટ',
    district: 'જિલ્લો: આણંદ',
    talukaLabel: 'તાલુકો:',
    sectorLabel: 'સેક્ટર:',
    centreLabel: 'કેન્દ્ર:',
    project: 'પ્રોજેક્ટ: ICDS પોષણસેતુ',
    endpoint: 'એન્ડપોઇન્ટ:',
    changeCentreBtn: 'કેન્દ્ર બદલો / પસંદ કરો',
    selectTalukaPrompt: 'તાલુકો પસંદ કરો:',
    selectSectorPrompt: 'સેક્ટર પસંદ કરો:',
    selectCentrePrompt: 'આંગણવાડી કેન્દ્ર પસંદ કરો:',
    // Card 1
    card1Header: 'પસંદ કરેલ આંગણવાડી કેન્દ્ર',
    card1Status: 'સક્રિય (Active)',
    workerLabel: 'કાર્યકર:',
    phoneLabel: 'સંપર્ક:',
    supervisorLabel: 'સુપરવાઇઝર:',
    // Card 2
    card2Header: 'લાઇવ બાળભોગ બેલેન્સ',
    card2Badge: 'લાઈવ સિંક',
    card2Unit: 'પેકેટ્સ (Packets)',
    card2Updated: 'છેલ્લું અપડેટ:',
    card2Waiting: 'પ્રતીક્ષારત...',
    card2Buffer: 'નિયત સુરક્ષા જથ્થો (Buffer):',
    card2BufferVal: '૧૫ પેકેટ્સ',
    stockStatusOk: '✓ પર્યાપ્ત સ્ટોક (Adequate)',
    stockStatusLow: '⚠️ સ્ટોક ઓછો છે (<૧૫)',
    // Card 3
    card3Header: 'સ્ટોક એલર્ટ મોનિટર (CDPO)',
    statusNormal: 'સામાન્ય (Normal)',
    statusCritical: 'તાકીદની જરૂરિયાત (CRITICAL)',
    normalBadgeTitle: 'પર્યાપ્ત સ્ટોક બેલેન્સ (Adequate Stock)',
    normalBadgeDesc: 'સ્ટોક નિર્ધારિત લઘુત્તમ મર્યાદા (૧૫ પેકેટ્સ) કરતાં વધારે છે.',
    lowStockBadgeTitle: '⚠️ તાત્કાલિક રીસ્ટોક કરો (Low Stock)',
    lowStockBadgeDesc: 'ચેતવણી: બાળભોગ બેલેન્સ ૧૫ પેકેટ્સ કરતાં ઘટી ગયું છે. કલેક્ટર કચેરી/ગોડાઉનમાંથી તાત્કાલિક પુરવઠો મોકલો.',
    minThreshold: 'લઘુત્તમ ચેતવણી થ્રેશોલ્ડ:',
    restockBtn: 'રીસ્ટોક રિક્વેસ્ટ મોકલો (+૫૦)',
    // Table
    tableTitle: 'રિયલ-ટાઇમ સ્ટોક ટ્રાન્ઝેક્શન અને ઓડિટ રજિસ્ટર (Live Audit Table)',
    tableSubtitle: 'મોબાઈલ એપ્લિકેશન દ્વારા નોંધાયેલ પ્રત્યેક આવક (Inward) અને વિતરણ (Distribution) ની ક્ષણવાર વિગતો',
    searchPlaceholder: 'ગામ અથવા વિગત શોધો...',
    filterAll: 'બધી ક્રિયાઓ (All)',
    filterInward: 'આવક (Inward +)',
    filterDist: 'વિતરણ (Distribution -)',
    recordsCountSuffix: 'રેકોર્ડ્સ',
    colTimestamp: 'તારીખ અને સમય (Timestamp)',
    colVillage: 'ગામ / કેન્દ્રનું નામ (Centre)',
    colAction: 'કામગીરી (Action Taken)',
    colChange: 'પેકેટ્સ ફેરફાર (Packets Changed)',
    colResult: 'પરિણામી સ્ટોક બેલેન્સ (Resulting Stock)',
    packetsUnit: 'પેકેટ',
    emptyTableMsg: 'કોઈ ટ્રાન્ઝેક્શન રેકોર્ડ મળ્યો નથી.',
    tableFooterNote: 'નવી એન્ટ્રી આપમેળે ટોચ પર ઉમેરાશે અને પીળા ગ્લો એનિમેશન સાથે હાઇલાઇટ થશે.',
    tableFooterRecord: 'સત્તાવાર રેકોર્ડ: આઈ.સી.ડી.એસ. આણંદ કલેક્ટર કચેરી',
    // Modal
    modalTitle: 'આંગણવાડી કેન્દ્ર અને સેક્ટર પસંદગી પોર્ટલ',
    modalDesc: 'આણંદ જિલ્લાના વિવિધ તાલુકા અને સેક્ટરના આંગણવાડી કેન્દ્રોનું લાઇવ સ્ટોક નિરીક્ષણ કરવા માટે પસંદ કરો:',
    modalSearch: 'કેન્દ્રનું નામ અથવા કોડ શોધો...',
    allTalukas: 'બધા તાલુકા',
    // Footer
    footerCopyright: '© 2026 પોષણસેતુ (PoshanSetu) — મહિલા અને બાળ વિકાસ વિભાગ, ગુજરાત સરકાર.',
    footerCollector: 'કલેક્ટર કચેરી, આણંદ',
    footerCdpo: 'CDPO કચેરી આણંદ ગ્રામ્ય',
    footerSystem: 'સિસ્ટમ સ્થિતિ: સામાન્ય',
    toastRestockTitle: 'રીસ્ટોક રિક્વેસ્ટ મંજૂર',
    toastRestockDesc: 'ગોડાઉનમાંથી ૫૦ પેકેટ્સ કેન્દ્ર ખાતે તાત્કાલિક રવાના કરવામાં આવ્યા છે.',
    toastLowStockTitle: '⚠️ લઘુત્તમ સ્ટોક ચેતવણી!',
    toastLowStockDesc: 'કેન્દ્રમાં સ્ટોક ઘટીને માત્ર {b} પેકેટ્સ રહી ગયો છે.',
    toastStockUpdateTitle: 'સ્ટોક અપડેટ પ્રાપ્ત થયો',
    toastStockUpdateDesc: 'નવું બેલેન્સ: {b} પેકેટ્સ ({d})',
    toastPdfTitle: 'PDF રિપોર્ટ ડાઉનલોડ થયો',
    toastPdfDesc: 'સત્તાવાર ઓડિટ PDF રિપોર્ટ સફળતાપૂર્વક જનરેટ કરવામાં આવ્યો છે.',
    toastSwitchCentre: 'કેન્દ્ર બદલાયું',
    toastSwitchCentreDesc: 'હવે {name} (કોડ: {code}) નું મોનિટરિંગ ખુલ્લું છે.',
  },
  en: {
    govTitle: 'Government of Gujarat',
    govSub: 'ગુજરાત સરકાર',
    dept: 'WCDD (ICDS Anand)',
    portalTitle: 'PoshanSetu Desktop Monitoring Portal',
    portalSubtitle: 'Child Development Project Officer (CDPO) & Collector Office, Anand — Balbhog Live Stock Tracker',
    langBtn: 'ગુજરાતી',
    rtdbConnected: 'RTDB Connected (Live)',
    rtdbConnecting: 'Connecting...',
    rtdbDemo: 'Demo Mode (Simulated)',
    clockLabel: 'Indian Standard Time (IST)',
    pdfBtn: 'Download PDF Report',
    district: 'District: Anand',
    talukaLabel: 'Taluka:',
    sectorLabel: 'Sector:',
    centreLabel: 'Centre:',
    project: 'Project: ICDS PoshanSetu',
    endpoint: 'Endpoint:',
    changeCentreBtn: 'Change / Select Centre',
    selectTalukaPrompt: 'Select Taluka:',
    selectSectorPrompt: 'Select Sector:',
    selectCentrePrompt: 'Select Anganwadi Centre:',
    // Card 1
    card1Header: 'SELECTED ANGANWADI CENTRE',
    card1Status: 'Active',
    workerLabel: 'Worker:',
    phoneLabel: 'Phone:',
    supervisorLabel: 'Supervisor:',
    // Card 2
    card2Header: 'LIVE BALBHOG BALANCE',
    card2Badge: 'Live Synced',
    card2Unit: 'Packets',
    card2Updated: 'Last Updated:',
    card2Waiting: 'Awaiting...',
    card2Buffer: 'Mandated Buffer Stock:',
    card2BufferVal: '15 Packets',
    stockStatusOk: '✓ Adequate Stock',
    stockStatusLow: '⚠️ Low Stock (<15)',
    // Card 3
    card3Header: 'STOCK ALERT MONITOR (CDPO)',
    statusNormal: 'Normal',
    statusCritical: 'CRITICAL ALERT',
    normalBadgeTitle: 'Adequate Stock Level',
    normalBadgeDesc: 'Stock balance is above the mandated 15 packets safety threshold.',
    lowStockBadgeTitle: '⚠️ Restock Immediately (Low Stock)',
    lowStockBadgeDesc: 'Stock balance has fallen below 15 packets. Dispatch supplies from central godown immediately.',
    minThreshold: 'Minimum Safety Buffer:',
    restockBtn: 'Send Restock Order (+50)',
    // Table
    tableTitle: 'Real-time Stock Transactions & Audit Register',
    tableSubtitle: 'Itemized chronological log of all stock received (inward) and distributed by smartphone app',
    searchPlaceholder: 'Search village, centre or action...',
    filterAll: 'All Actions',
    filterInward: 'Inward (+)',
    filterDist: 'Distribution (-)',
    recordsCountSuffix: 'Records',
    colTimestamp: 'Timestamp (IST)',
    colVillage: 'Centre / Village Name',
    colAction: 'Action Taken',
    colChange: 'Packets Changed',
    colResult: 'Resulting Stock Balance',
    packetsUnit: 'pkts',
    emptyTableMsg: 'No transaction records found.',
    tableFooterNote: 'New entries are prepended automatically with a subtle yellow glow animation.',
    tableFooterRecord: 'Official Register: ICDS Anand Collector Office',
    // Modal
    modalTitle: 'Anganwadi Centre & Sector Selection Portal',
    modalDesc: 'Switch across Talukas and Sectors in Anand District to inspect real-time stock balance & audit logs:',
    modalSearch: 'Search centre name or code...',
    allTalukas: 'All Talukas',
    // Footer
    footerCopyright: '© 2026 PoshanSetu — Women & Child Development Department, Govt of Gujarat.',
    footerCollector: 'Collector Office, Anand',
    footerCdpo: 'CDPO Office Anand Rural',
    footerSystem: 'System Status: Nominal',
    toastRestockTitle: 'Restock Request Dispatched',
    toastRestockDesc: '50 Balbhog packets dispatched from central godown to centre.',
    toastLowStockTitle: '⚠️ Critical Low Stock Alert!',
    toastLowStockDesc: 'Centre stock has dropped to only {b} packets.',
    toastStockUpdateTitle: 'Live Stock Update Received',
    toastStockUpdateDesc: 'New balance: {b} packets ({d})',
    toastPdfTitle: 'PDF Report Generated',
    toastPdfDesc: 'Formal audit PDF report has been downloaded successfully.',
    toastSwitchCentre: 'Centre Switched',
    toastSwitchCentreDesc: 'Now monitoring {name} (Code: {code}).',
  }
};

export default function App() {
  const [lang, setLang] = useState<'gu' | 'en'>(() => {
    return (localStorage.getItem('poshansetu_lang') as 'gu' | 'en') || 'gu';
  });

  // Hierarchy Selection State
  const [selectedTalukaId, setSelectedTalukaId] = useState<string>('anand_rural');
  const [selectedSectorId, setSelectedSectorId] = useState<string>('vadtal_01');
  const [selectedCentreId, setSelectedCentreId] = useState<string>('aw_vad_04');

  // Dropdown & Modal Open States
  const [isTalukaDropdownOpen, setIsTalukaDropdownOpen] = useState<boolean>(false);
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState<boolean>(false);
  const [isCentreModalOpen, setIsCentreModalOpen] = useState<boolean>(false);
  const [modalSearchQuery, setModalSearchQuery] = useState<string>('');
  const [modalTalukaFilter, setModalTalukaFilter] = useState<string>('all');

  // Active Centre reference
  const selectedTaluka = TALUKAS.find(t => t.id === selectedTalukaId) || TALUKAS[0];
  const selectedSector = SECTORS.find(s => s.id === selectedSectorId) || SECTORS[0];
  const selectedCentre = CENTRES.find(c => c.id === selectedCentreId) || CENTRES[0];

  const [balance, setBalance] = useState<number | null>(selectedCentre.stockBalance);
  const [lastUpdated, setLastUpdated] = useState<string>('--:--:--');
  const [liveTime, setLiveTime] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(true);

  // Generate initial transactions for current centre
  const buildTransactionsForCentre = (centre: AnganwadiCentre): Transaction[] => {
    const now = Date.now();
    return centre.history.map((h, idx) => {
      const time = new Date(now - h.timeOffsetHours * 3600000);
      return {
        id: `tx_${centre.id}_${idx}`,
        timestampStr: `${time.toLocaleDateString(lang === 'gu' ? 'gu-IN' : 'en-IN', { timeZone: 'Asia/Kolkata' })} ${time.toLocaleTimeString(lang === 'gu' ? 'gu-IN' : 'en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`,
        village: lang === 'gu' ? centre.nameGu : centre.nameEn,
        action: lang === 'gu' ? h.actionGu : h.actionEn,
        change: h.change,
        balance: h.balance,
        isNew: false,
      };
    });
  };

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    return buildTransactionsForCentre(CENTRES[0]);
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; isAlert: boolean } | null>(null);

  const prevBalanceRef = useRef<number | null>(null);
  const initialLoadDoneRef = useRef<boolean>(false);

  const t = I18N[lang];

  // Click outside listener for dropdowns
  const talukaDropdownRef = useRef<HTMLDivElement>(null);
  const sectorDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (talukaDropdownRef.current && !talukaDropdownRef.current.contains(e.target as Node)) {
        setIsTalukaDropdownOpen(false);
      }
      if (sectorDropdownRef.current && !sectorDropdownRef.current.contains(e.target as Node)) {
        setIsSectorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLangToggle = () => {
    const next = lang === 'gu' ? 'en' : 'gu';
    setLang(next);
    localStorage.setItem('poshansetu_lang', next);
    triggerToast(
      next === 'en' ? 'Language Switched' : 'ભાષા બદલાઈ',
      next === 'en' ? 'Switched to English' : 'ગુજરાતી ભાષા પસંદ કરેલ છે'
    );
  };

  const triggerToast = (title: string, desc: string, isAlert = false) => {
    setToastMessage({ title, desc, isAlert });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Switch Centre handler
  const handleSelectCentre = (centre: AnganwadiCentre) => {
    setSelectedCentreId(centre.id);
    setSelectedSectorId(centre.sectorId);
    setSelectedTalukaId(centre.talukaId);
    setBalance(centre.stockBalance);
    setLastUpdated(
      new Date().toLocaleTimeString(lang === 'gu' ? 'gu-IN' : 'en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    );
    setTransactions(buildTransactionsForCentre(centre));
    setIsTalukaDropdownOpen(false);
    setIsSectorDropdownOpen(false);
    setIsCentreModalOpen(false);

    const centreName = lang === 'gu' ? centre.nameGu : centre.nameEn;
    triggerToast(
      t.toastSwitchCentre,
      t.toastSwitchCentreDesc.replace('{name}', centreName).replace('{code}', centre.code),
      centre.stockBalance < LOW_STOCK_THRESHOLD
    );
  };

  // Switch Sector handler
  const handleSelectSector = (sector: SectorInfo) => {
    setSelectedSectorId(sector.id);
    setSelectedTalukaId(sector.talukaId);
    const firstCentre = CENTRES.find(c => c.sectorId === sector.id) || CENTRES[0];
    handleSelectCentre(firstCentre);
  };

  // Switch Taluka handler
  const handleSelectTaluka = (taluka: TalukaInfo) => {
    setSelectedTalukaId(taluka.id);
    const firstSector = SECTORS.find(s => s.talukaId === taluka.id) || SECTORS[0];
    setSelectedSectorId(firstSector.id);
    const firstCentre = CENTRES.find(c => c.sectorId === firstSector.id) || CENTRES[0];
    handleSelectCentre(firstCentre);
  };

  // IST Clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLiveTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' IST'
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen to Firebase RTDB ONLY when default Vadtal centre is active
  useEffect(() => {
    if (selectedCentreId !== 'aw_vad_04') {
      setIsConnected(true);
      return;
    }

    let isSubscribed = true;

    const processStockPayload = (rawVal: unknown) => {
      if (rawVal === null || rawVal === undefined) return;

      let newBal = 0;
      let villageName = lang === 'gu' ? '૦૪ - વડતાલ (આણંદ)' : '04 - Vadtal (Anand)';
      let actionLabel = '';
      let explicitChange: number | null = null;
      let dateObj = new Date();

      if (typeof rawVal === 'number') {
        newBal = Math.round(rawVal);
      } else if (typeof rawVal === 'string') {
        newBal = parseInt(rawVal, 10) || 0;
      } else if (typeof rawVal === 'object') {
        const obj = rawVal as Record<string, unknown>;
        newBal = obj.balance !== undefined ? Number(obj.balance) : (obj.packets !== undefined ? Number(obj.packets) : 0);
        if (typeof obj.village === 'string') villageName = obj.village;
        if (typeof obj.lastAction === 'string') actionLabel = obj.lastAction;
        if (typeof obj.change === 'number') explicitChange = obj.change;
        if (typeof obj.timestamp === 'string') {
          const parsed = new Date(obj.timestamp);
          if (!isNaN(parsed.getTime())) dateObj = parsed;
        }
      }

      const prev = prevBalanceRef.current;
      const isFirst = !initialLoadDoneRef.current;
      initialLoadDoneRef.current = true;
      prevBalanceRef.current = newBal;

      setBalance(newBal);
      setLastUpdated(
        dateObj.toLocaleTimeString(lang === 'gu' ? 'gu-IN' : 'en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setIsConnected(true);

      let delta = 0;
      if (explicitChange !== null && explicitChange !== undefined) {
        delta = explicitChange;
      } else if (prev !== null && !isFirst) {
        delta = newBal - prev;
      }

      if (!actionLabel) {
        if (isFirst) {
          actionLabel = lang === 'gu' ? 'પ્રારંભિક સ્ટોક સિંક (Initial Sync)' : 'Initial Stock Sync';
        } else if (delta > 0) {
          actionLabel = lang === 'gu' ? 'આવક - નવો સ્ટોક જમા (Inward)' : 'Inward (+ Stock Received)';
        } else if (delta < 0) {
          actionLabel = lang === 'gu' ? 'વિતરણ - બાળભોગ આપેલ (Distribution)' : 'Distribution (- Distributed)';
        } else {
          actionLabel = lang === 'gu' ? 'બેલેન્સ પુષ્ટિ (Stock Verified)' : 'Stock Verified';
        }
      }

      if (delta !== 0 || isFirst) {
        const newTx: Transaction = {
          id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          timestampStr: `${dateObj.toLocaleDateString(lang === 'gu' ? 'gu-IN' : 'en-IN', { timeZone: 'Asia/Kolkata' })} ${dateObj.toLocaleTimeString(lang === 'gu' ? 'gu-IN' : 'en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`,
          village: villageName,
          action: actionLabel,
          change: delta,
          balance: newBal,
          isNew: !isFirst,
        };

        setTransactions(prevList => [newTx, ...prevList].slice(0, 100));
      }
    };

    const fetchInitial = async () => {
      try {
        const res = await fetch(`${FIREBASE_DB_URL}active_stock.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (isSubscribed) {
          processStockPayload(data);
        }
      } catch {
        if (isSubscribed) {
          setBalance(150);
          setLastUpdated(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
        }
      }
    };

    fetchInitial();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`${FIREBASE_DB_URL}active_stock.json`);
      eventSource.addEventListener('put', (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed && isSubscribed) {
            processStockPayload(parsed.data !== undefined ? parsed.data : parsed);
          }
        } catch {
          // ignore
        }
      });
      eventSource.onerror = () => {
        setIsConnected(false);
      };
      eventSource.onopen = () => {
        setIsConnected(true);
      };
    } catch {
      // fallback
    }

    const pollTimer = setInterval(fetchInitial, 8000);

    return () => {
      isSubscribed = false;
      clearInterval(pollTimer);
      if (eventSource) eventSource.close();
    };
  }, [selectedCentreId, lang]);

  const handleRestockOrder = () => {
    const curBal = balance ?? 0;
    const newBal = curBal + 50;
    setBalance(newBal);
    setLastUpdated(
      new Date().toLocaleTimeString(lang === 'gu' ? 'gu-IN' : 'en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    );

    const centreName = lang === 'gu' ? selectedCentre.nameGu : selectedCentre.nameEn;
    const actionText = lang === 'gu' ? 'તાકીદનો રીસ્ટોક પુરવઠો (Emergency Restock Inward)' : 'Emergency Restock Inward (+50)';

    const newTx: Transaction = {
      id: `tx_${Date.now()}_restock`,
      timestampStr: `${new Date().toLocaleDateString(lang === 'gu' ? 'gu-IN' : 'en-IN', { timeZone: 'Asia/Kolkata' })} ${new Date().toLocaleTimeString(lang === 'gu' ? 'gu-IN' : 'en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`,
      village: centreName,
      action: actionText,
      change: 50,
      balance: newBal,
      isNew: true,
    };

    setTransactions(prev => [newTx, ...prev]);
    triggerToast(t.toastRestockTitle, `${t.toastRestockDesc} (${centreName})`, false);
  };

  const isLowStock = balance !== null && balance < LOW_STOCK_THRESHOLD;

  const filteredTransactions = transactions.filter(item => {
    if (actionFilter === 'Inward' && !item.action.toLowerCase().includes('inward') && !(item.change > 0)) {
      return false;
    }
    if (actionFilter === 'Distribution' && !item.action.toLowerCase().includes('distribution') && !(item.change < 0)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const combined = `${item.village} ${item.action} ${item.timestampStr} ${item.balance}`.toLowerCase();
      return combined.includes(q);
    }
    return true;
  });

  // FORMAL PDF REPORT GENERATION FOR CURRENT SELECTED CENTRE
  const exportPDF = () => {
    if (transactions.length === 0) {
      triggerToast('No Data', 'No transactions to generate PDF report.');
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Top Indian Tricolor Strip
    doc.setFillColor(249, 115, 22);
    doc.rect(0, 0, pageWidth, 4, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 4, pageWidth, 3, 'F');
    doc.setFillColor(22, 163, 74);
    doc.rect(0, 7, pageWidth, 4, 'F');

    // Header Background (#0F172A Gov Slate)
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 11, pageWidth, 74, 'F');

    // Header Titles
    const textLeft = 40;
    doc.setTextColor(251, 191, 36);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('GOVERNMENT OF GUJARAT | WCDD (ICDS ANAND DISTRICT)', textLeft, 32);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('POSHANSETU — BALBHOG STOCK & AUDIT REPORT', textLeft, 52);

    doc.setTextColor(203, 213, 225);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Child Development Project Officer (CDPO) & Collector Office, Anand', textLeft, 68);

    // Current Status Badge in Header
    const currentBal = balance !== null ? balance : (transactions[0]?.balance ?? 0);
    const isCritical = currentBal < LOW_STOCK_THRESHOLD;

    doc.setFillColor(isCritical ? 220 : 22, isCritical ? 38 : 101, isCritical ? 38 : 52);
    doc.roundedRect(pageWidth - 175, 26, 135, 24, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(isCritical ? 'ALERT: LOW STOCK (<15)' : 'STATUS: NORMAL STOCK', pageWidth - 165, 41);

    // Metadata Card Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(40, 95, pageWidth - 80, 72, 4, 4, 'FD');

    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('Anganwadi Centre:', 52, 112);
    doc.text('District / Taluka:', 52, 128);
    doc.text('Supervisor / Sector:', 52, 144);
    doc.text('Report Generated:', 52, 160);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${selectedCentre.nameEn} (Code: ${selectedCentre.code})`, 150, 112);
    doc.text(`Anand / ${selectedTaluka.nameEn} (Gujarat)`, 150, 128);
    doc.text(`${selectedSector.nameEn} (Worker: ${selectedCentre.workerNameEn})`, 150, 144);
    doc.text(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST', 150, 160);

    // Right side stats in metadata box
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Current Balance:', pageWidth - 215, 112);
    doc.text('Buffer Threshold:', pageWidth - 215, 128);
    doc.text('Total Audit Logs:', pageWidth - 215, 144);
    doc.text('Centre Phone:', pageWidth - 215, 160);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isCritical ? 220 : 22, isCritical ? 38 : 101, isCritical ? 38 : 52);
    doc.text(`${currentBal} Packets`, pageWidth - 120, 112);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text('15 Packets', pageWidth - 120, 128);
    doc.text(`${transactions.length} Records`, pageWidth - 120, 144);
    doc.text(selectedCentre.workerPhone, pageWidth - 120, 160);

    // Table Data
    const tableHeaders = [['#', 'TIMESTAMP (IST)', 'CENTRE / VILLAGE', 'ACTION TAKEN', 'CHANGE', 'BALANCE']];
    const tableRows = transactions.map((t, idx) => [
      String(idx + 1),
      t.timestampStr,
      t.village,
      t.action,
      t.change > 0 ? `+${t.change} pkts` : `${t.change} pkts`,
      `${t.balance} pkts`
    ]);

    autoTable(doc, {
      head: tableHeaders,
      body: tableRows,
      startY: 180,
      margin: { left: 40, right: 40 },
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: 'bold',
        halign: 'left',
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'center' },
        1: { cellWidth: 110 },
        2: { cellWidth: 125 },
        3: { cellWidth: 135 },
        4: { cellWidth: 55, halign: 'right', fontStyle: 'bold' },
        5: { cellWidth: 65, halign: 'right', fontStyle: 'bold' },
      },
      styles: {
        fontSize: 8,
        cellPadding: 5,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.5,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 400;
    let signY = finalY + 45;
    if (signY > pageHeight - 90) {
      doc.addPage();
      signY = 70;
    }

    doc.setDrawColor(203, 213, 225);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(40, signY - 20, pageWidth - 40, signY - 20);
    doc.setLineDashPattern([], 0);

    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text(`Signature: Anganwadi Worker (${selectedCentre.workerNameEn})`, 50, signY);
    doc.text(`Signature: Supervisor (${selectedCentre.supervisorEn})`, 220, signY);
    doc.text('Approved: CDPO / Collector Office Anand', pageWidth - 210, signY);

    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Official System Certified Audit Record — PoshanSetu Project | Govt. of Gujarat', 40, pageHeight - 20);
    doc.text(`Page 1 of 1 · Generated ${new Date().toISOString()}`, pageWidth - 170, pageHeight - 20);

    doc.save(`PoshanSetu_Audit_Report_${selectedCentre.code}_${new Date().toISOString().slice(0, 10)}.pdf`);
    triggerToast(t.toastPdfTitle, t.toastPdfDesc, false);
  };

  // Filter centres for modal
  const filteredModalCentres = CENTRES.filter(c => {
    if (modalTalukaFilter !== 'all' && c.talukaId !== modalTalukaFilter) {
      return false;
    }
    if (modalSearchQuery.trim()) {
      const q = modalSearchQuery.toLowerCase();
      const combined = `${c.nameGu} ${c.nameEn} ${c.code} ${c.workerNameGu} ${c.workerNameEn}`.toLowerCase();
      return combined.includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-slate-100 antialiased selection:bg-amber-100 selection:text-amber-900">
      
      {/* TRICOLOR TOP STRIP */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600"></div>

      {/* HEADER: DARK SLATE GOV PORTAL HEADER WITH GUJARAT STYLING */}
      <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Left: Gujarat Government & PoshanSetu Identity */}
            <div className="flex items-center gap-3.5">
              {/* Permanent Official PoshanSetu Logo */}
              <div className="w-13 h-13 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-md border border-slate-700/60 overflow-hidden">
                <img
                  src="/poshansetu-logo.svg"
                  alt="Poshan Setu Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wide uppercase">
                  <span>{t.govTitle}</span>
                  <span className="text-slate-500">·</span>
                  <span>{t.govSub}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300 font-normal">{t.dept}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                  <span>{t.portalTitle}</span>
                </h1>
                <p className="text-xs text-slate-300 mt-0.5">
                  {t.portalSubtitle}
                </p>
              </div>
            </div>

            {/* Right: Language Switcher, Realtime status, clock & PDF export */}
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* LANGUAGE TOGGLE BUTTON */}
              <button
                type="button"
                onClick={handleLangToggle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm transition-all cursor-pointer border border-amber-300"
                title="Switch Language: English / ગુજરાતી"
              >
                <Languages className="w-4 h-4 text-slate-950" />
                <span>{t.langBtn}</span>
              </button>

              {/* Realtime Connection Pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-xs">
                <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 live-blinking-dot' : 'bg-amber-500'}`}></span>
                <span className={`font-medium ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {selectedCentre.isFirebaseLive ? (isConnected ? t.rtdbConnected : t.rtdbConnecting) : t.rtdbDemo}
                </span>
              </div>

              {/* Clock */}
              <div className="hidden sm:flex flex-col text-right px-3 py-1 rounded bg-slate-800/60 border border-slate-700/60 text-xs">
                <span className="text-slate-400 font-medium text-[11px]">{t.clockLabel}</span>
                <span className="font-mono text-slate-100 font-semibold tabular-nums text-xs">{liveTime || '--:--:--'}</span>
              </div>

              {/* DOWNLOAD PDF REPORT BUTTON */}
              <button
                type="button"
                onClick={exportPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-700 hover:bg-red-600 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                title="Download formal formatted PDF audit report"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{t.pdfBtn}</span>
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* SUBHEADER STRIP WITH INTERACTIVE TALUKA & SECTOR DROPDOWNS */}
      <div className="bg-slate-800 text-slate-300 border-b border-slate-700 text-xs relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
          
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Span 1: District */}
            <span className="flex items-center gap-1 text-slate-400 font-medium">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.district}</span>
            </span>

            {/* Span 2: Separator */}
            <span className="text-slate-600">|</span>

            {/* Span 3: TALUKA DROPDOWN COMPONENT (Targeted by CSS Selector 1) */}
            <span className="relative inline-block" ref={talukaDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setIsTalukaDropdownOpen(prev => !prev);
                  setIsSectorDropdownOpen(false);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-amber-300 font-bold border border-slate-600 hover:border-amber-400/80 transition-all cursor-pointer shadow-xs"
                title={lang === 'gu' ? 'તાલુકો બદલો' : 'Change Taluka'}
              >
                <span className="text-slate-400 font-normal">{t.talukaLabel}</span>
                <span className="text-white underline decoration-amber-400/60 underline-offset-2">
                  {lang === 'gu' ? selectedTaluka.nameGu : selectedTaluka.nameEn}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-amber-400 transition-transform ${isTalukaDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Taluka Dropdown Menu */}
              {isTalukaDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-60 rounded-md bg-slate-900 border border-slate-700 shadow-xl py-1 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-amber-400 uppercase tracking-wider border-b border-slate-800">
                    {t.selectTalukaPrompt}
                  </div>
                  {TALUKAS.map(taluka => {
                    const isCurrent = taluka.id === selectedTalukaId;
                    return (
                      <button
                        key={taluka.id}
                        type="button"
                        onClick={() => handleSelectTaluka(taluka)}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer ${
                          isCurrent ? 'bg-amber-500/10 text-amber-300 font-bold' : 'text-slate-200'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span>{lang === 'gu' ? taluka.nameGu : taluka.nameEn}</span>
                          <span className="text-[10px] text-slate-400">
                            {lang === 'gu' ? taluka.nameEn : taluka.nameGu}
                          </span>
                        </div>
                        {isCurrent && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </span>

            {/* Span 4: Separator */}
            <span className="text-slate-600">|</span>

            {/* Span 5: SECTOR & CENTRES DROPDOWN COMPONENT (Targeted by CSS Selector 2) */}
            <span className="relative inline-block" ref={sectorDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setIsSectorDropdownOpen(prev => !prev);
                  setIsTalukaDropdownOpen(false);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-amber-300 font-bold border border-slate-600 hover:border-amber-400/80 transition-all cursor-pointer shadow-xs"
                title={lang === 'gu' ? 'સેક્ટર અને કેન્દ્રો બદલો' : 'Change Sector & Centres'}
              >
                <span className="text-slate-400 font-normal">{t.sectorLabel}</span>
                <span className="text-white underline decoration-amber-400/60 underline-offset-2">
                  {lang === 'gu' ? selectedSector.nameGu : selectedSector.nameEn}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-amber-400 transition-transform ${isSectorDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Sector Dropdown Menu */}
              {isSectorDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-72 rounded-md bg-slate-900 border border-slate-700 shadow-2xl py-1 z-50 text-xs max-h-96 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-amber-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                    <span>{t.selectSectorPrompt}</span>
                    <span className="text-[10px] text-slate-400">{selectedTaluka.nameEn}</span>
                  </div>

                  {SECTORS.map(sec => {
                    const isSecSelected = sec.id === selectedSectorId;
                    const secCentres = CENTRES.filter(c => c.sectorId === sec.id);

                    return (
                      <div key={sec.id} className="border-b border-slate-800/80 last:border-0">
                        <button
                          type="button"
                          onClick={() => handleSelectSector(sec)}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer ${
                            isSecSelected ? 'bg-amber-500/15 text-amber-300 font-bold' : 'text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{lang === 'gu' ? sec.nameGu : sec.nameEn}</span>
                          </div>
                          {isSecSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        </button>

                        {/* List centres in this sector */}
                        <div className="bg-slate-950/60 py-1 pl-6 pr-2 flex flex-col gap-0.5">
                          {secCentres.map(c => {
                            const isCentreActive = c.id === selectedCentreId;
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectCentre(c);
                                }}
                                className={`text-left px-2 py-1.5 rounded flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer ${
                                  isCentreActive ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                <div className="flex flex-col">
                                  <span className="text-xs">{lang === 'gu' ? c.nameGu : c.nameEn}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">Code: {c.code} · {c.workerNameGu}</span>
                                </div>
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                  c.stockBalance < LOW_STOCK_THRESHOLD
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400'
                                }`}>
                                  {c.stockBalance} pkts
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </span>

            {/* Span 6: Separator */}
            <span className="text-slate-600">|</span>

            {/* Span 7: Project Tag */}
            <span className="text-slate-300 font-medium">{t.project}</span>
          </div>

          {/* Right Endpoint & Centre Switcher Modal Trigger */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCentreModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-950" />
              <span>{t.changeCentreBtn}</span>
            </button>

            <div className="text-slate-400 hidden md:flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.endpoint} <code className="font-mono text-slate-300 text-[11px]">{selectedCentre.isFirebaseLive ? '/active_stock' : `/demo/${selectedCentre.code}`}</code></span>
            </div>
          </div>

        </div>
      </div>

      {/* MAIN BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">

        {/* TOP METRICS ROW WITH 3 MANDATORY CARDS */}
        <section aria-label="Key Metrics" className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* CARD 1: Selected Centre (Dynamic for all Centres, Talukas & Sectors) */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between hover:border-slate-300 transition-colors relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold uppercase tracking-wider text-slate-600">{t.card1Header}</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
                  {selectedCentre.code}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Building2 className="w-6 h-6 text-amber-600 shrink-0" />
                <span>{lang === 'gu' ? selectedCentre.nameGu : selectedCentre.nameEn}</span>
              </h3>

              <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                <p>
                  <strong className="text-slate-700">{t.talukaLabel}</strong> {lang === 'gu' ? selectedTaluka.nameGu : selectedTaluka.nameEn} · <strong className="text-slate-700">{t.sectorLabel}</strong> {lang === 'gu' ? selectedSector.nameGu : selectedSector.nameEn}
                </p>
                <p className="text-slate-500 text-[11px]">
                  {t.supervisorLabel} {lang === 'gu' ? selectedCentre.supervisorGu : selectedCentre.supervisorEn}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700">
                <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-medium">{lang === 'gu' ? selectedCentre.workerNameGu : selectedCentre.workerNameEn}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCentreModalOpen(true)}
                className="text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 text-[11px] bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded border border-amber-200 transition-colors cursor-pointer"
              >
                <span>{lang === 'gu' ? 'બદલો' : 'Change'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* CARD 2: Live Balbhog Balance */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between hover:border-slate-300 transition-colors relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 ${isLowStock ? 'bg-red-500' : 'bg-emerald-500'}`}></div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isLowStock ? 'bg-red-500' : 'bg-emerald-500'} live-blinking-dot`}></span>
                  <span className="font-semibold uppercase tracking-wider text-slate-700">{t.card2Header}</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold">
                  {selectedCentre.isFirebaseLive ? t.card2Badge : 'સિમ્યુલેટેડ (Demo)'}
                </span>
              </div>

              <div className="flex items-baseline gap-3 my-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-slate-950 font-mono tabular-nums tracking-tight">
                  {balance !== null ? balance.toLocaleString(lang === 'gu' ? 'gu-IN' : 'en-IN') : '--'}
                </span>
                <span className="text-sm font-semibold text-slate-600">
                  {t.card2Unit}
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.card2Updated} <strong className="font-mono text-slate-700">{lastUpdated}</strong></span>
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">{t.card2Buffer} <strong>{t.card2BufferVal}</strong></span>
              <span className={isLowStock ? 'font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200' : 'font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200'}>
                {isLowStock ? t.stockStatusLow : t.stockStatusOk}
              </span>
            </div>
          </div>

          {/* CARD 3: Low-Stock Alert with Realtime Status */}
          <div className={`rounded-xl border shadow-xs p-5 flex flex-col justify-between transition-all ${
            isLowStock
              ? 'bg-red-50 border-red-400 text-red-950 ring-1 ring-red-400'
              : 'bg-white border-slate-200/90 text-slate-800'
          }`}>
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold uppercase tracking-wider text-slate-600">{t.card3Header}</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  isLowStock ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isLowStock ? t.statusCritical : t.statusNormal}
                </span>
              </div>

              {isLowStock ? (
                <div>
                  <div className="flex items-center gap-2 text-red-700 font-bold text-base sm:text-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    <span>{t.lowStockBadgeTitle}</span>
                  </div>
                  <p className="text-xs text-red-800 mt-1.5 leading-relaxed">
                    {t.lowStockBadgeDesc}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-base sm:text-lg">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{t.normalBadgeTitle}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {t.normalBadgeDesc}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                {t.minThreshold} <strong className="text-slate-700">૧૫ પેકેટ્સ</strong>
              </span>

              {isLowStock ? (
                <button
                  type="button"
                  onClick={handleRestockOrder}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded shadow-xs transition-colors cursor-pointer"
                >
                  {t.restockBtn}
                </button>
              ) : (
                <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.statusNormal}</span>
                </span>
              )}
            </div>
          </div>

        </section>

        {/* REAL-TIME AUDIT REGISTER TABLE */}
        <section aria-label="Stock Audit Table" className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
          
          {/* Table Header Strip */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-600" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {t.tableTitle}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.tableSubtitle} — <strong>{lang === 'gu' ? selectedCentre.nameGu : selectedCentre.nameEn} ({selectedCentre.code})</strong>
              </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 w-48 sm:w-56"
                />
              </div>

              {/* Action Filter */}
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="py-1.5 px-3 text-xs border border-slate-300 rounded-md bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">{t.filterAll}</option>
                <option value="Inward">{t.filterInward}</option>
                <option value="Distribution">{t.filterDist}</option>
              </select>

              {/* Records count pill */}
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-200/70 text-slate-700 border border-slate-300">
                {filteredTransactions.length} {t.recordsCountSuffix}
              </span>

            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 uppercase font-bold text-[11px] tracking-wider">
                  <th className="py-3 px-4 w-12 text-center text-slate-400">#</th>
                  <th className="py-3 px-4">{t.colTimestamp}</th>
                  <th className="py-3 px-4">{t.colVillage}</th>
                  <th className="py-3 px-4">{t.colAction}</th>
                  <th className="py-3 px-4 text-right">{t.colChange}</th>
                  <th className="py-3 px-4 text-right">{t.colResult}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Inbox className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="text-sm font-medium">{t.emptyTableMsg}</p>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx, idx) => {
                    const isInward = tx.change > 0;
                    const isDistribution = tx.change < 0;

                    return (
                      <tr
                        key={tx.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          tx.isNew ? 'bg-amber-50/80 ring-1 ring-amber-300 animate-pulse' : ''
                        }`}
                      >
                        {/* Serial */}
                        <td className="py-3.5 px-4 text-center font-mono text-slate-400 text-[11px]">
                          {idx + 1}
                        </td>

                        {/* Timestamp */}
                        <td className="py-3.5 px-4 font-mono text-slate-700 text-xs tabular-nums">
                          {tx.timestampStr}
                        </td>

                        {/* Village / Centre */}
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{tx.village}</span>
                          </span>
                        </td>

                        {/* Action Taken */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isInward
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isDistribution
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {isInward && <ArrowDownLeft className="w-3 h-3 text-emerald-600" />}
                            {isDistribution && <ArrowUpRight className="w-3 h-3 text-blue-600" />}
                            <span>{tx.action}</span>
                          </span>
                        </td>

                        {/* Change Amount */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-xs tabular-nums">
                          <span className={isInward ? 'text-emerald-600' : isDistribution ? 'text-blue-600' : 'text-slate-600'}>
                            {isInward ? `+${tx.change}` : String(tx.change)} {t.packetsUnit}
                          </span>
                        </td>

                        {/* Resulting Balance */}
                        <td className="py-3.5 px-4 text-right font-mono font-extrabold text-sm tabular-nums text-slate-950">
                          {tx.balance} {t.packetsUnit}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2 px-4">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.tableFooterNote}</span>
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              {t.tableFooterRecord} · {selectedCentre.code}
            </span>
          </div>

        </section>

      </main>

      {/* FULL CENTRE SELECTION MODAL */}
      {isCentreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
            
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-base text-white">{t.modalTitle}</h3>
                  <p className="text-xs text-slate-300">{t.modalDesc}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCentreModalOpen(false)}
                className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder={t.modalSearch}
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Taluka Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setModalTalukaFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    modalTalukaFilter === 'all'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t.allTalukas}
                </button>
                {TALUKAS.map(taluka => (
                  <button
                    key={taluka.id}
                    type="button"
                    onClick={() => setModalTalukaFilter(taluka.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      modalTalukaFilter === taluka.id
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lang === 'gu' ? taluka.nameGu : taluka.nameEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Centres Grid */}
            <div className="p-4 overflow-y-auto max-h-[50vh] grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredModalCentres.map(c => {
                const isSelected = c.id === selectedCentreId;
                const taluka = TALUKAS.find(t => t.id === c.talukaId);
                const sector = SECTORS.find(s => s.id === c.sectorId);
                const isCentreLow = c.stockBalance < LOW_STOCK_THRESHOLD;

                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCentre(c)}
                    className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/50 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {c.code}
                        </span>
                        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                          isCentreLow
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {c.stockBalance} {t.packetsUnit}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900">
                        {lang === 'gu' ? c.nameGu : c.nameEn}
                      </h4>

                      <p className="text-xs text-slate-500 mt-1">
                        {lang === 'gu' ? taluka?.nameGu : taluka?.nameEn} · {lang === 'gu' ? sector?.nameGu : sector?.nameEn}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{t.workerLabel} {lang === 'gu' ? c.workerNameGu : c.workerNameEn}</span>
                      {isSelected ? (
                        <span className="text-amber-700 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Selected</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 hover:text-slate-700 font-medium">Click to View</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 px-5">
              <span>Showing {filteredModalCentres.length} Anganwadi Centres</span>
              <button
                type="button"
                onClick={() => setIsCentreModalOpen(false)}
                className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-auto bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p>{t.footerCopyright}</p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              {t.footerCollector} · {t.footerCdpo}
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{t.footerSystem}</span>
            </span>
          </div>
        </div>
      </footer>

      {/* TOAST POPUP */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`p-4 rounded-lg shadow-xl border flex items-start gap-3 max-w-sm ${
            toastMessage.isAlert
              ? 'bg-red-950 text-red-100 border-red-700 ring-1 ring-red-500'
              : 'bg-slate-900 text-slate-100 border-slate-700'
          }`}>
            <div className={`p-1 rounded ${toastMessage.isAlert ? 'bg-red-800/60 text-red-200' : 'bg-amber-500/20 text-amber-400'}`}>
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs">
              <h4 className="font-bold text-white text-sm mb-0.5">{toastMessage.title}</h4>
              <p className="text-slate-300 leading-relaxed">{toastMessage.desc}</p>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
