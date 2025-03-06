import React from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "./ui/sidebar"
import { Users, Calendar } from "lucide-react" 

export function AppSidebar() {
  const location = useLocation();
  
  const menuItems = [
    {
      title: "Donors",
      href: "/donors",
      icon: Users
    },
    {
      title: "Events",
      href: "/events",
      icon: Calendar
    }
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="text-lg font-semibold">Donor List Automation System</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {menuItems.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 ${
                location.pathname === item.href ? 'bg-gray-100 text-gray-900' : ''
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          ))}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <p className="text-xs text-gray-500 text-center">© 2024 DLAS</p>
      </SidebarFooter>
    </Sidebar>
  )
} 