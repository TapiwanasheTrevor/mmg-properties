"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Phone, Mail, MapPin, DollarSign, Eye, Edit } from "lucide-react"

interface TenantManagementProps {
  onTenantSelect?: () => void
}

export function TenantManagement({ onTenantSelect }: TenantManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const tenants = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1 (555) 123-4567",
      avatar: "/placeholder-user.jpg",
      property: "Sunset Apartments",
      unit: "Unit A2",
      rentAmount: 1200,
      leaseStart: "2023-01-15",
      leaseEnd: "2024-01-15",
      status: "active",
      paymentStatus: "current",
      lastPayment: "2023-12-01",
      occupation: "Software Engineer",
      emergencyContact: {
        name: "Jane Smith",
        phone: "+1 (555) 987-6543",
        relationship: "Spouse",
      },
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "+1 (555) 234-5678",
      avatar: "/placeholder-user.jpg",
      property: "Downtown Complex",
      unit: "Unit B5",
      rentAmount: 1500,
      leaseStart: "2023-06-01",
      leaseEnd: "2024-06-01",
      status: "active",
      paymentStatus: "late",
      lastPayment: "2023-11-15",
      occupation: "Marketing Manager",
      emergencyContact: {
        name: "Robert Johnson",
        phone: "+1 (555) 876-5432",
        relationship: "Father",
      },
    },
    {
      id: 3,
      name: "David Wilson",
      email: "d.wilson@email.com",
      phone: "+1 (555) 345-6789",
      avatar: "/placeholder-user.jpg",
      property: "Garden View",
      unit: "Unit C1",
      rentAmount: 950,
      leaseStart: "2023-03-01",
      leaseEnd: "2024-03-01",
      status: "notice_given",
      paymentStatus: "current",
      lastPayment: "2023-12-01",
      occupation: "Teacher",
      emergencyContact: {
        name: "Mary Wilson",
        phone: "+1 (555) 765-4321",
        relationship: "Mother",
      },
    },
  ]

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.unit.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "notice_given":
        return "bg-yellow-100 text-yellow-800"
      case "former":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "current":
        return "bg-green-100 text-green-800"
      case "late":
        return "bg-red-100 text-red-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tenant Management</h2>
          <p className="text-muted-foreground">Manage your tenants and lease agreements</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Tenant</DialogTitle>
              <DialogDescription>Create a new tenant profile and lease agreement</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Input placeholder="Enter first name" />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input placeholder="Enter last name" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="tenant@email.com" />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input placeholder="+1 (555) 123-4567" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Property</label>
                  <Input placeholder="Select property" />
                </div>
                <div>
                  <label className="text-sm font-medium">Unit</label>
                  <Input placeholder="Select unit" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Rent Amount</label>
                  <Input type="number" placeholder="1200" />
                </div>
                <div>
                  <label className="text-sm font-medium">Lease Start Date</label>
                  <Input type="date" />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button>Add Tenant</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search tenants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">Filter</Button>
        <Button variant="outline">Export</Button>
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTenants.map((tenant) => (
          <Card key={tenant.id}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={tenant.avatar || "/placeholder.svg"} alt={tenant.name} />
                  <AvatarFallback>
                    {tenant.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{tenant.name}</CardTitle>
                  <CardDescription>{tenant.occupation}</CardDescription>
                </div>
                <div className="flex flex-col space-y-1">
                  <Badge className={getStatusColor(tenant.status)}>{tenant.status.replace("_", " ")}</Badge>
                  <Badge className={getPaymentStatusColor(tenant.paymentStatus)}>{tenant.paymentStatus}</Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2" />
                  {tenant.property} - {tenant.unit}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 mr-2" />
                  {tenant.email}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 mr-2" />
                  {tenant.phone}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Monthly Rent</span>
                  <span className="font-semibold">${tenant.rentAmount}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Lease Expires</span>
                  <span className="text-sm">{new Date(tenant.leaseEnd).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Payment</span>
                  <span className="text-sm">{new Date(tenant.lastPayment).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={onTenantSelect}>
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Mail className="w-4 h-4 mr-1" />
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tenants</p>
                <p className="text-2xl font-bold">{tenants.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">{tenants.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Leases</p>
                <p className="text-2xl font-bold">{tenants.filter((t) => t.status === "active").length}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">
                  {tenants.filter((t) => t.status === "active").length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Late Payments</p>
                <p className="text-2xl font-bold text-red-600">
                  {tenants.filter((t) => t.paymentStatus === "late").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-semibold">
                  {tenants.filter((t) => t.paymentStatus === "late").length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  ${tenants.reduce((sum, t) => sum + t.rentAmount, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
