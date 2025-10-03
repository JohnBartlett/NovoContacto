'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Edit, Trash2, RotateCcw, Users } from 'lucide-react'
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

interface ContactListProps {
  contacts: Contact[]
  loading: boolean
  onContactSelect: (contact: Contact | null) => void
  selectedContact: Contact | null
  settings: DisplaySettings
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  selectedContactIds: Set<string>
  onContactCheckboxChange: (contactId: string, checked: boolean) => void
}

export default function ContactList({
  contacts,
  loading,
  onContactSelect,
  selectedContact,
  settings,
  currentPage,
  totalPages,
  onPageChange,
  selectedContactIds,
  onContactCheckboxChange
}: ContactListProps) {
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [editForm, setEditForm] = useState<Partial<Contact>>({})
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact)
    setEditForm(contact)
  }

  const handleSave = async () => {
    if (!editingContact) return

    setSaveStatus('saving')
    try {
      const response = await fetch(`/api/contacts/${editingContact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        const updatedContact = await response.json()
        onContactSelect(updatedContact)
        setSaveStatus('success')
        setEditingContact(null)
        setEditForm({})
        // Reset success status after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    } catch (error) {
      console.error('Failed to update contact:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const handleDelete = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onContactSelect(null)
        // Refresh the list by triggering a re-fetch
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to delete contact:', error)
    }
  }

  const handleRestore = async (contactId: string) => {
    if (!confirm('Are you sure you want to restore this contact to a previous version?')) return

    try {
      const response = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId, version: 1 })
      })

      if (response.ok) {
        // Refresh the list
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to restore contact:', error)
    }
  }

  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-systemGray-6 rounded-apple"></div>
          ))}
        </div>
      </div>
    )
  }

  if (contacts.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-systemGray-6 rounded-apple-lg flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-quaternaryLabel" />
        </div>
        <p className="text-body text-secondaryLabel">No contacts found</p>
        <p className="text-footnote text-quaternaryLabel mt-2">
          Upload a CSV file to get started
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Apple-style Contact List */}
      <div className="card overflow-hidden">
        <div className="divide-y divide-systemGray-5 max-h-96 overflow-y-auto">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`list-item p-4 ${
                selectedContact?.id === contact.id ? 'bg-systemBlue bg-opacity-5 border-l-4 border-systemBlue' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedContactIds.has(contact.id)}
                    onChange={(e) => {
                      e.stopPropagation()
                      onContactCheckboxChange(contact.id, e.target.checked)
                    }}
                    className="w-4 h-4 text-systemBlue bg-transparent border-systemGray-4 rounded focus:ring-systemBlue focus:ring-2"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-4">
                    {/* Apple-style Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-systemBlue rounded-apple flex items-center justify-center">
                        <span className="text-white font-semibold text-callout">
                          {contact.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Contact Info */}
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => onContactSelect(contact)}
                    >
                      {settings.showName && (
                        <p className="text-headline text-label truncate">
                          {contact.name || <span className="text-quaternaryLabel italic">Empty Name</span>}
                        </p>
                      )}
                      {settings.showEmail && (
                        <p className="text-subhead text-secondaryLabel truncate">
                          {contact.email || <span className="text-quaternaryLabel italic">Empty Email</span>}
                        </p>
                      )}
                      {settings.showPhone && (
                        <p className="text-subhead text-secondaryLabel truncate">
                          {contact.phone || <span className="text-quaternaryLabel italic">Empty Phone</span>}
                        </p>
                      )}
                      {settings.showAddress && (
                        <p className="text-subhead text-secondaryLabel truncate">
                          {contact.address || <span className="text-quaternaryLabel italic">Empty Address</span>}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-caption-1 text-quaternaryLabel">
                          v{contact.version}
                        </span>
                        <span className="text-caption-1 text-quaternaryLabel">•</span>
                        <span className="text-caption-1 text-quaternaryLabel">
                          {formatDate(contact.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                
                {/* Apple-style Action Buttons */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(contact)
                    }}
                    className="p-2 text-quaternaryLabel hover:text-systemBlue hover:bg-systemGray-6 rounded-apple transition-colors"
                    title="Edit contact"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRestore(contact.id)
                    }}
                    className="p-2 text-quaternaryLabel hover:text-systemBlue hover:bg-systemGray-6 rounded-apple transition-colors"
                    title="Restore contact"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(contact.id)
                    }}
                    className="p-2 text-quaternaryLabel hover:text-systemRed hover:bg-systemGray-6 rounded-apple transition-colors"
                    title="Delete contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Apple-style Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-footnote text-secondaryLabel">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Apple-style Edit Modal */}
      {editingContact && (
        <div className="modal-overlay flex items-center justify-center z-50">
          <div className="modal-content p-6 w-full max-w-md mx-4">
            <h3 className="text-title-3 text-label mb-6">Edit Contact</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-callout font-medium text-label mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-callout font-medium text-label mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-callout font-medium text-label mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-callout font-medium text-label mb-2">
                  Address
                </label>
                <textarea
                  value={editForm.address || ''}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="input"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-callout font-medium text-label mb-2">
                  Notes
                </label>
                <textarea
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="input"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setEditingContact(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className={`btn ${
                  saveStatus === 'saving' 
                    ? 'btn-secondary cursor-not-allowed' 
                    : saveStatus === 'success'
                    ? 'btn-success'
                    : saveStatus === 'error'
                    ? 'btn-error'
                    : 'btn-primary'
                }`}
              >
                {saveStatus === 'saving' ? 'Saving...' : 
                 saveStatus === 'success' ? 'Saved!' : 
                 saveStatus === 'error' ? 'Error' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
