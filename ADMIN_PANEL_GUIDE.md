# Admin Control Center Guide

## Overview
The enhanced Admin Control Center provides comprehensive management of the User Ninjas platform with best-in-class design and seamless interlinking between recruiters and testers.

## Key Features

### 1. **Dashboard Overview**
- **Quick Stats**: Real-time metrics showing Total Users, Recruiters, Testers, Active Tests, and Escalated Chats
- **Platform Analytics**: Visual indicators for:
  - Test Completion Rate
  - User Engagement Level
  - Test Quality (Average Rating)
- **Recent Activity**: Latest submissions with quick status overview
- **Quick Actions**: Fast access to common admin tasks

### 2. **Tests & Postings Management**
**Tab: Tests & Postings**

Features:
- View all tests from all recruiters in one place
- **Search & Filter**:
  - Search by test title
  - Filter by status (Active, Completed, Paused)
- **Detailed Metrics** per test:
  - Test title and recruiter name
  - Current status with visual badges
  - Reward amount
  - Number of submissions
  - Average rating from testers
  - Creation date
- **Actions**:
  - Edit test details (title, description, reward, status)
  - Delete tests
  - View detailed stats

### 3. **User Management**
**Tab: Users**

Capabilities:
- View all users on the platform
- **Filter Options**:
  - Search by name or email
  - Filter by role (All, Recruiters, Testers)
- **User Information**:
  - Full name
  - Email address
  - User role with color-coded badges
  - Join date
  - Current status

### 4. **Recruiter Hub**
**Tab: Recruiter Hub**

Insights:
- **Recruiter Statistics**:
  - Total recruiters on platform
  - Total tests created
  - Active tests count
- **Top Performing Recruiters**:
  - Recruiter name and performance metrics
  - Number of tests created
  - Number of submissions received
  - Completion percentage

**Use Case**: Identify high-performing recruiters, understand test creation patterns, and provide support to underperforming recruiters.

### 5. **Tester Hub**
**Tab: Tester Hub**

Metrics:
- **Tester Statistics**:
  - Total testers
  - Total submissions completed
  - Average quality rating
- **Top Quality Testers**:
  - Tester ID (anonymized)
  - Star rating indicator
  - Number of submissions
  - Average rating score

**Use Case**: Recognize quality testers, monitor engagement patterns, and identify problem submissions.

### 6. **Support & Chat Management**
**Tab: Support (Chats)**

Features:
- **Conversation Filtering**:
  - View all conversations
  - Filter by status: Escalated, Active, Closed
- **Message Management**:
  - View full conversation history
  - Send replies as admin/agent
  - Close conversations when resolved
- **Priority Handling**:
  - Escalated chats shown prominently
  - Badge indicators for unresolved issues
  - Quick-access button to high-priority conversations

## Workflow Flows

### Flow 1: Monitor & Manage Tests
```
Overview → Tests Tab → Search/Filter → 
  ├─ View Details → Edit Test → Update → Save
  ├─ Check Submissions → View Ratings → Monitor Quality
  └─ Delete if Needed → Confirm → Remove from Platform
```

### Flow 2: Recruiter-Tester Linking
```
Recruiter Hub ←→ Tests Performance ←→ Tester Hub
  ├─ High-performing Recruiters → Quality Tests → Quality Testers
  ├─ Monitor test completion rates
  ├─ Track tester ratings for quality
  └─ Make pairing recommendations
```

### Flow 3: Support & Escalation
```
Support Tab → Filter Escalated → Select Conversation →
  ├─ Read History → Understand Issue
  ├─ Compose Reply → Send Message
  └─ Mark Resolved → Close Conversation
```

### Flow 4: Platform Health Check
```
Dashboard → Quick Stats → Identify Issues →
  ├─ Low Completion? → Tests Tab → Check Test Setup
  ├─ Low Engagement? → Users Tab → Check User Activity
  ├─ Escalated Chats? → Support Tab → Address Issues
  └─ Low Quality? → Tester Hub → Monitor Testers
```

## Integration with Footer Pages

Footer pages can now be managed through the admin panel with planned integration for:
- **Legal Pages**: Privacy, Terms, Cookies settings
- **Product Pages**: Features, Pricing, Integrations management
- **Company Pages**: About, Careers, Blog, Press updates
- **Resources**: Documentation, Community, Changelog maintenance

## Data Synchronization

The admin panel pulls data from:
- `user_roles` table - User role assignments
- `profiles` table - User profile information
- `tests` table - All test postings
- `submissions` table - Test submissions and ratings
- `chat_conversations` table - Support conversations
- `chat_messages` table - Chat message history

## Recruiter-Tester Interlinking

### Direct Links
1. **From Recruiter Hub**: Click on recruiter name → view all their tests
2. **From Tests Tab**: Click recruiter name → view recruiter profile
3. **From Submissions**: Click tester → view tester's quality metrics

### Performance Correlation
- **Test Rating** ← Quality of test creation
- **Submission Quality** ← Tester's skill level
- **Completion Rate** ← Test design effectiveness + Tester motivation

## Quick Actions

### Create New Test
1. Click "New Test" button in Tests tab
2. Fill in test details (title, description, reward)
3. Set maximum testers needed
4. Publish to platform

### Manage Users
1. Go to Users tab
2. Search or filter as needed
3. Click eye icon to view detailed profile
4. Update role if needed

### Respond to Support
1. Go to Support tab
2. Select escalated conversation
3. Read message history
4. Type and send reply
5. Mark as closed when resolved

## Best Practices

### For Platform Health
- ✅ Review escalated chats daily
- ✅ Monitor test completion rates (target: 70%+)
- ✅ Check average test rating (target: 4.0+/5)
- ✅ Ensure user engagement stays above 80%

### For Recruiter Success
- ✅ Identify top recruiters monthly
- ✅ Provide feedback on test setup
- ✅ Monitor test creation quality
- ✅ Support new recruiters

### For Tester Quality
- ✅ Monitor high-rating testers
- ✅ Address quality issues early
- ✅ Recognize excellent submissions
- ✅ Track consistency

## Troubleshooting

### Issue: Tests not showing
- **Solution**: Click Refresh button, verify recruiter account status

### Issue: Can't edit test
- **Solution**: Verify test isn't completed, check permissions

### Issue: Chat history not loading
- **Solution**: Check conversation exists, try refreshing page

### Issue: Stats showing incorrect numbers
- **Solution**: Click Refresh button to sync data from database

## Performance Tips

- Use filters to reduce data load (e.g., filter by status)
- Search for specific items instead of scrolling large lists
- Close resolved conversations to keep support tab organized
- Archive old data periodically for better performance

## Security

- All data is displayed with appropriate anonymization where needed
- Edit and delete actions require confirmation
- Conversation closures are logged
- Admin actions are audit-tracked in the system
