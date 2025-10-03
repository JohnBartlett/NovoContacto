'use client'

import { useState, useEffect } from 'react'
import { Upload, Users, Settings, History, Search, Filter, Download } from 'lucide-react'
import ContactList from '@/components/ContactList'
import ContactDetail from '@/components/ContactDetail'
import UploadModal from '@/components/UploadModal'
import SettingsModal from '@/components/SettingsModal'
import HistoryModal from '@/components/HistoryModal'
import GroupModal from '@/components/GroupModal'

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

interface Group {
  id: string
  name: string
  description: string | null
  color: string | null
  createdAt: string
  updatedAt: string
  contacts?: ContactGroup[]
}

interface ContactGroup {
  id: string
  contactId: string
  groupId: string
  addedAt: string
  contact?: Contact
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

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set())
  const [deletedContacts, setDeletedContacts] = useState<Contact[]>([])
  const [showUndo, setShowUndo] = useState(false)
  const [groups, setGroups] = useState<Group[]>([])
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [settings, setSettings] = useState<DisplaySettings>({
    showName: true,
    showEmail: true,
    showPhone: true,
    showAddress: true,
    showNotes: false,
    itemsPerPage: 20,
    sortBy: 'name',
    sortOrder: 'asc'
  })

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: settings.itemsPerPage.toString(),
        search: searchTerm,
        sortBy: settings.sortBy,
        sortOrder: settings.sortOrder
      })
      
      // Add group filter if a group is selected
      if (selectedGroupId) {
        params.append('groupId', selectedGroupId)
      }
      
      console.log('Frontend: Fetching contacts with search:', searchTerm)
      console.log('Frontend: Selected group:', selectedGroupId)
      console.log('Frontend: API URL:', `/api/contacts?${params}`)
      
      const response = await fetch(`/api/contacts?${params}`)
      const data = await response.json()
      
      console.log('Frontend: API response:', data)
      
      if (data.contacts) {
        setContacts(data.contacts)
        setTotalPages(data.pagination?.pages || 1)
        console.log('Frontend: Set contacts:', data.contacts.length)
      } else {
        setContacts([])
        setTotalPages(1)
        console.log('Frontend: No contacts in response')
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups')
      const data = await response.json()
      setGroups(data)
    } catch (error) {
      console.error('Failed to fetch groups:', error)
    }
  }

  useEffect(() => {
    fetchSettings()
    fetchGroups()
  }, [])

  useEffect(() => {
    fetchContacts()
  }, [currentPage, searchTerm, settings, selectedGroupId])

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [searchTerm])

  const handleContactSelect = (contact: Contact | null) => {
    setSelectedContact(contact)
  }

  const handleContactCheckboxChange = (contactId: string, checked: boolean) => {
    setSelectedContactIds(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(contactId)
      } else {
        newSet.delete(contactId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    const allIds = new Set(contacts.map(contact => contact.id))
    setSelectedContactIds(allIds)
  }

  const handleSelectNone = () => {
    setSelectedContactIds(new Set())
  }

  const handleSelectAllInSearch = async () => {
    if (!searchTerm) {
      // If no search term, select all visible contacts
      handleSelectAll()
      return
    }

    try {
      // Get all contact IDs matching the search criteria
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'getAllIds', 
          search: searchTerm,
          groupId: selectedGroupId
        })
      })

      if (response.ok) {
        const data = await response.json()
        const allMatchingIds = new Set(data.contactIds)
        setSelectedContactIds(allMatchingIds)
        console.log('Selected all contacts in search:', allMatchingIds.size)
      } else {
        console.error('Failed to get all contact IDs')
        // Fallback to selecting visible contacts
        handleSelectAll()
      }
    } catch (error) {
      console.error('Failed to select all in search:', error)
      // Fallback to selecting visible contacts
      handleSelectAll()
    }
  }

  const handleBulkDelete = async () => {
    if (selectedContactIds.size === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedContactIds.size} contact(s)?`)) return

    try {
      // Store contacts that will be deleted for undo functionality
      const contactsToDelete = contacts.filter(contact => selectedContactIds.has(contact.id))
      setDeletedContacts(contactsToDelete)
      
      const deletePromises = Array.from(selectedContactIds).map(id => 
        fetch(`/api/contacts/${id}`, { method: 'DELETE' })
      )
      
      await Promise.all(deletePromises)
      
      // Remove deleted contacts from the list
      setContacts(contacts.filter(contact => !selectedContactIds.has(contact.id)))
      setSelectedContactIds(new Set())
      
      // Clear selected contact if it was deleted
      if (selectedContact && selectedContactIds.has(selectedContact.id)) {
        setSelectedContact(null)
      }
      
      // Show undo option
      setShowUndo(true)
      
      // Auto-hide undo after 10 seconds
      setTimeout(() => {
        setShowUndo(false)
        setDeletedContacts([])
      }, 10000)
      
    } catch (error) {
      console.error('Failed to delete contacts:', error)
    }
  }

  const handleBulkExport = () => {
    if (selectedContactIds.size === 0) return
    
    const selectedContacts = contacts.filter(contact => selectedContactIds.has(contact.id))
    const csvData = convertToCSV(selectedContacts)
    downloadCSV(csvData, 'selected-contacts.csv')
  }

  const handleUndoDelete = async () => {
    if (deletedContacts.length === 0) return

    try {
      // Restore each deleted contact by setting isActive back to true
      const restorePromises = deletedContacts.map(contact => 
        fetch(`/api/contacts/${contact.id}?action=restore`, { method: 'POST' })
      )
      
      await Promise.all(restorePromises)
      
      // Add restored contacts back to the list
      setContacts(prevContacts => [...prevContacts, ...deletedContacts])
      
      // Clear undo state
      setShowUndo(false)
      setDeletedContacts([])
      
    } catch (error) {
      console.error('Failed to restore contacts:', error)
    }
  }

  const convertToCSV = (contacts: Contact[]) => {
    const headers = ['Name', 'Email', 'Phone', 'Address', 'Notes']
    const rows = contacts.map(contact => [
      contact.name || '',
      contact.email || '',
      contact.phone || '',
      contact.address || '',
      contact.notes || ''
    ])
    
    return [headers, ...rows].map(row => 
      row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')
    ).join('\n')
  }

  const downloadCSV = (csvData: string, filename: string) => {
    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleAddToGroup = async (groupId: string) => {
    if (selectedContactIds.size === 0) return

    try {
      const response = await fetch(`/api/groups/${groupId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactIds: Array.from(selectedContactIds) })
      })

      if (response.ok) {
        // Clear selection
        setSelectedContactIds(new Set())
        // Refresh groups to show updated member counts
        fetchGroups()
      }
    } catch (error) {
      console.error('Failed to add contacts to group:', error)
    }
  }

  const handleContactUpdate = (updatedContact: Contact) => {
    // Update the contact in the list and selected contact
    setContacts(contacts.map(c => 
      c.id === updatedContact.id ? updatedContact : c
    ))
    setSelectedContact(updatedContact)
  }

  const handleUploadSuccess = () => {
    setShowUploadModal(false)
    fetchContacts()
  }

  const handleSettingsUpdate = async (newSettings: DisplaySettings) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      })

      if (response.ok) {
        setSettings(newSettings)
        setShowSettingsModal(false)
      }
    } catch (error) {
      console.error('Failed to update settings:', error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Apple-style Header */}
      <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-large-title text-label">Contacts</h1>
            <p className="text-subhead text-secondaryLabel mt-1">
              {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        {/* Apple-style Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload CSV
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={() => setShowHistoryModal(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            History
          </button>
          <button
            onClick={() => setShowGroupModal(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Groups
          </button>
        </div>
      </div>

      {/* Apple-style Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="search-bar flex items-center">
            <Search className="w-4 h-4 text-quaternaryLabel mr-3" />
            <input
              type="text"
              placeholder="Search contacts, use 'Empty X', or operators: AND, OR, NOT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-label placeholder-quaternaryLabel focus:outline-none"
            />
          </div>
          {searchTerm.toLowerCase().startsWith('empty ') && (
            <div className="mt-2 text-caption-1 text-systemBlue">
              💡 Try: Empty Phone, Empty Address, Empty Email, Empty Name
            </div>
          )}
          {(searchTerm.toUpperCase().includes(' AND ') || searchTerm.toUpperCase().includes(' OR ') || searchTerm.toUpperCase().includes(' NOT ')) && (
            <div className="mt-2 text-caption-1 text-systemBlue">
              💡 Examples: "John AND email", "phone OR address", "NOT empty", "John AND NOT Smith"
            </div>
          )}
        </div>
        <button className="btn btn-secondary flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Undo Notification */}
      {showUndo && deletedContacts.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-systemGray-6 border border-systemGray-4 rounded-apple p-4 shadow-lg z-50">
          <div className="flex items-center space-x-3">
            <div className="text-caption-1 text-label">
              {deletedContacts.length} contact(s) deleted
            </div>
            <button
              onClick={handleUndoDelete}
              className="btn btn-primary btn-sm"
            >
              Undo
            </button>
            <button
              onClick={() => {
                setShowUndo(false)
                setDeletedContacts([])
              }}
              className="p-1 text-quaternaryLabel hover:text-label"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Apple-style Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact List */}
        <div className="lg:col-span-2">
          <ContactList
            contacts={contacts}
            loading={loading}
            onContactSelect={handleContactSelect}
            selectedContact={selectedContact}
            settings={settings}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            selectedContactIds={selectedContactIds}
            onContactCheckboxChange={handleContactCheckboxChange}
          />
        </div>

        {/* Contact Detail Sidebar */}
        <div className="lg:col-span-1">
          {selectedContact ? (
            <ContactDetail
              contact={selectedContact}
              onUpdate={handleContactUpdate}
              settings={settings}
            />
          ) : (
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-systemGray-6 rounded-apple-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-quaternaryLabel" />
              </div>
              <p className="text-body text-secondaryLabel">Select a contact to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Group Filter */}
      <div className="flex items-center justify-between p-4 bg-systemGray-6 rounded-apple">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-caption-1 text-label">Filter by Group:</label>
            <select
              value={selectedGroupId || ''}
              onChange={(e) => {
                setSelectedGroupId(e.target.value || null)
                setCurrentPage(1) // Reset to page 1 when changing group
              }}
              className="btn btn-secondary btn-sm"
            >
              <option value="">All Contacts</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.contacts?.length || 0})
                </option>
              ))}
            </select>
          </div>
          {selectedGroupId && (
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: groups.find(g => g.id === selectedGroupId)?.color || '#007AFF' }}
              />
              <span className="text-caption-1 text-label">
                Showing contacts in "{groups.find(g => g.id === selectedGroupId)?.name}"
              </span>
            </div>
          )}
        </div>
        {selectedGroupId && (
          <button
            onClick={() => setSelectedGroupId(null)}
            className="btn btn-secondary btn-sm"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Selection Controls */}
      {contacts.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-systemGray-6 rounded-apple">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSelectAll}
                className="btn btn-secondary btn-sm"
              >
                Select All
              </button>
              <button
                onClick={handleSelectNone}
                className="btn btn-secondary btn-sm"
              >
                Select None
              </button>
              {searchTerm && (
                <button
                  onClick={handleSelectAllInSearch}
                  className="btn btn-secondary btn-sm"
                >
                  Select All in Search
                </button>
              )}
            </div>
            <div className="text-caption-1 text-label">
              {selectedContactIds.size} selected
              {searchTerm && (
                <span className="text-quaternaryLabel">
                  {' '}({contacts.length} visible)
                </span>
              )}
            </div>
          </div>
          
          {selectedContactIds.size > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkExport}
                className="btn btn-primary btn-sm"
              >
                Export Selected
              </button>
              <div className="relative">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddToGroup(e.target.value)
                      e.target.value = ''
                    }
                  }}
                  className="btn btn-secondary btn-sm appearance-none pr-8"
                  defaultValue=""
                >
                  <option value="">Add to Group</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleBulkDelete}
                className="btn btn-error btn-sm"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>
      )}

      {/* Apple-style Modals */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettingsModal(false)}
          onSave={handleSettingsUpdate}
        />
      )}

      {showHistoryModal && (
        <HistoryModal
          onClose={() => setShowHistoryModal(false)}
        />
      )}
      {showGroupModal && (
        <GroupModal
          isOpen={showGroupModal}
          onClose={() => setShowGroupModal(false)}
          onGroupUpdate={fetchGroups}
        />
      )}
    </div>
  )
}
