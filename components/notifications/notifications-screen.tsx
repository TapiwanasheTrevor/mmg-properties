"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  Check,
  X,
  Clock,
  DollarSign,
  Wrench,
  Users,
  Building2,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Mail,
} from "lucide-react"

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "maintenance",
      title: "New Maintenance Request",
      message: "Kitchen faucet leaking in Unit A2, Sunset Apartments",
      timestamp: "2023-12-15T10:30:00Z",
      read: false,
      priority: "high",
      actionRequired: true,
      from: "John Smith",
      avatar: "/placeholder-user.jpg",
    },
    {
      id: 2,
      type: "payment",
      title: "Rent Payment Received",
      message: "Payment of $1,200 received from Sarah Johnson for Unit B5",
      timestamp: "2023-12-15T09:15:00Z",
      read: false,
      priority: "medium",
      actionRequired: false,
      from: "Sarah Johnson",
      avatar: "/placeholder-user.jpg",
    },
    {
      id: 3,
      type: "lease",
      title: "Lease Renewal Required",
      message: "Lease for Unit C1 expires in 30 days. Renewal action needed.",
      timestamp: "2023-12-14T16:45:00Z",
      read: true,
      priority: "medium",
      actionRequired: true,
      from: "System",
      avatar: null,
    },
    {
      id: 4,
      type: "maintenance",
      title: "Maintenance Completed",
      message: "AC repair in Unit D3 has been completed by Mike Johnson",
      timestamp: "2023-12-14T14:20:00Z",
      read: true,
      priority: "low",
      actionRequired: false,
      from: "Mike Johnson",
      avatar: "/placeholder-user.jpg",
    },
    {
      id: 5,
      type: "tenant",
      title: "New Tenant Application",
      message: "New application received for Unit A5 from Emma Davis",
      timestamp: "2023-12-13T11:30:00Z",
      read: false,
      priority: "medium",
      actionRequired: true,
      from: "Emma Davis",
      avatar: "/placeholder-user.jpg",
    },
    {
      id: 6,
      type: "payment",
      title: "Late Payment Alert",
      message: "Rent payment overdue for Unit B2. 5 days past due date.",
      timestamp: "2023-12-13T08:00:00Z",
      read: true,
      priority: "high",
      actionRequired: true,
      from: "System",
      avatar: null,
    },
  ])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "maintenance":
        return <Wrench className="w-5 h-5" />
      case "payment":
        return <DollarSign className="w-5 h-5" />
      case "lease":
        return <Calendar className="w-5 h-5" />
      case "tenant":
        return <Users className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === "high") return "text-red-600 bg-red-100"
    switch (type) {
      case "maintenance":
        return "text-orange-600 bg-orange-100"
      case "payment":
        return "text-green-600 bg-green-100"
      case "lease":
        return "text-blue-600 bg-blue-100"
      case "tenant":
        return "text-purple-600 bg-purple-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const actionRequiredCount = notifications.filter((n) => n.actionRequired && !n.read).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            {unreadCount} unread notifications • {actionRequiredCount} require action
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Email Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Action Required</p>
                <p className="text-2xl font-bold text-red-600">{actionRequiredCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold">{notifications.filter((n) => n.type === "maintenance").length}</p>
              </div>
              <Wrench className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Payments</p>
                <p className="text-2xl font-bold">{notifications.filter((n) => n.type === "payment").length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="action">Action Required ({actionRequiredCount})</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={`${!notification.read ? "border-l-4 border-l-blue-500" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-full ${getNotificationColor(notification.type, notification.priority)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            {notification.avatar ? (
                              <Avatar className="w-4 h-4">
                                <AvatarImage src={notification.avatar || "/placeholder.svg"} />
                                <AvatarFallback>{notification.from[0]}</AvatarFallback>
                              </Avatar>
                            ) : (
                              <Building2 className="w-4 h-4" />
                            )}
                            <span>{notification.from}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(notification.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {notification.actionRequired && (
                          <Badge variant="destructive" size="sm">
                            Action Required
                          </Badge>
                        )}
                        {notification.priority === "high" && (
                          <Badge variant="destructive" size="sm">
                            High Priority
                          </Badge>
                        )}
                        {!notification.read && (
                          <Badge variant="secondary" size="sm">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mt-3">
                      {!notification.read && (
                        <Button size="sm" variant="outline" onClick={() => markAsRead(notification.id)}>
                          <Check className="w-3 h-3 mr-1" />
                          Mark Read
                        </Button>
                      )}
                      {notification.actionRequired && <Button size="sm">Take Action</Button>}
                      <Button size="sm" variant="ghost" onClick={() => deleteNotification(notification.id)}>
                        <X className="w-3 h-3 mr-1" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {notifications
            .filter((n) => !n.read)
            .map((notification) => (
              <Card key={notification.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-2 rounded-full ${getNotificationColor(notification.type, notification.priority)}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                            <span>{notification.from}</span>
                            <span>{new Date(notification.timestamp).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {notification.actionRequired && (
                            <Badge variant="destructive" size="sm">
                              Action Required
                            </Badge>
                          )}
                          <Badge variant="secondary" size="sm">
                            New
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mt-3">
                        <Button size="sm" variant="outline" onClick={() => markAsRead(notification.id)}>
                          <Check className="w-3 h-3 mr-1" />
                          Mark Read
                        </Button>
                        {notification.actionRequired && <Button size="sm">Take Action</Button>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="action" className="space-y-4">
          {notifications
            .filter((n) => n.actionRequired && !n.read)
            .map((notification) => (
              <Card key={notification.id} className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 rounded-full text-red-600 bg-red-100">
                      <AlertTriangle className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-red-900">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                            <span>{notification.from}</span>
                            <span>{new Date(notification.timestamp).toLocaleString()}</span>
                          </div>
                        </div>

                        <Badge variant="destructive" size="sm">
                          Urgent
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-2 mt-3">
                        <Button size="sm">Take Action</Button>
                        <Button size="sm" variant="outline" onClick={() => markAsRead(notification.id)}>
                          Mark Read
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          {notifications
            .filter((n) => n.type === "maintenance")
            .map((notification) => (
              <Card key={notification.id} className={`${!notification.read ? "border-l-4 border-l-orange-500" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 rounded-full text-orange-600 bg-orange-100">
                      <Wrench className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                      <h4 className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>{notification.from}</span>
                        <span>{new Date(notification.timestamp).toLocaleString()}</span>
                      </div>

                      <div className="flex items-center space-x-2 mt-3">
                        {!notification.read && (
                          <Button size="sm" variant="outline" onClick={() => markAsRead(notification.id)}>
                            Mark Read
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          View Request
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          {notifications
            .filter((n) => n.type === "payment")
            .map((notification) => (
              <Card key={notification.id} className={`${!notification.read ? "border-l-4 border-l-green-500" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 rounded-full text-green-600 bg-green-100">
                      <DollarSign className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                      <h4 className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>{notification.from}</span>
                        <span>{new Date(notification.timestamp).toLocaleString()}</span>
                      </div>

                      <div className="flex items-center space-x-2 mt-3">
                        {!notification.read && (
                          <Button size="sm" variant="outline" onClick={() => markAsRead(notification.id)}>
                            Mark Read
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          View Transaction
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
