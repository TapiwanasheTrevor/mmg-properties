import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadDocument } from './documents';
import { getLease } from './leases';
import { getTenant } from './tenants';
import { getProperty } from './properties';
import { getUnit } from './units';
import { auditHelpers } from '@/lib/security/audit-logger';

export interface LeaseDocument {
  id: string;
  leaseId: string;
  tenantId: string;
  propertyId: string;
  unitId: string;
  templateId: string;
  templateName: string;
  documentType: 'lease_agreement' | 'lease_renewal' | 'lease_amendment' | 'lease_termination';
  status: 'draft' | 'pending_signature' | 'signed' | 'expired' | 'cancelled';
  content: {
    html: string;
    variables: Record<string, any>;
  };
  signatures: {
    tenantSignature?: {
      signedAt: Timestamp;
      signatureData: string; // Base64 signature image
      ipAddress: string;
      userAgent: string;
    };
    landlordSignature?: {
      signedAt: Timestamp;
      signatureData: string;
      ipAddress: string;
      userAgent: string;
      signedBy: string;
      signedByName: string;
    };
    witnessSignature?: {
      signedAt: Timestamp;
      signatureData: string;
      witnessName: string;
      witnessContact: string;
    };
  };
  documentUrl?: string; // Final PDF URL
  expiresAt?: Timestamp;
  createdBy: string;
  createdByName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface LeaseTemplate {
  id: string;
  name: string;
  description: string;
  documentType: 'lease_agreement' | 'lease_renewal' | 'lease_amendment' | 'lease_termination';
  category: 'standard' | 'furnished' | 'commercial' | 'custom';
  htmlContent: string;
  variables: {
    name: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'boolean' | 'select';
    required: boolean;
    defaultValue?: any;
    options?: string[]; // For select type
    description?: string;
  }[];
  isActive: boolean;
  version: number;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const leaseDocumentsCollection = collection(db, 'lease_documents');
const leaseTemplatesCollection = collection(db, 'lease_templates');

// Default lease agreement template
const DEFAULT_LEASE_TEMPLATE = {
  name: 'Standard Residential Lease Agreement',
  description: 'Standard template for residential property leases',
  documentType: 'lease_agreement' as const,
  category: 'standard' as const,
  htmlContent: `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin-bottom: 10px;">RESIDENTIAL LEASE AGREEMENT</h1>
        <p style="font-size: 14px; color: #666;">MMG Property Consultancy</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <p><strong>Date:</strong> {{currentDate}}</p>
        <p><strong>Lease ID:</strong> {{leaseId}}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">PARTIES</h3>
        <p><strong>Landlord:</strong> {{landlordName}}</p>
        <p><strong>Address:</strong> {{landlordAddress}}</p>
        <p><strong>Contact:</strong> {{landlordPhone}} | {{landlordEmail}}</p>
        <br>
        <p><strong>Tenant:</strong> {{tenantName}}</p>
        <p><strong>ID Number:</strong> {{tenantIdNumber}}</p>
        <p><strong>Contact:</strong> {{tenantPhone}} | {{tenantEmail}}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">PROPERTY DETAILS</h3>
        <p><strong>Property:</strong> {{propertyName}}</p>
        <p><strong>Address:</strong> {{propertyAddress}}</p>
        <p><strong>Unit:</strong> {{unitLabel}} - {{unitType}}</p>
        <p><strong>Bedrooms:</strong> {{unitBedrooms}} | <strong>Bathrooms:</strong> {{unitBathrooms}}</p>
        <p><strong>Size:</strong> {{unitSize}} sqft</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">LEASE TERMS</h3>
        <p><strong>Lease Term:</strong> {{leaseTerm}} months</p>
        <p><strong>Start Date:</strong> {{leaseStartDate}}</p>
        <p><strong>End Date:</strong> {{leaseEndDate}}</p>
        <p><strong>Monthly Rent:</strong> {{currency}} {{rentAmount}}</p>
        <p><strong>Security Deposit:</strong> {{currency}} {{securityDeposit}}</p>
        <p><strong>Payment Due Date:</strong> {{paymentDueDate}} of each month</p>
        <p><strong>Payment Method:</strong> {{paymentMethod}}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">TERMS AND CONDITIONS</h3>
        <ol style="line-height: 1.6;">
          <li><strong>Use of Premises:</strong> The premises shall be used solely as a private residential dwelling by the tenant and immediate family.</li>
          <li><strong>Rent Payment:</strong> Rent is due on the {{paymentDueDate}} of each month. Late payments may incur a fee of {{lateFeeAmount}} after {{lateFeeGracePeriod}} days.</li>
          <li><strong>Security Deposit:</strong> A security deposit of {{currency}} {{securityDeposit}} is required and will be held for the duration of the lease.</li>
          <li><strong>Utilities:</strong> {{utilitiesResponsibility}}</li>
          <li><strong>Maintenance:</strong> Tenant is responsible for minor maintenance and repairs under {{currency}} {{maintenanceThreshold}}. Major repairs are landlord's responsibility.</li>
          <li><strong>Pets:</strong> {{petPolicy}}</li>
          <li><strong>Smoking:</strong> {{smokingPolicy}}</li>
          <li><strong>Subletting:</strong> Subletting is not permitted without written consent from the landlord.</li>
          <li><strong>Property Inspection:</strong> Landlord may inspect the property with {{inspectionNotice}} hours advance notice.</li>
          <li><strong>Termination:</strong> Either party may terminate this lease with {{terminationNotice}} days written notice.</li>
        </ol>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">ADDITIONAL TERMS</h3>
        <div style="min-height: 100px; border: 1px solid #e5e7eb; padding: 10px; background-color: #f9fafb;">
          {{additionalTerms}}
        </div>
      </div>
      
      <div style="margin-top: 40px;">
        <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">SIGNATURES</h3>
        <div style="display: flex; justify-content: space-between; margin-top: 30px;">
          <div style="width: 45%;">
            <div style="border-bottom: 1px solid #000; height: 60px; margin-bottom: 10px;"></div>
            <p><strong>Tenant Signature</strong></p>
            <p>{{tenantName}}</p>
            <p>Date: _________________</p>
          </div>
          <div style="width: 45%;">
            <div style="border-bottom: 1px solid #000; height: 60px; margin-bottom: 10px;"></div>
            <p><strong>Landlord/Agent Signature</strong></p>
            <p>{{landlordName}}</p>
            <p>Date: _________________</p>
          </div>
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
          <div style="border-bottom: 1px solid #000; height: 60px; margin-bottom: 10px; width: 300px; margin: 0 auto;"></div>
          <p><strong>Witness Signature (Optional)</strong></p>
          <p>Name: _______________________________</p>
          <p>Contact: ____________________________</p>
          <p>Date: _________________</p>
        </div>
      </div>
      
      <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
        <p>This document was generated by MMG Property Consultancy on {{generationDate}}</p>
        <p>For questions or concerns, contact: info@mmgproperty.com</p>
      </div>
    </div>
  `,
  variables: [
    { name: 'currentDate', label: 'Current Date', type: 'date' as const, required: true },
    { name: 'leaseId', label: 'Lease ID', type: 'text' as const, required: true },
    { name: 'landlordName', label: 'Landlord Name', type: 'text' as const, required: true },
    { name: 'landlordAddress', label: 'Landlord Address', type: 'text' as const, required: true },
    { name: 'landlordPhone', label: 'Landlord Phone', type: 'text' as const, required: true },
    { name: 'landlordEmail', label: 'Landlord Email', type: 'text' as const, required: true },
    { name: 'tenantName', label: 'Tenant Name', type: 'text' as const, required: true },
    { name: 'tenantIdNumber', label: 'Tenant ID Number', type: 'text' as const, required: true },
    { name: 'tenantPhone', label: 'Tenant Phone', type: 'text' as const, required: true },
    { name: 'tenantEmail', label: 'Tenant Email', type: 'text' as const, required: true },
    { name: 'propertyName', label: 'Property Name', type: 'text' as const, required: true },
    { name: 'propertyAddress', label: 'Property Address', type: 'text' as const, required: true },
    { name: 'unitLabel', label: 'Unit Label', type: 'text' as const, required: true },
    { name: 'unitType', label: 'Unit Type', type: 'text' as const, required: true },
    { name: 'unitBedrooms', label: 'Number of Bedrooms', type: 'number' as const, required: true },
    { name: 'unitBathrooms', label: 'Number of Bathrooms', type: 'number' as const, required: true },
    { name: 'unitSize', label: 'Unit Size (sqft)', type: 'number' as const, required: false },
    { name: 'leaseTerm', label: 'Lease Term (months)', type: 'number' as const, required: true },
    { name: 'leaseStartDate', label: 'Lease Start Date', type: 'date' as const, required: true },
    { name: 'leaseEndDate', label: 'Lease End Date', type: 'date' as const, required: true },
    { name: 'currency', label: 'Currency', type: 'select' as const, required: true, options: ['USD', 'ZWL'] },
    { name: 'rentAmount', label: 'Monthly Rent Amount', type: 'number' as const, required: true },
    { name: 'securityDeposit', label: 'Security Deposit Amount', type: 'number' as const, required: true },
    { name: 'paymentDueDate', label: 'Payment Due Date', type: 'number' as const, required: true, defaultValue: 1 },
    { name: 'paymentMethod', label: 'Payment Method', type: 'text' as const, required: true, defaultValue: 'Bank Transfer' },
    { name: 'lateFeeAmount', label: 'Late Fee Amount', type: 'number' as const, required: false, defaultValue: 50 },
    { name: 'lateFeeGracePeriod', label: 'Late Fee Grace Period (days)', type: 'number' as const, required: false, defaultValue: 5 },
    { name: 'utilitiesResponsibility', label: 'Utilities Responsibility', type: 'text' as const, required: true, defaultValue: 'Tenant is responsible for all utilities' },
    { name: 'maintenanceThreshold', label: 'Maintenance Threshold', type: 'number' as const, required: false, defaultValue: 100 },
    { name: 'petPolicy', label: 'Pet Policy', type: 'text' as const, required: true, defaultValue: 'No pets allowed without prior written consent' },
    { name: 'smokingPolicy', label: 'Smoking Policy', type: 'text' as const, required: true, defaultValue: 'Smoking is prohibited in the premises' },
    { name: 'inspectionNotice', label: 'Inspection Notice Period (hours)', type: 'number' as const, required: false, defaultValue: 24 },
    { name: 'terminationNotice', label: 'Termination Notice Period (days)', type: 'number' as const, required: false, defaultValue: 30 },
    { name: 'additionalTerms', label: 'Additional Terms', type: 'text' as const, required: false },
    { name: 'generationDate', label: 'Generation Date', type: 'date' as const, required: true },
  ],
};

// Generate lease document from template
export const generateLeaseDocument = async (
  leaseId: string,
  templateId: string,
  customVariables: Record<string, any> = {},
  userId: string,
  userName: string
): Promise<string> => {
  try {
    // Get lease, tenant, property, and unit data
    const [lease, template] = await Promise.all([
      getLease(leaseId),
      getLeaseTemplate(templateId)
    ]);
    
    if (!lease) throw new Error('Lease not found');
    if (!template) throw new Error('Template not found');
    
    const [tenant, property, unit] = await Promise.all([
      getTenant(lease.tenantId),
      getProperty(lease.propertyId),
      getUnit(lease.unitId)
    ]);
    
    if (!tenant) throw new Error('Tenant not found');
    if (!property) throw new Error('Property not found');
    if (!unit) throw new Error('Unit not found');
    
    // Prepare template variables
    const variables = {
      currentDate: new Date().toLocaleDateString(),
      generationDate: new Date().toLocaleDateString(),
      leaseId: lease.id,
      
      // Landlord information (using property owner or MMG)
      landlordName: property.owner?.name || 'MMG Property Consultancy',
      landlordAddress: property.owner?.address || 'Harare, Zimbabwe',
      landlordPhone: property.owner?.phone || '+263 XX XXX XXXX',
      landlordEmail: property.owner?.email || 'info@mmgproperty.com',
      
      // Tenant information
      tenantName: tenant.personalInfo.emergencyContact.name || 'N/A',
      tenantIdNumber: tenant.personalInfo.idNumber,
      tenantPhone: tenant.personalInfo.emergencyContact.phone || 'N/A',
      tenantEmail: tenant.personalInfo.emergencyContact.email || 'N/A',
      
      // Property information
      propertyName: property.name,
      propertyAddress: `${property.address.street}, ${property.address.city}, ${property.address.state}`,
      
      // Unit information
      unitLabel: unit.label,
      unitType: unit.type.replace('_', ' '),
      unitBedrooms: unit.details.bedrooms || 0,
      unitBathrooms: unit.details.bathrooms || 0,
      unitSize: unit.details.area || 0,
      
      // Lease terms
      leaseTerm: Math.ceil(
        (lease.dates.endDate.toDate().getTime() - lease.dates.startDate.toDate().getTime()) 
        / (1000 * 60 * 60 * 24 * 30)
      ),
      leaseStartDate: lease.dates.startDate.toDate().toLocaleDateString(),
      leaseEndDate: lease.dates.endDate.toDate().toLocaleDateString(),
      currency: lease.terms.currency,
      rentAmount: lease.terms.rentAmount.toLocaleString(),
      securityDeposit: lease.terms.securityDeposit?.toLocaleString() || '0',
      paymentDueDate: lease.terms.paymentDueDate || 1,
      paymentMethod: lease.terms.paymentMethod || 'Bank Transfer',
      
      // Default terms (can be overridden by customVariables)
      lateFeeAmount: 50,
      lateFeeGracePeriod: 5,
      utilitiesResponsibility: 'Tenant is responsible for all utilities',
      maintenanceThreshold: 100,
      petPolicy: 'No pets allowed without prior written consent',
      smokingPolicy: 'Smoking is prohibited in the premises',
      inspectionNotice: 24,
      terminationNotice: 30,
      additionalTerms: '',
      
      // Override with custom variables
      ...customVariables,
    };
    
    // Process template content
    let htmlContent = template.htmlContent;
    
    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(regex, String(value || ''));
    });
    
    // Create lease document record
    const documentData: Omit<LeaseDocument, 'id'> = {
      leaseId,
      tenantId: lease.tenantId,
      propertyId: lease.propertyId,
      unitId: lease.unitId,
      templateId,
      templateName: template.name,
      documentType: template.documentType,
      status: 'draft',
      content: {
        html: htmlContent,
        variables,
      },
      signatures: {},
      createdBy: userId,
      createdByName: userName,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };
    
    const docRef = await addDoc(leaseDocumentsCollection, documentData);
    
    // Log audit event
    await auditHelpers.logDataExport(userId, '', 'lease_document', {
      action: 'generate',
      leaseId,
      templateId,
      documentId: docRef.id
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error generating lease document:', error);
    throw error;
  }
};

// Get lease document
export const getLeaseDocument = async (documentId: string): Promise<LeaseDocument | null> => {
  try {
    const docRef = doc(db, 'lease_documents', documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as LeaseDocument;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting lease document:', error);
    throw error;
  }
};

// Get lease documents
export const getLeaseDocuments = async (options: {
  leaseId?: string;
  tenantId?: string;
  status?: string;
  documentType?: string;
} = {}) => {
  try {
    let q = query(leaseDocumentsCollection);
    
    if (options.leaseId) {
      q = query(q, where('leaseId', '==', options.leaseId));
    }
    
    if (options.tenantId) {
      q = query(q, where('tenantId', '==', options.tenantId));
    }
    
    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }
    
    if (options.documentType) {
      q = query(q, where('documentType', '==', options.documentType));
    }
    
    q = query(q, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const documents: LeaseDocument[] = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() } as LeaseDocument);
    });
    
    return documents;
  } catch (error) {
    console.error('Error getting lease documents:', error);
    throw error;
  }
};

// Update lease document status
export const updateLeaseDocumentStatus = async (
  documentId: string,
  status: LeaseDocument['status'],
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, 'lease_documents', documentId);
    
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
    
    // Log audit event
    await auditHelpers.logDataExport(userId, '', 'lease_document', {
      action: 'status_update',
      documentId,
      newStatus: status
    });
  } catch (error) {
    console.error('Error updating lease document status:', error);
    throw error;
  }
};

// Add signature to lease document
export const addSignatureToDocument = async (
  documentId: string,
  signatureType: 'tenant' | 'landlord' | 'witness',
  signatureData: {
    signatureImage: string; // Base64 encoded signature
    signerName?: string;
    witnessName?: string;
    witnessContact?: string;
    ipAddress: string;
    userAgent: string;
  },
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, 'lease_documents', documentId);
    const updateData: any = { updatedAt: serverTimestamp() };
    
    const signatureRecord = {
      signedAt: serverTimestamp(),
      signatureData: signatureData.signatureImage,
      ipAddress: signatureData.ipAddress,
      userAgent: signatureData.userAgent,
    };
    
    switch (signatureType) {
      case 'tenant':
        updateData['signatures.tenantSignature'] = signatureRecord;
        break;
      case 'landlord':
        updateData['signatures.landlordSignature'] = {
          ...signatureRecord,
          signedBy: userId,
          signedByName: signatureData.signerName || 'Unknown',
        };
        break;
      case 'witness':
        updateData['signatures.witnessSignature'] = {
          ...signatureRecord,
          witnessName: signatureData.witnessName || 'Unknown',
          witnessContact: signatureData.witnessContact || '',
        };
        break;
    }
    
    await updateDoc(docRef, updateData);
    
    // Check if document is fully signed
    const document = await getLeaseDocument(documentId);
    if (document && document.signatures.tenantSignature && document.signatures.landlordSignature) {
      await updateLeaseDocumentStatus(documentId, 'signed', userId);
    } else if (document && (document.signatures.tenantSignature || document.signatures.landlordSignature)) {
      await updateLeaseDocumentStatus(documentId, 'pending_signature', userId);
    }
    
    // Log audit event
    await auditHelpers.logDataExport(userId, '', 'lease_document', {
      action: 'add_signature',
      documentId,
      signatureType
    });
  } catch (error) {
    console.error('Error adding signature to document:', error);
    throw error;
  }
};

// Generate PDF from lease document
export const generateLeaseDocumentPDF = async (
  documentId: string,
  userId: string,
  userName: string
): Promise<string> => {
  try {
    const document = await getLeaseDocument(documentId);
    if (!document) throw new Error('Document not found');
    
    // In a real implementation, you would use a PDF generation library
    // For now, we'll create a simple HTML file and simulate PDF generation
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lease Agreement - ${document.id}</title>
        <style>
          body { margin: 0; padding: 20px; }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        ${document.content.html}
      </body>
      </html>
    `;
    
    // Create a blob and simulate PDF generation
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const file = new File([blob], `lease-agreement-${document.id}.html`, { type: 'text/html' });
    
    // Upload as document
    const uploadedDocumentId = await uploadDocument(
      file,
      {
        name: `${document.templateName} - ${document.id}`,
        description: `Generated lease document for lease ${document.leaseId}`,
        category: 'lease_agreement',
        tags: ['lease', 'generated', 'agreement'],
        relatedResource: {
          type: 'lease',
          id: document.leaseId,
          name: `Lease ${document.leaseId}`,
        },
        accessLevel: 'private',
      },
      userId,
      userName,
      'system'
    );
    
    // Update lease document with PDF URL
    const docRef = doc(db, 'lease_documents', documentId);
    await updateDoc(docRef, {
      documentUrl: `document:${uploadedDocumentId}`,
      updatedAt: serverTimestamp(),
    });
    
    // Log audit event
    await auditHelpers.logDataExport(userId, '', 'lease_document', {
      action: 'generate_pdf',
      documentId,
      uploadedDocumentId
    });
    
    return uploadedDocumentId;
  } catch (error) {
    console.error('Error generating lease document PDF:', error);
    throw error;
  }
};

// Get lease template
export const getLeaseTemplate = async (templateId: string): Promise<LeaseTemplate | null> => {
  try {
    if (templateId === 'default') {
      // Return default template
      return {
        id: 'default',
        ...DEFAULT_LEASE_TEMPLATE,
        isActive: true,
        version: 1,
        createdBy: 'system',
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };
    }
    
    const docRef = doc(db, 'lease_templates', templateId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as LeaseTemplate;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting lease template:', error);
    throw error;
  }
};

// Get all lease templates
export const getLeaseTemplates = async (): Promise<LeaseTemplate[]> => {
  try {
    const q = query(
      leaseTemplatesCollection,
      where('isActive', '==', true),
      orderBy('name')
    );
    
    const querySnapshot = await getDocs(q);
    const templates: LeaseTemplate[] = [
      // Always include default template
      {
        id: 'default',
        ...DEFAULT_LEASE_TEMPLATE,
        isActive: true,
        version: 1,
        createdBy: 'system',
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      }
    ];
    
    querySnapshot.forEach((doc) => {
      templates.push({ id: doc.id, ...doc.data() } as LeaseTemplate);
    });
    
    return templates;
  } catch (error) {
    console.error('Error getting lease templates:', error);
    throw error;
  }
};

// Create custom lease template
export const createLeaseTemplate = async (
  templateData: Omit<LeaseTemplate, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(leaseTemplatesCollection, {
      ...templateData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Log audit event
    await auditHelpers.logDataExport(templateData.createdBy, '', 'lease_template', {
      action: 'create',
      templateId: docRef.id,
      templateName: templateData.name
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating lease template:', error);
    throw error;
  }
};

// Send document for signature
export const sendDocumentForSignature = async (
  documentId: string,
  recipientType: 'tenant' | 'landlord',
  userId: string
): Promise<void> => {
  try {
    const document = await getLeaseDocument(documentId);
    if (!document) throw new Error('Document not found');
    
    // Update status to pending signature
    await updateLeaseDocumentStatus(documentId, 'pending_signature', userId);
    
    // In a real implementation, you would send an email or notification
    // to the recipient with a link to sign the document
    
    // Log audit event
    await auditHelpers.logDataExport(userId, '', 'lease_document', {
      action: 'send_for_signature',
      documentId,
      recipientType
    });
    
    console.log(`Document ${documentId} sent for ${recipientType} signature`);
  } catch (error) {
    console.error('Error sending document for signature:', error);
    throw error;
  }
};
