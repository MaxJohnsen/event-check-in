'use client'

import { useState, useEffect } from 'react'
import { Search, User, Mail, Briefcase, Phone, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  mobile: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
}

export function EventRegistrationComponent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [formData, setFormData] = useState<Contact>({ id: '', name: '', email: '', company: '', mobile: '' })
  const [showDropdown, setShowDropdown] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/contacts');
        if (!response.ok) {
          throw new Error('Failed to fetch contacts');
        }
        const data = await response.json();
        setContacts(data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const events: Event[] = await response.json();
        const today = new Date().toISOString().split('T')[0];
        const todayEvent = events.find(event => event.date === today);
        if (todayEvent) {
          setCurrentEvent(todayEvent);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchContacts();
    fetchEvents();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setShowDropdown(value.length > 0)
    setSelectedContact(null)
  }

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact)
    setFormData(contact)
    setShowDropdown(false)
    setSearchTerm(contact.name)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!currentEvent) {
      console.error('No event selected');
      return;
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/register-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          eventId: currentEvent.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register attendance');
      }

      const result = await response.json();
      console.log('Registration successful:', result);
      setSuccessMessage(`Thank you for registering, ${formData.name}. We look forward to seeing you at the event!`);
      
      setTimeout(() => {
        setSuccessMessage('')
        setFormData({ id: '', name: '', email: '', company: '', mobile: '' })
        setSearchTerm('')
      }, 3000);
    } catch (error) {
      console.error('Error registering attendance:', error);
      setSuccessMessage('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Event Check-In</CardTitle>
          {currentEvent && (
            <CardDescription className="text-center flex items-center justify-center">
              <Calendar className="mr-2 h-4 w-4" />
              {currentEvent.name} - {currentEvent.date}
            </CardDescription>
          )}
          <CardDescription className="text-center">Please enter your details to check in</CardDescription>
        </CardHeader>
        <CardContent>
          {successMessage ? (
            <div className="text-center space-y-4">
              <div className="text-xl font-semibold text-green-600">{successMessage}</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="relative">
                  <Label htmlFor="search">Search Attendee</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="search"
                      type="text"
                      placeholder="Start typing your name..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="pl-8"
                    />
                  </div>
                  {showDropdown && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto">
                      {filteredContacts.map((contact) => (
                        <li
                          key={contact.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSelectContact(contact)}
                        >
                          {contact.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company (Optional)</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
              <CardFooter className="flex justify-end mt-6 px-0">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Registering...' : 'Check In'}
                </Button>
              </CardFooter>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
