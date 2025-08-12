"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Building2, Plus, Search, MapPin, Users, DollarSign, Eye, Edit, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PropertyManagementProps {
  onPropertySelect?: () => void
}

export function PropertyManagement({ onPropertySelect }: PropertyManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const properties = [
    {
      id: 1,
      name: "Sunset Apartments",
      address: "123 Sunset Blvd, Downtown",
      type: "apartment_complex",
      totalUnits: 20,
      occupiedUnits: 19,
      monthlyIncome: 8500,
      status: "active",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 2,
      name: "Downtown Lofts",
      address: "456 Main Street, City Center",
      type: "apartment_complex",
      totalUnits: 15,
      occupiedUnits: 13,
      monthlyIncome: 6200,
      status: "active",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 3,
      name: "Garden Cottages",
      address: "789 Garden Lane, Suburbs",
      type: "house",
      totalUnits: 8,
      occupiedUnits: 8,
      monthlyIncome: 2800,
      status: "active",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 4,
      name: "Riverside Complex",
      address: "321 River Road, Waterfront",
      type: "mixed_use",
      totalUnits: 12,
      occupiedUnits: 7,
      monthlyIncome: 3200,
      status: "maintenance",
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  const filteredProperties = properties.filter(
    (property) =>
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Property Management</h2>
          <p className="text-muted-foreground">Manage your property portfolio</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">Filter</Button>
        <Button variant="outline">Sort</Button>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="overflow-hidden">
            <div className="aspect-video relative">
              <img
                src={property.image || "/placeholder.svg"}
                alt={property.name}
                className="w-full h-full object-cover"
              />
              <Badge
                className={`absolute top-2 right-2 ${
                  property.status === "active"
                    ? "bg-green-500"
                    : property.status === "maintenance"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              >
                {property.status}
              </Badge>
            </div>

            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{property.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.address}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Property
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Users className="w-4 h-4 mr-2" />
                      Manage Tenants
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Occupancy</span>
                  <span className="font-medium">
                    {property.occupiedUnits}/{property.totalUnits} units
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(property.occupiedUnits / property.totalUnits) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Monthly Income
                  </div>
                  <span className="font-semibold text-green-600">${(property.monthlyIncome || 0).toLocaleString()}</span>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={onPropertySelect}>
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
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
                <p className="text-sm text-muted-foreground">Total Properties</p>
                <p className="text-2xl font-bold">{properties.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Units</p>
                <p className="text-2xl font-bold">{properties.reduce((sum, p) => sum + p.totalUnits, 0)}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Occupied Units</p>
                <p className="text-2xl font-bold">{properties.reduce((sum, p) => sum + p.occupiedUnits, 0)}</p>
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
                <p className="text-2xl font-bold text-green-600">
                  ${properties.reduce((sum, p) => sum + p.monthlyIncome, 0).toLocaleString()}
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
