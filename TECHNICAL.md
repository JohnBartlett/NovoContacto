# Novo Contacts Technical Documentation

This document provides comprehensive technical information about the Novo Contacts application architecture, implementation details, and development guidelines.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [API Design](#api-design)
5. [Frontend Architecture](#frontend-architecture)
6. [State Management](#state-management)
7. [Performance Considerations](#performance-considerations)
8. [Security Implementation](#security-implementation)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Guide](#deployment-guide)

## Architecture Overview

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   Database      │
│   (Next.js)     │◄──►│   (Next.js API) │◄──►│   (SQLite)      │
│                 │    │                 │    │                 │
│ • React 18      │    │ • REST API      │    │ • Prisma ORM    │
│ • TypeScript    │    │ • Route Handlers│    │ • SQLite        │
│ • Tailwind CSS  │    │ • Validation    │    │ • Migrations    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components

1. **Frontend Application** (Next.js 14)
   - React 18 with TypeScript
   - Server-side rendering and static generation
   - Client-side routing and state management

2. **API Layer** (Next.js API Routes)
   - RESTful API endpoints
   - Request/response handling
   - Data validation and sanitization

3. **Database Layer** (Prisma + SQLite)
   - Object-relational mapping
   - Database migrations
   - Query optimization

## Technology Stack

### Frontend Technologies

- **Next.js 14**: React framework with App Router
- **React 18**: UI library with hooks and concurrent features
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **React Dropzone**: File upload handling
- **PapaParse**: CSV parsing library

### Backend Technologies

- **Next.js API Routes**: Serverless API endpoints
- **Prisma ORM**: Database toolkit and query builder
- **SQLite**: Embedded database
- **Node.js**: JavaScript runtime

### Development Tools

- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Prisma Studio**: Database management
- **TypeScript**: Type checking

## Database Schema

### Core Models

#### Contact Model
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
  uploadId  String?
  
  @@map("contacts")
}
```

#### ContactVersion Model
```prisma
model ContactVersion {
  id        String   @id @default(cuid())
  contactId String
  version   Int
  name      String?
  email     String?
  phone     String?
  address   String?
  notes     String?
  createdAt DateTime @default(now())
  
  // Relationships
  contact   Contact @relation(fields: [contactId], references: [id], onDelete: Cascade)
  
  @@unique([contactId, version])
  @@map("contact_versions")
}
```

#### Group Model
```prisma
model Group {
  id          String   @id @default(cuid())
  name        String
  description String?
  color       String?  @default("#007AFF")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  contacts    ContactGroup[]
  
  @@map("groups")
}
```

#### ContactGroup Model
```prisma
model ContactGroup {
  id        String   @id @default(cuid())
  contactId String
  groupId   String
  addedAt   DateTime @default(now())
  
  // Relationships
  contact   Contact @relation(fields: [contactId], references: [id], onDelete: Cascade)
  group     Group   @relation(fields: [groupId], references: [id], onDelete: Cascade)
  
  @@unique([contactId, groupId])
  @@map("contact_groups")
}
```

### Database Relationships

- **Contact ↔ ContactVersion**: One-to-many (version history)
- **Contact ↔ ContactGroup**: Many-to-many (group membership)
- **Group ↔ ContactGroup**: One-to-many (group members)
- **Contact ↔ ContactUpload**: Many-to-one (upload source)

## API Design

### RESTful Endpoints

#### Contact Management
```
GET    /api/contacts           # List contacts with pagination
GET    /api/contacts/[id]      # Get specific contact
PUT    /api/contacts/[id]      # Update contact
DELETE /api/contacts/[id]      # Delete contact
POST   /api/contacts           # Bulk operations
```

#### Group Management
```
GET    /api/groups             # List all groups
POST   /api/groups             # Create group
GET    /api/groups/[id]        # Get specific group
PUT    /api/groups/[id]        # Update group
DELETE /api/groups/[id]        # Delete group
POST   /api/groups/[id]/contacts    # Add contacts to group
DELETE /api/groups/[id]/contacts    # Remove contacts from group
```

#### System Operations
```
POST   /api/upload             # Upload CSV file
POST   /api/restore           # Restore contacts
GET    /api/settings          # Get display settings
PUT    /api/settings          # Update settings
GET    /api/uploads           # Get upload history
```

### Request/Response Patterns

#### Pagination
```typescript
interface PaginationResponse {
  data: any[];
  pagination: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}
```

#### Error Handling
```typescript
interface ErrorResponse {
  error: string;
  details?: string;
}
```

## Frontend Architecture

### Component Structure

```
app/
├── layout.tsx              # Root layout
├── page.tsx                # Main page
├── globals.css             # Global styles
└── api/                    # API routes
    ├── contacts/
    ├── groups/
    ├── upload/
    ├── restore/
    └── settings/

components/
├── ContactList.tsx         # Contact list component
├── ContactDetail.tsx       # Contact detail component
├── GroupModal.tsx          # Group management modal
├── HistoryModal.tsx        # Version history modal
├── SettingsModal.tsx       # Settings modal
└── UploadModal.tsx         # Upload modal
```

### State Management

#### Main Application State
```typescript
interface AppState {
  // Contact data
  contacts: Contact[];
  selectedContact: Contact | null;
  selectedContactIds: Set<string>;
  
  // UI state
  loading: boolean;
  currentPage: number;
  totalPages: number;
  searchTerm: string;
  
  // Group management
  groups: Group[];
  selectedGroupId: string | null;
  
  // Bulk operations
  deletedContacts: Contact[];
  showUndo: boolean;
  
  // Modals
  showUploadModal: boolean;
  showSettingsModal: boolean;
  showGroupModal: boolean;
}
```

#### State Management Patterns

1. **Local State**: React useState for component-specific state
2. **Lifted State**: Shared state passed down through props
3. **Effect Hooks**: useEffect for side effects and data fetching
4. **Custom Hooks**: Reusable state logic (future enhancement)

### Component Design Patterns

#### Container/Presentational Pattern
- **Container Components**: Handle state and business logic
- **Presentational Components**: Handle UI rendering and user interactions

#### Props Interface Design
```typescript
interface ContactListProps {
  contacts: Contact[];
  selectedContactIds: Set<string>;
  onContactSelect: (contact: Contact | null) => void;
  onContactCheckboxChange: (contactId: string, checked: boolean) => void;
  loading: boolean;
}
```

## Performance Considerations

### Database Optimization

#### Query Optimization
- **Selective Fields**: Only fetch required fields
- **Pagination**: Limit results with skip/take
- **Indexing**: Proper database indexes for search fields
- **Connection Pooling**: Efficient database connections

#### Example Optimized Query
```typescript
const contacts = await prisma.contact.findMany({
  where: { isActive: true },
  select: { id: true, name: true, email: true },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { name: 'asc' }
});
```

### Frontend Optimization

#### React Performance
- **Memoization**: React.memo for expensive components
- **Callback Optimization**: useCallback for event handlers
- **Effect Dependencies**: Proper useEffect dependencies
- **State Updates**: Batched state updates

#### Bundle Optimization
- **Code Splitting**: Dynamic imports for large components
- **Tree Shaking**: Remove unused code
- **Asset Optimization**: Optimize images and fonts
- **Caching**: Proper cache headers

### Search Performance

#### Search Query Optimization
```typescript
// Efficient search with proper indexing
const where = {
  isActive: true,
  OR: [
    { name: { contains: searchTerm } },
    { email: { contains: searchTerm } },
    { phone: { contains: searchTerm } }
  ]
};
```

#### Pagination Strategy
- **Cursor-based Pagination**: For large datasets
- **Offset Pagination**: For smaller datasets
- **Search Result Caching**: Cache search results

## Security Implementation

### Input Validation

#### API Validation
```typescript
// Request validation
const { name, email, phone } = await request.json();

// Validate required fields
if (!name) {
  return NextResponse.json({ error: 'Name is required' }, { status: 400 });
}

// Sanitize input
const sanitizedData = {
  name: name.trim(),
  email: email?.trim().toLowerCase(),
  phone: phone?.trim()
};
```

#### SQL Injection Prevention
- **Prisma ORM**: Parameterized queries
- **Input Sanitization**: Clean user input
- **Type Validation**: TypeScript type checking

### File Upload Security

#### CSV Upload Validation
```typescript
// File type validation
if (!file.type.includes('csv')) {
  return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
}

// File size validation
if (file.size > MAX_FILE_SIZE) {
  return NextResponse.json({ error: 'File too large' }, { status: 400 });
}
```

#### Data Sanitization
- **CSV Parsing**: Safe CSV parsing with PapaParse
- **Data Validation**: Validate each contact record
- **Error Handling**: Graceful error handling for malformed data

### Data Protection

#### Soft Deletes
```typescript
// Soft delete implementation
const deletedContact = await prisma.contact.update({
  where: { id: contactId },
  data: { isActive: false }
});
```

#### Version Control
- **Audit Trail**: Complete change history
- **Data Integrity**: Prevent data loss
- **Rollback Capability**: Restore previous versions

## Testing Strategy

### Unit Testing

#### Component Testing
```typescript
// Example component test
import { render, screen } from '@testing-library/react';
import ContactList from './ContactList';

test('renders contact list', () => {
  const contacts = [
    { id: '1', name: 'John Doe', email: 'john@example.com' }
  ];
  
  render(<ContactList contacts={contacts} />);
  
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});
```

#### API Testing
```typescript
// Example API test
import { GET } from './api/contacts/route';

test('GET /api/contacts returns contacts', async () => {
  const request = new Request('http://localhost:3000/api/contacts');
  const response = await GET(request);
  const data = await response.json();
  
  expect(response.status).toBe(200);
  expect(data.contacts).toBeDefined();
});
```

### Integration Testing

#### Database Integration
- **Test Database**: Separate test database
- **Data Seeding**: Test data setup
- **Cleanup**: Test data cleanup

#### API Integration
- **End-to-End Testing**: Full request/response cycle
- **Error Scenarios**: Test error handling
- **Performance Testing**: Load testing

### Testing Tools

- **Jest**: JavaScript testing framework
- **React Testing Library**: React component testing
- **Supertest**: API testing
- **Prisma Test Environment**: Database testing

## Deployment Guide

### Development Environment

#### Prerequisites
- Node.js 18+
- npm or yarn
- Git

#### Setup
```bash
# Clone repository
git clone <repository-url>
cd NovoContacto

# Install dependencies
npm install

# Setup database
npx prisma db push
npx prisma generate

# Start development server
npm run dev
```

### Production Environment

#### Build Process
```bash
# Build application
npm run build

# Start production server
npm start
```

#### Environment Variables
```env
# Database
DATABASE_URL="file:./dev.db"

# Application
NODE_ENV="production"
PORT=3000
```

#### Database Migration
```bash
# Run migrations
npx prisma db push

# Generate client
npx prisma generate
```

### Deployment Options

#### Vercel Deployment
1. **Connect Repository**: Link GitHub repository
2. **Configure Build**: Set build commands
3. **Environment Variables**: Set production variables
4. **Deploy**: Automatic deployment on push

#### Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

#### Database Considerations
- **SQLite**: File-based database for simple deployments
- **PostgreSQL**: For production with multiple instances
- **Database Backup**: Regular backup strategy

### Monitoring and Maintenance

#### Performance Monitoring
- **Response Times**: API response monitoring
- **Database Performance**: Query performance tracking
- **Error Tracking**: Error logging and monitoring

#### Maintenance Tasks
- **Database Cleanup**: Remove old versions
- **Log Rotation**: Manage log files
- **Security Updates**: Regular dependency updates
- **Backup Strategy**: Data backup and recovery

---

## Development Guidelines

### Code Style
- **TypeScript**: Strict type checking
- **ESLint**: Code linting rules
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

### Git Workflow
- **Feature Branches**: Develop features in separate branches
- **Pull Requests**: Code review process
- **Semantic Versioning**: Version numbering
- **Changelog**: Document all changes

### Documentation
- **Code Comments**: Inline documentation
- **API Documentation**: Comprehensive API docs
- **User Guide**: End-user documentation
- **Technical Docs**: Developer documentation

This technical documentation provides a comprehensive overview of the Novo Contacts application architecture and implementation details.
