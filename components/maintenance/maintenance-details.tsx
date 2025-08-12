'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Wrench, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Edit,
  Phone,
  Mail,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import Link from 'next/link';

interface MaintenanceDetailsProps {
  maintenanceId: string;
}

export default function MaintenanceDetails({ maintenanceId }: MaintenanceDetailsProps) {
  const router = useRouter();
  const [maintenance, setMaintenance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockMaintenance = {
      id: maintenanceId,
      title: 'Leaking faucet in kitchen',
      description: 'The kitchen faucet has been leaking for 3 days. Water is dripping constantly and needs immediate attention.',
      category: 'plumbing',
      priority: 'high',
      status: 'in_progress',
      property: {
        id: 'prop1',
        name: 'Sunset Apartments',
        address: '123 Property Ave, Harare'
      },
      unit: {
        id: 'unit1',
        number: 'A101',
        tenant: {
          name: 'John Smith',
          phone: '+263 77 123 4567',
          email: 'john.smith@email.com'
        }
      },
      requestedBy: {
        id: 'tenant1',
        name: 'John Smith',
        role: 'tenant',
        phone: '+263 77 123 4567',
        email: 'john.smith@email.com'
      },
      assignedTo: {
        id: 'tech1',
        name: 'Mike Johnson',
        company: 'Fix-It Services',
        phone: '+263 77 987 6543',
        email: 'mike@fixitservices.com'
      },
      estimatedCost: 150,
      actualCost: 0,
      images: [
        '/placeholder.svg?height=200&width=300',
        '/placeholder.svg?height=200&width=300'
      ],
      dates: {
        requested: '2024-01-15T09:00:00Z',
        scheduled: '2024-01-16T14:00:00Z',
        started: '2024-01-16T14:30:00Z',
        completed: null
      },
      updates: [
        {
          id: '1',
          timestamp: '2024-01-15T09:00:00Z',
          author: 'John Smith',
          message: 'Maintenance request submitted',
          type: 'system'
        },
        {
          id: '2',
          timestamp: '2024-01-15T10:30:00Z',
          author: 'Admin',
          message: 'Request reviewed and approved. Assigned to Mike Johnson from Fix-It Services.',
          type: 'update'
        },
        {
          id: '3',
          timestamp: '2024-01-16T14:30:00Z',
          author: 'Mike Johnson',
          message: 'Started work on the faucet repair. Need to replace the cartridge.',
          type: 'update'
        }
      ],
      notes: 'Tenant reported the issue during morning hours. High priority due to water waste.'
    };
    
    setTimeout(() => {
      setMaintenance(mockMaintenance);
      setLoading(false);
    }, 1000);
  }, [maintenanceId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'plumbing': return '🚿';
      case 'electrical': return '⚡';
      case 'hvac': return '❄️';
      case 'appliances': return '🔧';
      case 'structural': return '🏗️';
      default: return '🔨';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!maintenance) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Maintenance Request Not Found</h2>
        <p className="text-gray-600 mt-2">The maintenance request you're looking for doesn't exist.</p>
        <Button className="mt-4" onClick={() => router.push('/maintenance')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Maintenance
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{getCategoryIcon(maintenance.category)}</span>
              <h1 className="text-3xl font-bold text-gray-900">{maintenance.title}</h1>
            </div>
            <p className="text-gray-600">{maintenance.property.name} - Unit {maintenance.unit.number}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(maintenance.status)}>
            {maintenance.status.replace('_', ' ').charAt(0).toUpperCase() + maintenance.status.slice(1)}
          </Badge>
          <Badge className={getPriorityColor(maintenance.priority)}>
            {maintenance.priority.charAt(0).toUpperCase() + maintenance.priority.slice(1)} Priority
          </Badge>
          
          <Button variant="outline" size="sm" asChild>
            <Link href={`/maintenance/${maintenanceId}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${maintenance.estimatedCost?.toLocaleString() || 'TBD'}
            </div>
            <p className="text-xs text-muted-foreground">estimated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requested</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(maintenance.dates.requested).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">request date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Category</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {maintenance.category.charAt(0).toUpperCase() + maintenance.category.slice(1)}
            </div>
            <p className="text-xs text-muted-foreground">maintenance type</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned To</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {maintenance.assignedTo?.name || 'Unassigned'}
            </div>
            <p className="text-xs text-muted-foreground">{maintenance.assignedTo?.company || 'technician'}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Request Information</CardTitle>
                <CardDescription>Details about the maintenance request</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{maintenance.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{maintenance.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <Badge className={getPriorityColor(maintenance.priority)}>
                      {maintenance.priority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="font-medium">{maintenance.notes}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location & Costs</CardTitle>
                <CardDescription>Property and financial information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Property</p>
                  <p className="font-medium">{maintenance.property.name}</p>
                  <p className="text-sm text-gray-600">{maintenance.property.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unit</p>
                  <p className="font-medium">Unit {maintenance.unit.number}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Cost</p>
                    <p className="font-medium text-green-600">${maintenance.estimatedCost}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Actual Cost</p>
                    <p className="font-medium">{maintenance.actualCost ? `$${maintenance.actualCost}` : 'TBD'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline & Updates</CardTitle>
              <CardDescription>Chronological history of this maintenance request</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenance.updates.map((update: any) => (
                  <div key={update.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {update.type === 'system' ? (
                        <Clock className="w-5 h-5 text-blue-500 mt-1" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{update.author}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(update.timestamp).toLocaleDateString()} at {new Date(update.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{update.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>Photos related to this maintenance request</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {maintenance.images.map((image: string, index: number) => (
                  <div key={index} className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`Maintenance image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Requested By</CardTitle>
                <CardDescription>Person who submitted the request</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{maintenance.requestedBy.name}</p>
                    <p className="text-sm text-muted-foreground">{maintenance.requestedBy.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <p className="font-medium">{maintenance.requestedBy.phone}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <p className="font-medium">{maintenance.requestedBy.email}</p>
                </div>
              </CardContent>
            </Card>

            {maintenance.assignedTo && (
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Technician</CardTitle>
                  <CardDescription>Service provider handling the request</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{maintenance.assignedTo.name}</p>
                      <p className="text-sm text-muted-foreground">{maintenance.assignedTo.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <p className="font-medium">{maintenance.assignedTo.phone}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <p className="font-medium">{maintenance.assignedTo.email}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}