'use client'

import { useState, useEffect } from 'react'
import { X, Save, Eye, EyeOff } from 'lucide-react'

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

interface SettingsModalProps {
  settings: DisplaySettings
  onClose: () => void
  onSave: (settings: DisplaySettings) => void
}

export default function SettingsModal({ settings, onClose, onSave }: SettingsModalProps) {
  const [formData, setFormData] = useState<DisplaySettings>(settings)

  useEffect(() => {
    setFormData(settings)
  }, [settings])

  const handleSave = () => {
    onSave(formData)
  }

  const toggleField = (field: keyof DisplaySettings) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <div className="modal-overlay flex items-center justify-center z-50">
      <div className="modal-content p-6 w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-title-3 text-label">Display Settings</h3>
          <button
            onClick={onClose}
            className="p-2 text-quaternaryLabel hover:text-secondaryLabel hover:bg-systemGray-6 rounded-apple transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-8">
          {/* Apple-style Field Visibility */}
          <div>
            <h4 className="text-title-2 text-label mb-6">Field Visibility</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'showName', label: 'Name', description: 'Display contact names' },
                { key: 'showEmail', label: 'Email', description: 'Display email addresses' },
                { key: 'showPhone', label: 'Phone', description: 'Display phone numbers' },
                { key: 'showAddress', label: 'Address', description: 'Display addresses' },
                { key: 'showNotes', label: 'Notes', description: 'Display notes and comments' },
              ].map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between p-4 border border-systemGray-5 rounded-apple-lg bg-systemBackground">
                  <div>
                    <p className="text-headline text-label">{label}</p>
                    <p className="text-footnote text-secondaryLabel">{description}</p>
                  </div>
                  <button
                    onClick={() => toggleField(key as keyof DisplaySettings)}
                    className={`p-3 rounded-apple transition-colors ${
                      formData[key as keyof DisplaySettings]
                        ? 'bg-systemBlue text-white'
                        : 'bg-systemGray-6 text-quaternaryLabel'
                    }`}
                  >
                    {formData[key as keyof DisplaySettings] ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Apple-style Display Preferences */}
          <div>
            <h4 className="text-title-2 text-label mb-6">Display Preferences</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-callout font-medium text-label mb-3">
                  Items per page
                </label>
                <select
                  value={formData.itemsPerPage}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    itemsPerPage: parseInt(e.target.value)
                  }))}
                  className="input"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div>
                <label className="block text-callout font-medium text-label mb-3">
                  Sort by
                </label>
                <select
                  value={formData.sortBy}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    sortBy: e.target.value
                  }))}
                  className="input"
                >
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="createdAt">Date Created</option>
                  <option value="updatedAt">Last Updated</option>
                </select>
              </div>

              <div>
                <label className="block text-callout font-medium text-label mb-3">
                  Sort order
                </label>
                <select
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    sortOrder: e.target.value
                  }))}
                  className="input"
                >
                  <option value="asc">Ascending (A-Z)</option>
                  <option value="desc">Descending (Z-A)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Apple-style Preview */}
          <div>
            <h4 className="text-title-2 text-label mb-6">Preview</h4>
            <div className="bg-systemGray-6 border border-systemGray-5 rounded-apple-lg p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-systemBlue rounded-apple flex items-center justify-center">
                    <span className="text-white font-semibold text-callout">J</span>
                  </div>
                  <div className="flex-1">
                    {formData.showName && (
                      <p className="text-headline text-label">John Doe</p>
                    )}
                    {formData.showEmail && (
                      <p className="text-subhead text-secondaryLabel">john@example.com</p>
                    )}
                    {formData.showPhone && (
                      <p className="text-subhead text-secondaryLabel">+1 (555) 123-4567</p>
                    )}
                    {formData.showAddress && (
                      <p className="text-subhead text-secondaryLabel">123 Main St, City, State</p>
                    )}
                    {formData.showNotes && (
                      <p className="text-subhead text-secondaryLabel">Important client</p>
                    )}
                  </div>
                </div>
                <p className="text-caption-1 text-quaternaryLabel">
                  This is how contacts will appear in the list
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
