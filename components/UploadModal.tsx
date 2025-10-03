'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { formatFileSize } from '@/lib/utils'

interface UploadModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<{
    success: boolean
    message: string
    totalContacts?: number
  } | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setUploadProgress(0)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setUploadResult({
          success: true,
          message: `Successfully uploaded ${result.totalContacts} contacts`,
          totalContacts: result.totalContacts
        })
        setTimeout(() => {
          onSuccess()
        }, 2000)
      } else {
        setUploadResult({
          success: false,
          message: result.error || 'Upload failed'
        })
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: 'Upload failed. Please try again.'
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [onSuccess])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    multiple: false,
    disabled: uploading
  })

  return (
    <div className="modal-overlay flex items-center justify-center z-50">
      <div className="modal-content p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-title-3 text-label">Upload Contacts CSV</h3>
          <button
            onClick={onClose}
            className="p-2 text-quaternaryLabel hover:text-secondaryLabel hover:bg-systemGray-6 rounded-apple transition-colors"
            disabled={uploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!uploadResult ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-apple-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-systemBlue bg-systemBlue bg-opacity-5'
                : 'border-systemGray-4 hover:border-systemBlue'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            
            {uploading ? (
              <div className="space-y-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-systemBlue mx-auto"></div>
                <p className="text-body text-secondaryLabel">Processing contacts...</p>
                <div className="w-full bg-systemGray-6 rounded-full h-2">
                  <div 
                    className="bg-systemBlue h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <Upload className="w-16 h-16 text-quaternaryLabel mx-auto" />
                <div>
                  <p className="text-title-3 text-label">
                    {isDragActive ? 'Drop the CSV file here' : 'Drag & drop a CSV file'}
                  </p>
                  <p className="text-callout text-secondaryLabel mt-2">
                    or click to browse files
                  </p>
                </div>
                <div className="text-footnote text-quaternaryLabel space-y-1">
                  <p>Supported format: Google Contacts CSV export</p>
                  <p>Max file size: 10MB</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-6">
            {uploadResult.success ? (
              <div className="space-y-6">
                <CheckCircle className="w-20 h-20 text-systemGreen mx-auto" />
                <div>
                  <p className="text-title-2 text-label">
                    Upload Successful!
                  </p>
                  <p className="text-callout text-secondaryLabel mt-2">
                    {uploadResult.message}
                  </p>
                </div>
                <div className="bg-systemGreen bg-opacity-10 border border-systemGreen border-opacity-20 rounded-apple-lg p-4">
                  <p className="text-callout text-systemGreen">
                    Your contacts have been imported and are ready to view.
                    All changes will be tracked with version control.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <AlertCircle className="w-20 h-20 text-systemRed mx-auto" />
                <div>
                  <p className="text-title-2 text-label">
                    Upload Failed
                  </p>
                  <p className="text-callout text-secondaryLabel mt-2">
                    {uploadResult.message}
                  </p>
                </div>
                <div className="bg-systemRed bg-opacity-10 border border-systemRed border-opacity-20 rounded-apple-lg p-4">
                  <p className="text-callout text-systemRed">
                    Please check your CSV file format and try again.
                    Make sure it's a valid Google Contacts export.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setUploadResult(null)
                    setUploading(false)
                  }}
                  className="btn btn-primary"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {!uploading && !uploadResult && (
          <div className="mt-6 bg-systemBlue bg-opacity-10 border border-systemBlue border-opacity-20 rounded-apple-lg p-4">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-systemBlue mt-0.5" />
              <div className="text-callout text-systemBlue">
                <p className="font-medium">CSV Format Requirements:</p>
                <ul className="mt-2 space-y-1 text-footnote">
                  <li>• Export from Google Contacts</li>
                  <li>• Include Name, Email, Phone fields</li>
                  <li>• UTF-8 encoding preferred</li>
                  <li>• First row should contain headers</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {!uploading && !uploadResult && (
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
