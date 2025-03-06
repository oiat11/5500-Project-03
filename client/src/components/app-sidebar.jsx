import React from "react"
import { Link, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "./ui/sidebar"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { Users, Calendar } from "lucide-react" 

export function AppSidebar() {
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.auth);
  
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
      <SidebarHeader className="pt-6">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={currentUser?.avatar} alt={currentUser?.username} />
            <AvatarFallback className="rounded-lg">
              {currentUser?.username?.slice(0, 2)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{currentUser?.username}</span>
            <span className="truncate text-xs text-muted-foreground">{currentUser?.email}</span>
          </div>
        </div>
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
        <p className="text-xs text-gray-500 text-center">© 2025 Donor List Automation System</p>
      </SidebarFooter>
    </Sidebar>
  )
} 