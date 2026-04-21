# Admin Panel Quick Start

## Accessing the Admin Panel

1. **Login** as an admin user (role must be set to 'admin' in the `user_roles` table)
2. **Navigate** to `/admin` route
3. **Dashboard** loads automatically with current platform data

## First Time Setup

### Step 1: Verify Admin Access
```sql
-- Check if your user has admin role
SELECT * FROM user_roles WHERE user_id = 'your-user-id';
-- Should show role: 'admin'
```

### Step 2: Review Overview Dashboard
- Check platform health metrics
- Review recent activity
- Note any escalated chats

### Step 3: Explore Each Tab
Start with Overview → Tests → Users → Recruiter Hub → Tester Hub → Support

## Common Tasks

### Task 1: Review & Activate New Tests

**Steps:**
1. Click **"Tests & Postings"** tab
2. Filter by status: **"Active"** or **"All"**
3. Search for specific test if needed
4. Review test details by looking at the table row
5. To edit: Click ✏️ icon → Modify details → Save
6. To delete: Click 🗑️ icon → Confirm

**Expected Outcome:** Tests properly configured and live on platform

---

### Task 2: Monitor Test Quality

**Steps:**
1. Go to **"Tests & Postings"** tab
2. Look at **"Avg Rating"** column (rightmost)
3. Tests below 3.5★ need attention
4. Click test title to view submission details
5. Review tester feedback

**Expected Outcome:** Identify quality issues early

---

### Task 3: Find Top Performers

**Steps:**
1. Click **"Recruiter Hub"** tab
2. See "Top Performing Recruiters" list
3. Scroll down to view rankings
4. Click on recruiter name for detailed view

**Alternative for Testers:**
1. Click **"Tester Hub"** tab
2. See "Top Quality Testers" with star ratings
3. High ratings = reliable testers

**Expected Outcome:** Recognize and support strong performers

---

### Task 4: Handle Support Issues

**Steps:**
1. Click **"Support (Chats)"** tab
2. Look for red badge with count
3. Filter: Select **"Escalated"**
4. Click conversation from list
5. Read full message history
6. Type reply in input field
7. Click send (paper plane icon)
8. When resolved: Click **"Close"** button

**Expected Outcome:** Escalated issues resolved within 24 hours

---

### Task 5: Manage Users

**Steps:**
1. Click **"Users"** tab
2. Use search bar to find user by name/email
3. Filter by role (Recruiter/Tester)
4. View join date and status
5. Click eye icon for more details (if needed)

**Expected Outcome:** User inventory up-to-date and accessible

---

## Dashboard Metrics Explained

### Quick Stats Cards

| Metric | What It Means | Target Value |
|--------|---|---|
| **Total Users** | Number of all users | Growing +10%/month |
| **Recruiters** | Active test creators | Growing +5%/month |
| **Testers** | Active participants | Growing +15%/month |
| **Active Tests** | Currently running tests | >50% of total tests |
| **Escalated** | Chats needing help | < 5% of all chats |

### Platform Analytics

**Test Completion Rate**
- % of tests that get completed submissions
- ✅ Target: 65-75%
- ⚠️ Below 60%: Check test rewards or difficulty
- ⚠️ Below 50%: Urgent review needed

**User Engagement**
- % of users actively using platform
- ✅ Target: 80%+
- ⚠️ Below 70%: Review user retention

**Test Quality (Avg Rating)**
- Average rating across all submissions
- ✅ Target: 4.0-4.5/5
- ⚠️ Below 3.5/5: Investigate quality issues
- ⚠️ Below 3.0/5: Consider removing problematic tests

---

## Data You Can See

### For Tests
- ✅ Title, description, status
- ✅ Recruiter who created it
- ✅ Reward amount
- ✅ Number of submissions
- ✅ Average quality rating
- ✅ Creation date

### For Users
- ✅ Name and email
- ✅ Role (Recruiter/Tester)
- ✅ Join date
- ✅ Account status

### For Submissions
- ✅ Test title
- ✅ Tester ID (anonymized)
- ✅ Submission status
- ✅ Quality rating
- ✅ Creation date

### For Conversations
- ✅ Visitor name and email
- ✅ Message history
- ✅ Conversation status
- ✅ Last message preview

---

## What You Can Do

### ✅ Can Do
- View all platform data
- Search and filter
- Edit test details
- Delete tests
- Send chat replies
- Close conversations
- Export reports (planned)
- Manage user status

### ❌ Cannot Do (By Design)
- Delete user accounts (use Supabase)
- Edit user roles directly (use backend)
- Access private tester data
- Modify submission ratings by testers
- Delete chat history

---

## Keyboard Shortcuts

- **Cmd/Ctrl + R** - Refresh all data
- **Cmd/Ctrl + F** - Search current tab
- **Esc** - Close any dialog
- **Enter** - Save form in dialog

---

## Troubleshooting

### "Access Denied" Error
**Solution:** 
- Verify your user role is 'admin'
- Check user_roles table in Supabase
- Log out and log back in

### Data Not Updating
**Solution:**
- Click **"Refresh"** button (top right)
- Wait 2-3 seconds for sync
- Check internet connection

### Can't Edit Test
**Solution:**
- Verify test status isn't "completed"
- Check if you have admin permissions
- Try refreshing page

### Chat Messages Not Loading
**Solution:**
- Select different conversation first
- Click back to original one
- Try page refresh

---

## Weekly Checklist

Every Monday morning:
- [ ] Check escalated chats (should be <5)
- [ ] Review test completion rate
- [ ] Monitor platform engagement
- [ ] Identify top/bottom performers
- [ ] Check for any quality issues

---

## Monthly Tasks

- [ ] Generate platform report
- [ ] Review recruiter performance
- [ ] Identify struggling testers
- [ ] Update support FAQs
- [ ] Plan platform improvements

---

## Need Help?

1. **Check the docs**: See `ADMIN_PANEL_GUIDE.md`
2. **Review architecture**: See `ADMIN_PANEL_ARCHITECTURE.md`
3. **Check logs**: Supabase dashboard
4. **Contact developer**: Reference line numbers in error

