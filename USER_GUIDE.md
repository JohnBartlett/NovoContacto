# Novo Contacts User Guide

Welcome to Novo Contacts, a powerful contact management system with advanced features for organizing, searching, and managing your contacts.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Basic Operations](#basic-operations)
3. [Advanced Search](#advanced-search)
4. [Contact Groups](#contact-groups)
5. [Bulk Operations](#bulk-operations)
6. [Data Cleanup](#data-cleanup)
7. [Version Control](#version-control)
8. [Settings & Preferences](#settings--preferences)
9. [Tips & Tricks](#tips--tricks)

## Getting Started

### First Time Setup

1. **Upload Your Contacts**
   - Click the "Upload CSV" button
   - Drag and drop your Google Contacts CSV file
   - Wait for the import to complete

2. **Explore the Interface**
   - View your contacts in the main list
   - Use the search bar to find specific contacts
   - Click on any contact to view details

3. **Configure Settings**
   - Click the "Settings" button to customize your view
   - Choose which fields to display
   - Set your preferred items per page

## Basic Operations

### Viewing Contacts

The main contact list shows all your imported contacts with:
- **Name**: Contact's full name
- **Email**: Primary email address
- **Phone**: Primary phone number
- **Address**: Primary address
- **Notes**: Additional information
- **Version**: Current version number

#### Display Formats
- **Standard Display**: Multi-line layout for readability
- **Terse Display**: Single-line compact layout. To enable:
  1. Go to Settings
  2. Toggle "Terse Display" in the Display Format section
  3. Click "Save Settings"

### Searching Contacts

#### Simple Search
- Type any text in the search bar
- Search works across all fields (name, email, phone, address, notes)
- Results update in real-time

#### Advanced Search Patterns

**Find Missing Information**
- `Empty Phone` - Find contacts without phone numbers
- `Empty Email` - Find contacts without email addresses
- `Empty Address` - Find contacts without addresses
- `Empty Name` - Find contacts without names
- `Empty Notes` - Find contacts without notes
- `Empty` - Find contacts with any missing field

**Logical Operators**
- `John AND email` - Find contacts named John with email addresses
- `phone OR address` - Find contacts with either phone or address
- `NOT empty` - Find contacts with all fields filled
- `John AND NOT Smith` - Find contacts named John but not Smith

### Editing Contacts

1. **Click the Edit Button** on any contact
2. **Modify Information** in the contact detail panel
3. **Click the Save Button** (green diskette icon)
4. **Watch for Feedback** - the save button will show success/error status

### Deleting Contacts

- **Individual Delete**: Click the delete button on any contact
- **Bulk Delete**: Select multiple contacts and use the bulk delete option
- **Undo Delete**: Use the undo notification that appears after deletion

## Advanced Search

### Search Hints

The search bar provides dynamic hints based on your input:

- **"Empty"** → Shows all "Empty X" options
- **"AND"** → Shows logical operator examples
- **"OR"** → Shows logical operator examples
- **"NOT"** → Shows logical operator examples

### Search Examples

```
# Find contacts with missing phone numbers
Empty Phone

# Find contacts named John with email addresses
John AND email

# Find contacts with either phone or address
phone OR address

# Find contacts with all fields filled
NOT empty

# Find contacts named John but not Smith
John AND NOT Smith

# Find contacts with specific domain
@company.com

# Find contacts with specific area code
(555)
```

## Contact Groups

### Creating Groups

1. **Click the "Groups" Button**
2. **Click "New Group"**
3. **Fill in Details**:
   - Name: Group name (required)
   - Description: Optional description
   - Color: Choose a color for visual identification
4. **Click "Create"**

### Adding Contacts to Groups

#### Method 1: From Search Results
1. **Search for contacts** you want to group
2. **Select contacts** using checkboxes
3. **Choose "Add to Group"** from the dropdown
4. **Select destination group**

#### Method 2: From Contact List
1. **Select contacts** using checkboxes
2. **Choose "Add to Group"** from the dropdown
3. **Select destination group**

### Viewing Group Contacts

1. **Use the "Filter by Group" dropdown**
2. **Select a group** to view only its members
3. **Search within the group** to find specific contacts
4. **Use "Clear Filter"** to return to all contacts

### Managing Groups

1. **Click the "Groups" Button**
2. **View all groups** with member counts
3. **Edit groups** by clicking the edit button
4. **Delete groups** by clicking the delete button
5. **View group members** by clicking the view button

## Bulk Operations

### Selecting Contacts

#### Individual Selection
- **Click checkboxes** next to contacts you want to select
- **Selection counter** shows how many contacts are selected

#### Bulk Selection
- **"Select All"** - Select all visible contacts on current page
- **"Select None"** - Clear all selections
- **"Select All in Search"** - Select ALL contacts matching search criteria (across all pages)

### Bulk Actions

#### Export Selected
1. **Select contacts** you want to export
2. **Click "Export Selected"**
3. **CSV file downloads** automatically

#### Delete Selected
1. **Select contacts** you want to delete
2. **Click "Delete Selected"**
3. **Confirm deletion** in the dialog
4. **Use "Undo"** if you change your mind (10-second timeout)

#### Add to Group
1. **Select contacts** you want to group
2. **Choose "Add to Group"** from the dropdown
3. **Select destination group**

### Undo Operations

After bulk delete operations:
- **Undo notification appears** for 10 seconds
- **Click "Undo"** to restore deleted contacts
- **Click "✕"** to dismiss the notification
- **Automatic cleanup** after 10 seconds

## Data Cleanup

### Overview

The cleanup system helps you maintain clean, organized contact data by identifying and removing problematic contacts. It includes 8 different cleanup types to address various data quality issues.

### Accessing Cleanup

1. Click the **"Cleanup"** button in the top navigation bar
2. Choose your cleanup type from the available options
3. Click **"Start Cleanup"** to begin the process
4. Review the results and details

### Cleanup Types

#### 1. General Cleanup 🧹
- **Purpose**: Comprehensive cleanup of all data issues
- **What it does**: Runs all cleanup routines in sequence
- **Best for**: Complete data maintenance

#### 2. Useless Contacts 🗑️
- **Purpose**: Remove test data, placeholders, and generic contacts
- **What it removes**:
  - Test data patterns (test@, demo@, example@)
  - Generic names (John, Jane, User, Admin)
  - No-reply emails (noreply@, no-reply@)
  - Placeholder data (single characters, generic addresses)

#### 3. Invalid Emails 📧
- **Purpose**: Remove contacts with malformed email addresses
- **What it removes**:
  - Missing @ symbol or multiple @ symbols
  - Invalid characters (+, &, ', !, emojis)
  - Incomplete emails (too short, missing TLD)
  - Malformed email formats

#### 4. Test Data 🧪
- **Purpose**: Remove contacts from test domains and patterns
- **What it removes**:
  - Test domains (example.com, test.com, localhost)
  - Test patterns (test1@, demo2@, user3@)
  - Temporary domains (temp.com, tmp.com)

#### 5. Data Validation ✅
- **Purpose**: Clean and normalize contact data formatting
- **What it does**:
  - Normalizes formatting (removes extra spaces)
  - Cleans phone numbers (removes invalid characters)
  - Standardizes emails (lowercase, removes spaces)
  - Cleans addresses (normalizes line breaks)

#### 6. Address Cleanup 🏠
- **Purpose**: Fix malformed addresses and escape sequences
- **What it fixes**:
  - Escape sequences (0D=0A, \n)
  - Duplicate content in addresses
  - Malformed address formatting

#### 7. Empty Fields 📝
- **Purpose**: Fill in missing names and emails
- **What it does**:
  - Extracts names from email addresses
  - Generates placeholder emails for contacts with names
  - Fills in missing contact information

#### 8. Remove Duplicates 🔄
- **Purpose**: Find and remove duplicate contacts
- **What it does**:
  - Identifies duplicates based on email addresses
  - Keeps the oldest contact, removes newer duplicates
  - Prevents duplicate contact clutter

### Understanding Results

After running cleanup, you'll see:
- **Cleaned**: Number of contacts processed
- **Errors**: Number of errors encountered
- **Details**: Specific actions taken for each contact

### Safety Features

- **Version Control**: All changes are versioned and can be restored
- **Soft Delete**: Contacts are marked as inactive, not permanently deleted
- **Detailed Logging**: Every action is logged for transparency
- **Error Handling**: Graceful handling of any issues during cleanup

### Best Practices

1. **Start with General Cleanup**: Run the comprehensive cleanup first
2. **Review Results**: Check the details to understand what was cleaned
3. **Run Specific Cleanups**: Use targeted cleanups for specific issues
4. **Regular Maintenance**: Run cleanup periodically to maintain data quality
5. **Backup First**: Consider backing up your data before major cleanups

## Version Control

### Understanding Versions

- **Every change creates a new version**
- **Version numbers increment automatically**
- **Complete history is preserved**
- **No data is ever lost**

### Viewing Version History

1. **Click on any contact** to view details
2. **Version history** is shown in the contact detail panel
3. **Each version** shows the date and changes made

### Restoring Contacts

#### Individual Restore
1. **Click the restore button** on any contact
2. **Choose version** to restore to
3. **Confirm restoration**

#### Bulk Restore
1. **Click the "History" button**
2. **Choose restore type**:
   - Individual contact to specific version
   - All contacts to specific date
3. **Confirm restoration**

## Settings & Preferences

### Display Settings

#### Field Visibility
- **Show/Hide Fields**: Choose which fields to display
- **Available Fields**: Name, Email, Phone, Address, Notes
- **Preview**: See changes before applying

#### Display Options
- **Items Per Page**: Set how many contacts to show (10, 20, 50, 100)
- **Sorting**: Choose sort field and order
- **Apply Changes**: Click "Apply" to save settings

### Search Settings

#### Search Hints
- **Dynamic Help**: Hints appear based on your input
- **Examples**: See examples for different search patterns
- **Syntax Help**: Learn advanced search syntax

## Tips & Tricks

### Efficient Searching

1. **Use "Empty X" patterns** to find incomplete contacts
2. **Combine search terms** with logical operators
3. **Use specific patterns** like email domains or phone area codes
4. **Save common searches** by bookmarking results

### Group Management

1. **Create meaningful group names** for easy identification
2. **Use colors** to visually distinguish groups
3. **Add descriptions** to document group purposes
4. **Regular cleanup** of unused groups

### Bulk Operations

1. **Use "Select All in Search"** for comprehensive selections
2. **Combine search and selection** for targeted bulk operations
3. **Use undo functionality** for safety
4. **Export before major changes** as backup

### Performance Tips

1. **Use specific search terms** for faster results
2. **Limit items per page** for better performance
3. **Clear filters** when not needed
4. **Regular database maintenance** for optimal performance

### Keyboard Shortcuts

- **Ctrl/Cmd + F**: Focus search bar
- **Ctrl/Cmd + A**: Select all visible contacts
- **Escape**: Clear search or close modals
- **Enter**: Apply search or confirm actions

### Best Practices

1. **Regular backups** of your contact data
2. **Consistent naming** for contacts and groups
3. **Regular cleanup** of duplicate or outdated contacts
4. **Use groups** to organize contacts by purpose or relationship
5. **Keep contact information current** with regular updates

## Troubleshooting

### Common Issues

#### Search Not Working
- **Check spelling** of search terms
- **Try simpler searches** first
- **Clear search** and try again
- **Check for special characters**

#### Contacts Not Saving
- **Check required fields** are filled
- **Try refreshing** the page
- **Check for error messages**
- **Contact support** if issues persist

#### Performance Issues
- **Reduce items per page** in settings
- **Use more specific searches**
- **Clear browser cache**
- **Restart the application**

### Getting Help

1. **Check this user guide** for detailed instructions
2. **Look for error messages** in the interface
3. **Try different approaches** to the same task
4. **Contact support** with specific error details

## Advanced Features

### CSV Export

- **Select contacts** you want to export
- **Click "Export Selected"**
- **CSV file downloads** with all selected contact data
- **Proper formatting** for import into other systems

### Data Integrity

- **Automatic validation** of contact data
- **Duplicate detection** during import
- **Data consistency checks** throughout the system
- **Backup and restore** capabilities

### Security

- **Local data storage** for privacy
- **No external data sharing**
- **Secure file handling** for uploads
- **Data encryption** at rest

---

## Support

For additional help or to report issues:

1. **Check the documentation** for detailed instructions
2. **Review the changelog** for recent updates
3. **Contact support** with specific error details
4. **Include screenshots** when reporting visual issues

Thank you for using Novo Contacts!
