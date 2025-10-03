# Novo Contacts API Documentation

This document provides comprehensive documentation for all API endpoints in the Novo Contacts application.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently, the API does not require authentication. All endpoints are publicly accessible.

## Response Format
All API responses follow a consistent format:

### Success Response
```json
{
  "data": "response_data",
  "pagination": {
    "page": 1,
    "pages": 10,
    "total": 100,
    "limit": 20
  }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Data Cleanup

### POST /api/cleanup
Perform data cleanup operations on contacts.

#### Request Body
```json
{
  "action": "cleanup_type"
}
```

#### Cleanup Types
- `general`: Comprehensive cleanup of all data issues
- `useless-contacts`: Remove test data, placeholders, and generic contacts
- `invalid-emails`: Remove contacts with malformed email addresses
- `test-data`: Remove contacts from test domains and patterns
- `data-validation`: Clean and normalize contact data formatting
- `address-cleanup`: Fix malformed addresses and escape sequences
- `empty-fields`: Fill in missing names and emails
- `duplicates`: Find and remove duplicate contacts

#### Response
```json
{
  "success": true,
  "results": {
    "cleaned": 116,
    "errors": 0,
    "details": [
      "Removed useless contact: John (john@example.com)",
      "Removed contact with invalid email: Test User (invalid@email)",
      "Cleaned address for contact cmga5ip2b0004o4mfmqzjqs4l"
    ]
  }
}
```

#### Example Usage
```bash
# General cleanup
curl -X POST http://localhost:3000/api/cleanup \
  -H "Content-Type: application/json" \
  -d '{"action": "general"}'

# Remove useless contacts
curl -X POST http://localhost:3000/api/cleanup \
  -H "Content-Type: application/json" \
  -d '{"action": "useless-contacts"}'

# Clean invalid emails
curl -X POST http://localhost:3000/api/cleanup \
  -H "Content-Type: application/json" \
  -d '{"action": "invalid-emails"}'
```

## Contact Management

### GET /api/contacts
Retrieve a paginated list of contacts with optional filtering and search.

#### Query Parameters
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `search` (string, optional): Search term
- `sortBy` (string, optional): Sort field (default: "name")
- `sortOrder` (string, optional): Sort order - "asc" or "desc" (default: "asc")
- `groupId` (string, optional): Filter by group ID

#### Search Syntax
- **Text Search**: Simple text matching across all fields
- **Empty Field Search**: Use "Empty X" where X is field name
  - Examples: "Empty Phone", "Empty Email", "Empty Address", "Empty Name", "Empty Notes"
- **Logical Operators**: Use AND, OR, NOT for complex queries
  - Examples: "John AND email", "phone OR address", "NOT empty", "John AND NOT Smith"

#### Example Request
```bash
GET /api/contacts?page=1&limit=10&search=john&sortBy=name&sortOrder=asc&groupId=group123
```

#### Example Response
```json
{
  "contacts": [
    {
      "id": "contact123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "address": "123 Main St",
      "notes": "Important contact",
      "version": 1,
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pages": 5,
    "total": 50,
    "limit": 10
  }
}
```

### GET /api/contacts/[id]
Retrieve a specific contact with its version history.

#### Path Parameters
- `id` (string, required): Contact ID

#### Example Response
```json
{
  "id": "contact123",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "notes": "Important contact",
  "version": 1,
  "isActive": true,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "versions": [
    {
      "id": "version123",
      "version": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "address": "123 Main St",
      "notes": "Important contact",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### PUT /api/contacts/[id]
Update a contact. Creates a new version automatically.

#### Path Parameters
- `id` (string, required): Contact ID

#### Request Body
```json
{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "phone": "+1234567890",
  "address": "456 New St",
  "notes": "Updated contact"
}
```

#### Example Response
```json
{
  "id": "contact123",
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "phone": "+1234567890",
  "address": "456 New St",
  "notes": "Updated contact",
  "version": 2,
  "isActive": true,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T01:00:00.000Z"
}
```

### DELETE /api/contacts/[id]
Soft delete a contact (sets isActive to false).

#### Path Parameters
- `id` (string, required): Contact ID

#### Example Response
```json
{
  "success": true
}
```

### POST /api/contacts
Get all contact IDs matching search criteria (for bulk operations).

#### Request Body
```json
{
  "action": "getAllIds",
  "search": "john",
  "groupId": "group123"
}
```

#### Example Response
```json
{
  "contactIds": ["contact1", "contact2", "contact3"]
}
```

## Group Management

### GET /api/groups
Retrieve all groups with member counts.

#### Example Response
```json
[
  {
    "id": "group123",
    "name": "Work Contacts",
    "description": "Professional contacts",
    "color": "#007AFF",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "contacts": [
      {
        "id": "contactgroup123",
        "contactId": "contact123",
        "groupId": "group123",
        "addedAt": "2023-01-01T00:00:00.000Z",
        "contact": {
          "id": "contact123",
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ]
  }
]
```

### POST /api/groups
Create a new group.

#### Request Body
```json
{
  "name": "Work Contacts",
  "description": "Professional contacts",
  "color": "#007AFF"
}
```

#### Example Response
```json
{
  "id": "group123",
  "name": "Work Contacts",
  "description": "Professional contacts",
  "color": "#007AFF",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### GET /api/groups/[id]
Retrieve a specific group with its members.

#### Path Parameters
- `id` (string, required): Group ID

#### Example Response
```json
{
  "id": "group123",
  "name": "Work Contacts",
  "description": "Professional contacts",
  "color": "#007AFF",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "contacts": [
    {
      "id": "contactgroup123",
      "contactId": "contact123",
      "groupId": "group123",
      "addedAt": "2023-01-01T00:00:00.000Z",
      "contact": {
        "id": "contact123",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

### PUT /api/groups/[id]
Update a group.

#### Path Parameters
- `id` (string, required): Group ID

#### Request Body
```json
{
  "name": "Updated Work Contacts",
  "description": "Updated description",
  "color": "#FF0000"
}
```

#### Example Response
```json
{
  "id": "group123",
  "name": "Updated Work Contacts",
  "description": "Updated description",
  "color": "#FF0000",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T01:00:00.000Z"
}
```

### DELETE /api/groups/[id]
Delete a group.

#### Path Parameters
- `id` (string, required): Group ID

#### Example Response
```json
{
  "success": true
}
```

### POST /api/groups/[id]/contacts
Add contacts to a group.

#### Path Parameters
- `id` (string, required): Group ID

#### Request Body
```json
{
  "contactIds": ["contact1", "contact2", "contact3"]
}
```

#### Example Response
```json
{
  "success": true,
  "added": 3
}
```

### DELETE /api/groups/[id]/contacts
Remove contacts from a group.

#### Path Parameters
- `id` (string, required): Group ID

#### Request Body
```json
{
  "contactIds": ["contact1", "contact2"]
}
```

#### Example Response
```json
{
  "success": true,
  "removed": 2
}
```

## System Operations

### POST /api/upload
Upload a CSV file with contacts.

#### Request Body
Form data with CSV file.

#### Example Response
```json
{
  "success": true,
  "uploadId": "upload123",
  "totalContacts": 100,
  "processedContacts": 100
}
```

### POST /api/restore
Restore contacts to previous versions.

#### Request Body
```json
{
  "type": "individual",
  "contactId": "contact123",
  "version": 1
}
```

or

```json
{
  "type": "bulk",
  "date": "2023-01-01T00:00:00.000Z"
}
```

#### Example Response
```json
{
  "success": true,
  "restored": 1
}
```

### GET /api/settings
Retrieve display settings.

#### Example Response
```json
{
  "id": "settings123",
  "userId": "default",
  "showName": true,
  "showEmail": true,
  "showPhone": true,
  "showAddress": true,
  "showNotes": false,
  "itemsPerPage": 20,
  "sortBy": "name",
  "sortOrder": "asc",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### PUT /api/settings
Update display settings.

#### Request Body
```json
{
  "showName": true,
  "showEmail": true,
  "showPhone": true,
  "showAddress": true,
  "showNotes": false,
  "itemsPerPage": 20,
  "sortBy": "name",
  "sortOrder": "asc"
}
```

#### Example Response
```json
{
  "id": "settings123",
  "userId": "default",
  "showName": true,
  "showEmail": true,
  "showPhone": true,
  "showAddress": true,
  "showNotes": false,
  "itemsPerPage": 20,
  "sortBy": "name",
  "sortOrder": "asc",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T01:00:00.000Z"
}
```

### GET /api/uploads
Retrieve upload history.

#### Example Response
```json
[
  {
    "id": "upload123",
    "filename": "contacts.csv",
    "uploadDate": "2023-01-01T00:00:00.000Z",
    "totalContacts": 100,
    "processedContacts": 100,
    "status": "completed"
  }
]
```

## Error Handling

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

### Common Error Responses

#### Validation Error
```json
{
  "error": "Validation failed",
  "details": "Required field 'name' is missing"
}
```

#### Not Found Error
```json
{
  "error": "Contact not found"
}
```

#### Server Error
```json
{
  "error": "Failed to process request",
  "details": "Database connection failed"
}
```

## Rate Limiting
Currently, there are no rate limits implemented. This may be added in future versions.

## CORS
The API supports CORS for cross-origin requests from the frontend application.

## Data Validation
All input data is validated on the server side. Invalid data will result in a 400 Bad Request response with details about the validation errors.

## Pagination
List endpoints support pagination with the following parameters:
- `page`: Page number (1-based)
- `limit`: Items per page (default: 20, max: 100)

Pagination metadata is included in the response:
```json
{
  "pagination": {
    "page": 1,
    "pages": 10,
    "total": 200,
    "limit": 20
  }
}
```
