import React from 'react'
import { Routes, Route, BrowserRouter, Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar"
import { AppSidebar } from "./components/app-sidebar"
import Home from './pages/Home'
import LogIn from './pages/LogIn'
import SignUp from './pages/SignUp'
import Donors from './pages/Donors'
import CreateDonor from './pages/CreateDonor'
import Events from './pages/Events'
import Tags from './pages/Tags'
import PrivateRoute from './components/PrivateRoute'
import Settings from './pages/Settings'
import CreateEvent from './pages/CreateEvent'
import DonorDetails from './pages/DonorDetails'
import EventDetails from './pages/EventDetails'
import TagDetails from './pages/TagDetails'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />}/>
        <Route path="/login" element={<LogIn />}/>
        <Route path="/signup" element={<SignUp />}/>
        
        {/* Protected routes with Sidebar */}
        <Route element={<PrivateRoute />}>
          <Route element={
            <SidebarProvider>
              <div className="flex min-h-screen">
                <AppSidebar />
                <main className="flex-1">
                  <SidebarTrigger />
                  <div className=" px-6 py-8">
                    <Outlet />
                  </div>
                </main>
              </div>
            </SidebarProvider>
          }>
            <Route path="/donors" element={<Donors />} />
            <Route path="/donors/:id" element={<DonorDetails />} />
            <Route path="/donors/create" element={<CreateDonor />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/create" element={<CreateEvent />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/tags/:id" element={<TagDetails />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
