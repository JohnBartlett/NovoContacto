'use client'

import { useState, useEffect } from 'react'
import { Settings, ArrowLeft } from 'lucide-react'

interface DisplaySettings {
  id: string
  userId: string
  showName: boolean
  showEmail: boolean
  showPhone: boolean
  showAddress: boolean
  showNotes: boolean
  itemsPerPage: number
  sortBy: string
  sortOrder: string
  terseDisplay: boolean
  createdAt: string
  updatedAt: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<DisplaySettings>({
    id: '',
    userId: 'default',
    showName: true,
    showEmail: true,
    showPhone: true,
    showAddress: true,
    showNotes: false,
    itemsPerPage: 20,
    sortBy: 'name',
    sortOrder: 'asc',
    terseDisplay: false,
    createdAt: '',
    updatedAt: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        setMessage('Settings saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('Failed to save settings')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      setMessage('Failed to save settings')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleFieldToggle = (field: keyof DisplaySettings) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleItemsPerPageChange = (value: number) => {
    setSettings(prev => ({
      ...prev,
      itemsPerPage: value
    }))
  }

  const handleSortChange = (field: string) => {
    setSettings(prev => ({
      ...prev,
      sortBy: field
    }))
  }

  const handleSortOrderChange = (order: string) => {
    setSettings(prev => ({
      ...prev,
      sortOrder: order
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-systemGray-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-systemBlue mx-auto mb-4"></div>
          <p className="text-body text-secondaryLabel">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-systemGray-6">
      <div className="max-w-4xl mx-auto px-6 py-8">
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
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-title-2 text-label">Settings</h1>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-systemGray-5 rounded-apple p-6">
          <div className="space-y-8">
            {/* Field Visibility */}
            <div>
              <h2 className="text-title-3 text-label mb-4">Field Visibility</h2>
              <p className="text-body text-secondaryLabel mb-6">
                Choose which fields to display in the contact list
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'showName', label: 'Name', description: 'Contact name' },
                  { key: 'showEmail', label: 'Email', description: 'Email address' },
                  { key: 'showPhone', label: 'Phone', description: 'Phone number' },
                  { key: 'showAddress', label: 'Address', description: 'Physical address' },
                  { key: 'showNotes', label: 'Notes', description: 'Additional notes' }
                ].map(({ key, label, description }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-systemGray-6 rounded-apple">
                    <div>
                      <div className="text-callout font-medium text-label">{label}</div>
                      <div className="text-caption-1 text-secondaryLabel">{description}</div>
                    </div>
                    <button
                      onClick={() => handleFieldToggle(key as keyof DisplaySettings)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings[key as keyof DisplaySettings] 
                          ? 'bg-systemBlue' 
                          : 'bg-systemGray-4'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        settings[key as keyof DisplaySettings] 
                          ? 'translate-x-6' 
                          : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Terse Display */}
            <div>
              <h2 className="text-title-3 text-label mb-4">Display Format</h2>
              <p className="text-body text-secondaryLabel mb-6">
                Choose how contacts are displayed in the list
              </p>
              
              <div className="flex items-center justify-between p-4 bg-systemGray-6 rounded-apple">
                <div>
                  <div className="text-callout font-medium text-label">Terse Display</div>
                  <div className="text-caption-1 text-secondaryLabel">Single-line format for compact viewing</div>
                </div>
                <button
                  onClick={() => handleFieldToggle('terseDisplay')}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.terseDisplay 
                      ? 'bg-systemBlue' 
                      : 'bg-systemGray-4'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    settings.terseDisplay 
                      ? 'translate-x-6' 
                      : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            {/* Display Options */}
            <div>
              <h2 className="text-title-3 text-label mb-4">Display Options</h2>
              <p className="text-body text-secondaryLabel mb-6">
                Configure how contacts are displayed and sorted
              </p>
              
              <div className="space-y-6">
                {/* Items Per Page */}
                <div>
                  <label className="text-callout font-medium text-label mb-2 block">
                    Items Per Page
                  </label>
                  <select
                    value={settings.itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="w-full p-3 bg-systemGray-6 border border-systemGray-4 rounded-apple text-body text-label focus:outline-none focus:ring-2 focus:ring-systemBlue"
                  >
                    <option value={10}>10 contacts</option>
                    <option value={20}>20 contacts</option>
                    <option value={50}>50 contacts</option>
                    <option value={100}>100 contacts</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-callout font-medium text-label mb-2 block">
                    Sort By
                  </label>
                  <select
                    value={settings.sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full p-3 bg-systemGray-6 border border-systemGray-4 rounded-apple text-body text-label focus:outline-none focus:ring-2 focus:ring-systemBlue"
                  >
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="address">Address</option>
                    <option value="createdAt">Date Added</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="text-callout font-medium text-label mb-2 block">
                    Sort Order
                  </label>
                  <select
                    value={settings.sortOrder}
                    onChange={(e) => handleSortOrderChange(e.target.value)}
                    className="w-full p-3 bg-systemGray-6 border border-systemGray-4 rounded-apple text-body text-label focus:outline-none focus:ring-2 focus:ring-systemBlue"
                  >
                    <option value="asc">Ascending (A-Z)</option>
                    <option value="desc">Descending (Z-A)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div>
              <h2 className="text-title-3 text-label mb-4">Preview</h2>
              <p className="text-body text-secondaryLabel mb-4">
                Here's how your contact list will look with these settings:
              </p>
              
              <div className="bg-systemGray-6 rounded-apple p-4 border border-systemGray-4">
                <div className="text-caption-1 text-secondaryLabel mb-2">
                  Showing 1-{Math.min(settings.itemsPerPage, 3)} of 100 contacts
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'John Doe', email: 'john@example.com', phone: '+1234567890' },
                    { name: 'Jane Smith', email: 'jane@example.com', phone: '+0987654321' },
                    { name: 'Bob Johnson', email: 'bob@example.com', phone: '+1122334455' }
                  ].slice(0, Math.min(3, settings.itemsPerPage)).map((contact, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-systemGray-5 rounded-apple">
                      {settings.showName && (
                        <div className="text-body font-medium text-label">{contact.name}</div>
                      )}
                      {settings.showEmail && (
                        <div className="text-body text-secondaryLabel">{contact.email}</div>
                      )}
                      {settings.showPhone && (
                        <div className="text-body text-secondaryLabel">{contact.phone}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-systemGray-4">
            <div className="text-caption-1 text-secondaryLabel">
              Changes will be applied immediately after saving
            </div>
            <div className="flex items-center space-x-3">
              {message && (
                <div className={`text-caption-1 ${
                  message.includes('success') ? 'text-systemGreen' : 'text-systemRed'
                }`}>
                  {message}
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
