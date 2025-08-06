import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Building2, DollarSign, Users, TrendingUp, AlertCircle } from "lucide-react"

export default function OwnerDashboard() {
  return (
    <div className="space-y-6">
      {/* Owner Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Across 3 locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$18,450</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied Units</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42/48</div>
            <p className="text-xs text-muted-foreground">87.5% occupancy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">2 require approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Portfolio */}
        <Card>
          <CardHeader>
            <CardTitle>Property Portfolio</CardTitle>
            <CardDescription>Your properties and their performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Sunset Apartments", units: "20 units", income: "$8,500", occupancy: 95 },
              { name: "Downtown Lofts", units: "15 units", income: "$6,200", occupancy: 88 },
              { name: "Garden Cottages", units: "8 units", income: "$2,800", occupancy: 100 },
              { name: "Riverside Complex", units: "5 units", income: "$950", occupancy: 60 },
            ].map((property) => (
              <div key={property.name} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{property.name}</h4>
                    <p className="text-sm text-muted-foreground">{property.units}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{property.income}/mo</p>
                    <Badge
                      variant={
                        property.occupancy >= 90 ? "default" : property.occupancy >= 70 ? "secondary" : "destructive"
                      }
                    >
                      {property.occupancy}% occupied
                    </Badge>
                  </div>
                </div>
                <Progress value={property.occupancy} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your properties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { type: "payment", message: "Rent payment received from Unit A5", time: "2 hours ago", amount: "$1,200" },
              { type: "request", message: "Maintenance request for Unit B3", time: "5 hours ago", status: "pending" },
              { type: "lease", message: "New lease signed for Unit C2", time: "1 day ago", tenant: "Sarah Johnson" },
              { type: "payment", message: "Rent payment received from Unit A2", time: "2 days ago", amount: "$950" },
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === "payment"
                      ? "bg-green-500"
                      : activity.type === "request"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                {activity.amount && <Badge variant="outline">{activity.amount}</Badge>}
                {activity.status && <Badge variant="secondary">{activity.status}</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
          <CardDescription>Income and expenses overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">$18,450</div>
              <p className="text-sm text-muted-foreground">Total Income</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">$3,200</div>
              <p className="text-sm text-muted-foreground">Maintenance Costs</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">$15,250</div>
              <p className="text-sm text-muted-foreground">Net Profit</p>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Button>
              <TrendingUp className="w-4 h-4 mr-2" />
              View Detailed Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
