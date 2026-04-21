# Admin Panel Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     ADMIN CONTROL CENTER                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────────┐
        │           7 Main Navigation Tabs             │
        └─────────────────────────────────────────────┘
                  │  │  │  │  │  │  │
    ┌─────┬──────┘  │  │  │  │  │  └─────────┬──────────┐
    │     │         │  │  │  │  │            │          │
    ▼     ▼         ▼  ▼  ▼  ▼  ▼            ▼          ▼
   OV   Tests      Users Rec Test Recruiter Tester  Support
  VIEW   &POST          HUB HUB   HUB      HUB      CHATS
    │     │         │  │  │  │  │            │          │
    └─────┴─────────┴──┴──┴──┴──┴────────────┴──────────┘
            │                                   │
            ▼                                   ▼
    ┌──────────────────────┐        ┌─────────────────────────┐
    │  Data Management     │        │  Communication Manager  │
    │  - Test CRUD         │        │  - Chat Conversations   │
    │  - User Filters      │        │  - Message Threads      │
    │  - Submission Track  │        │  - Escalation Handler   │
    └──────────────────────┘        └─────────────────────────┘
            │                                   │
            ▼                                   ▼
    ┌──────────────────────────────────────────────────────┐
    │              SUPABASE BACKEND                        │
    │  ┌────────────┐  ┌──────────────┐  ┌────────────┐   │
    │  │ user_roles │  │  profiles    │  │   tests    │   │
    │  └────────────┘  └──────────────┘  └────────────┘   │
    │  ┌────────────┐  ┌──────────────┐  ┌────────────┐   │
    │  │submissions │  │    chat_     │  │   chat_    │   │
    │  │            │  │conversations │  │ messages   │   │
    │  └────────────┘  └──────────────┘  └────────────┘   │
    └──────────────────────────────────────────────────────┘
```

## Data Flow

### Recruiter → Test → Tester Path
```
Recruiter Creates Test
        ↓
  Test in "pending"
        ↓
Admin Reviews & Activates
        ↓
  Test "active" → Testers Can See
        ↓
Tester Submits Completion
        ↓
Submission Created
        ↓
Admin/Recruiter Reviews Quality
        ↓
Rate Submission (★★★★★)
        ↓
Feedback Loop → Improve Platform Quality
```

### Data Sources in Each Tab

| Tab | Primary Table | Related Tables | Key Metrics |
|-----|---|---|---|
| Overview | tests, submissions | profiles | Completion %, Engagement %, Avg Rating |
| Tests & Postings | tests | submissions, profiles | Per-test stats, recruiter info |
| Users | user_roles | profiles | Role distribution, join dates |
| Recruiter Hub | tests | submissions, profiles | Tests created, completion rate |
| Tester Hub | submissions | profiles, tests | Quality rating, consistency |
| Support | chat_conversations | chat_messages | Status, message count, escalation |

## Component Hierarchy

```
AdminPanel (Main)
├── Header Section
│   ├── Title & Icon
│   └── Refresh Button
├── Quick Stats Grid (5 cards)
├── Tabs Component
│   ├── Overview Tab
│   │   ├── Platform Analytics Card
│   │   ├── Quick Actions Card
│   │   └── Recent Activity Feed
│   ├── Tests Tab
│   │   ├── Search & Filter Bar
│   │   ├── Tests Table
│   │   └── Edit Dialog
│   ├── Users Tab
│   │   ├── Search & Filter Bar
│   │   └── Users Table
│   ├── Recruiter Hub Tab
│   │   ├── Stats Cards
│   │   └── Top Recruiters List
│   ├── Tester Hub Tab
│   │   ├── Stats Cards
│   │   └── Top Testers List
│   └── Support Tab
│       ├── Conversations List
│       └── Message View & Reply
└── Edit Test Dialog (Modal)
```

## State Management

```typescript
// Data State
users: UserWithRole[]
tests: TestData[]
submissions: SubmissionData[]
conversations: ChatConversation[]
stats: PlatformStats

// UI State
activeTab: string
selectedConvo: string | null
editingTest: TestData | null
editDialogOpen: boolean

// Filter State
userSearchQuery: string
userRoleFilter: 'all' | 'recruiter' | 'tester'
testSearchQuery: string
testStatusFilter: 'all' | 'active' | 'completed' | 'paused'
chatFilter: 'all' | 'escalated' | 'active' | 'closed'

// Async State
loading: boolean
sendingReply: boolean
loadingMessages: boolean
```

## API Integration Points

### Fetch Operations
- `fetchAll()` - Load all initial data
- `fetchConversations()` - Refresh chat list
- `openConversation(id)` - Load message history
- Data synced from Supabase tables

### Mutation Operations
- `handleUpdateTest()` - Update test details
- `handleDeleteTest()` - Delete test
- `sendReply()` - Send chat message
- `closeConversation()` - Mark chat as resolved

## Interlinking Strategy

### 1. Direct Navigation Links
- Recruiter Name → View all recruiter's tests
- Tester ID → View tester's submission quality
- Test Title → View detailed test analytics

### 2. Data Cross-References
- Tests Tab shows recruiter performance via test creation count
- Recruiter Hub shows test creation trends
- Tester Hub shows quality ratings across submissions
- Support Tab shows common issues from recruiters/testers

### 3. Correlation Metrics
- Recruiter Performance = (Active Tests × Completion Rate × Avg Rating)
- Tester Quality = Average Rating across all submissions
- Platform Health = (Completion % + Engagement % + Quality Rating) / 3

## Real-time Features

- **Live Stats**: Dashboard updates on page load
- **Message Threading**: Chat messages load chronologically
- **Status Indicators**: Test status badges update on change
- **Activity Feed**: Recent submissions show in real-time

## Performance Optimization

- **Lazy Loading**: Tables use ScrollArea for large datasets
- **Pagination**: Tables paginate large result sets
- **Filtering**: Client-side filters before rendering
- **Caching**: Stats cached until refresh clicked
- **Debouncing**: Search queries debounced

## Security Features

- Role-based access (admin only)
- No sensitive data in UI (emails shown, but testers anonymized where appropriate)
- Edit/Delete confirmations prevent accidents
- Chat messages logged for audit trail
- All mutations go through Supabase RLS policies

## Footer Page Integration (Planned)

```
Content Management Tab (Future)
├── Legal Pages
│   ├── Privacy Policy
│   ├── Terms of Service
│   └── Cookies Policy
├── Product Pages
│   ├── Features
│   ├── Pricing
│   └── Integrations
├── Company Pages
│   ├── About
│   ├── Careers
│   ├── Blog
│   └── Press
└── Resources
    ├── Documentation
    ├── Community
    ├── Changelog
    └── Contact
```

Each section would allow admins to:
- View current content
- Edit text and links
- Preview before publishing
- Version control
- Publish/unpublish
