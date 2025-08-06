"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle,
  Upload,
  MessageSquare,
  Calendar,
  User,
} from "lucide-react"

export function MaintenanceRequests() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRequest, setSelectedRequest] = useState<any>(null)

  const requests = [
    {
      id: 1,
      title: "Kitchen faucet leaking",
      description:
        "The kitchen faucet has been dripping constantly for the past week. Water is pooling under the sink.",
      property: "Sunset Apartments",
      unit: "Unit A2",
      tenant: "John Smith",
      tenantAvatar: "/placeholder-user.jpg",
      priority: "high",
      status: "pending",
      category: "plumbing",
      createdAt: "2023-12-15T10:30:00Z",
      assignedTo: "Mike Johnson",
      images: ["/placeholder.svg?height=200&width=300"],
      comments: [
        {
          user: "John Smith",
          message: "The leak is getting worse. Please prioritize this.",
          timestamp: "2023-12-15T14:30:00Z",
        },
      ],
    },
    {
      id: 2,
      title: "Broken window in bedroom",
      description: "Window won't close properly and there's a crack in the glass.",
      property: "Downtown Complex",
      unit: "Unit B5",
      tenant: "Sarah Johnson",
      tenantAvatar: "/placeholder-user.jpg",
      priority: "medium",
      status: "in_progress",
      category: "structural",
      createdAt: "2023-12-14T09:15:00Z",
      assignedTo: "Mike Johnson",
      images: ["/placeholder.svg?height=200&width=300"],
      comments: [],
    },
    {
      id: 3,
      title: "AC unit not cooling",
      description: "Air conditioning unit is running but not producing cold air.",
      property: "Garden View",
      unit: "Unit C1",
      tenant: "David Wilson",
      tenantAvatar: "/placeholder-user.jpg",
      priority: "high",
      status: "completed",
      category: "appliance",
      createdAt: "2023-12-13T16:45:00Z",
      assignedTo: "Lisa Chen",
      completedAt: "2023-12-14T11:30:00Z",
      images: ["/placeholder.svg?height=200&width=300"],
      completionProof: ["/placeholder.svg?height=200&width=300"],
      comments: [
        {
          user: "Lisa Chen",
          message: "Replaced the refrigerant and cleaned the filters. AC is working properly now.",
          timestamp: "2023-12-14T11:30:00Z",
        },
      ],
    },
  ]

  const filteredRequests = requests.filter(
    (request) =>
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.unit.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Maintenance Requests</h2>
          <p className="text-muted-foreground">Track and manage maintenance requests</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Maintenance Request</DialogTitle>
              <DialogDescription>Submit a new maintenance request for your property</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Property</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunset">Sunset Apartments</SelectItem>
                      <SelectItem value="downtown">Downtown Complex</SelectItem>
                      <SelectItem value="garden">Garden View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Unit</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a1">Unit A1</SelectItem>
                      <SelectItem value="a2">Unit A2</SelectItem>
                      <SelectItem value="b1">Unit B1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="appliance">Appliance</SelectItem>
                      <SelectItem value="structural">Structural</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Title</label>
                <Input placeholder="Brief description of the issue" />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea placeholder="Detailed description of the maintenance issue" rows={4} />
              </div>

              <div>
                <label className="text-sm font-medium">Photos/Videos</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, MP4 up to 10MB each</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button>Submit Request</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
        <Select defaultValue="all">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{request.title}</h3>
                    <Badge className={getPriorityColor(request.priority)}>{request.priority}</Badge>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status === "in_progress" && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {request.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                      {request.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                      {request.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground mb-3">{request.description}</p>

                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={request.tenantAvatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {request.tenant
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span>{request.tenant}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>
                        {request.property} - {request.unit}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                    {request.assignedTo && (
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>Assigned to {request.assignedTo}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {request.images.length > 0 && (
                    <Badge variant="outline">
                      {request.images.length} photo{request.images.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                  {request.comments.length > 0 && (
                    <Badge variant="outline">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {request.comments.length}
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                {selectedRequest.title}
                <Badge className={getPriorityColor(selectedRequest.priority)}>{selectedRequest.priority}</Badge>
                <Badge className={getStatusColor(selectedRequest.status)}>
                  {selectedRequest.status.replace("_", " ")}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {selectedRequest.property} - {selectedRequest.unit}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">{selectedRequest.description}</p>
              </div>

              {selectedRequest.images.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Photos</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRequest.images.map((image, index) => (
                      <img
                        key={index}
                        src={image || "/placeholder.svg"}
                        alt={`Request photo ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.completionProof && (
                <div>
                  <h4 className="font-medium mb-2">Completion Proof</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRequest.completionProof.map((image, index) => (
                      <img
                        key={index}
                        src={image || "/placeholder.svg"}
                        alt={`Completion photo ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Request Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Submitted by:</span>
                    <p className="font-medium">{selectedRequest.tenant}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <p className="font-medium capitalize">{selectedRequest.category}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <p className="font-medium">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                  </div>
                  {selectedRequest.completedAt && (
                    <div>
                      <span className="text-muted-foreground">Completed:</span>
                      <p className="font-medium">{new Date(selectedRequest.completedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedRequest.comments.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Comments</h4>
                  <div className="space-y-3">
                    {selectedRequest.comments.map((comment, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm">{comment.user}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Add Comment</Button>
                {selectedRequest.status === "pending" && <Button>Assign Agent</Button>}
                {selectedRequest.status === "in_progress" && <Button>Mark Complete</Button>}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
