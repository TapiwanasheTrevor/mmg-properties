import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, DollarSign, Wrench, Calendar, FileText, Phone, Mail } from "lucide-react"

export default function TenantDashboard() {
  return (
    <div className="space-y-6">
      {/* Tenant Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Rent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,200</div>
            <p className="text-xs text-muted-foreground">Due on 1st of each month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lease Expires</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8 months</div>
            <p className="text-xs text-muted-foreground">August 15, 2024</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">1 in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Paid</div>
            <p className="text-xs text-muted-foreground">Next due: Jan 1, 2024</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unit Information */}
        <Card>
          <CardHeader>
            <CardTitle>My Unit</CardTitle>
            <CardDescription>Unit A5 - Sunset Apartments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <Home className="w-8 h-8 text-gray-500" />
              </div>
              <div>
                <h3 className="font-medium">2 Bedroom Apartment</h3>
                <p className="text-sm text-muted-foreground">750 sq ft</p>
                <p className="text-sm text-muted-foreground">5th Floor</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Air Conditioning</Badge>
                <Badge variant="outline">Balcony</Badge>
                <Badge variant="outline">Parking Space</Badge>
                <Badge variant="outline">Gym Access</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Property Manager</h4>
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder-user.jpg" alt="Agent" />
                  <AvatarFallback>MJ</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Mike Johnson</p>
                  <p className="text-xs text-muted-foreground">Property Agent</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Phone className="w-4 h-4 mr-1" />
                  Call
                </Button>
                <Button size="sm" variant="outline">
                  <Mail className="w-4 h-4 mr-1" />
                  Email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Requests */}
        <Card>
          <CardHeader>
            <CardTitle>My Maintenance Requests</CardTitle>
            <CardDescription>Track your submitted requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                id: 1,
                title: "Kitchen faucet dripping",
                status: "in_progress",
                submitted: "2 days ago",
                priority: "medium",
              },
              {
                id: 2,
                title: "Bathroom light not working",
                status: "pending",
                submitted: "5 days ago",
                priority: "low",
              },
              {
                id: 3,
                title: "AC unit making noise",
                status: "completed",
                submitted: "1 week ago",
                priority: "high",
              },
            ].map((request) => (
              <div key={request.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{request.title}</h4>
                    <p className="text-sm text-muted-foreground">Submitted {request.submitted}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge
                      variant={
                        request.status === "completed"
                          ? "default"
                          : request.status === "in_progress"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {request.status.replace("_", " ")}
                    </Badge>
                    <Badge
                      variant={
                        request.priority === "high"
                          ? "destructive"
                          : request.priority === "medium"
                            ? "default"
                            : "secondary"
                      }
                      size="sm"
                    >
                      {request.priority}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            ))}

            <Button className="w-full">
              <Wrench className="w-4 h-4 mr-2" />
              Submit New Request
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Your payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: "Dec 1, 2023", amount: "$1,200", type: "Rent", status: "Paid", method: "Bank Transfer" },
              { date: "Nov 1, 2023", amount: "$1,200", type: "Rent", status: "Paid", method: "Bank Transfer" },
              { date: "Oct 1, 2023", amount: "$1,200", type: "Rent", status: "Paid", method: "Bank Transfer" },
              { date: "Sep 15, 2023", amount: "$50", type: "Late Fee", status: "Paid", method: "Card" },
            ].map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{payment.type}</p>
                  <p className="text-sm text-muted-foreground">{payment.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{payment.amount}</p>
                  <p className="text-sm text-muted-foreground">{payment.method}</p>
                </div>
                <Badge variant="default">{payment.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
