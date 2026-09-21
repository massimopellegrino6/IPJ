import { PropertyItem, MandateInfo, CadastralInfo, DocumentChecklist, PortalSyndication } from '../types/intelligence';

export const AGENTS_DIRECTORY = [
  {
    id: 'agent_1',
    name: 'Marco Rossi',
    role: 'Senior Listing Broker & Partner',
    email: 'm.rossi@proptech-intelligence.it',
    phone: '+39 06 4582 9101',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'agent_2',
    name: 'Elena Bianchi',
    role: 'Head of Residential Acquisitions',
    email: 'e.bianchi@proptech-intelligence.it',
    phone: '+39 02 8391 4402',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'agent_3',
    name: 'Matteo Ferrari',
    role: 'Commercial & Luxury Asset Lead',
    email: 'm.ferrari@proptech-intelligence.it',
    phone: '+39 011 592 7303',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'agent_4',
    name: 'Sofia Conti',
    role: 'Transaction Manager & Due Diligence',
    email: 's.conti@proptech-intelligence.it',
    phone: '+39 051 441 8299',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80'
  }
];

export function getPropertyRegistryInfo(property: PropertyItem): {
  mandate: MandateInfo;
  cadastralData: CadastralInfo;
  documents: DocumentChecklist;
  portalSyndication: PortalSyndication;
} {
  // If property already has them, return them
  if (property.mandate && property.cadastralData && property.documents && property.portalSyndication) {
    return {
      mandate: property.mandate,
      cadastralData: property.cadastralData,
      documents: property.documents,
      portalSyndication: property.portalSyndication
    };
  }

  // Derive deterministic hash code from property id to produce consistent, realistic data
  let hash = 0;
  for (let i = 0; i < property.id.length; i++) {
    hash = (hash << 5) - hash + property.id.charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);

  const agent = AGENTS_DIRECTORY[posHash % AGENTS_DIRECTORY.length];
  const mandateTypes: MandateInfo['type'][] = ['Exclusive', 'Exclusive', 'Exclusive', 'Non-Exclusive', 'Direct'];
  const mandateType = mandateTypes[posHash % mandateTypes.length];
  
  // Calculate expiration dates
  const daysToExp = (posHash % 140) + 12; // between 12 and 152 days
  const commission = mandateType === 'Exclusive' ? 3.0 : 4.0;

  // Cadastral data
  const sheetNum = 120 + (posHash % 80);
  const parcelNum = 200 + (posHash % 450);
  const subNum = (posHash % 28) + 1;
  const categories = ['A/2', 'A/2', 'A/3', 'A/1', 'A/7'];
  const cat = categories[posHash % categories.length];
  const annuity = Math.round(property.squareMeters * 8.2 + (posHash % 300));
  const complianceStatus: CadastralInfo['urbanCompliance'] = 
    posHash % 7 === 0 ? 'NEEDS_VERIFICATION' : 'COMPLIANT';

  // Document Checklist
  const deedOfOrigin = true;
  const mortgageInspection = posHash % 9 !== 0; // occasionally needs update
  const energyCertificateAPE = property.energyClass !== 'G';
  const condoRegulation = property.propertyType !== 'Villa';
  const floorPlanCompliance = complianceStatus === 'COMPLIANT';

  return {
    mandate: {
      type: mandateType,
      startDate: '2026-01-15',
      expirationDate: '2026-10-31',
      daysToExpiration: daysToExp,
      commissionPct: commission,
      assignedAgent: agent
    },
    cadastralData: {
      sheet: `${sheetNum}`,
      parcel: `${parcelNum}`,
      subaltern: `${subNum}`,
      cadastralCategory: cat,
      annuity: annuity,
      urbanCompliance: complianceStatus
    },
    documents: {
      deedOfOrigin,
      mortgageInspection,
      energyCertificateAPE,
      condoRegulation,
      floorPlanCompliance
    },
    portalSyndication: {
      immobiliare: true,
      idealista: posHash % 5 !== 0,
      casaIt: posHash % 3 !== 0,
      directWeb: true
    }
  };
}
