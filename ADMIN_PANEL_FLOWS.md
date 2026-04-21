# Admin Panel User Flows & Interlinking

## Main Navigation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN HOME (/admin)                      │
│                  Loads Overview Dashboard                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┬─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
    ┌────────────┐    ┌────────────┐    ┌────────────┐
    │  Overview  │    │    Tests   │    │   Users    │
    │ Dashboard  │    │ & Postings │    │ Management │
    └────────────┘    └────────────┘    └────────────┘
        │                     │                     │
        ├─────────────────────┼─────────────────────┤
        │                     │                     │
        ▼                     ▼                     ▼
    ┌────────────┐    ┌────────────┐    ┌────────────┐
    │ Recruiter  │    │   Tester   │    │  Support   │
    │    Hub     │    │    Hub     │    │   (Chats)  │
    └────────────┘    └────────────┘    └────────────┘
```

---

## 1️⃣ Overview Tab Flow

```
User Enters Admin Panel
         ↓
┌────────────────────────────────────────┐
│   Quick Stats (5 Cards)                │
│   ├─ Total Users                       │
│   ├─ Recruiters Active                 │
│   ├─ Testers Active                    │
│   ├─ Tests Running                     │
│   └─ Escalated Chats (ALERT!)          │
└────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│   Platform Analytics                   │
│   ├─ Completion Rate 68% ████░         │
│   ├─ Engagement 82% ███████░           │
│   └─ Quality 4.2★ █████░               │
└────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────┐
│   Recent Activity (5 latest)           │
│   ├─ User 1 submitted test             │
│   ├─ User 2 approved task              │
│   └─ More...                           │
└────────────────────────────────────────┘
```

---

## 2️⃣ Tests & Postings Management Flow

```
Start: Tests Tab
     ↓
┌─────────────────────────────────────┐
│  Search & Filter                    │
│  ├─ Search by title                 │
│  └─ Filter: [Active] [All] [Status] │
└─────────────────────────────────────┘
     ↓
┌─────────────────────────────────────┐
│  Test List (Table)                  │
│  ┌──────────────────────────────┐   │
│  │ Title | Recruiter | Status   │   │
│  ├──────────────────────────────┤   │
│  │ "USB Login" | John | Active  │   │
│  │ "Mobile App" | Jane | Paused │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
     ↓
User Selects Action:
  ├─ Click Title → See Details
  ├─ Click Recruiter Name → View Recruiter Hub
  ├─ Click ✏️ → Edit Dialog
  └─ Click 🗑️ → Delete (confirm)
     ↓
If Edit:
  ┌──────────────────────────────────┐
  │  Edit Test Modal                 │
  │  ├─ Title input                  │
  │  ├─ Description textarea         │
  │  ├─ Reward $ amount              │
  │  ├─ Status dropdown              │
  │  └─ [Cancel] [Save Changes]      │
  └──────────────────────────────────┘
     ↓
  Changes saved & list refreshed
```

---

## 3️⃣ User Management Flow

```
Start: Users Tab
     ↓
┌──────────────────────────────────────┐
│  Search & Role Filter                │
│  ├─ Search: Name/Email               │
│  └─ Filter: [All] [Recruiters]       │
│           [Testers]                  │
└──────────────────────────────────────┘
     ↓
┌──────────────────────────────────────┐
│  User Table                          │
│  ┌────────────────────────────────┐  │
│  │ Name | Email | Role | Joined  │  │
│  ├────────────────────────────────┤  │
│  │ John | john@.. | Recruiter | Oct│  │
│  │ Jane | jane@.. | Tester | Dec  │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
     ↓
User Actions:
  ├─ View Profile (👁️ icon)
  ├─ Click Name → See Detail
  └─ Click Role Badge → See role info
```

---

## 4️⃣ Recruiter Hub Interlinking Flow

```
Start: Recruiter Hub
        ↓
┌─────────────────────────────────┐
│  Recruiter Statistics           │
│  ├─ Total: 15 recruiters        │
│  ├─ Tests Created: 127          │
│  └─ Active Now: 42              │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│  Top Performers List            │
│  ┌──────────────────────────────┐
│  │ 1. John - 18 tests, 94% fill │
│  │ 2. Jane - 15 tests, 87% fill │
│  │ 3. Bob  - 12 tests, 76% fill │
│  └──────────────────────────────┘
└─────────────────────────────────┘
        ↓
User Clicks on Recruiter Name:
        ├─ Route to Tests Tab
        └─ Filter to Show Only Their Tests
           ↓
        See All John's Tests:
        ├─ Mobile App - Active - 8 submissions
        ├─ Website Test - Completed - 12 ratings
        └─ etc...
           ↓
        Can Then:
        ├─ Edit Their Tests
        ├─ Check Submissions Quality
        └─ Monitor Performance
```

---

## 5️⃣ Tester Hub Quality Tracking Flow

```
Start: Tester Hub
        ↓
┌─────────────────────────────────┐
│  Tester Statistics              │
│  ├─ Total: 245 testers          │
│  ├─ Submissions: 892 completed  │
│  └─ Avg Quality: 4.2/5 ⭐       │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│  Top Quality Testers            │
│  ┌──────────────────────────────┐
│  │ 1. [ID] ⭐⭐⭐⭐⭐ 4.9/5      │
│  │    23 submissions             │
│  │ 2. [ID] ⭐⭐⭐⭐☆ 4.7/5      │
│  │    18 submissions             │
│  │ 3. [ID] ⭐⭐⭐⭐☆ 4.6/5      │
│  │    25 submissions             │
│  └──────────────────────────────┘
└─────────────────────────────────┘
        ↓
User Benefits:
├─ Recognize Top Testers
├─ Monitor Quality Trends
├─ Identify Reliable Testers
├─ Match with Quality Recruiters
└─ Plan Reward Programs
```

---

## 6️⃣ Support Chat Management Flow

```
Start: Support (Chats) Tab
       ↓
┌──────────────────────────────────┐
│  Alert Badge (if any)            │
│  🔴 3 Escalated Chats Need Help  │
└──────────────────────────────────┘
       ↓
┌──────────────────────────────────┐
│  Conversation Filters            │
│  [Escalated] [Active] [Closed]   │
│  [All]                           │
└──────────────────────────────────┘
       ↓
Split Screen:
  ┌──────────────┐    ┌──────────────┐
  │   Conv List  │    │ Message View │
  ├──────────────┤    ├──────────────┤
  │ • John       │    │              │
  │ • Jane [🔴]  │    │ Message feed │
  │ • Bob        │    │ + Reply box  │
  └──────────────┘    └──────────────┘
       ↓
User Workflow:
  1. Click Escalated Filter (🔴)
  2. See "Jane" conversation flagged
  3. Click "Jane" in list
  4. View full conversation history
  5. Type reply in input field
  6. Click Send ▶️
  7. See reply appear in thread
  8. Click "Close" button
  9. Mark as resolved
  10. Jane moved to "Closed"
```

---

## 7️⃣ Recruiter ↔️ Tester Quality Correlation

```
┌────────────────────────────────────────────┐
│         PLATFORM QUALITY CYCLE             │
└────────────────────────────────────────────┘

Recruiter Creates Test
    ↓
├─ Good Test Design
│   ├─ Clear instructions
│   ├─ Fair reward
│   └─ Right difficulty
│
Testers Find Test
    ↓
├─ High-Quality Testers
│   ├─ Careful feedback
│   ├─ Thorough testing
│   └─ Professional submissions
│
Recruiter Rates Submissions
    ↓
├─ Rating ⭐⭐⭐⭐⭐
│   ├─ Tester gets higher rating
│   ├─ Test gets positive review
│   ├─ Recruiter builds reputation
│   └─ POSITIVE FEEDBACK LOOP
│
Admin Can See Pattern:
├─ Which Recruiters Make Good Tests
├─ Which Testers Do Quality Work
├─ Suggest Better Pairings
└─ Improve Overall Platform Quality
```

---

## 8️⃣ Search & Discovery Paths

```
Admin wants to find low-quality tests:

Path 1 - Through Tests Tab:
Tests Tab
  ↓ Sort by Rating
  ↓ Show Low Ratings (< 3.5⭐)
  ↓ See "Mobile App" has 2.8⭐
  ↓ Click to Edit
  ↓ Investigate requirements

Path 2 - Through Recruiter Hub:
Recruiter Hub
  ↓ See Recruiter "John"
  ↓ Click John's name
  ↓ Route to Tests Tab (filtered)
  ↓ Show only John's tests
  ↓ Spot low ratings in his tests
  ↓ Contact John with feedback

Path 3 - Through Dashboard:
Overview Tab
  ↓ See Quality Rating: 3.8⭐ (below 4.0 target)
  ↓ Click to investigate
  ↓ Route to Tests & Postings
  ↓ Filter by low ratings
  ↓ Take corrective action
```

---

## 9️⃣ Data Flow Diagram

```
DATABASE (Supabase)
├── user_roles ◄──────┐
├── profiles ◄────────┤
├── tests ◄───────────┤
├── test_submissions ◄┤
├── chat_conversations
└── chat_messages
         ↓
    ADMIN CACHE
    (In Memory)
         ↓
┌─────────────────────────────────────┐
│      React State Management         │
│  ├─ users[]                         │
│  ├─ tests[]                         │
│  ├─ submissions[]                   │
│  ├─ conversations[]                 │
│  └─ stats{}                         │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│        UI Components                │
│  ├─ Overview Tab                    │
│  ├─ Tests Tab                       │
│  ├─ Users Tab                       │
│  ├─ Recruiter Hub                   │
│  ├─ Tester Hub                      │
│  ├─ Support Tab                     │
│  └─ Dialogs (Edit, etc)             │
└─────────────────────────────────────┘
         ↓
        USER
    (Views & Edits)
```

---

## 🔟 Complete Admin Journey Example

```
9:00 AM - Check Daily Status
├─ Open /admin
├─ See 3 Escalated Chats 🔴
├─ See Quality: 3.9⭐ (below target)
└─ Create action plan

9:15 AM - Handle Support
├─ Go to Support Tab
├─ Click Escalated filter
├─ Open "Jane's" chat
├─ Read issue
├─ Reply with solution
├─ Mark Closed
└─ Check next escalated chat

9:45 AM - Quality Investigation
├─ Go to Tests & Postings
├─ Filter by Status: Active
├─ Sort by Rating
├─ Find "Mobile App" has 2.5⭐
├─ Click Edit
├─ Note quality issues
├─ Add comment: "Revise instructions"
├─ Save changes

10:00 AM - Recruiter Check-in
├─ Go to Recruiter Hub
├─ See "John" has low completion
├─ Click John's name
├─ Route to his tests
├─ See issues with one test
├─ Send feedback: "Reward too low"

10:30 AM - Tester Recognition
├─ Go to Tester Hub
├─ See "Alex" has 4.9⭐ rating
├─ Check their submissions
├─ Plan incentive for consistency
├─ Note for monthly rewards

11:00 AM - End-of-Morning Report
├─ All escalated chats closed ✓
├─ 1 test quality issue identified ✓
├─ 1 recruiter contacted ✓
├─ 1 tester recognized ✓
└─ Platform health: Improving!
```

---

This comprehensive interlinking creates a **virtuous cycle**:
- ✨ Better tests → Better submissions → Better ratings
- 🔄 Feedback loops → Quality improvement
- 👥 Admin visibility → Better decision-making
- 📈 Continuous optimization → Growing platform value
