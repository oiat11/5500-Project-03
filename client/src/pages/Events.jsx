import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { CalendarIcon, MapPinIcon, UsersIcon, TagIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/event');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        
        const data = await response.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <Button onClick={() => navigate("/events/create")}>Create New Event</Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading events...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">Error: {error}</p>
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground mb-4">No events found</p>
            <Button onClick={() => navigate("/events/create")}>Create Your First Event</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card 
              key={event.id} 
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleEventClick(event.id)}
            >
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xl">{event.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {event.date ? format(new Date(event.date), 'PPP') : 'No date set'}
                </div>
                
                {event.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPinIcon className="mr-2 h-4 w-4" />
                    {event.location}
                  </div>
                )}
                
                {event.description && (
                  <p className="text-sm line-clamp-2">{event.description}</p>
                )}
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {event.tags && event.tags.length > 0 && (
                    <div className="flex items-start gap-1 mr-4">
                      <TagIcon className="h-4 w-4 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {event.tags.map(tag => (
                          <Badge 
                            key={tag.id} 
                            variant="outline" 
                            className="text-xs"
                            style={{ 
                              backgroundColor: tag.color ? `${tag.color}20` : undefined,
                              borderColor: tag.color,
                              color: tag.color
                            }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-2 border-t">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <UsersIcon className="mr-1 h-4 w-4" />
                    {event.donors?.length || 0} donors
                  </div>
                  {event.status && (
                    <Badge 
                      variant="outline" 
                      className={`
                        ${event.status === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
                        ${event.status === 'published' ? 'bg-green-100 text-green-800' : ''}
                        ${event.status === 'archived' ? 'bg-amber-100 text-amber-800' : ''}
                      `}
                    >
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 