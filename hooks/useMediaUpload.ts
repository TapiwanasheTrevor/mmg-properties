'use client';

import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';

interface UploadOptions {
  maxSize?: number; // in MB
  allowedTypes?: string[];
  compression?: boolean;
}

interface MediaItem {
  url: string;
  type: 'image' | 'video' | 'document';
  filename: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
}

export function useMediaUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Compress image if needed
  const compressImage = (file: File, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 1920px width for properties)
        const maxWidth = 1920;
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob!], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }, file.type, quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Upload single file
  const uploadFile = async (
    file: File,
    path: string,
    options: UploadOptions = {}
  ): Promise<string> => {
    const { maxSize = 10, allowedTypes = ['image/*', 'video/*', 'application/pdf'], compression = true } = options;
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      throw new Error(`File size must be less than ${maxSize}MB`);
    }

    // Validate file type
    const isAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isAllowed) {
      throw new Error('File type not allowed');
    }

    let processedFile = file;

    // Compress images for property photos
    if (compression && file.type.startsWith('image/') && !file.type.includes('gif')) {
      processedFile = await compressImage(file);
    }

    // Create unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}_${randomStr}.${extension}`;
    
    const storageRef = ref(storage, `${path}/${filename}`);
    
    try {
      setUploading(true);
      setError(null);
      
      const snapshot = await uploadBytes(storageRef, processedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Upload multiple files for property/maintenance
  const uploadMultipleFiles = async (
    files: File[],
    path: string,
    options: UploadOptions = {}
  ): Promise<string[]> => {
    setUploading(true);
    setError(null);
    setProgress(0);

    const uploadPromises = files.map(async (file, index) => {
      try {
        const url = await uploadFile(file, path, options);
        setProgress(((index + 1) / files.length) * 100);
        return url;
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        throw error;
      }
    });

    try {
      const urls = await Promise.all(uploadPromises);
      return urls;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // Upload property photos
  const uploadPropertyPhotos = async (
    files: File[],
    propertyId: string,
    userId: string
  ): Promise<MediaItem[]> => {
    const urls = await uploadMultipleFiles(files, `properties/${propertyId}/photos`, {
      maxSize: 10,
      allowedTypes: ['image/*'],
      compression: true,
    });

    const mediaItems: MediaItem[] = files.map((file, index) => ({
      url: urls[index],
      type: 'image',
      filename: file.name,
      size: file.size,
      uploadedAt: new Date(),
      uploadedBy: userId,
    }));

    // Update Firestore
    await updateDoc(doc(db, 'properties', propertyId), {
      photos: arrayUnion(...mediaItems),
      updatedAt: new Date(),
    });

    return mediaItems;
  };

  // Upload maintenance request media
  const uploadMaintenanceMedia = async (
    files: File[],
    requestId: string,
    userId: string
  ): Promise<MediaItem[]> => {
    const urls = await uploadMultipleFiles(files, `maintenance/${requestId}`, {
      maxSize: 20,
      allowedTypes: ['image/*', 'video/*'],
      compression: true,
    });

    const mediaItems: MediaItem[] = files.map((file, index) => ({
      url: urls[index],
      type: file.type.startsWith('image/') ? 'image' : 'video',
      filename: file.name,
      size: file.size,
      uploadedAt: new Date(),
      uploadedBy: userId,
    }));

    // Update Firestore
    await updateDoc(doc(db, 'maintenance_requests', requestId), {
      media: arrayUnion(...mediaItems),
      updatedAt: new Date(),
    });

    return mediaItems;
  };

  // Delete media file
  const deleteMedia = async (
    url: string,
    collection: string,
    documentId: string,
    field: string = 'photos'
  ) => {
    try {
      // Delete from storage
      const storageRef = ref(storage, url);
      await deleteObject(storageRef);

      // Remove from Firestore
      await updateDoc(doc(db, collection, documentId), {
        [field]: arrayRemove(url),
        updatedAt: new Date(),
      });
    } catch (error: any) {
      console.error('Error deleting media:', error);
      throw error;
    }
  };

  // Capture photo using device camera (for mobile agents)
  const capturePhoto = async (propertyId: string, userId: string): Promise<MediaItem | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera
      });

      return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        video.srcObject = stream;
        video.play();

        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          setTimeout(() => {
            ctx.drawImage(video, 0, 0);
            canvas.toBlob(async (blob) => {
              stream.getTracks().forEach(track => track.stop());
              
              if (blob) {
                const file = new File([blob], `inspection_${Date.now()}.jpg`, {
                  type: 'image/jpeg'
                });
                
                try {
                  const mediaItems = await uploadPropertyPhotos([file], propertyId, userId);
                  resolve(mediaItems[0]);
                } catch (error) {
                  reject(error);
                }
              } else {
                reject(new Error('Failed to capture photo'));
              }
            }, 'image/jpeg', 0.9);
          }, 100);
        };
      });
    } catch (error: any) {
      setError('Camera access denied or not available');
      throw error;
    }
  };

  return {
    uploading,
    progress,
    error,
    uploadFile,
    uploadMultipleFiles,
    uploadPropertyPhotos,
    uploadMaintenanceMedia,
    deleteMedia,
    capturePhoto,
  };
}