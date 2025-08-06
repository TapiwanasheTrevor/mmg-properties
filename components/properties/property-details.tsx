"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  DollarSign,
  Plus,
  Edit,
  Eye,
  Phone,
  Mail,
  Square,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"

interface PropertyDetailsProps {
  onBack: () => void
}

export default function PropertyDetails({ onBack }: PropertyDetailsProps) {
  const property = {
    id: 1,
    name: "Sunset Apartments",
    address: "123 Sunset Blvd, Downtown",
    type: "apartment_complex",
    totalUnits: 20,
    occupiedUnits: 19,
    monthlyIncome: 18500,
    status: "active",
    description:
      "Modern apartment complex with premium amenities in the heart of downtown. Features include gym, pool, parking, and 24/7 security.",
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    amenities: ["Gym", "Pool", "Parking", "24/7 Security", "Laundry", "Elevator"],
    owner: {
      name: "Michael Thompson",
      email: "m.thompson@email.com",
      phone: "+1 (555) 123-4567",
      avatar: "/placeholder-user.jpg",
    },
    agent: {
      name: "Sarah Wilson",
      email: "s.wilson@mmg.com",
      phone: "+1 (555) 987-6543",
      avatar: "/placeholder-user.jpg",
    },
  }

  const units = [
    {
      id: 1,
      label: "A1",
      type: "2_bedroom",
      rent: 1200,
      status: "occupied",
      tenant: "John Smith",
      tenantAvatar: "/placeholder-user.jpg",
      leaseEnd: "2024-06-15",
      sqft: 850,
    },
    {
      id: 2,
      label: "A2",
      type: "2_bedroom",
      rent: 1200,
      status: "occupied",
      tenant: "Mary Johnson",
      tenantAvatar: "/placeholder-user.jpg",
      leaseEnd: "2024-08-30",
      sqft: 850,
    },
    {
      id: 3,
      label: "A3",
      type: "1_bedroom",
      rent: 950,
      status: "vacant",
      tenant: null,
      tenantAvatar: null,
      leaseEnd: null,
      sqft: 650,
    },
    {
      id: 4,
      label: "B1",
      type: "3_bedroom",
      rent: 1500,
      status: "occupied",
      tenant: "David Wilson",
      tenantAvatar: "/placeholder-user.jpg",
      leaseEnd: "2024-12-01",
      sqft: 1100,
    },
    {
      id: 5,
      label: "B2",
      type: "2_bedroom",
      rent: 1200,
      status: "maintenance",
      tenant: null,
      tenantAvatar: null,
      leaseEnd: null,
      sqft: 850,
    },
  ]

  const maintenanceRequests = [
    {
      id: 1,
      title: "Kitchen faucet leaking",
      unit: "A2",
      tenant: "Mary Johnson",
      priority: "high",
      status: "pending",
      createdAt: "2023-12-15T10:30:00Z",
    },
    {
      id: 2,
      title: "AC not cooling properly",
      unit: "B1",
      tenant: "David Wilson",
      priority: "medium",
      status: "in_progress",
      createdAt: "2023-12-14T14:20:00Z",
    },
    {
      id: 3,
      title: "Bathroom light fixture",
      unit: "A1",
      tenant: "John Smith",
      priority: "low",
      status: "completed",
      createdAt: "2023-12-13T09:15:00Z",
    },
  ]

  const financialData = [
    { month: "Jan", income: 18500, expenses: 3200 },
    { month: "Feb", income: 18500, expenses: 2800 },
    { month: "Mar", income: 17600, expenses: 4100 },
    { month: "Apr", income: 18500, expenses: 2900 },
    { month: "May", income: 18500, expenses: 3500 },
    { month: "Jun", income: 18500, expenses: 2600 },
  ]

  const getUnitStatusColor = (status: string) => {
    switch (status) {
      case "occupied":
        return "bg-green-100 text-green-800"
      case "vacant":
        return "bg-yellow-100 text-yellow-800"
      case "maintenance":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUnitTypeDisplay = (type: string) => {
    switch (type) {
      case "1_bedroom":
        return "1 Bed"
      case "2_bedroom":
        return "2 Bed"
      case "3_bedroom":
        return "3 Bed"
      case "studio":
        return "Studio"
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{property.name}</h2>
            <p className="text-muted-foreground flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {property.address}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-800">{property.status}</Badge>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Property
          </Button>
        </div>
      </div>

      {/* Property Images */}
      <div className="grid grid-cols-4 gap-4 h-64">
        <div className="col-span-2 row-span-2">
          <img
            src={property.images[0] || "/placeholder.svg"}
            alt="Property main"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-4">
          {property.images.slice(1, 4).map((image, index) => (
            <img
              key={index}
              src={image || "/placeholder.svg"}
              alt={`Property ${index + 2}`}
              className="w-full h-full object-cover rounded-lg"
            />
          ))}
          <div className="relative">
            <img
              src={property.images[3] || "/placeholder.svg"}
              alt="Property 4"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <Button variant="secondary">
                <Eye className="w-4 h-4 mr-2" />
                View All Photos
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Units</p>
                <p className="text-2xl font-bold">{property.totalUnits}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Occupied</p>
                <p className="text-2xl font-bold text-green-600">{property.occupiedUnits}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Income</p>
                <p className="text-2xl font-bold text-green-600">${property.monthlyIncome.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round((property.occupiedUnits / property.totalUnits) * 100)}%
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {Math.round((property.occupiedUnits / property.totalUnits) * 100)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="units">Units ({property.totalUnits})</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{property.description}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Property Type</h4>
                  <p className="text-muted-foreground capitalize">{property.type.replace("_", " ")}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Management Team</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Property Owner</h4>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={property.owner.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {property.owner.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{property.owner.name}</p>
                      <p className="text-sm text-muted-foreground">{property.owner.email}</p>
                    </div>
                    <div className="flex space-x-1">
                      <Button size="icon" variant="outline">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="outline">
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Property Agent</h4>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={property.agent.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {property.agent.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{property.agent.name}</p>
                      <p className="text-sm text-muted-foreground">{property.agent.email}</p>
                    </div>
                    <div className="flex space-x-1">
                      <Button size="icon" variant="outline">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="outline">
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from this property</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: "payment", message: "Rent payment received from Unit A1", time: "2 hours ago" },
                  { type: "maintenance", message: "Maintenance request submitted for Unit A2", time: "5 hours ago" },
                  { type: "lease", message: "Lease renewal signed for Unit B1", time: "1 day ago" },
                  { type: "tenant", message: "New tenant moved into Unit A3", time: "3 days ago" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === "payment"
                          ? "bg-green-500"
                          : activity.type === "maintenance"
                            ? "bg-yellow-500"
                            : activity.type === "lease"
                              ? "bg-blue-500"
                              : "bg-purple-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Units Tab */}
        <TabsContent value="units" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Unit Management</h3>
              <p className="text-muted-foreground">Manage individual units and tenants</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Unit
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {units.map((unit) => (
              <Card key={unit.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Unit {unit.label}</CardTitle>
                      <CardDescription>
                        {getUnitTypeDisplay(unit.type)} • {unit.sqft} sq ft
                      </CardDescription>
                    </div>
                    <Badge className={getUnitStatusColor(unit.status)}>{unit.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Monthly Rent</span>
                    <span className="font-semibold">${unit.rent}</span>
                  </div>

                  {unit.tenant && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={unit.tenantAvatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {unit.tenant
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{unit.tenant}</span>
                      </div>
                      {unit.leaseEnd && (
                        <div className="text-xs text-muted-foreground">
                          Lease expires: {new Date(unit.leaseEnd).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Unit Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {units.filter((u) => u.status === "occupied").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Occupied</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {units.filter((u) => u.status === "vacant").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Vacant</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {units.filter((u) => u.status === "maintenance").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Maintenance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Maintenance Requests</h3>
              <p className="text-muted-foreground">Track maintenance issues for this property</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </div>

          <div className="space-y-4">
            {maintenanceRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium">{request.title}</h4>
                        <Badge
                          variant={
                            request.priority === "high"
                              ? "destructive"
                              : request.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {request.priority}
                        </Badge>
                        <Badge
                          variant={
                            request.status === "completed"
                              ? "default"
                              : request.status === "in_progress"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {request.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                          {request.status === "in_progress" && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {request.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                          {request.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Unit {request.unit}</span>
                        <span>Tenant: {request.tenant}</span>
                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Open Requests</p>
                    <p className="text-2xl font-bold">
                      {maintenanceRequests.filter((r) => r.status !== "completed").length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold">
                      {maintenanceRequests.filter((r) => r.status === "in_progress").length}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">
                      {maintenanceRequests.filter((r) => r.status === "completed").length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financials Tab */}
        <TabsContent value="financials" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
                <CardDescription>Last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financialData.map((month, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{month.month}</span>
                        <span className="text-sm text-muted-foreground">
                          ${(month.income - month.expenses).toLocaleString()} profit
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Income: ${month.income.toLocaleString()}</span>
                          <span className="text-red-600">Expenses: ${month.expenses.toLocaleString()}</span>
                        </div>
                        <Progress value={((month.income - month.expenses) / month.income) * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Current month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Rent Collection</span>
                  <span className="font-semibold">${property.monthlyIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Late Fees</span>
                  <span className="font-semibold">$150</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Parking Fees</span>
                  <span className="font-semibold">$400</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total Revenue</span>
                    <span className="text-green-600">${(property.monthlyIncome + 150 + 400).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Current month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Maintenance</span>
                  <span className="font-semibold">$1,200</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Insurance</span>
                  <span className="font-semibold">$800</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Utilities</span>
                  <span className="font-semibold">$600</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Management Fee</span>
                  <span className="font-semibold">$925</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total Expenses</span>
                    <span className="text-red-600">$3,525</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Net Profit Analysis</CardTitle>
              <CardDescription>Profit margin and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-600">$15,525</div>
                  <p className="text-sm text-muted-foreground">Monthly Net Profit</p>
                </div>
                <div>
                  <div className="text-3xl font-bold">82.1%</div>
                  <p className="text-sm text-muted-foreground">Profit Margin</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">+8.5%</div>
                  <p className="text-sm text-muted-foreground">YoY Growth</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Property Documents</h3>
              <p className="text-muted-foreground">Manage property-related documents and files</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Legal Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Property Deed", type: "PDF", size: "2.4 MB", date: "2023-01-15" },
                  { name: "Insurance Policy", type: "PDF", size: "1.8 MB", date: "2023-06-01" },
                  { name: "Building Permits", type: "PDF", size: "3.2 MB", date: "2022-11-20" },
                ].map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                        <span className="text-red-600 text-xs font-semibold">{doc.type}</span>
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.size} • {doc.date}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Records</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "HVAC Inspection Report", type: "PDF", size: "1.2 MB", date: "2023-12-01" },
                  { name: "Plumbing Maintenance Log", type: "PDF", size: "890 KB", date: "2023-11-15" },
                  { name: "Electrical Safety Certificate", type: "PDF", size: "1.5 MB", date: "2023-10-20" },
                ].map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-semibold">{doc.type}</span>
                      </div>
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.size} • {doc.date}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Floor Plans & Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Floor Plan - Level 1", type: "image" },
                  { name: "Floor Plan - Level 2", type: "image" },
                  { name: "Property Photos", type: "folder" },
                  { name: "Unit Layouts", type: "folder" },
                ].map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      {item.type === "image" ? (
                        <Square className="w-6 h-6 text-gray-600" />
                      ) : (
                        <Building2 className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
