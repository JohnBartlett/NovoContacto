# Novo Contacts - Advanced Contact Management System

A modern, feature-rich web application for managing Google Contacts CSV exports with advanced version control, group management, and powerful search capabilities.

## 🚀 Features

### Core Functionality
- **CSV Upload**: Upload Google Contacts CSV exports with drag-and-drop interface
- **Contact Management**: View, edit, and delete contacts with a modern interface
- **Version Control**: Track all changes to contacts with automatic versioning
- **Restore Functionality**: Restore individual contacts or all contacts to previous versions
- **Configurable Display**: Customize which fields to display in the contact list
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Advanced Search & Filtering
- **Smart Search**: Search across all contact fields with intelligent matching
- **Empty Field Search**: Find contacts with missing information using "Empty X" syntax
- **Logical Operators**: Use AND, OR, NOT operators for complex searches
- **Group Filtering**: Filter contacts by group membership
- **Search Hints**: Dynamic help messages for search syntax

### Contact Groups
- **Group Management**: Create, edit, and delete contact groups
- **Group Assignment**: Add contacts to groups from search results
- **Bulk Operations**: Select all contacts in search results and add to groups
- **Group Viewing**: Filter contact list to show only group members
- **Visual Indicators**: Color-coded groups with member counts

### Selection & Bulk Operations
- **Multi-Select**: Select individual contacts or all contacts in search results
- **Bulk Actions**: Export, delete, or add to groups in bulk
- **Undo Functionality**: Undo bulk delete operations with 10-second timeout
- **Selection Counter**: Real-time display of selected contacts
- **Smart Selection**: Select all contacts matching search criteria across all pages

### User Experience
- **Version Tracking**: Always see current version number in header
- **Save Feedback**: Visual feedback for all save operations
- **Scrollable Lists**: Contact lists are scrollable for better navigation
- **Settings Management**: Configurable items per page, sorting, and display preferences
- **Terse Display Mode**: Optional single-line, compact contact list layout
- **History Tracking**: Complete audit trail of all contact changes

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with Apple-inspired design
- **Database**: SQLite with Prisma ORM
- **File Upload**: React Dropzone
- **CSV Parsing**: PapaParse
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd NovoContacto
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma db push
npx prisma generate
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Usage Guide

### Uploading Contacts

1. Click the "Upload CSV" button
2. Drag and drop your Google Contacts CSV file or click to browse
3. The system will automatically parse and import your contacts
4. All contacts are stored with version control enabled

### Managing Contacts

#### Basic Operations
- **View Contacts**: Browse your imported contacts in the main list
- **Search**: Use the search bar to find specific contacts
- **Edit**: Click the edit button to modify contact information
- **Delete**: Remove contacts (soft delete with version history preserved)

#### Display Formats
- **Standard Display**: Multi-line layout showing each visible field on its own line
- **Terse Display**: Single-line compact layout showing selected fields inline
  - Enable via Settings → Display Format → Terse Display
  - Honors your field visibility selections (Name, Email, Phone, Address)

#### Advanced Search
- **Text Search**: Type any text to search across all fields
- **Empty Field Search**: Use "Empty Phone", "Empty Email", "Empty Address", "Empty Name", or "Empty Notes"
- **Logical Operators**: Use "AND", "OR", "NOT" for complex queries
  - Examples: "John AND email", "phone OR address", "NOT empty", "John AND NOT Smith"

#### Contact Selection
- **Individual Selection**: Click checkboxes to select specific contacts
- **Select All**: Select all visible contacts
- **Select All in Search**: Select ALL contacts matching search criteria (across all pages)
- **Bulk Actions**: Export, delete, or add selected contacts to groups

### Group Management

#### Creating Groups
1. Click the "Groups" button
2. Click "New Group" 
3. Enter group name, description, and choose a color
4. Click "Create"

#### Adding Contacts to Groups
1. Search for contacts you want to group
2. Select contacts using checkboxes
3. Choose "Add to Group" from the dropdown
4. Select the destination group

#### Viewing Group Contacts
1. Use the "Filter by Group" dropdown
2. Select a group to view only its members
3. Search within the group to find specific contacts
4. Use "Clear Filter" to return to all contacts

### Version Control

#### Automatic Versioning
- Every change creates a new version automatically
- Version numbers are displayed in the contact list
- Complete history is preserved for all contacts

#### Restoring Contacts
- **Individual Restore**: Click the restore button on any contact
- **Bulk Restore**: Use the History modal to restore multiple contacts
- **Date-based Restore**: Restore all contacts to a specific date

### Settings & Preferences

#### Display Settings
- **Field Visibility**: Choose which fields to display (Name, Email, Phone, Address, Notes)
- **Items Per Page**: Set how many contacts to show per page
- **Sorting**: Choose sort field and order
- **Display Format**: Toggle Terse Display for single-line list layout
- **Preview**: See changes before applying

#### Search Settings
- **Search Hints**: Dynamic help messages appear based on your search
- **Empty Field Detection**: Automatic suggestions for "Empty X" searches
- **Operator Help**: Examples for logical operators

## 🗄 Database Schema

The application uses a comprehensive database schema with the following entities:

### Core Entities
- **Contact**: Main contact information with version tracking
- **ContactVersion**: Historical snapshots of contact data
- **ContactUpload**: Track CSV uploads and processing status
- **DisplaySettings**: User preferences for field visibility and display

### Group Management
- **Group**: Contact groups with name, description, and color
- **ContactGroup**: Many-to-many relationship between contacts and groups

### Schema Details
```prisma
model Contact {
  id        String   @id @default(cuid())
  name      String?
  email     String?
  phone     String?
  address   String?
  notes     String?
  version   Int      @default(1)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relationships
  versions  ContactVersion[]
  groups    ContactGroup[]
  upload    ContactUpload? @relation(fields: [uploadId], references: [id])
}

model Group {
  id          String   @id @default(cuid())
  name        String
  description String?
  color       String?  @default("#007AFF")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  contacts    ContactGroup[]
}

model ContactGroup {
  id        String   @id @default(cuid())
  contactId String
  groupId   String
  addedAt   DateTime @default(now())
  
  contact   Contact @relation(fields: [contactId], references: [id], onDelete: Cascade)
  group     Group   @relation(fields: [groupId], references: [id], onDelete: Cascade)
  
  @@unique([contactId, groupId])
}
```

## 🔌 API Endpoints

### Contact Management
- `GET /api/contacts` - List contacts with pagination, search, and group filtering
- `GET /api/contacts/[id]` - Get specific contact with version history
- `PUT /api/contacts/[id]` - Update contact (creates new version)
- `DELETE /api/contacts/[id]` - Soft delete contact
- `POST /api/contacts` - Get all contact IDs matching search/group criteria

### Group Management
- `GET /api/groups` - List all groups with member counts
- `POST /api/groups` - Create new group
- `GET /api/groups/[id]` - Get specific group with members
- `PUT /api/groups/[id]` - Update group details
- `DELETE /api/groups/[id]` - Delete group
- `POST /api/groups/[id]/contacts` - Add contacts to group
- `DELETE /api/groups/[id]/contacts` - Remove contacts from group

### System Operations
- `POST /api/upload` - Upload CSV file
- `POST /api/restore` - Restore contacts to previous versions
- `GET /api/settings` - Get display settings
- `PUT /api/settings` - Update display settings
- `GET /api/uploads` - Get upload history

## 📊 CSV Format

The application expects CSV files exported from Google Contacts with the following common field names:

- **Name** / Full Name
- **Email** / E-mail Address  
- **Phone** / Phone 1 - Value
- **Address** / Address 1 - Formatted
- **Notes**

## 🔧 Development

### Database Management

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma db push --force-reset

# Generate Prisma client
npx prisma generate
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:push      # Push schema changes to database
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
```

### Building for Production

```bash
npm run build
npm start
```

## 🎨 UI/UX Features

### Apple-Inspired Design
- Clean, modern interface with Apple-style components
- Consistent spacing and typography
- Smooth animations and transitions
- Responsive design for all screen sizes

### User Feedback
- **Save Indicators**: Visual feedback for all save operations
- **Loading States**: Clear loading indicators during operations
- **Success/Error States**: Color-coded feedback for user actions
- **Undo Notifications**: Temporary notifications for undoable actions

### Accessibility
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Focus indicators

## 🚀 Recent Updates

### Version 1.3.2 - Group Display & Filtering
- Added group filtering to contact list
- Implemented "Filter by Group" dropdown
- Added group member count display
- Enhanced search to work within groups
- Updated bulk selection to respect group filters

### Version 1.3.1 - Enhanced Search Selection
- Fixed "Select All in Search" to select ALL matching contacts across all pages
- Added API endpoint for getting all contact IDs matching search criteria
- Enhanced selection counter to show total vs visible contacts
- Improved search performance with efficient ID-only queries

### Version 1.3.0 - Contact Groups System
- Implemented complete group management system
- Added group creation, editing, and deletion
- Implemented contact-to-group assignment
- Added bulk group operations
- Created group management UI with color coding

### Version 1.2.1 - Undo Functionality
- Added undo functionality for bulk delete operations
- Implemented 10-second undo timeout
- Added visual undo notifications
- Enhanced error handling and user feedback

### Version 1.2.0 - Contact Selection & Bulk Actions
- Implemented multi-contact selection system
- Added bulk export and delete operations
- Created "Select All in Search" functionality
- Added selection counter and visual feedback
- Enhanced CSV export with proper formatting

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.