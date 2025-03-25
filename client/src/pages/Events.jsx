import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"

export default function Events() {
  const navigate = useNavigate()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Events</h1>
      <div className="flex items-center gap-2">
        <Button onClick={() => navigate("/events/create")}>Create New Event</Button>
      </div>
      <p>Manage your events here.</p>
    </div>
  )
} 