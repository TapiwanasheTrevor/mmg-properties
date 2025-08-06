"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Home, Users, Wrench, BarChart3, Settings, Bell } from "lucide-react"

interface SidebarProps {
  userRole: "admin" | "owner" | "agent" | "tenant"
  activeScreen: string
  onScreenChange: (
    screen:
      | "dashboard"
      | "properties"
      | "property-details"
      | "requests"
      | "tenants"
      | "reports"
      | "notifications"
      | "settings",
  ) => void
}

export function Sidebar({ userRole, activeScreen, onScreenChange }: SidebarProps) {
  const getMenuItems = () => {
    const baseItems = [{ id: "dashboard", label: "Dashboard", icon: Home }]

    switch (userRole) {
      case "admin":
        return [
          ...baseItems,
          { id: "properties", label: "Properties", icon: Building2 },
          { id: "tenants", label: "Tenants", icon: Users },
          { id: "requests", label: "Maintenance", icon: Wrench, badge: 12 },
          { id: "reports", label: "Reports", icon: BarChart3 },
        ]
      case "owner":
        return [
          ...baseItems,
          { id: "properties", label: "My Properties", icon: Building2 },
          { id: "tenants", label: "My Tenants", icon: Users },
          { id: "requests", label: "Maintenance", icon: Wrench, badge: 5 },
          { id: "reports", label: "Financial Reports", icon: BarChart3 },
        ]
      case "agent":
        return [
          ...baseItems,
          { id: "properties", label: "Assigned Properties", icon: Building2 },
          { id: "requests", label: "My Tasks", icon: Wrench, badge: 8 },
          { id: "tenants", label: "Tenants", icon: Users },
        ]
      case "tenant":
        return [...baseItems, { id: "requests", label: "My Requests", icon: Wrench, badge: 2 }]
      default:
        return baseItems
    }
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">MMG</h1>
            <p className="text-sm text-gray-500">Property Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {getMenuItems().map((item) => {
          const Icon = item.icon
          const isActive = activeScreen === item.id

          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onScreenChange(item.id as any)}
            >
              <Icon className="w-4 h-4 mr-3" />
              {item.label}
              {item.badge && (
                <Badge variant="destructive" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-2">
        <Button
          variant={activeScreen === "notifications" ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => onScreenChange("notifications")}
        >
          <Bell className="w-4 h-4 mr-3" />
          Notifications
          <Badge variant="destructive" className="ml-auto">
            3
          </Badge>
        </Button>
        <Button
          variant={activeScreen === "settings" ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => onScreenChange("settings")}
        >
          <Settings className="w-4 h-4 mr-3" />
          Settings
        </Button>
      </div>
    </div>
  )
}
