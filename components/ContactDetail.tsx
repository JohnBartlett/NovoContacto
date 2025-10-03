'use client'

import { useState } from 'react'
import { Edit, Save, X, RotateCcw, History } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Contact {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  version: number
  createdAt: string
  updatedAt: string
}

interface DisplaySettings {
  showName: boolean
  showEmail: boolean
  showPhone: boolean
  showAddress: boolean
  showNotes: boolean
  itemsPerPage: number
  sortBy: string
  sortOrder: string
}

interface ContactDetailProps {
  contact: Contact
  onUpdate: (contact: Contact) => void
  settings: DisplaySettings
}

export default function ContactDetail({ contact, onUpdate, settings }: ContactDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Contact>>({})
  const [showVersions, setShowVersions] = useState(false)
  const [versions, setVersions] = useState<any[]>([])
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  const handleEdit = () => {
    console.log('Starting edit with contact:', contact)
    setEditForm(contact)
    setIsEditing(true)
    console.log('Edit form set to:', contact)
  }

  const handleSave = async () => {
    setSaveStatus('saving')
    try {
      console.log('Saving contact with data:', editForm)
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        const updatedContact = await response.json()
        console.log('Save successful:', updatedContact)
        onUpdate(updatedContact)
        setSaveStatus('success')
        setIsEditing(false)
        setEditForm({})
        // Reset success status after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        const errorData = await response.json()
        console.error('Save failed:', errorData)
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    } catch (error) {
      console.error('Failed to update contact:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditForm({})
  }

  const handleRestore = async (version: number) => {
    if (!confirm(`Are you sure you want to restore this contact to version ${version}?`)) return

    try {
      const response = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: contact.id, version })
      })

      if (response.ok) {
        const updatedContact = await response.json()
        onUpdate(updatedContact.contact)
        setShowVersions(false)
      }
    } catch (error) {
      console.error('Failed to restore contact:', error)
    }
  }

  const fetchVersions = async () => {
    try {
      const response = await fetch(`/api/contacts/${contact.id}`)
      const data = await response.json()
      setVersions(data.versions || [])
      setShowVersions(true)
    } catch (error) {
      console.error('Failed to fetch versions:', error)
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-title-3 text-label">Contact Details</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchVersions}
            className="p-2 text-quaternaryLabel hover:text-systemBlue hover:bg-systemGray-6 rounded-apple transition-colors"
            title="View version history"
          >
            <History className="w-4 h-4" />
          </button>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="p-2 text-quaternaryLabel hover:text-systemBlue hover:bg-systemGray-6 rounded-apple transition-colors"
              title="Edit contact"
            >
              <Edit className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center space-x-1">
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className={`p-2 rounded-apple transition-colors ${
                  saveStatus === 'saving' 
                    ? 'text-quaternaryLabel cursor-not-allowed' 
                    : saveStatus === 'success'
                    ? 'text-systemGreen bg-systemGreen bg-opacity-10'
                    : saveStatus === 'error'
                    ? 'text-systemRed bg-systemRed bg-opacity-10'
                    : 'text-systemGreen hover:text-green-600 hover:bg-systemGray-6'
                }`}
                title={
                  saveStatus === 'saving' ? 'Saving...' :
                  saveStatus === 'success' ? 'Saved successfully!' :
                  saveStatus === 'error' ? 'Save failed' :
                  'Save changes'
                }
              >
                <Save className={`w-4 h-4 ${saveStatus === 'saving' ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleCancel}
                className="p-2 text-quaternaryLabel hover:text-secondaryLabel hover:bg-systemGray-6 rounded-apple transition-colors"
                title="Cancel editing"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Apple-style Avatar */}
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-systemBlue rounded-apple-lg flex items-center justify-center">
            <span className="text-white font-semibold text-title-2">
              {contact.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <p className="text-footnote text-secondaryLabel">Version {contact.version}</p>
            <p className="text-caption-1 text-quaternaryLabel">
              Updated {formatDate(contact.updatedAt)}
            </p>
          </div>
        </div>

        {/* Apple-style Contact Fields */}
        {settings.showName && (
          <div>
            <label className="block text-callout font-medium text-label mb-2">
              Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.name || ''}
                onChange={(e) => {
                  const newForm = { ...editForm, name: e.target.value }
                  console.log('Name changed to:', e.target.value, 'New form:', newForm)
                  setEditForm(newForm)
                }}
                className="input"
              />
            ) : (
              <p className="text-body text-label">{contact.name || 'Not provided'}</p>
            )}
          </div>
        )}

        {settings.showEmail && (
          <div>
            <label className="block text-callout font-medium text-label mb-2">
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="input"
              />
            ) : (
              <p className="text-body text-label">
                {contact.email ? (
                  <a href={`mailto:${contact.email}`} className="text-systemBlue hover:underline">
                    {contact.email}
                  </a>
                ) : (
                  'Not provided'
                )}
              </p>
            )}
          </div>
        )}

        {settings.showPhone && (
          <div>
            <label className="block text-callout font-medium text-label mb-2">
              Phone
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="input"
              />
            ) : (
              <p className="text-body text-label">
                {contact.phone ? (
                  <a href={`tel:${contact.phone}`} className="text-systemBlue hover:underline">
                    {contact.phone}
                  </a>
                ) : (
                  'Not provided'
                )}
              </p>
            )}
          </div>
        )}

        {settings.showAddress && (
          <div>
            <label className="block text-callout font-medium text-label mb-2">
              Address
            </label>
            {isEditing ? (
              <textarea
                value={editForm.address || ''}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="input"
                rows={3}
              />
            ) : (
              <p className="text-body text-label whitespace-pre-line">
                {contact.address || 'Not provided'}
              </p>
            )}
          </div>
        )}

        {settings.showNotes && (
          <div>
            <label className="block text-callout font-medium text-label mb-2">
              Notes
            </label>
            {isEditing ? (
              <textarea
                value={editForm.notes || ''}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="input"
                rows={3}
              />
            ) : (
              <p className="text-body text-label whitespace-pre-line">
                {contact.notes || 'No notes'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Apple-style Version History Modal */}
      {showVersions && (
        <div className="modal-overlay flex items-center justify-center z-50">
          <div className="modal-content p-6 w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-title-3 text-label">Version History</h3>
              <button
                onClick={() => setShowVersions(false)}
                className="p-2 text-quaternaryLabel hover:text-secondaryLabel hover:bg-systemGray-6 rounded-apple transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`p-4 border rounded-apple-lg ${
                    version.version === contact.version
                      ? 'border-systemBlue bg-systemBlue bg-opacity-5'
                      : 'border-systemGray-5 bg-systemBackground'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-headline text-label">
                        Version {version.version}
                        {version.version === contact.version && (
                          <span className="ml-2 text-callout text-systemBlue">(Current)</span>
                        )}
                      </p>
                      <p className="text-footnote text-secondaryLabel">
                        {formatDate(version.createdAt)}
                      </p>
                    </div>
                    {version.version !== contact.version && (
                      <button
                        onClick={() => handleRestore(version.version)}
                        className="btn btn-secondary flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restore
                      </button>
                    )}
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    {version.name && (
                      <div className="flex">
                        <span className="text-callout font-medium text-label w-16">Name:</span>
                        <span className="text-callout text-secondaryLabel">{version.name}</span>
                      </div>
                    )}
                    {version.email && (
                      <div className="flex">
                        <span className="text-callout font-medium text-label w-16">Email:</span>
                        <span className="text-callout text-secondaryLabel">{version.email}</span>
                      </div>
                    )}
                    {version.phone && (
                      <div className="flex">
                        <span className="text-callout font-medium text-label w-16">Phone:</span>
                        <span className="text-callout text-secondaryLabel">{version.phone}</span>
                      </div>
                    )}
                    {version.address && (
                      <div className="flex">
                        <span className="text-callout font-medium text-label w-16">Address:</span>
                        <span className="text-callout text-secondaryLabel">{version.address}</span>
                      </div>
                    )}
                    {version.notes && (
                      <div className="flex">
                        <span className="text-callout font-medium text-label w-16">Notes:</span>
                        <span className="text-callout text-secondaryLabel">{version.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
