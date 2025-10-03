'use client'

import { useState, useEffect } from 'react'
import { History, ArrowLeft, RotateCcw, Calendar, User, Clock } from 'lucide-react'

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  address: string
  notes: string
  version: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ContactVersion {
  id: string
  contactId: string
  version: number
  name: string
  email: string
  phone: string
  address: string
  notes: string
  createdAt: string
}

interface Upload {
  id: string
  filename: string
  uploadDate: string
  totalContacts: number
  processedContacts: number
  status: string
}

export default function HistoryPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [uploads, setUploads] = useState<Upload[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [contactVersions, setContactVersions] = useState<ContactVersion[]>([])
  const [showVersions, setShowVersions] = useState(false)
  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [contactsResponse, uploadsResponse] = await Promise.all([
        fetch('/api/contacts?limit=100'),
        fetch('/api/uploads')
      ])
      
      const contactsData = await contactsResponse.json()
      const uploadsData = await uploadsResponse.json()
      
      setContacts(contactsData.contacts || [])
      setUploads(uploadsData || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContactClick = async (contact: Contact) => {
    try {
      const response = await fetch(`/api/contacts/${contact.id}`)
      const data = await response.json()
      setContactVersions(data.versions || [])
      setSelectedContact(contact)
      setShowVersions(true)
    } catch (error) {
      console.error('Failed to fetch contact versions:', error)
    }
  }

  const handleRestoreContact = async (contactId: string, version: number) => {
    try {
      setRestoring(true)
      const response = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'individual',
          contactId,
          version
        })
      })
      
      if (response.ok) {
        alert('Contact restored successfully!')
        setShowVersions(false)
        fetchData() // Refresh data
      } else {
        alert('Failed to restore contact')
      }
    } catch (error) {
      console.error('Failed to restore contact:', error)
      alert('Failed to restore contact')
    } finally {
      setRestoring(false)
    }
  }

  const handleBulkRestore = async (date: string) => {
    if (!confirm('Are you sure you want to restore all contacts to this date? This will affect all contacts.')) {
      return
    }

    try {
      setRestoring(true)
      const response = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'bulk',
          date
        })
      })
      
      if (response.ok) {
        alert('All contacts restored successfully!')
        fetchData() // Refresh data
      } else {
        alert('Failed to restore contacts')
      }
    } catch (error) {
      console.error('Failed to restore contacts:', error)
      alert('Failed to restore contacts')
    } finally {
      setRestoring(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-systemGray-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-systemBlue mx-auto mb-4"></div>
          <p className="text-body text-secondaryLabel">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-systemGray-6">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <a 
              href="/"
              className="p-2 rounded-apple hover:bg-systemGray-5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-label" />
            </a>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-systemBlue rounded-apple flex items-center justify-center">
                <History className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-title-2 text-label">History</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload History */}
          <div className="bg-systemGray-5 rounded-apple p-6">
            <h2 className="text-title-3 text-label mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Upload History
            </h2>
            <p className="text-body text-secondaryLabel mb-6">
              Track all CSV uploads and their processing status
            </p>
            
            {uploads.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-quaternaryLabel mx-auto mb-4" />
                <p className="text-body text-secondaryLabel">No uploads found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {uploads.map((upload) => (
                  <div key={upload.id} className="bg-systemGray-6 rounded-apple p-4 border border-systemGray-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-callout font-medium text-label">{upload.filename}</div>
                      <div className={`px-2 py-1 rounded-apple text-caption-1 ${
                        upload.status === 'completed' 
                          ? 'bg-systemGreen/20 text-systemGreen' 
                          : 'bg-systemOrange/20 text-systemOrange'
                      }`}>
                        {upload.status}
                      </div>
                    </div>
                    <div className="text-caption-1 text-secondaryLabel mb-2">
                      {new Date(upload.uploadDate).toLocaleString()}
                    </div>
                    <div className="text-caption-1 text-secondaryLabel">
                      {upload.processedContacts} of {upload.totalContacts} contacts processed
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact History */}
          <div className="bg-systemGray-5 rounded-apple p-6">
            <h2 className="text-title-3 text-label mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Contact History
            </h2>
            <p className="text-body text-secondaryLabel mb-6">
              View and restore individual contact versions
            </p>
            
            {contacts.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-quaternaryLabel mx-auto mb-4" />
                <p className="text-body text-secondaryLabel">No contacts found</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {contacts.slice(0, 20).map((contact) => (
                  <div 
                    key={contact.id}
                    onClick={() => handleContactClick(contact)}
                    className="bg-systemGray-6 rounded-apple p-3 border border-systemGray-4 hover:bg-systemGray-4 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-callout font-medium text-label">{contact.name || 'Unnamed Contact'}</div>
                        <div className="text-caption-1 text-secondaryLabel">
                          Version {contact.version} • Updated {new Date(contact.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-caption-1 text-quaternaryLabel">
                        {contact.isActive ? 'Active' : 'Deleted'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bulk Restore */}
        <div className="mt-8 bg-systemGray-5 rounded-apple p-6">
          <h2 className="text-title-3 text-label mb-4 flex items-center">
            <RotateCcw className="w-5 h-5 mr-2" />
            Bulk Restore
          </h2>
          <p className="text-body text-secondaryLabel mb-6">
            Restore all contacts to a specific date
          </p>
          
          <div className="flex items-center space-x-4">
            <input
              type="date"
              id="restoreDate"
              className="p-3 bg-systemGray-6 border border-systemGray-4 rounded-apple text-body text-label focus:outline-none focus:ring-2 focus:ring-systemBlue"
            />
            <button
              onClick={() => {
                const dateInput = document.getElementById('restoreDate') as HTMLInputElement
                if (dateInput.value) {
                  handleBulkRestore(dateInput.value)
                } else {
                  alert('Please select a date')
                }
              }}
              disabled={restoring}
              className="btn btn-secondary"
            >
              {restoring ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Restoring...
                </>
              ) : (
                'Restore All Contacts'
              )}
            </button>
          </div>
        </div>

        {/* Contact Versions Modal */}
        {showVersions && selectedContact && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-systemGray-5 rounded-apple p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-title-3 text-label">
                  Version History: {selectedContact.name || 'Unnamed Contact'}
                </h3>
                <button
                  onClick={() => setShowVersions(false)}
                  className="p-2 hover:bg-systemGray-4 rounded-apple transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {contactVersions.map((version) => (
                  <div key={version.id} className="bg-systemGray-6 rounded-apple p-4 border border-systemGray-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-callout font-medium text-label">
                        Version {version.version}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-secondaryLabel" />
                        <span className="text-caption-1 text-secondaryLabel">
                          {new Date(version.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-caption-1 text-secondaryLabel mb-4">
                      {version.name && <div><strong>Name:</strong> {version.name}</div>}
                      {version.email && <div><strong>Email:</strong> {version.email}</div>}
                      {version.phone && <div><strong>Phone:</strong> {version.phone}</div>}
                      {version.address && <div><strong>Address:</strong> {version.address}</div>}
                      {version.notes && <div><strong>Notes:</strong> {version.notes}</div>}
                    </div>
                    
                    {version.version !== selectedContact.version && (
                      <button
                        onClick={() => handleRestoreContact(selectedContact.id, version.version)}
                        disabled={restoring}
                        className="btn btn-primary btn-sm"
                      >
                        {restoring ? 'Restoring...' : 'Restore to this version'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
