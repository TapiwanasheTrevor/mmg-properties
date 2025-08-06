import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertTriangle, Building2, Star, Calendar } from "lucide-react"

export default function AgentDashboard() {
  return (
    <div className="space-y-6">
      {/* Agent Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">3 new this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">2 overdue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">Based on 45 reviews</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>Maintenance requests assigned to you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                id: 1,
                title: "Fix leaking faucet",
                property: "Sunset Apartments - Unit A2",
                priority: "high",
                status: "in_progress",
                dueDate: "Today",
                tenant: "John Smith",
              },
              {
                id: 2,
                title: "Replace broken window",
                property: "Downtown Complex - Unit B5",
                priority: "medium",
                status: "pending",
                dueDate: "Tomorrow",
                tenant: "Mary Johnson",
              },
              {
                id: 3,
                title: "Electrical inspection",
                property: "Garden View - Lobby",
                priority: "high",
                status: "overdue",
                dueDate: "Yesterday",
                tenant: "Building Management",
              },
            ].map((task) => (
              <div key={task.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-muted-foreground">{task.property}</p>
                    <p className="text-xs text-muted-foreground">Tenant: {task.tenant}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge
                      variant={
                        task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"
                      }
                    >
                      {task.priority}
                    </Badge>
                    <Badge
                      variant={
                        task.status === "overdue"
                          ? "destructive"
                          : task.status === "in_progress"
                            ? "default"
                            : "outline"
                      }
                    >
                      {task.status === "in_progress" && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {task.status === "overdue" && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {task.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Due: {task.dueDate}</span>
                  <Button size="sm">Update Status</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Assigned Properties */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Properties</CardTitle>
            <CardDescription>Properties under your management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Sunset Apartments", units: 20, occupied: 19, issues: 2 },
              { name: "Downtown Complex", units: 25, occupied: 22, issues: 3 },
              { name: "Garden View", units: 12, occupied: 11, issues: 1 },
              { name: "Riverside Homes", units: 8, occupied: 7, issues: 2 },
            ].map((property) => (
              <div key={property.name} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{property.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {property.occupied}/{property.units} units occupied
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {property.issues > 0 && <Badge variant="destructive">{property.issues} issues</Badge>}
                    <Badge variant="outline">{Math.round((property.occupied / property.units) * 100)}%</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  View Details
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>Your appointments and tasks for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: "9:00 AM", task: "Property inspection - Sunset Apartments Unit A5", type: "inspection" },
              { time: "11:30 AM", task: "Meet with new tenant - Downtown Complex", type: "meeting" },
              { time: "2:00 PM", task: "Maintenance follow-up - Garden View", type: "maintenance" },
              { time: "4:00 PM", task: "Property showing - Riverside Homes Unit 3", type: "showing" },
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.task}</p>
                  <p className="text-sm text-muted-foreground">{item.time}</p>
                </div>
                <Badge variant="outline">{item.type}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
