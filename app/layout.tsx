import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Novo Contacts - Contact Management System',
  description: 'Upload and manage your Google Contacts with version control',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sf-pro">
        <div className="min-h-screen bg-secondarySystemBackground">
          {/* Apple-style Navigation Bar */}
          <header className="bg-systemBackground border-b border-systemGray-5">
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-systemBlue rounded-apple flex items-center justify-center">
                    <span className="text-white font-semibold text-callout">N</span>
                  </div>
                  <h1 className="text-title-3 text-label">
                    Novo Contacts
                    <span className="ml-2 text-caption-1 text-quaternaryLabel">v1.3.3</span>
                  </h1>
                </div>
                
                {/* Apple-style Navigation */}
                <nav className="flex items-center space-x-1">
                  <a 
                    href="/" 
                    className="nav-item px-4 py-2 rounded-apple text-callout font-medium"
                  >
                    Contacts
                  </a>
                  <a 
                    href="/settings" 
                    className="nav-item px-4 py-2 rounded-apple text-callout font-medium"
                  >
                    Settings
                  </a>
                  <a 
                    href="/history" 
                    className="nav-item px-4 py-2 rounded-apple text-callout font-medium"
                  >
                    History
                  </a>
                </nav>
              </div>
            </div>
          </header>
          
          {/* Apple-style Main Content */}
          <main className="max-w-6xl mx-auto px-6 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
