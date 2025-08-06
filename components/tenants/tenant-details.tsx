"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Download,
  Send,
  CreditCard,
  Receipt,
} from "lucide-react"

interface TenantDetailsProps {
  onBack: () => void
}

export function TenantDetails({ onBack }: TenantDetailsProps) {
  const [newMessage, setNewMessage] = useState("")

  const tenant = {
    id: 1,
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    avatar: "/placeholder-user.jpg",
    property: "Sunset Apartments",
    unit: "Unit A2",
    rentAmount: 1200,
    securityDeposit: 1200,
    leaseStart: "2023-01-15",
    leaseEnd: "2024-01-15",
    status: "active",
    paymentStatus: "current",
    lastPayment: "2023-12-01",
    occupation: "Software Engineer",
    dateOfBirth: "1990-05-15",
    ssn: "***-**-4567",
    emergencyContact: {
      name: "Jane Smith",
      phone: "+1 (555) 987-6543",
      relationship: "Spouse",
      email: "jane.smith@email.com",
    },
    moveInDate: "2023-01-15",
    previousAddress: "456 Oak Street, Springfield, IL 62701",
    employer: "Tech Solutions Inc.",
    monthlyIncome: 5500,
  }

  const paymentHistory = [
    {
      id: 1,
      date: "2023-12-01",
      type: "Rent",
      amount: 1200,
      status: "paid",
      method: "Bank Transfer",
      reference: "TXN-001234",
      dueDate: "2023-12-01",
      paidDate: "2023-12-01",
    },
    {
      id: 2,
      date: "2023-11-01",
      type: "Rent",
      amount: 1200,
      status: "paid",
      method: "Bank Transfer",
      reference: "TXN-001233",
      dueDate: "2023-11-01",
      paidDate: "2023-11-01",
    },
    {
      id: 3,
      date: "2023-10-01",
      type: "Rent",
      amount: 1200,
      status: "paid",
      method: "Check",
      reference: "CHK-5678",
      dueDate: "2023-10-01",
      paidDate: "2023-10-03",
    },
    {
      id: 4,
      date: "2023-09-15",
      type: "Late Fee",
      amount: 50,
      status: "paid",
      method: "Card",
      reference: "TXN-001231",
      dueDate: "2023-09-05",
      paidDate: "2023-09-15",
    },
    {
      id: 5,
      date: "2023-09-01",
      type: "Rent",
      amount: 1200,
      status: "paid",
      method: "Bank Transfer",
      reference: "TXN-001230",
      dueDate: "2023-09-01",
      paidDate: "2023-09-05",
    },
  ]

  const correspondence = [
    {
      id: 1,
      type: "email",
      subject: "Lease Renewal Discussion",
      from: "Property Manager",
      to: "John Smith",
      date: "2023-12-10T14:30:00Z",
      content:
        "Hi John, I hope this email finds you well. As your lease is approaching its renewal date, I wanted to reach out to discuss your plans for the upcoming year. Please let me know if you'd like to schedule a meeting to discuss the renewal terms.",
      status: "sent",
    },
    {
      id: 2,
      type: "email",
      subject: "Re: Lease Renewal Discussion",
      from: "John Smith",
      to: "Property Manager",
      date: "2023-12-10T16:45:00Z",
      content:
        "Thank you for reaching out. I'm definitely interested in renewing my lease. I've been very happy with the apartment and the management. Could we schedule a meeting for next week?",
      status: "received",
    },
    {
      id: 3,
      type: "sms",
      subject: "Maintenance Update",
      from: "Property Manager",
      to: "John Smith",
      date: "2023-12-05T10:15:00Z",
      content:
        "Hi John, the maintenance team will be coming to fix your kitchen faucet tomorrow at 2 PM. Please let me know if this time works for you.",
      status: "sent",
    },
    {
      id: 4,
      type: "sms",
      subject: "Re: Maintenance Update",
      from: "John Smith",
      to: "Property Manager",
      date: "2023-12-05T10:30:00Z",
      content: "Perfect timing! I'll be working from home tomorrow. Thank you for the quick response.",
      status: "received",
    },
    {
      id: 5,
      type: "letter",
      subject: "Welcome Letter",
      from: "Property Manager",
      to: "John Smith",
      date: "2023-01-15T09:00:00Z",
      content:
        "Welcome to Sunset Apartments! We're excited to have you as our new tenant. This letter contains important information about your lease, building amenities, and contact information for any questions or concerns.",
      status: "sent",
    },
  ]

  const complaints = [
    {
      id: 1,
      title: "Noisy Neighbors",
      description: "The tenants in the unit above are consistently loud during late hours, especially on weekends.",
      category: "noise",
      priority: "medium",
      status: "resolved",
      dateSubmitted: "2023-11-20T18:30:00Z",
      dateResolved: "2023-11-25T14:20:00Z",
      resolution:
        "Spoke with upstairs neighbors and established quiet hours agreement. No further complaints received.",
    },
    {
      id: 2,
      title: "Parking Space Issue",
      description: "Someone has been parking in my assigned parking space (#15) repeatedly.",
      category: "parking",
      priority: "low",
      status: "in_progress",
      dateSubmitted: "2023-12-01T12:15:00Z",
      dateResolved: null,
      resolution: null,
    },
    {
      id: 3,
      title: "Heating Not Working Properly",
      description:
        "The heating system in my unit is not maintaining consistent temperature. It's too cold in the mornings.",
      category: "maintenance",
      priority: "high",
      status: "resolved",
      dateSubmitted: "2023-10-15T08:45:00Z",
      dateResolved: "2023-10-18T16:30:00Z",
      resolution: "HVAC technician serviced the unit and replaced faulty thermostat. System now working properly.",
    },
  ]

  const documents = [
    {
      id: 1,
      name: "Lease Agreement",
      type: "PDF",
      size: "2.4 MB",
      date: "2023-01-15",
      category: "lease",
    },
    {
      id: 2,
      name: "Security Deposit Receipt",
      type: "PDF",
      size: "156 KB",
      date: "2023-01-15",
      category: "financial",
    },
    {
      id: 3,
      name: "Renter's Insurance Policy",
      type: "PDF",
      size: "1.8 MB",
      date: "2023-01-20",
      category: "insurance",
    },
    {
      id: 4,
      name: "Move-in Inspection Report",
      type: "PDF",
      size: "890 KB",
      date: "2023-01-15",
      category: "inspection",
    },
    {
      id: 5,
      name: "Pet Agreement",
      type: "PDF",
      size: "245 KB",
      date: "2023-03-10",
      category: "lease",
    },
  ]

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getComplaintStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getComplaintPriorityColor = (priority: string) => {
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

  const totalPaid = paymentHistory.reduce((sum, payment) => sum + payment.amount, 0)
  const onTimePayments = paymentHistory.filter((p) => p.paidDate <= p.dueDate).length
  const paymentRate = Math.round((onTimePayments / paymentHistory.length) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={tenant.avatar || "/placeholder.svg"} alt={tenant.name} />
              <AvatarFallback>
                {tenant.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{tenant.name}</h2>
              <p className="text-muted-foreground flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {tenant.property} - {tenant.unit}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={tenant.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
            {tenant.status}
          </Badge>
          <Badge
            className={tenant.paymentStatus === "current" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
          >
            {tenant.paymentStatus}
          </Badge>
          <Button variant="outline">
            <Phone className="w-4 h-4 mr-2" />
            Call
          </Button>
          <Button variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Rent</p>
                <p className="text-2xl font-bold">${tenant.rentAmount}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold">${totalPaid.toLocaleString()}</p>
              </div>
              <Receipt className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Payment Rate</p>
                <p className="text-2xl font-bold">{paymentRate}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lease Expires</p>
                <p className="text-2xl font-bold">
                  {Math.ceil((new Date(tenant.leaseEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}d
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="correspondence">Correspondence</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="font-medium">{tenant.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="font-medium">{tenant.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                    <p className="font-medium">{new Date(tenant.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">SSN</label>
                    <p className="font-medium">{tenant.ssn}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Occupation</label>
                  <p className="font-medium">{tenant.occupation}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Employer</label>
                  <p className="font-medium">{tenant.employer}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Monthly Income</label>
                  <p className="font-medium">${tenant.monthlyIncome.toLocaleString()}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Previous Address</label>
                  <p className="font-medium">{tenant.previousAddress}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lease Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Property</label>
                    <p className="font-medium">{tenant.property}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Unit</label>
                    <p className="font-medium">{tenant.unit}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Lease Start</label>
                    <p className="font-medium">{new Date(tenant.leaseStart).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Lease End</label>
                    <p className="font-medium">{new Date(tenant.leaseEnd).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Monthly Rent</label>
                    <p className="font-medium">${tenant.rentAmount}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Security Deposit</label>
                    <p className="font-medium">${tenant.securityDeposit}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Move-in Date</label>
                  <p className="font-medium">{new Date(tenant.moveInDate).toLocaleDateString()}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Lease Status</label>
                  <Badge
                    className={tenant.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                  >
                    {tenant.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {tenant.emergencyContact.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{tenant.emergencyContact.name}</p>
                  <p className="text-sm text-muted-foreground">{tenant.emergencyContact.relationship}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{tenant.emergencyContact.phone}</p>
                  <p className="text-sm text-muted-foreground">{tenant.emergencyContact.email}</p>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest tenant-related activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: "payment", message: "Rent payment received - $1,200", time: "2 days ago" },
                  {
                    type: "maintenance",
                    message: "Submitted maintenance request for kitchen faucet",
                    time: "1 week ago",
                  },
                  { type: "communication", message: "Responded to lease renewal inquiry", time: "2 weeks ago" },
                  { type: "complaint", message: "Filed noise complaint", time: "3 weeks ago" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === "payment"
                          ? "bg-green-500"
                          : activity.type === "maintenance"
                            ? "bg-yellow-500"
                            : activity.type === "communication"
                              ? "bg-blue-500"
                              : "bg-red-500"
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

        {/* Payment History Tab */}
        <TabsContent value="payments" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Payment History</h3>
              <p className="text-muted-foreground">Complete payment record for {tenant.name}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Record Payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record New Payment</DialogTitle>
                    <DialogDescription>Add a new payment record for {tenant.name}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Payment Type</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rent">Rent</SelectItem>
                            <SelectItem value="late_fee">Late Fee</SelectItem>
                            <SelectItem value="security_deposit">Security Deposit</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Amount</label>
                        <Input type="number" placeholder="0.00" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Payment Method</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="check">Check</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="card">Credit/Debit Card</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Payment Date</label>
                        <Input type="date" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Reference Number</label>
                      <Input placeholder="Transaction reference" />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline">Cancel</Button>
                      <Button>Record Payment</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                    <p className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">On-Time Payments</p>
                    <p className="text-2xl font-bold">
                      {onTimePayments}/{paymentHistory.length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Rate</p>
                    <p className="text-2xl font-bold">{paymentRate}%</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">{paymentRate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Amount</th>
                      <th className="text-left p-4 font-medium">Method</th>
                      <th className="text-left p-4 font-medium">Reference</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{new Date(payment.date).toLocaleDateString()}</p>
                            {payment.paidDate !== payment.dueDate && (
                              <p className="text-xs text-muted-foreground">
                                Due: {new Date(payment.dueDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{payment.type}</Badge>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold">${payment.amount}</span>
                        </td>
                        <td className="p-4">{payment.method}</td>
                        <td className="p-4">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">{payment.reference}</code>
                        </td>
                        <td className="p-4">
                          <Badge className={getPaymentStatusColor(payment.status)}>{payment.status}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              <FileText className="w-3 h-3 mr-1" />
                              Receipt
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Correspondence Tab */}
        <TabsContent value="correspondence" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Correspondence History</h3>
              <p className="text-muted-foreground">All communication with {tenant.name}</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Message
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Send Message to {tenant.name}</DialogTitle>
                  <DialogDescription>Send an email or SMS to the tenant</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Message Type</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
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
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Subject</label>
                    <Input placeholder="Message subject" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      placeholder="Type your message here..."
                      rows={6}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Save Draft</Button>
                    <Button>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {correspondence.map((message) => (
              <Card key={message.id}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-2 rounded-full ${
                        message.type === "email"
                          ? "bg-blue-100 text-blue-600"
                          : message.type === "sms"
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {message.type === "email" ? (
                        <Mail className="w-4 h-4" />
                      ) : message.type === "sms" ? (
                        <MessageSquare className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{message.subject}</h4>
                          <p className="text-sm text-muted-foreground">
                            {message.status === "sent" ? "To" : "From"}:{" "}
                            {message.status === "sent" ? message.to : message.from}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant="outline"
                            className={
                              message.status === "sent" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
                            }
                          >
                            {message.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(message.date).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">{message.content}</p>

                      <div className="flex items-center space-x-2 mt-3">
                        <Button variant="outline" size="sm">
                          Reply
                        </Button>
                        <Button variant="outline" size="sm">
                          Forward
                        </Button>
                        <Button variant="outline" size="sm">
                          Archive
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Complaints Tab */}
        <TabsContent value="complaints" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Complaints & Issues</h3>
              <p className="text-muted-foreground">Track and manage tenant complaints</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Log Complaint
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log New Complaint</DialogTitle>
                  <DialogDescription>Record a new complaint from {tenant.name}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Complaint Title</label>
                    <Input placeholder="Brief description of the issue" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="noise">Noise</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="parking">Parking</SelectItem>
                          <SelectItem value="neighbor">Neighbor Issues</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
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
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea placeholder="Detailed description of the complaint" rows={4} />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Log Complaint</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Complaints</p>
                    <p className="text-2xl font-bold">{complaints.length}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Resolved</p>
                    <p className="text-2xl font-bold text-green-600">
                      {complaints.filter((c) => c.status === "resolved").length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {complaints.filter((c) => c.status === "in_progress").length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {complaints.map((complaint) => (
              <Card key={complaint.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium">{complaint.title}</h4>
                        <Badge className={getComplaintPriorityColor(complaint.priority)}>{complaint.priority}</Badge>
                        <Badge className={getComplaintStatusColor(complaint.status)}>
                          {complaint.status === "resolved" && <CheckCircle className="w-3 h-3 mr-1" />}
                          {complaint.status === "in_progress" && <Clock className="w-3 h-3 mr-1" />}
                          {complaint.status === "pending" && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {complaint.status.replace("_", " ")}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">{complaint.description}</p>

                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-3">
                        <span>Category: {complaint.category}</span>
                        <span>Submitted: {new Date(complaint.dateSubmitted).toLocaleDateString()}</span>
                        {complaint.dateResolved && (
                          <span>Resolved: {new Date(complaint.dateResolved).toLocaleDateString()}</span>
                        )}
                      </div>

                      {complaint.resolution && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <h5 className="font-medium text-green-800 mb-1">Resolution</h5>
                          <p className="text-sm text-green-700">{complaint.resolution}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {complaint.status !== "resolved" && (
                        <Button variant="outline" size="sm">
                          Update Status
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Tenant Documents</h3>
              <p className="text-muted-foreground">Manage documents related to {tenant.name}</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lease Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {documents
                  .filter((doc) => doc.category === "lease")
                  .map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <span className="text-blue-600 text-xs font-semibold">{doc.type}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.size} • {doc.date}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {documents
                  .filter((doc) => doc.category === "financial")
                  .map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                          <span className="text-green-600 text-xs font-semibold">{doc.type}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.size} • {doc.date}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Other Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {documents
                  .filter((doc) => !["lease", "financial"].includes(doc.category))
                  .map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                          <span className="text-purple-600 text-xs font-semibold">{doc.type}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.size} • {doc.date}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Document Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {documents.filter((d) => d.category === "lease").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Lease Documents</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {documents.filter((d) => d.category === "financial").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Financial</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {documents.filter((d) => d.category === "insurance").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Insurance</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {documents.filter((d) => d.category === "inspection").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Inspections</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
