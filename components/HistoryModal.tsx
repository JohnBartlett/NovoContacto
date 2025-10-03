'use client'

import { useState, useEffect } from 'react'
import { X, RotateCcw, Calendar, User, Download } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface UploadHistory {
  id: string
  filename: string
  uploadDate: string
  totalContacts: number
  processedContacts: number
  status: string
}

interface HistoryModalProps {
  onClose: () => void
}

export default function HistoryModal({ onClose }: HistoryModalProps) {
  const [uploads, setUploads] = useState<UploadHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)

  useEffect(() => {
    fetchUploadHistory()
  }, [])

  const fetchUploadHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/uploads')
      const data = await response.json()
      setUploads(data.uploads || [])
    } catch (error) {
      console.error('Failed to fetch upload history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestoreToDate = async () => {
    if (!selectedDate) return

    try {
      const response = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restoreAll: true,
          date: selectedDate
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Successfully restored ${result.restored} contacts to ${selectedDate}`)
        setShowRestoreConfirm(false)
        setSelectedDate('')
      }
    } catch (error) {
      console.error('Failed to restore contacts:', error)
      alert('Failed to restore contacts. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'processing':
        return 'text-blue-600 bg-blue-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓'
      case 'processing':
        return '⏳'
      case 'failed':
        return '✗'
      default:
        return '?'
    }
  }

  return (
    <div className="modal-overlay flex items-center justify-center z-50">
      <div className="modal-content p-6 w-full max-w-4xl mx-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-title-3 text-label">Upload History & Restore</h3>
          <button
            onClick={onClose}
            className="p-2 text-quaternaryLabel hover:text-secondaryLabel hover:bg-systemGray-6 rounded-apple transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-systemBlue"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Apple-style Restore to Date */}
            <div className="bg-systemBlue bg-opacity-10 border border-systemBlue border-opacity-20 rounded-apple-lg p-6">
              <h4 className="text-headline text-label mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-systemBlue" />
                Restore All Contacts to Date
              </h4>
              <div className="flex items-center space-x-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input"
                />
                <button
                  onClick={() => setShowRestoreConfirm(true)}
                  disabled={!selectedDate}
                  className="btn btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restore to Date
                </button>
              </div>
              <p className="text-callout text-systemBlue mt-4">
                This will restore all contacts to their state on the selected date.
                A new version will be created for each contact.
              </p>
            </div>

            {/* Apple-style Upload History */}
            <div>
              <h4 className="text-headline text-label mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-systemBlue" />
                Upload History
              </h4>
              
              {uploads.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-systemGray-6 rounded-apple-lg flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-quaternaryLabel" />
                  </div>
                  <p className="text-body text-secondaryLabel">No uploads found</p>
                  <p className="text-footnote text-quaternaryLabel mt-2">Upload a CSV file to see history</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {uploads.map((upload) => (
                    <div key={upload.id} className="border border-systemGray-5 rounded-apple-lg p-4 bg-systemBackground">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <p className="text-headline text-label">{upload.filename}</p>
                              <p className="text-footnote text-secondaryLabel">
                                {formatDate(upload.uploadDate)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-callout text-secondaryLabel">
                                {upload.processedContacts} / {upload.totalContacts} contacts
                              </div>
                              <div className={`px-3 py-1 rounded-apple text-caption-1 font-medium ${getStatusColor(upload.status)}`}>
                                {getStatusIcon(upload.status)} {upload.status}
                              </div>
                            </div>
                          </div>
                          
                          {upload.status === 'processing' && (
                            <div className="mt-4">
                              <div className="w-full bg-systemGray-6 rounded-full h-2">
                                <div 
                                  className="bg-systemBlue h-2 rounded-full transition-all duration-300"
                                  style={{ 
                                    width: `${(upload.processedContacts / upload.totalContacts) * 100}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Apple-style Restore Confirmation */}
        {showRestoreConfirm && (
          <div className="modal-overlay flex items-center justify-center z-60">
            <div className="modal-content p-6 w-full max-w-md mx-4">
              <h4 className="text-title-3 text-label mb-4">
                Confirm Restore
              </h4>
              <p className="text-body text-secondaryLabel mb-6">
                Are you sure you want to restore all contacts to their state on{' '}
                <strong className="text-label">{selectedDate}</strong>? This will create new versions
                for all contacts and cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRestoreConfirm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestoreToDate}
                  className="btn btn-destructive flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restore All
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-8">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
