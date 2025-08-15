'use client';

import { useState, useRef } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { 
  Camera, 
  Upload, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  MapPin,
  Clock,
  FileText,
  Star,
  Thermometer,
  Zap,
  Droplets,
  Shield,
  Home,
  Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const inspectionSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  unitId: z.string().optional(),
  inspectionType: z.enum(['routine', 'pre_lease', 'post_lease', 'maintenance', 'emergency']),
  
  // Property condition ratings (1-5 scale)
  overallCondition: z.number().min(1).max(5),
  structuralCondition: z.number().min(1).max(5),
  electricalCondition: z.number().min(1).max(5),
  plumbingCondition: z.number().min(1).max(5),
  cleanlinessRating: z.number().min(1).max(5),
  
  // Detailed assessments
  structuralNotes: z.string().optional(),
  electricalNotes: z.string().optional(),
  plumbingNotes: z.string().optional(),
  applianceNotes: z.string().optional(),
  securityNotes: z.string().optional(),
  
  // Issues found
  issuesFound: z.array(z.string()).optional(),
  urgentRepairs: z.array(z.string()).optional(),
  recommendations: z.string().optional(),
  
  // Property specific (Zimbabwe context)
  waterPressure: z.enum(['excellent', 'good', 'fair', 'poor']),
  powerSupply: z.enum(['stable', 'intermittent', 'issues']),
  internetConnectivity: z.enum(['excellent', 'good', 'fair', 'poor', 'none']),
  securityFeatures: z.array(z.string()).optional(),
  
  // Environmental factors
  ventilation: z.enum(['excellent', 'good', 'fair', 'poor']),
  naturalLight: z.enum(['excellent', 'good', 'fair', 'poor']),
  noiseLevel: z.enum(['quiet', 'moderate', 'noisy']),
  
  // Next steps
  followUpRequired: z.boolean(),
  followUpDate: z.string().optional(),
  estimatedRepairCost: z.number().optional(),
});

type InspectionFormData = z.infer<typeof inspectionSchema>;

const inspectionTypes = [
  { value: 'routine', label: 'Routine Inspection', description: 'Regular property check' },
  { value: 'pre_lease', label: 'Pre-Lease Inspection', description: 'Before new tenant moves in' },
  { value: 'post_lease', label: 'Post-Lease Inspection', description: 'After tenant moves out' },
  { value: 'maintenance', label: 'Maintenance Inspection', description: 'Following maintenance work' },
  { value: 'emergency', label: 'Emergency Inspection', description: 'Urgent issue assessment' },
];

const conditionAreas = [
  { key: 'structural', label: 'Structural', icon: Home, description: 'Walls, ceiling, floors, doors, windows' },
  { key: 'electrical', label: 'Electrical', icon: Zap, description: 'Wiring, outlets, fixtures, breakers' },
  { key: 'plumbing', label: 'Plumbing', icon: Droplets, description: 'Pipes, taps, toilets, drainage' },
  { key: 'security', label: 'Security', icon: Shield, description: 'Locks, gates, alarms, lighting' },
];

const ratingScale = [
  { value: 1, label: 'Poor', color: 'text-red-600', description: 'Immediate attention required' },
  { value: 2, label: 'Below Average', color: 'text-orange-600', description: 'Needs improvement' },
  { value: 3, label: 'Average', color: 'text-yellow-600', description: 'Acceptable condition' },
  { value: 4, label: 'Good', color: 'text-blue-600', description: 'Well maintained' },
  { value: 5, label: 'Excellent', color: 'text-green-600', description: 'Outstanding condition' },
];

interface MobileInspectionFormProps {
  propertyId?: string;
  unitId?: string;
  onSubmitSuccess?: () => void;
}

export default function MobileInspectionForm({ 
  propertyId: defaultPropertyId, 
  unitId: defaultUnitId,
  onSubmitSuccess 
}: MobileInspectionFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const { uploadMultipleFiles, uploading } = useMediaUpload();
  const { currentLocation, checkInToProperty, checkOutFromProperty } = useLocationTracking(user?.id || '');

  const form = useForm<InspectionFormData>({
    resolver: zodResolver(inspectionSchema),
    defaultValues: {
      propertyId: defaultPropertyId || '',
      unitId: defaultUnitId || '',
      inspectionType: 'routine',
      overallCondition: 3,
      structuralCondition: 3,
      electricalCondition: 3,
      plumbingCondition: 3,
      cleanlinessRating: 3,
      waterPressure: 'good',
      powerSupply: 'stable',
      internetConnectivity: 'good',
      ventilation: 'good',
      naturalLight: 'good',
      noiseLevel: 'moderate',
      followUpRequired: false,
    },
  });

  // Start camera for photo capture
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      setError('Camera access denied. Please enable camera permissions.');
    }
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File(
              [blob], 
              `inspection_${Date.now()}.jpg`, 
              { type: 'image/jpeg' }
            );
            setCapturedPhotos(prev => [...prev, file]);
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Remove captured photo
  const removePhoto = (index: number) => {
    setCapturedPhotos(photos => photos.filter((_, i) => i !== index));
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setCapturedPhotos(prev => [...prev, ...files].slice(0, 20)); // Max 20 photos
  };

  // Submit inspection report
  const onSubmit = async (data: InspectionFormData) => {
    if (!user || !currentLocation) {
      setError('Location required for inspection. Please enable GPS.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Check in to property if not already checked in
      if (data.propertyId) {
        await checkInToProperty(data.propertyId, 'inspection');
      }

      // Create inspection report
      const inspectionData = {
        ...data,
        agentId: user.id,
        agentName: `${user.profile?.firstName || 'Unknown'} ${user.profile?.lastName || ''}`,
        location: currentLocation,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'completed',
        photos: [] as string[],
      };

      const docRef = await addDoc(collection(db, 'inspections'), inspectionData);

      // Upload photos if any
      if (capturedPhotos.length > 0) {
        const photoUrls = await uploadMultipleFiles(
          capturedPhotos,
          `inspections/${docRef.id}`,
          { maxSize: 10, allowedTypes: ['image/*'], compression: true }
        );
        
        // Update inspection with photo URLs
        inspectionData.photos = photoUrls;
      }

      // Check out from property
      if (data.propertyId) {
        await checkOutFromProperty(
          'Inspection completed successfully',
          inspectionData.photos
        );
      }

      setSuccess(true);
      form.reset();
      setCapturedPhotos([]);
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

    } catch (error: any) {
      console.error('Error submitting inspection:', error);
      setError(error.message || 'Failed to submit inspection. Please try again.');
    } finally {
      setIsSubmitting(false);
      stopCamera();
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
            <h3 className="text-lg font-semibold mb-2">Inspection Completed</h3>
            <p className="text-gray-600 mb-4">
              Inspection report has been submitted and property owners will be notified.
            </p>
            <Button onClick={() => setSuccess(false)}>
              Conduct Another Inspection
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Location Status */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">GPS Location</span>
            </div>
            {currentLocation ? (
              <div className="text-xs text-green-600">✓ Active</div>
            ) : (
              <div className="text-xs text-red-600">⚠ No GPS</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Camera Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Property Photos
          </CardTitle>
          <CardDescription>
            Take photos of key areas and any issues found
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isCameraActive ? (
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={startCamera} className="h-20">
                <div className="flex flex-col items-center">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-xs">Start Camera</span>
                </div>
              </Button>
              
              <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                <Upload className="w-6 h-6 mb-1 text-gray-400" />
                <span className="text-xs text-gray-600">Upload Photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-h-64 bg-black rounded-lg"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={capturePhoto} className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  Capture Photo
                </Button>
                <Button onClick={stopCamera} variant="outline">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Photo Gallery */}
          {capturedPhotos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {capturedPhotos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Inspection photo ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0"
                    onClick={() => removePhoto(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inspection Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Property Inspection Report
          </CardTitle>
          <CardDescription>
            Complete assessment of property condition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="inspectionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inspection Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {inspectionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div>{type.label}</div>
                                <div className="text-xs text-gray-500">{type.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Condition Ratings */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Property Condition Assessment</h3>
                
                {conditionAreas.map((area) => {
                  const Icon = area.icon;
                  const fieldName = `${area.key}Condition` as keyof InspectionFormData;
                  
                  return (
                    <div key={area.key} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-blue-600" />
                        <h4 className="font-medium">{area.label}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{area.description}</p>
                      
                      <FormField
                        control={form.control}
                        name={fieldName}
                        render={({ field }) => (
                          <FormItem>
                            <div className="grid grid-cols-5 gap-2">
                              {ratingScale.map((rating) => (
                                <Button
                                  key={rating.value}
                                  type="button"
                                  variant={field.value === rating.value ? "default" : "outline"}
                                  className="h-16 flex flex-col p-2"
                                  onClick={() => field.onChange(rating.value)}
                                >
                                  <Star className={`w-4 h-4 mb-1 ${
                                    field.value === rating.value ? 'text-white' : rating.color
                                  }`} />
                                  <span className="text-xs">{rating.label}</span>
                                </Button>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Selected: {ratingScale.find(r => r.value === field.value)?.description}
                            </p>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`${area.key}Notes` as keyof InspectionFormData}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder={`Additional notes about ${area.label.toLowerCase()}...`}
                                className="h-20"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  );
                })}

                {/* Overall Condition */}
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium">Overall Property Condition</h4>
                  <FormField
                    control={form.control}
                    name="overallCondition"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid grid-cols-5 gap-2">
                          {ratingScale.map((rating) => (
                            <Button
                              key={rating.value}
                              type="button"
                              variant={field.value === rating.value ? "default" : "outline"}
                              className="h-16 flex flex-col p-2"
                              onClick={() => field.onChange(rating.value)}
                            >
                              <Star className={`w-5 h-5 mb-1 ${
                                field.value === rating.value ? 'text-white' : rating.color
                              }`} />
                              <span className="text-xs">{rating.label}</span>
                            </Button>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Zimbabwe-Specific Assessments */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Infrastructure & Utilities</h3>
                
                <FormField
                  control={form.control}
                  name="waterPressure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Water Pressure</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent - Strong flow</SelectItem>
                          <SelectItem value="good">Good - Adequate flow</SelectItem>
                          <SelectItem value="fair">Fair - Low pressure</SelectItem>
                          <SelectItem value="poor">Poor - Very low/intermittent</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="powerSupply"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Power Supply</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="stable">Stable - No outages</SelectItem>
                          <SelectItem value="intermittent">Intermittent - Occasional outages</SelectItem>
                          <SelectItem value="issues">Issues - Frequent outages</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="internetConnectivity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internet Connectivity</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent - Fiber available</SelectItem>
                          <SelectItem value="good">Good - ADSL/4G available</SelectItem>
                          <SelectItem value="fair">Fair - Basic connectivity</SelectItem>
                          <SelectItem value="poor">Poor - Limited options</SelectItem>
                          <SelectItem value="none">None - No connectivity</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Recommendations */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Summary & Recommendations</h3>
                
                <FormField
                  control={form.control}
                  name="recommendations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recommendations</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Recommendations for improvements, repairs, or maintenance..."
                          className="h-32"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="followUpRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Follow-up Required</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimatedRepairCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Repair Cost (USD)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || uploading || !currentLocation}
              >
                {isSubmitting || uploading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    {uploading ? 'Uploading photos...' : 'Submitting inspection...'}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Inspection Report
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}