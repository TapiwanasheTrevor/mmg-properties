import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Building2, Users, Wrench, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">92% occupancy rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">3 high priority</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Maintenance Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Maintenance Requests</CardTitle>
            <CardDescription>Latest requests requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                id: 1,
                title: "Leaking faucet in Unit A2",
                property: "Sunset Apartments",
                priority: "high",
                status: "pending",
              },
              {
                id: 2,
                title: "Broken AC in Unit B5",
                property: "Downtown Complex",
                priority: "medium",
                status: "in_progress",
              },
              {
                id: 3,
                title: "Electrical issue in lobby",
                property: "Garden View",
                priority: "high",
                status: "pending",
              },
              {
                id: 4,
                title: "Painting request for Unit C1",
                property: "Riverside Homes",
                priority: "low",
                status: "completed",
              },
            ].map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{request.title}</p>
                  <p className="text-sm text-muted-foreground">{request.property}</p>
                </div>
                <div className="flex items-center space-x-2">
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
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Property Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Property Performance</CardTitle>
            <CardDescription>Occupancy rates by property</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Sunset Apartments", occupancy: 95, units: "19/20" },
              { name: "Downtown Complex", occupancy: 88, units: "22/25" },
              { name: "Garden View", occupancy: 92, units: "11/12" },
              { name: "Riverside Homes", occupancy: 85, units: "17/20" },
            ].map((property) => (
              <div key={property.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{property.name}</span>
                  <span className="text-muted-foreground">{property.units} occupied</span>
                </div>
                <Progress value={property.occupancy} className="h-2" />
                <div className="text-right text-sm text-muted-foreground">{property.occupancy}%</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col">
              <Building2 className="w-6 h-6 mb-2" />
              Add Property
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <Users className="w-6 h-6 mb-2" />
              Add Tenant
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <Wrench className="w-6 h-6 mb-2" />
              Create Request
            </Button>
            <Button variant="outline" className="h-20 flex-col bg-transparent">
              <TrendingUp className="w-6 h-6 mb-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
