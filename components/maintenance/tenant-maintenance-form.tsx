'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  Camera, 
  Upload, 
  X, 
  AlertCircle, 
  Clock, 
  Wrench,
  Zap,
  Droplets,
  Home,
  Thermometer,
  Shield
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const maintenanceSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Please provide detailed description (min 20 characters)'),
  category: z.enum(['plumbing', 'electrical', 'hvac', 'appliances', 'structural', 'pest_control', 'security', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'emergency']),
  location: z.string().min(3, 'Please specify location within your unit'),
  preferredTime: z.enum(['morning', 'afternoon', 'evening', 'anytime']),
  allowEntry: z.boolean(),
  tenantPresent: z.boolean(),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

const maintenanceCategories = [
  { value: 'plumbing', label: 'Plumbing', icon: Droplets, description: 'Pipes, taps, toilets, drains' },
  { value: 'electrical', label: 'Electrical', icon: Zap, description: 'Lights, outlets, wiring, breakers' },
  { value: 'hvac', label: 'Heating/Cooling', icon: Thermometer, description: 'AC, heating, ventilation' },
  { value: 'appliances', label: 'Appliances', icon: Home, description: 'Fridge, stove, washing machine' },
  { value: 'structural', label: 'Structural', icon: Home, description: 'Walls, doors, windows, floors' },
  { value: 'pest_control', label: 'Pest Control', icon: Shield, description: 'Insects, rodents' },
  { value: 'security', label: 'Security', icon: Shield, description: 'Locks, gates, alarms' },
  { value: 'other', label: 'Other', icon: Wrench, description: 'Other maintenance issues' },
];

const priorityLevels = [
  { value: 'low', label: 'Low Priority', color: 'text-green-600', description: 'Can wait 3-7 days' },
  { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600', description: 'Needs attention within 1-3 days' },
  { value: 'high', label: 'High Priority', color: 'text-orange-600', description: 'Urgent - within 24 hours' },
  { value: 'emergency', label: 'Emergency', color: 'text-red-600', description: 'Immediate attention required' },
];

interface TenantMaintenanceFormProps {
  onSubmitSuccess?: () => void;
  propertyId?: string;
  unitId?: string;
}

export default function TenantMaintenanceForm({ 
  onSubmitSuccess, 
  propertyId, 
  unitId 
}: TenantMaintenanceFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { uploadMultipleFiles, uploading } = useMediaUpload();

  const form = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      priority: 'medium',
      preferredTime: 'anytime',
      allowEntry: false,
      tenantPresent: false,
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        setError('Each file must be less than 10MB');
        return false;
      }
      return true;
    });
    
    setUploadedFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index: number) => {
    setUploadedFiles(files => files.filter((_, i) => i !== index));
  };

  const capturePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Create video element for camera preview
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
          canvas.toBlob((blob) => {
            stream.getTracks().forEach(track => track.stop());
            
            if (blob) {
              const file = new File([blob], `maintenance_photo_${Date.now()}.jpg`, {
                type: 'image/jpeg'
              });
              setUploadedFiles(prev => [...prev, file].slice(0, 5));
            }
          }, 'image/jpeg', 0.9);
        }, 100);
      };
    } catch (error) {
      setError('Camera access denied or not available');
    }
  };

  const onSubmit = async (data: MaintenanceFormData) => {
    if (!user || !propertyId) {
      setError('Missing user or property information');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create maintenance request
      const requestData = {
        ...data,
        tenantId: user.id,
        propertyId,
        unitId,
        status: 'submitted',
        createdAt: new Date(),
        updatedAt: new Date(),
        media: [] as string[],
      };

      const docRef = await addDoc(collection(db, 'maintenance_requests'), requestData);

      // Upload files if any
      if (uploadedFiles.length > 0) {
        const mediaUrls = await uploadMultipleFiles(
          uploadedFiles, 
          `maintenance/${docRef.id}`,
          { maxSize: 10, allowedTypes: ['image/*', 'video/*'] }
        );
        
        // Update request with media URLs
        await addDoc(collection(db, 'maintenance_requests'), {
          ...requestData,
          id: docRef.id,
          media: mediaUrls,
        });
      }

      setSuccess(true);
      form.reset();
      setUploadedFiles([]);
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

    } catch (error: any) {
      console.error('Error submitting maintenance request:', error);
      setError(error.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Request Submitted Successfully</h3>
            <p className="text-gray-600 mb-4">
              Your maintenance request has been sent to your property manager. 
              You'll receive updates via SMS and email.
            </p>
            <Button onClick={() => setSuccess(false)}>
              Submit Another Request
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="w-5 h-5" />
          Report Maintenance Issue
        </CardTitle>
        <CardDescription>
          Describe your maintenance issue in detail. Include photos for faster resolution.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Kitchen sink leaking" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select issue category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {maintenanceCategories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <div>
                                <div>{category.label}</div>
                                <div className="text-xs text-gray-500">{category.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorityLevels.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              priority.value === 'low' ? 'bg-green-500' :
                              priority.value === 'medium' ? 'bg-yellow-500' :
                              priority.value === 'high' ? 'bg-orange-500' : 'bg-red-500'
                            }`} />
                            <div>
                              <div className={priority.color}>{priority.label}</div>
                              <div className="text-xs text-gray-500">{priority.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location in Unit</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Master bathroom, Kitchen sink, Living room" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe the issue in detail. Include when it started, what you've noticed, and any steps you've taken..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Photo Upload */}
            <div className="space-y-4">
              <Label>Photos/Videos (Optional but recommended)</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button type="button" variant="outline" onClick={capturePhoto} className="h-20">
                  <div className="flex flex-col items-center">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-xs">Take Photo</span>
                  </div>
                </Button>
                
                <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                  <Upload className="w-6 h-6 mb-1 text-gray-400" />
                  <span className="text-xs text-gray-600">Upload Files</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-center">
                            <Camera className="w-8 h-8 text-gray-400 mx-auto" />
                            <p className="text-xs text-gray-600 mt-1">Video</p>
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Access Preferences */}
            <div className="space-y-4">
              <Label>Access Preferences</Label>
              
              <FormField
                control={form.control}
                name="preferredTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Time for Repair</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                        <SelectItem value="evening">Evening (5PM - 7PM)</SelectItem>
                        <SelectItem value="anytime">Anytime</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="allowEntry"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Allow entry if I'm not home</FormLabel>
                        <p className="text-xs text-gray-600">
                          Repair team can enter with property manager
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tenantPresent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I prefer to be present</FormLabel>
                        <p className="text-xs text-gray-600">
                          Schedule when I'm available
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || uploading}
            >
              {isSubmitting || uploading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  {uploading ? 'Uploading files...' : 'Submitting request...'}
                </>
              ) : (
                <>
                  <Wrench className="w-4 h-4 mr-2" />
                  Submit Maintenance Request
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}