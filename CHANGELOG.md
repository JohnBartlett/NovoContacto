# Changelog

All notable changes to the Novo Contacts project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.1] - 2024-10-03

### Added
- Enhanced cleanup system with 8 different cleanup types
- Useless Contacts cleanup: Remove test data, placeholders, and generic contacts
- Invalid Emails cleanup: Remove contacts with malformed email addresses
- Test Data cleanup: Remove contacts from test domains and patterns
- Data Validation cleanup: Clean and normalize contact data formatting
- Smart detection patterns for identifying problematic data
- Comprehensive cleanup modal with detailed results reporting

### Changed
- Updated CleanupModal UI with new cleanup options and descriptions
- Enhanced cleanup API with advanced data cleaning algorithms
- Improved SQLite compatibility by removing mode parameters

### Technical
- Added 4 new cleanup functions: `cleanupUselessContacts`, `cleanupInvalidEmails`, `cleanupTestData`, `cleanupDataValidation`
- Implemented 16+ detection patterns for invalid data
- Enhanced error handling and detailed cleanup reporting
- Successfully tested on real data: removed 116 problematic contacts

## [1.4.0] - 2024-10-03

### Added
- Comprehensive data cleanup system with multiple cleanup types
- Address cleanup: Fix malformed addresses and escape sequences
- Empty fields cleanup: Fill in missing names and emails
- Duplicate removal: Find and remove duplicate contacts
- General cleanup: Comprehensive data cleaning
- Cleanup modal with visual feedback and detailed results

### Changed
- Added cleanup button to main navigation
- Updated version to v1.4.0
- Enhanced contact list with automatic refresh after cleanup

### Technical
- Created `/api/cleanup` endpoint with multiple cleanup actions
- Implemented `CleanupModal` component with comprehensive UI
- Added cleanup state management to main application
- Successfully tested cleanup operations on real data

## [1.3.4] - 2024-10-03

### Added
- Terse display setting for single-line contact list format
- Settings UI toggle for Display Format (Terse Display)

### Changed
- Updated `ContactList` to conditionally render terse vs standard layout
- Bumped version shown in header to v1.3.4

### Technical
- Added `terseDisplay Boolean @default(false)` to `DisplaySettings` schema
- Propagated `terseDisplay` through settings interfaces and state

## [1.3.3] - 2024-10-03

### Added
- Created `/settings` page with comprehensive display and sorting options
- Created `/history` page with upload history and contact version management

### Fixed
- Resolved 404 navigation errors for Settings and History links

### Changed
- Bumped version in header to v1.3.3

### Technical
- Implemented pages in the App Router and wired navigation

## [1.3.2] - 2024-10-03

### Added
- Group filtering functionality to contact list
- "Filter by Group" dropdown selector
- Group member count display in filter options
- Visual group indicators with color coding
- "Clear Filter" button to return to all contacts
- Group filtering support in search operations
- Enhanced bulk selection to work within group context

### Changed
- Updated contact API to support group filtering via `groupId` parameter
- Enhanced search functionality to work within selected groups
- Modified "Select All in Search" to respect group filters
- Updated contact list to show group-specific results

### Technical
- Added group filtering logic to `/api/contacts` endpoint
- Enhanced POST `/api/contacts` to support group filtering for bulk operations
- Updated frontend to pass group context in all API calls
- Added group state management to main application

## [1.3.1] - 2024-10-03

### Fixed
- "Select All in Search" now selects ALL contacts matching search criteria across all pages
- Added API endpoint to get all contact IDs matching search criteria
- Enhanced selection counter to show total selected vs visible contacts
- Improved search performance with efficient ID-only queries

### Added
- New POST `/api/contacts` endpoint with `action: "getAllIds"` parameter
- Support for group filtering in bulk selection operations
- Enhanced debugging logs for search operations

### Changed
- Updated `handleSelectAllInSearch` to use new API endpoint
- Modified selection counter to display more accurate information
- Enhanced search API to support both search terms and group filtering

### Technical
- Implemented efficient contact ID retrieval for bulk operations
- Added support for complex search queries in bulk selection
- Enhanced error handling and fallback behavior for selection operations

## [1.3.0] - 2024-10-03

### Added
- Complete contact group management system
- Group creation, editing, and deletion functionality
- Contact-to-group assignment with bulk operations
- Group management UI with color coding and member counts
- Group selection dropdown in bulk operations
- Group modal for comprehensive group management

### Database
- Added `Group` model with name, description, and color fields
- Added `ContactGroup` model for many-to-many relationships
- Implemented unique constraints to prevent duplicate assignments
- Added cascade delete functionality for group relationships

### API
- `GET /api/groups` - List all groups with member counts
- `POST /api/groups` - Create new groups
- `GET /api/groups/[id]` - Get specific group with members
- `PUT /api/groups/[id]` - Update group details
- `DELETE /api/groups/[id]` - Delete groups
- `POST /api/groups/[id]/contacts` - Add contacts to groups
- `DELETE /api/groups/[id]/contacts` - Remove contacts from groups

### UI/UX
- Added "Groups" button to main navigation
- Created comprehensive group management modal
- Implemented color-coded group indicators
- Added member count display for each group
- Enhanced bulk operations with group assignment

## [1.2.1] - 2024-10-03

### Added
- Undo functionality for bulk delete operations
- 10-second undo timeout with automatic cleanup
- Visual undo notifications with action buttons
- Enhanced error handling for bulk operations

### Changed
- Modified bulk delete to store deleted contacts for potential restoration
- Updated undo notification UI with Apple-style design
- Enhanced error logging for better debugging

### Technical
- Added `deletedContacts` state management
- Implemented `handleUndoDelete` function with API calls
- Added `POST /api/contacts/[id]?action=restore` endpoint
- Enhanced error handling and user feedback

## [1.2.0] - 2024-10-03

### Added
- Multi-contact selection system with checkboxes
- Bulk export functionality for selected contacts
- Bulk delete operations with confirmation dialogs
- "Select All in Search" functionality
- Selection counter with real-time updates
- CSV export with proper formatting and escaping

### UI/UX
- Added selection controls bar with action buttons
- Implemented visual feedback for all selection states
- Enhanced contact list with selection checkboxes
- Added bulk action buttons (Export, Delete, Add to Group)

### Technical
- Added `selectedContactIds` state management
- Implemented `handleContactCheckboxChange` function
- Created `convertToCSV` and `downloadCSV` utility functions
- Enhanced contact list component with selection props

## [1.1.8] - 2024-10-03

### Fixed
- Search pagination issue where search results were not displayed
- Added automatic page reset to page 1 when search term changes
- Enhanced search functionality to work correctly across all pages

### Changed
- Updated search behavior to automatically reset pagination
- Enhanced user experience for search operations

## [1.1.7] - 2024-10-03

### Added
- Comprehensive debugging logs for search operations
- Enhanced error handling and logging throughout the application
- Detailed console output for troubleshooting search issues

### Changed
- Updated version number to reflect debugging improvements
- Enhanced error reporting for better development experience

## [1.1.6] - 2024-10-03

### Fixed
- Contact saving functionality with proper API routing
- Removed duplicate API calls in contact update flow
- Fixed 500 Internal Server Error during contact updates

### Changed
- Moved PUT method from `/api/contacts/route.ts` to `/api/contacts/[id]/route.ts`
- Implemented field filtering for contact updates
- Enhanced error logging with detailed error information

### Technical
- Added proper API routing for contact updates
- Implemented data validation and filtering
- Enhanced error handling with try-catch blocks

## [1.1.5] - 2024-10-03

### Fixed
- PrismaClientValidationError for SQLite compatibility
- Removed `mode: "insensitive"` from all Prisma queries
- Fixed search functionality to work with SQLite database

### Changed
- Updated all database queries to be SQLite compatible
- Enhanced search functionality with proper query parsing

## [1.1.4] - 2024-10-03

### Added
- "Empty X" search functionality for finding contacts with missing fields
- Logical operators (AND, OR, NOT) in search functionality
- Dynamic search hints and help messages
- Enhanced search placeholder text

### Changed
- Updated search input with comprehensive placeholder
- Enhanced search API with advanced query parsing
- Improved user experience with contextual help

## [1.1.3] - 2024-10-03

### Added
- Scrollable contact list with max height
- "Empty X" indicators for missing contact fields
- Save feedback for edit operations in contact list
- Enhanced visual feedback for all user actions

### Changed
- Updated contact list styling for better scrolling
- Enhanced contact display with missing field indicators
- Improved save button feedback in edit modals

## [1.1.2] - 2024-10-03

### Added
- Visual feedback for save operations (spinning, success, error states)
- Enhanced debugging logs for contact operations
- Save status indicators in contact detail component

### Changed
- Updated save button styling to reflect operation status
- Enhanced error handling and user feedback
- Improved contact update flow with better debugging

## [1.1.1] - 2024-10-03

### Added
- Version number display in application header
- Enhanced search functionality with dynamic hints
- Improved user experience with contextual help

### Changed
- Updated header to show current version
- Enhanced search interface with better user guidance

## [1.1.0] - 2024-10-03

### Added
- Comprehensive search functionality with advanced features
- "Empty X" search patterns for finding incomplete contacts
- Logical operators (AND, OR, NOT) for complex queries
- Dynamic search hints and examples
- Enhanced search API with query parsing

### Changed
- Updated search interface with better user experience
- Enhanced search functionality with advanced query support
- Improved search performance and accuracy

## [1.0.0] - 2024-10-03

### Added
- Initial release of Novo Contacts application
- CSV upload functionality with drag-and-drop interface
- Contact management with view, edit, and delete operations
- Version control system with automatic versioning
- Restore functionality for individual and bulk operations
- Configurable display settings
- Responsive design with Apple-inspired UI
- SQLite database with Prisma ORM
- Complete API with comprehensive endpoints

### Features
- **Contact Management**: Full CRUD operations with version control
- **CSV Import**: Google Contacts CSV export support
- **Version Control**: Automatic versioning with restore capabilities
- **Settings**: Configurable field visibility and display preferences
- **Search**: Basic search functionality across all fields
- **Responsive Design**: Works on all device sizes
- **Modern UI**: Apple-inspired design with smooth animations

### Technical
- Next.js 14 with React 18 and TypeScript
- Tailwind CSS for styling
- SQLite database with Prisma ORM
- React Dropzone for file uploads
- PapaParse for CSV processing
- Lucide React for icons

---

## Development Notes

### Version Numbering
- **Major** (1.x.x): Significant new features or breaking changes
- **Minor** (x.1.x): New features and enhancements
- **Patch** (x.x.1): Bug fixes and minor improvements

### Database Schema Evolution
- Version 1.0.0: Initial schema with Contact, ContactVersion, ContactUpload, DisplaySettings
- Version 1.3.0: Added Group and ContactGroup models for group management

### API Evolution
- Version 1.0.0: Basic CRUD operations for contacts
- Version 1.1.0: Enhanced search with advanced query parsing
- Version 1.2.0: Bulk operations and selection system
- Version 1.3.0: Group management endpoints
- Version 1.3.2: Group filtering and enhanced search

### UI/UX Evolution
- Version 1.0.0: Basic contact management interface
- Version 1.1.0: Enhanced search with hints and help
- Version 1.2.0: Multi-selection and bulk operations
- Version 1.3.0: Group management interface
- Version 1.3.2: Group filtering and display
