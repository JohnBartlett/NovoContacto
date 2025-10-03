'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Users, Trash2, Edit } from 'lucide-react'

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

interface GroupModalProps {
  isOpen: boolean
  onClose: () => void
  onGroupUpdate: () => void
}

export default function GroupModal({ isOpen, onClose, onGroupUpdate }: GroupModalProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#007AFF'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchGroups()
    }
  }, [isOpen])

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups')
      const data = await response.json()
      setGroups(data)
    } catch (error) {
      console.error('Failed to fetch groups:', error)
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormData({ name: '', description: '', color: '#007AFF' })
        setShowCreateForm(false)
        fetchGroups()
        onGroupUpdate()
      }
    } catch (error) {
      console.error('Failed to create group:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGroup) return
    setLoading(true)

    try {
      const response = await fetch(`/api/groups/${selectedGroup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setFormData({ name: '', description: '', color: '#007AFF' })
        setShowEditForm(false)
        setSelectedGroup(null)
        fetchGroups()
        onGroupUpdate()
      }
    } catch (error) {
      console.error('Failed to update group:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchGroups()
        onGroupUpdate()
      }
    } catch (error) {
      console.error('Failed to delete group:', error)
    }
  }

  const handleEditClick = (group: Group) => {
    setSelectedGroup(group)
    setFormData({
      name: group.name,
      description: group.description || '',
      color: group.color || '#007AFF'
    })
    setShowEditForm(true)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-systemGray-6 rounded-apple-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-title-2 text-label">Manage Groups</h2>
          <button
            onClick={onClose}
            className="p-2 text-quaternaryLabel hover:text-label rounded-apple"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-6 h-[60vh]">
          {/* Groups List */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-headline text-label">Groups</h3>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary btn-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Group
              </button>
            </div>

            <div className="space-y-2">
              {groups.map(group => (
                <div
                  key={group.id}
                  className="p-4 bg-systemGray-5 rounded-apple border border-systemGray-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: group.color || '#007AFF' }}
                      />
                      <div>
                        <h4 className="text-callout text-label">{group.name}</h4>
                        {group.description && (
                          <p className="text-caption-1 text-secondaryLabel">{group.description}</p>
                        )}
                        <div className="flex items-center space-x-2 text-caption-1 text-quaternaryLabel">
                          <Users className="w-3 h-3" />
                          <span>{group.contacts?.length || 0} members</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEditClick(group)}
                        className="p-2 text-quaternaryLabel hover:text-systemBlue hover:bg-systemGray-6 rounded-apple"
                        title="Edit group"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="p-2 text-quaternaryLabel hover:text-systemRed hover:bg-systemGray-6 rounded-apple"
                        title="Delete group"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Create/Edit Form */}
          {(showCreateForm || showEditForm) && (
            <div className="w-80 bg-systemGray-5 rounded-apple p-4">
              <h3 className="text-headline text-label mb-4">
                {showCreateForm ? 'Create Group' : 'Edit Group'}
              </h3>
              
              <form onSubmit={showCreateForm ? handleCreateGroup : handleEditGroup}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-caption-1 text-label mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input w-full"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-caption-1 text-label mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input w-full h-20 resize-none"
                      placeholder="Optional description"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-caption-1 text-label mb-1">Color</label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full h-10 rounded-apple border border-systemGray-4"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary flex-1"
                  >
                    {loading ? 'Saving...' : (showCreateForm ? 'Create' : 'Update')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setShowEditForm(false)
                      setFormData({ name: '', description: '', color: '#007AFF' })
                      setSelectedGroup(null)
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
