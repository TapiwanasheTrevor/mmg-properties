import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { auditHelpers } from '@/lib/security/audit-logger';

export interface InspectionReport {
  id: string;
  propertyId: string;
  unitId?: string;
  inspectionType: InspectionType;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: Timestamp;
  completedDate?: Timestamp;
  inspector: {
    id: string;
    name: string;
    role: string;
    contact?: string;
  };
  tenant?: {
    id: string;
    name: string;
    present: boolean;
    signature?: string;
  };
  purpose: string;
  overallCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  areas: InspectionArea[];
  photos: InspectionPhoto[];
  issues: InspectionIssue[];
  recommendations: string;
  followUpRequired: boolean;
  followUpDate?: Timestamp;
  followUpNotes?: string;
  reportGenerated: boolean;
  reportUrl?: string;
  createdBy: string;
  createdByName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type InspectionType = 
  | 'move_in'
  | 'move_out'
  | 'routine'
  | 'maintenance'
  | 'safety'
  | 'compliance'
  | 'damage_assessment'
  | 'insurance'
  | 'pre_listing';

export interface InspectionArea {
  id: string;
  name: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  items: InspectionItem[];
  notes?: string;
  photos: string[]; // Photo IDs
}

export interface InspectionItem {
  id: string;
  name: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical' | 'not_applicable';
  notes?: string;
  requiresAttention: boolean;
  estimatedCost?: number;
  photos: string[]; // Photo IDs
}

export interface InspectionPhoto {
  id: string;
  url: string;
  filename: string;
  caption?: string;
  areaId?: string;
  itemId?: string;
  timestamp: Timestamp;
  uploadedBy: string;
}

export interface InspectionIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'safety' | 'maintenance' | 'compliance' | 'cosmetic' | 'structural';
  title: string;
  description: string;
  location: string;
  estimatedCost?: number;
  priority: number; // 1-10 scale
  requiresImmediateAttention: boolean;
  photos: string[]; // Photo IDs
  recommendedAction: string;
  assignedTo?: string;
  dueDate?: Timestamp;
  resolved: boolean;
  resolvedDate?: Timestamp;
  resolvedNotes?: string;
}

const inspectionsCollection = collection(db, 'inspections');

// Default inspection areas and items
const DEFAULT_INSPECTION_AREAS = [
  {
    name: 'Kitchen',
    items: [
      'Cabinets and drawers',
      'Countertops',
      'Sink and faucet',
      'Appliances (stove, refrigerator, dishwasher)',
      'Electrical outlets',
      'Lighting',
      'Flooring',
      'Windows',
      'Plumbing',
    ]
  },
  {
    name: 'Living Room',
    items: [
      'Walls and paint',
      'Flooring/carpet',
      'Windows and screens',
      'Doors',
      'Electrical outlets',
      'Lighting fixtures',
      'HVAC vents',
      'Ceiling',
    ]
  },
  {
    name: 'Bedrooms',
    items: [
      'Walls and paint',
      'Flooring/carpet',
      'Windows and screens',
      'Closets',
      'Doors',
      'Electrical outlets',
      'Lighting fixtures',
      'HVAC vents',
    ]
  },
  {
    name: 'Bathrooms',
    items: [
      'Toilet',
      'Sink and faucet',
      'Shower/bathtub',
      'Tiles and grout',
      'Mirrors',
      'Lighting',
      'Exhaust fan',
      'Plumbing',
      'Electrical outlets',
    ]
  },
  {
    name: 'Exterior',
    items: [
      'Roof condition',
      'Gutters and downspouts',
      'Siding/exterior walls',
      'Windows and screens',
      'Doors',
      'Walkways and steps',
      'Landscaping',
      'Fencing',
      'Parking areas',
    ]
  },
  {
    name: 'Systems',
    items: [
      'HVAC system',
      'Electrical panel',
      'Plumbing system',
      'Water heater',
      'Smoke detectors',
      'Carbon monoxide detectors',
      'Security system',
      'Internet/cable setup',
    ]
  },
];

// Create new inspection report
export const createInspectionReport = async (
  inspectionData: Omit<InspectionReport, 'id' | 'areas' | 'photos' | 'issues' | 'createdAt' | 'updatedAt'>,
  userId: string,
  userName: string
): Promise<string> => {
  try {
    // Generate default areas and items
    const areas: InspectionArea[] = DEFAULT_INSPECTION_AREAS.map((area, areaIndex) => ({
      id: `area_${areaIndex}`,
      name: area.name,
      condition: 'good',
      notes: '',
      photos: [],
      items: area.items.map((item, itemIndex) => ({
        id: `item_${areaIndex}_${itemIndex}`,
        name: item,
        condition: 'good',
        notes: '',
        requiresAttention: false,
        photos: [],
      }))
    }));

    const reportData: Omit<InspectionReport, 'id'> = {
      ...inspectionData,
      areas,
      photos: [],
      issues: [],
      reportGenerated: false,
      createdBy: userId,
      createdByName: userName,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(inspectionsCollection, reportData);
    
    // Log audit event
    await auditHelpers.logDataExport(userId, '', 'inspection', {
      action: 'create',
      inspectionId: docRef.id,
      propertyId: inspectionData.propertyId,
      inspectionType: inspectionData.inspectionType
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating inspection report:', error);
    throw error;
  }
};

// Get inspection report
export const getInspectionReport = async (inspectionId: string): Promise<InspectionReport | null> => {
  try {
    const docRef = doc(db, 'inspections', inspectionId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as InspectionReport;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting inspection report:', error);
    throw error;
  }
};

// Get inspection reports
export const getInspectionReports = async (options: {
  propertyId?: string;
  unitId?: string;
  inspectionType?: InspectionType;
  status?: string;
  inspectorId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  pageSize?: number;
} = {}) => {
  try {
    let q = query(inspectionsCollection);

    // Apply filters
    if (options.propertyId) {
      q = query(q, where('propertyId', '==', options.propertyId));
    }
    
    if (options.unitId) {
      q = query(q, where('unitId', '==', options.unitId));
    }
    
    if (options.inspectionType) {
      q = query(q, where('inspectionType', '==', options.inspectionType));
    }
    
    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }
    
    if (options.inspectorId) {
      q = query(q, where('inspector.id', '==', options.inspectorId));
    }

    // Order by scheduled date (most recent first)
    q = query(q, orderBy('scheduledDate', 'desc'));

    // Apply limit
    if (options.pageSize) {
      q = query(q, limit(options.pageSize));
    }

    const querySnapshot = await getDocs(q);
    const reports: InspectionReport[] = [];
    
    querySnapshot.forEach((doc) => {
      const report = { id: doc.id, ...doc.data() } as InspectionReport;
      
      // Client-side date filtering
      if (options.dateFrom || options.dateTo) {
        const reportDate = report.scheduledDate.toDate();
        if (options.dateFrom && reportDate < options.dateFrom) return;
        if (options.dateTo && reportDate > options.dateTo) return;
      }
      
      reports.push(report);
    });

    return {
      reports,
      total: reports.length,
    };
  } catch (error) {
    console.error('Error getting inspection reports:', error);
    throw error;
  }
};

// Update inspection report
export const updateInspectionReport = async (
  inspectionId: string,
  updates: Partial<InspectionReport>,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, 'inspections', inspectionId);
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    
    // Log audit event
    await auditHelpers.logDataExport(userId, '', 'inspection', {
      action: 'update',
      inspectionId,
      updates
    });
  } catch (error) {
    console.error('Error updating inspection report:', error);
    throw error;
  }
};

// Upload inspection photo
export const uploadInspectionPhoto = async (
  inspectionId: string,
  file: File,
  metadata: {
    caption?: string;
    areaId?: string;
    itemId?: string;
  },
  userId: string
): Promise<string> => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `inspection_${inspectionId}_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Upload to Firebase Storage
    const storageRef = ref(storage, `inspections/${inspectionId}/${filename}`);
    const uploadResult = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(uploadResult.ref);
    
    // Create photo record
    const photo: InspectionPhoto = {
      id: `photo_${timestamp}`,
      url: downloadUrl,
      filename: file.name,
      caption: metadata.caption,
      areaId: metadata.areaId,
      itemId: metadata.itemId,
      timestamp: serverTimestamp() as Timestamp,
      uploadedBy: userId,
    };
    
    // Add photo to inspection report
    const inspection = await getInspectionReport(inspectionId);
    if (!inspection) throw new Error('Inspection not found');
    
    const updatedPhotos = [...inspection.photos, photo];
    
    await updateInspectionReport(inspectionId, {
      photos: updatedPhotos,
    }, userId);
    
    // Log audit event
    await auditHelpers.logDataExport(userId, '', 'inspection', {
      action: 'upload_photo',
      inspectionId,
      photoId: photo.id,
      filename: file.name
    });
    
    return photo.id;
  } catch (error) {
    console.error('Error uploading inspection photo:', error);
    throw error;
  }
};

// Update inspection area
export const updateInspectionArea = async (
  inspectionId: string,
  areaId: string,
  updates: Partial<InspectionArea>,
  userId: string
): Promise<void> => {
  try {
    const inspection = await getInspectionReport(inspectionId);
    if (!inspection) throw new Error('Inspection not found');
    
    const updatedAreas = inspection.areas.map(area => 
      area.id === areaId ? { ...area, ...updates } : area
    );
    
    await updateInspectionReport(inspectionId, {
      areas: updatedAreas,
    }, userId);
  } catch (error) {
    console.error('Error updating inspection area:', error);
    throw error;
  }
};

// Update inspection item
export const updateInspectionItem = async (
  inspectionId: string,
  areaId: string,
  itemId: string,
  updates: Partial<InspectionItem>,
  userId: string
): Promise<void> => {
  try {
    const inspection = await getInspectionReport(inspectionId);
    if (!inspection) throw new Error('Inspection not found');
    
    const updatedAreas = inspection.areas.map(area => {
      if (area.id === areaId) {
        const updatedItems = area.items.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        );
        return { ...area, items: updatedItems };
      }
      return area;
    });
    
    await updateInspectionReport(inspectionId, {
      areas: updatedAreas,
    }, userId);
  } catch (error) {
    console.error('Error updating inspection item:', error);
    throw error;
  }
};

// Add inspection issue
export const addInspectionIssue = async (
  inspectionId: string,
  issue: Omit<InspectionIssue, 'id' | 'resolved' | 'resolvedDate' | 'resolvedNotes'>,
  userId: string
): Promise<string> => {
  try {
    const inspection = await getInspectionReport(inspectionId);
    if (!inspection) throw new Error('Inspection not found');
    
    const newIssue: InspectionIssue = {
      ...issue,
      id: `issue_${Date.now()}`,
      resolved: false,
    };
    
    const updatedIssues = [...inspection.issues, newIssue];
    
    await updateInspectionReport(inspectionId, {
      issues: updatedIssues,
    }, userId);
    
    return newIssue.id;
  } catch (error) {
    console.error('Error adding inspection issue:', error);
    throw error;
  }
};

// Update inspection issue
export const updateInspectionIssue = async (
  inspectionId: string,
  issueId: string,
  updates: Partial<InspectionIssue>,
  userId: string
): Promise<void> => {
  try {
    const inspection = await getInspectionReport(inspectionId);
    if (!inspection) throw new Error('Inspection not found');
    
    const updatedIssues = inspection.issues.map(issue => 
      issue.id === issueId ? { ...issue, ...updates } : issue
    );
    
    await updateInspectionReport(inspectionId, {
      issues: updatedIssues,
    }, userId);
  } catch (error) {
    console.error('Error updating inspection issue:', error);
    throw error;
  }
};

// Complete inspection
export const completeInspection = async (
  inspectionId: string,
  completionData: {
    overallCondition: InspectionReport['overallCondition'];
    recommendations: string;
    followUpRequired: boolean;
    followUpDate?: Date;
    followUpNotes?: string;
    tenantSignature?: string;
  },
  userId: string
): Promise<void> => {
  try {
    const updates: Partial<InspectionReport> = {
      status: 'completed',
      completedDate: serverTimestamp() as Timestamp,
      overallCondition: completionData.overallCondition,
      recommendations: completionData.recommendations,
      followUpRequired: completionData.followUpRequired,
      followUpNotes: completionData.followUpNotes,
    };
    
    if (completionData.followUpDate) {
      updates.followUpDate = Timestamp.fromDate(completionData.followUpDate);
    }
    
    if (completionData.tenantSignature) {
      updates.tenant = {
        ...updates.tenant,
        signature: completionData.tenantSignature,
      } as any;
    }
    
    await updateInspectionReport(inspectionId, updates, userId);
    
    // Log audit event
    await auditHelpers.logDataExport(userId, '', 'inspection', {
      action: 'complete',
      inspectionId,
      overallCondition: completionData.overallCondition
    });
  } catch (error) {
    console.error('Error completing inspection:', error);
    throw error;
  }
};

// Generate inspection report PDF
export const generateInspectionReportPDF = async (
  inspectionId: string,
  userId: string
): Promise<string> => {
  try {
    const inspection = await getInspectionReport(inspectionId);
    if (!inspection) throw new Error('Inspection not found');
    
    // Generate HTML report
    const htmlContent = generateReportHTML(inspection);
    
    // In a real implementation, convert HTML to PDF
    // For now, we'll create an HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const file = new File([blob], `inspection-report-${inspectionId}.html`, { type: 'text/html' });
    
    // Upload to document management system
    const { uploadDocument } = await import('./documents');
    const documentId = await uploadDocument(
      file,
      {
        name: `Inspection Report - ${inspection.inspectionType}`,
        description: `Inspection report for ${inspection.purpose}`,
        category: 'inspection_reports',
        tags: ['inspection', 'report', inspection.inspectionType],
        relatedResource: {
          type: 'property',
          id: inspection.propertyId,
          name: `Property ${inspection.propertyId}`,
        },
        accessLevel: 'private',
      },
      userId,
      'System',
      'system'
    );
    
    // Update inspection with report URL
    await updateInspectionReport(inspectionId, {
      reportGenerated: true,
      reportUrl: documentId,
    }, userId);
    
    // Log audit event
    await auditHelpers.logDataExport(userId, '', 'inspection', {
      action: 'generate_report',
      inspectionId,
      documentId
    });
    
    return documentId;
  } catch (error) {
    console.error('Error generating inspection report PDF:', error);
    throw error;
  }
};

// Generate HTML report content
const generateReportHTML = (inspection: InspectionReport): string => {
  const issuesByCategory = inspection.issues.reduce((acc, issue) => {
    if (!acc[issue.category]) acc[issue.category] = [];
    acc[issue.category].push(issue);
    return acc;
  }, {} as Record<string, InspectionIssue[]>);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Inspection Report - ${inspection.id}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .section { margin-bottom: 30px; }
        .area { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; }
        .item { margin-left: 20px; margin-bottom: 10px; }
        .condition { padding: 3px 8px; border-radius: 3px; font-size: 12px; }
        .excellent { background-color: #dcfce7; color: #166534; }
        .good { background-color: #dbeafe; color: #1e40af; }
        .fair { background-color: #fef3c7; color: #92400e; }
        .poor { background-color: #fed7d7; color: #c53030; }
        .critical { background-color: #fee2e2; color: #dc2626; }
        .issue { margin-bottom: 15px; padding: 10px; border-left: 4px solid #dc2626; background-color: #fef2f2; }
        .photo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 10px 0; }
        .photo { max-width: 100%; height: auto; border: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Property Inspection Report</h1>
        <p><strong>Inspection ID:</strong> ${inspection.id}</p>
        <p><strong>Date:</strong> ${inspection.scheduledDate.toDate().toLocaleDateString()}</p>
        <p><strong>Inspector:</strong> ${inspection.inspector.name}</p>
        <p><strong>Type:</strong> ${inspection.inspectionType.replace('_', ' ').toUpperCase()}</p>
        <p><strong>Overall Condition:</strong> <span class="condition ${inspection.overallCondition}">${inspection.overallCondition.toUpperCase()}</span></p>
      </div>
      
      <div class="section">
        <h2>Property Details</h2>
        <p><strong>Property ID:</strong> ${inspection.propertyId}</p>
        ${inspection.unitId ? `<p><strong>Unit ID:</strong> ${inspection.unitId}</p>` : ''}
        <p><strong>Purpose:</strong> ${inspection.purpose}</p>
      </div>
      
      <div class="section">
        <h2>Inspection Areas</h2>
        ${inspection.areas.map(area => `
          <div class="area">
            <h3>${area.name} <span class="condition ${area.condition}">${area.condition.toUpperCase()}</span></h3>
            ${area.notes ? `<p><em>${area.notes}</em></p>` : ''}
            ${area.items.map(item => `
              <div class="item">
                <strong>${item.name}:</strong> 
                <span class="condition ${item.condition}">${item.condition.replace('_', ' ').toUpperCase()}</span>
                ${item.requiresAttention ? ' <strong style="color: red;">(Requires Attention)</strong>' : ''}
                ${item.notes ? `<br><em>${item.notes}</em>` : ''}
                ${item.estimatedCost ? `<br><strong>Estimated Cost:</strong> $${item.estimatedCost}` : ''}
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
      
      ${inspection.issues.length > 0 ? `
        <div class="section">
          <h2>Issues Identified</h2>
          ${Object.entries(issuesByCategory).map(([category, issues]) => `
            <h3>${category.toUpperCase()}</h3>
            ${issues.map(issue => `
              <div class="issue">
                <h4>${issue.title} <span class="condition ${issue.severity}">${issue.severity.toUpperCase()}</span></h4>
                <p><strong>Location:</strong> ${issue.location}</p>
                <p><strong>Description:</strong> ${issue.description}</p>
                <p><strong>Recommended Action:</strong> ${issue.recommendedAction}</p>
                ${issue.estimatedCost ? `<p><strong>Estimated Cost:</strong> $${issue.estimatedCost}</p>` : ''}
                ${issue.requiresImmediateAttention ? '<p style="color: red; font-weight: bold;">REQUIRES IMMEDIATE ATTENTION</p>' : ''}
              </div>
            `).join('')}
          `).join('')}
        </div>
      ` : ''}
      
      ${inspection.photos.length > 0 ? `
        <div class="section">
          <h2>Photos</h2>
          <div class="photo-grid">
            ${inspection.photos.map(photo => `
              <div>
                <img src="${photo.url}" alt="${photo.caption || 'Inspection photo'}" class="photo">
                ${photo.caption ? `<p style="font-size: 12px; text-align: center;">${photo.caption}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <div class="section">
        <h2>Recommendations</h2>
        <p>${inspection.recommendations || 'No specific recommendations at this time.'}</p>
        
        ${inspection.followUpRequired ? `
          <h3>Follow-up Required</h3>
          ${inspection.followUpDate ? `<p><strong>Follow-up Date:</strong> ${inspection.followUpDate.toDate().toLocaleDateString()}</p>` : ''}
          ${inspection.followUpNotes ? `<p><strong>Notes:</strong> ${inspection.followUpNotes}</p>` : ''}
        ` : '<p><strong>No follow-up required.</strong></p>'}
      </div>
      
      <div class="section">
        <h2>Signatures</h2>
        <div style="display: flex; justify-content: space-between; margin-top: 50px;">
          <div style="text-align: center;">
            <div style="border-bottom: 1px solid #000; width: 200px; height: 50px; margin-bottom: 10px;"></div>
            <p><strong>Inspector Signature</strong></p>
            <p>${inspection.inspector.name}</p>
            <p>Date: ${inspection.completedDate ? inspection.completedDate.toDate().toLocaleDateString() : '_____________'}</p>
          </div>
          ${inspection.tenant ? `
            <div style="text-align: center;">
              <div style="border-bottom: 1px solid #000; width: 200px; height: 50px; margin-bottom: 10px;">
                ${inspection.tenant.signature ? `<img src="${inspection.tenant.signature}" style="max-height: 45px; max-width: 195px;" alt="Tenant Signature">` : ''}
              </div>
              <p><strong>Tenant Signature</strong></p>
              <p>${inspection.tenant.name}</p>
              <p>Date: ${inspection.completedDate ? inspection.completedDate.toDate().toLocaleDateString() : '_____________'}</p>
            </div>
          ` : ''}
        </div>
      </div>
      
      <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
        <p>This report was generated by MMG Property Consultancy on ${new Date().toLocaleDateString()}</p>
        <p>For questions or concerns, contact: info@mmgproperty.com</p>
      </div>
    </body>
    </html>
  `;
};

// Get inspection statistics
export const getInspectionStatistics = async (propertyId?: string) => {
  try {
    const { reports } = await getInspectionReports({ 
      propertyId, 
      pageSize: 1000 
    });
    
    const stats = {
      total: reports.length,
      byStatus: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      byCondition: {} as Record<string, number>,
      recentReports: reports.slice(0, 5),
      pendingFollowUps: reports.filter(r => r.followUpRequired && !r.followUpDate),
      overdueFollowUps: reports.filter(r => 
        r.followUpRequired && 
        r.followUpDate && 
        r.followUpDate.toDate() < new Date()
      ),
      totalIssues: reports.reduce((sum, r) => sum + r.issues.length, 0),
      criticalIssues: reports.reduce((sum, r) => 
        sum + r.issues.filter(i => i.severity === 'critical').length, 0
      ),
    };
    
    // Calculate distributions
    reports.forEach(report => {
      stats.byStatus[report.status] = (stats.byStatus[report.status] || 0) + 1;
      stats.byType[report.inspectionType] = (stats.byType[report.inspectionType] || 0) + 1;
      stats.byCondition[report.overallCondition] = (stats.byCondition[report.overallCondition] || 0) + 1;
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting inspection statistics:', error);
    throw error;
  }
};
