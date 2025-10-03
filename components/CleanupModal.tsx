'use client'

import { useState } from 'react'
import { X, Trash2, AlertTriangle, CheckCircle, Loader } from 'lucide-react'

interface CleanupModalProps {
  isOpen: boolean
  onClose: () => void
  onCleanupComplete: () => void
}

interface CleanupResult {
  cleaned: number
  errors: number
  details: string[]
}

export default function CleanupModal({ isOpen, onClose, onCleanupComplete }: CleanupModalProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CleanupResult | null>(null)
  const [selectedAction, setSelectedAction] = useState<string>('general')

  const cleanupActions = [
    {
      id: 'general',
      name: 'General Cleanup',
      description: 'Comprehensive cleanup of all contact data',
      icon: '🧹'
    },
    {
      id: 'useless-contacts',
      name: 'Useless Contacts',
      description: 'Remove test data, placeholders, and generic contacts',
      icon: '🗑️'
    },
    {
      id: 'invalid-emails',
      name: 'Invalid Emails',
      description: 'Remove contacts with malformed email addresses',
      icon: '📧'
    },
    {
      id: 'test-data',
      name: 'Test Data',
      description: 'Remove contacts from test domains and patterns',
      icon: '🧪'
    },
    {
      id: 'data-validation',
      name: 'Data Validation',
      description: 'Clean and normalize contact data formatting',
      icon: '✅'
    },
    {
      id: 'address-cleanup',
      name: 'Address Cleanup',
      description: 'Fix malformed addresses and escape sequences',
      icon: '🏠'
    },
    {
      id: 'empty-fields',
      name: 'Empty Fields',
      description: 'Fill in missing names and emails',
      icon: '📝'
    },
    {
      id: 'duplicates',
      name: 'Remove Duplicates',
      description: 'Find and remove duplicate contacts',
      icon: '🔄'
    }
  ]

  const handleCleanup = async (action: string) => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.results)
        onCleanupComplete()
      } else {
        setResult({
          cleaned: 0,
          errors: 1,
          details: [`Error: ${data.error}`]
        })
      }
    } catch (error) {
      setResult({
        cleaned: 0,
        errors: 1,
        details: [`Network error: ${error}`]
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-systemGray-5 rounded-apple p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-systemOrange rounded-apple flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-title-3 text-label">Data Cleanup</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-systemGray-4 rounded-apple transition-colors"
          >
            <X className="w-5 h-5 text-quaternaryLabel" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Cleanup Actions */}
          <div>
            <h3 className="text-title-4 text-label mb-4">Choose Cleanup Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cleanupActions.map((action) => (
                <div
                  key={action.id}
                  className={`p-4 rounded-apple border-2 cursor-pointer transition-colors ${
                    selectedAction === action.id
                      ? 'border-systemBlue bg-systemBlue/10'
                      : 'border-systemGray-4 hover:border-systemGray-3'
                  }`}
                  onClick={() => setSelectedAction(action.id)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{action.icon}</span>
                    <div>
                      <div className="text-callout font-medium text-label">{action.name}</div>
                      <div className="text-caption-1 text-secondaryLabel">{action.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-systemOrange/10 border border-systemOrange/20 rounded-apple p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-systemOrange flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-callout font-medium text-label mb-1">Important</div>
                <div className="text-caption-1 text-secondaryLabel">
                  Cleanup operations will modify your contact data. We recommend backing up your data first.
                  All changes are versioned and can be restored if needed.
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-systemGray-6 rounded-apple p-4">
              <div className="flex items-center space-x-3 mb-3">
                {result.errors > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-systemOrange" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-systemGreen" />
                )}
                <div className="text-callout font-medium text-label">Cleanup Results</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-body text-label">
                  ✅ Cleaned: {result.cleaned} contacts
                </div>
                {result.errors > 0 && (
                  <div className="text-body text-systemOrange">
                    ❌ Errors: {result.errors}
                  </div>
                )}
                
                {result.details.length > 0 && (
                  <div className="mt-3">
                    <div className="text-caption-1 text-secondaryLabel mb-2">Details:</div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {result.details.map((detail, index) => (
                        <div key={index} className="text-caption-1 text-quaternaryLabel">
                          • {detail}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-systemGray-4">
            <div className="text-caption-1 text-secondaryLabel">
              {selectedAction === 'general' && 'Comprehensive cleanup of all data issues'}
              {selectedAction === 'useless-contacts' && 'Remove test data, placeholders, and generic contacts'}
              {selectedAction === 'invalid-emails' && 'Remove contacts with malformed email addresses'}
              {selectedAction === 'test-data' && 'Remove contacts from test domains and patterns'}
              {selectedAction === 'data-validation' && 'Clean and normalize contact data formatting'}
              {selectedAction === 'address-cleanup' && 'Fix malformed address data'}
              {selectedAction === 'empty-fields' && 'Fill in missing contact information'}
              {selectedAction === 'duplicates' && 'Remove duplicate contacts'}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleCleanup(selectedAction)}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Cleaning...
                  </>
                ) : (
                  'Start Cleanup'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
