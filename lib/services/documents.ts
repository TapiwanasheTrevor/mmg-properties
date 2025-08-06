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
  deleteObject,
  listAll,
} from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { auditHelpers } from '@/lib/security/audit-logger';

export interface Document {
  id: string;
  name: string;
  description?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category: DocumentCategory;
  tags: string[];
  uploadedBy: string;
  uploadedByName: string;
  uploadedByRole: string;
  relatedResource?: {
    type: 'property' | 'unit' | 'tenant' | 'lease' | 'maintenance' | 'transaction';
    id: string;
    name: string;
  };
  accessLevel: 'public' | 'private' | 'restricted';
  permissions: {
    view: string[]; // User IDs who can view
    edit: string[]; // User IDs who can edit
    delete: string[]; // User IDs who can delete
  };
  downloadUrl: string;
  storageRef: string;
  version: number;
  parentDocumentId?: string; // For version control
  isActive: boolean;
  expiresAt?: Timestamp;
  metadata: {
    width?: number;
    height?: number;
    pageCount?: number;
    extractedText?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type DocumentCategory = 
  | 'lease_agreement'
  | 'tenant_application'
  | 'property_documents'
  | 'maintenance_reports'
  | 'financial_records'
  | 'inspection_reports'
  | 'legal_documents'
  | 'insurance_documents'
  | 'certificates'
  | 'photos'
  | 'other';

export interface DocumentFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  path: string;
  ownerId: string;
  permissions: {
    view: string[];
    edit: string[];
    admin: string[];
  };
  documentCount: number;
  totalSize: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const documentsCollection = collection(db, 'documents');
const foldersCollection = collection(db, 'document_folders');

// Upload document
export const uploadDocument = async (
  file: File,
  metadata: {
    name: string;
    description?: string;
    category: DocumentCategory;
    tags?: string[];
    relatedResource?: {
      type: 'property' | 'unit' | 'tenant' | 'lease' | 'maintenance' | 'transaction';
      id: string;
      name: string;
    };
    accessLevel?: 'public' | 'private' | 'restricted';
    permissions?: {
      view?: string[];
      edit?: string[];
      delete?: string[];
    };
    folderId?: string;
  },
  userId: string,
  userName: string,
  userRole: string
): Promise<string> => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${timestamp}_${sanitizedFileName}`;
    
    // Create storage reference
    const folderPath = metadata.folderId ? `documents/${metadata.folderId}` : 'documents/general';
    const storageRef = ref(storage, `${folderPath}/${uniqueFileName}`);
    
    // Upload file
    const uploadResult = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(uploadResult.ref);
    
    // Create document record
    const documentData: Omit<Document, 'id'> = {
      name: metadata.name,
      description: metadata.description,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      category: metadata.category,
      tags: metadata.tags || [],
      uploadedBy: userId,
      uploadedByName: userName,
      uploadedByRole: userRole,
      relatedResource: metadata.relatedResource,
      accessLevel: metadata.accessLevel || 'private',
      permissions: {
        view: metadata.permissions?.view || [userId],
        edit: metadata.permissions?.edit || [userId],
        delete: metadata.permissions?.delete || [userId],
      },
      downloadUrl,
      storageRef: uploadResult.ref.fullPath,
      version: 1,
      isActive: true,
      metadata: {
        width: undefined,
        height: undefined,
        pageCount: undefined,
        extractedText: undefined,
      },
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };
    
    const docRef = await addDoc(documentsCollection, documentData);
    
    // Log audit event
    await auditHelpers.logDataExport(userId, userRole, 'document', {
      action: 'upload',
      documentId: docRef.id,
      fileName: file.name,
      fileSize: file.size,
      category: metadata.category
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

// Get document by ID
export const getDocument = async (documentId: string): Promise<Document | null> => {
  try {
    const docRef = doc(db, 'documents', documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Document;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
};

// Get documents with filtering
interface GetDocumentsOptions {
  category?: DocumentCategory;
  relatedResourceType?: string;
  relatedResourceId?: string;
  uploadedBy?: string;
  tags?: string[];
  accessLevel?: string;
  folderId?: string;
  isActive?: boolean;
  pageSize?: number;
}

export const getDocuments = async (options: GetDocumentsOptions = {}) => {
  try {
    let q = query(documentsCollection);

    // Apply filters
    if (options.category) {
      q = query(q, where('category', '==', options.category));
    }
    
    if (options.relatedResourceType && options.relatedResourceId) {
      q = query(q, where('relatedResource.type', '==', options.relatedResourceType));
      q = query(q, where('relatedResource.id', '==', options.relatedResourceId));
    }
    
    if (options.uploadedBy) {
      q = query(q, where('uploadedBy', '==', options.uploadedBy));
    }
    
    if (options.accessLevel) {
      q = query(q, where('accessLevel', '==', options.accessLevel));
    }
    
    if (options.isActive !== undefined) {
      q = query(q, where('isActive', '==', options.isActive));
    }

    // Order by upload date (most recent first)
    q = query(q, orderBy('createdAt', 'desc'));

    // Apply limit
    if (options.pageSize) {
      q = query(q, limit(options.pageSize));
    }

    const querySnapshot = await getDocs(q);
    const documents: Document[] = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() } as Document);
    });

    return {
      documents,
      total: documents.length,
    };
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
};

// Update document metadata
export const updateDocument = async (
  documentId: string,
  updates: Partial<Pick<Document, 'name' | 'description' | 'tags' | 'category' | 'accessLevel' | 'permissions'>>,
  userId: string,
  userRole: string
): Promise<void> => {
  try {
    const docRef = doc(db, 'documents', documentId);
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    
    // Log audit event
    await auditHelpers.logDataExport(userId, userRole, 'document', {
      action: 'update',
      documentId,
      updates
    });
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

// Delete document
export const deleteDocument = async (
  documentId: string,
  userId: string,
  userRole: string
): Promise<void> => {
  try {
    // Get document to access storage reference
    const document = await getDocument(documentId);
    if (!document) {
      throw new Error('Document not found');
    }
    
    // Delete file from storage
    const storageRef = ref(storage, document.storageRef);
    await deleteObject(storageRef);
    
    // Delete document record
    const docRef = doc(db, 'documents', documentId);
    await deleteDoc(docRef);
    
    // Log audit event
    await auditHelpers.logDataExport(userId, userRole, 'document', {
      action: 'delete',
      documentId,
      fileName: document.fileName
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

// Create new version of document
export const createDocumentVersion = async (
  parentDocumentId: string,
  file: File,
  userId: string,
  userName: string,
  userRole: string
): Promise<string> => {
  try {
    const parentDocument = await getDocument(parentDocumentId);
    if (!parentDocument) {
      throw new Error('Parent document not found');
    }
    
    // Deactivate previous version
    await updateDoc(doc(db, 'documents', parentDocumentId), {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
    
    // Upload new version
    const newDocumentId = await uploadDocument(
      file,
      {
        name: parentDocument.name,
        description: parentDocument.description,
        category: parentDocument.category,
        tags: parentDocument.tags,
        relatedResource: parentDocument.relatedResource,
        accessLevel: parentDocument.accessLevel,
        permissions: parentDocument.permissions,
      },
      userId,
      userName,
      userRole
    );
    
    // Update new document with version info
    await updateDoc(doc(db, 'documents', newDocumentId), {
      version: parentDocument.version + 1,
      parentDocumentId,
    });
    
    return newDocumentId;
  } catch (error) {
    console.error('Error creating document version:', error);
    throw error;
  }
};

// Get document versions
export const getDocumentVersions = async (documentId: string): Promise<Document[]> => {
  try {
    // Get the main document first
    const mainDocument = await getDocument(documentId);
    if (!mainDocument) return [];
    
    // If this document has a parent, get all versions of the parent
    const rootDocumentId = mainDocument.parentDocumentId || documentId;
    
    // Get all versions
    const q = query(
      documentsCollection,
      where('parentDocumentId', '==', rootDocumentId),
      orderBy('version', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const versions: Document[] = [];
    
    // Add the root document if it doesn't have a parent
    if (!mainDocument.parentDocumentId) {
      versions.push(mainDocument);
    }
    
    querySnapshot.forEach((doc) => {
      versions.push({ id: doc.id, ...doc.data() } as Document);
    });
    
    return versions.sort((a, b) => b.version - a.version);
  } catch (error) {
    console.error('Error getting document versions:', error);
    throw error;
  }
};

// Search documents
export const searchDocuments = async (
  searchTerm: string,
  userId: string,
  filters: {
    category?: DocumentCategory;
    tags?: string[];
    dateFrom?: Date;
    dateTo?: Date;
  } = {}
): Promise<Document[]> => {
  try {
    // Get all documents the user has access to
    const { documents } = await getDocuments({ pageSize: 1000 });
    
    // Filter documents based on permissions
    const accessibleDocuments = documents.filter(doc => 
      doc.accessLevel === 'public' ||
      doc.permissions.view.includes(userId) ||
      doc.uploadedBy === userId
    );
    
    // Apply search and filters
    const searchLower = searchTerm.toLowerCase();
    const filteredDocuments = accessibleDocuments.filter(doc => {
      // Text search
      const matchesSearch = !searchTerm || 
        doc.name.toLowerCase().includes(searchLower) ||
        doc.description?.toLowerCase().includes(searchLower) ||
        doc.fileName.toLowerCase().includes(searchLower) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchLower));
      
      // Category filter
      const matchesCategory = !filters.category || doc.category === filters.category;
      
      // Tags filter
      const matchesTags = !filters.tags?.length || 
        filters.tags.some(tag => doc.tags.includes(tag));
      
      // Date filters
      const docDate = doc.createdAt.toDate();
      const matchesDateFrom = !filters.dateFrom || docDate >= filters.dateFrom;
      const matchesDateTo = !filters.dateTo || docDate <= filters.dateTo;
      
      return matchesSearch && matchesCategory && matchesTags && matchesDateFrom && matchesDateTo;
    });
    
    return filteredDocuments.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
  } catch (error) {
    console.error('Error searching documents:', error);
    throw error;
  }
};

// Get documents by resource
export const getDocumentsByResource = async (
  resourceType: string,
  resourceId: string,
  userId: string
): Promise<Document[]> => {
  try {
    const { documents } = await getDocuments({
      relatedResourceType: resourceType,
      relatedResourceId: resourceId,
      isActive: true,
    });
    
    // Filter by permissions
    return documents.filter(doc => 
      doc.accessLevel === 'public' ||
      doc.permissions.view.includes(userId) ||
      doc.uploadedBy === userId
    );
  } catch (error) {
    console.error('Error getting documents by resource:', error);
    throw error;
  }
};

// Get document statistics
export const getDocumentStatistics = async (userId?: string) => {
  try {
    const { documents } = await getDocuments({ pageSize: 10000 });
    
    // Filter by user if specified
    const filteredDocuments = userId 
      ? documents.filter(doc => doc.uploadedBy === userId)
      : documents;
    
    const stats = {
      total: filteredDocuments.length,
      totalSize: filteredDocuments.reduce((sum, doc) => sum + doc.fileSize, 0),
      byCategory: {} as Record<string, number>,
      byAccessLevel: {} as Record<string, number>,
      byMimeType: {} as Record<string, number>,
      recentUploads: filteredDocuments
        .sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime())
        .slice(0, 10),
      largestFiles: filteredDocuments
        .sort((a, b) => b.fileSize - a.fileSize)
        .slice(0, 10),
    };
    
    // Calculate category distribution
    filteredDocuments.forEach(doc => {
      stats.byCategory[doc.category] = (stats.byCategory[doc.category] || 0) + 1;
      stats.byAccessLevel[doc.accessLevel] = (stats.byAccessLevel[doc.accessLevel] || 0) + 1;
      stats.byMimeType[doc.mimeType] = (stats.byMimeType[doc.mimeType] || 0) + 1;
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting document statistics:', error);
    throw error;
  }
};

// Check document permissions
export const hasDocumentPermission = (
  document: Document,
  userId: string,
  permission: 'view' | 'edit' | 'delete'
): boolean => {
  // Owner always has all permissions
  if (document.uploadedBy === userId) return true;
  
  // Public documents can be viewed by anyone
  if (permission === 'view' && document.accessLevel === 'public') return true;
  
  // Check explicit permissions
  return document.permissions[permission]?.includes(userId) || false;
};

// Update document permissions
export const updateDocumentPermissions = async (
  documentId: string,
  permissions: {
    view?: string[];
    edit?: string[];
    delete?: string[];
  },
  userId: string,
  userRole: string
): Promise<void> => {
  try {
    const docRef = doc(db, 'documents', documentId);
    
    await updateDoc(docRef, {
      permissions,
      updatedAt: serverTimestamp(),
    });
    
    // Log audit event
    await auditHelpers.logDataExport(userId, userRole, 'document', {
      action: 'update_permissions',
      documentId,
      permissions
    });
  } catch (error) {
    console.error('Error updating document permissions:', error);
    throw error;
  }
};
