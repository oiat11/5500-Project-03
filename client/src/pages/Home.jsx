import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          Welcome to the Donor List Automation System
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Streamline your donor management and event organization with our comprehensive system.
          Please log in to get started.
        </p>
        <Button 
          size="lg"
          onClick={() => navigate('/login')}
          className="px-8"
        >
          Get Started
        </Button>
      </div>
    </div>
  )
}
