-- AI Interview Sessions table
create table ai_interview_sessions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references tests(id) on delete cascade,
  submission_id uuid references test_submissions(id) on delete set null,
  tester_id uuid references auth.users(id) on delete cascade not null,
  status text not null default 'pending',
  -- pending | active | completed | abandoned
  eligible boolean,
  eligibility_reason text,
  transcript jsonb not null default '[]'::jsonb,
  friction_points jsonb not null default '[]'::jsonb,
  insights jsonb not null default '[]'::jsonb,
  key_quotes jsonb not null default '[]'::jsonb,
  duration_seconds integer,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table ai_interview_sessions enable row level security;

-- Testers can view their own sessions
create policy "Testers can view own ai_interview_sessions"
  on ai_interview_sessions for select
  using (auth.uid() = tester_id);

-- Testers can create their own sessions
create policy "Testers can insert own ai_interview_sessions"
  on ai_interview_sessions for insert
  with check (auth.uid() = tester_id);

-- Testers can update their own sessions
create policy "Testers can update own ai_interview_sessions"
  on ai_interview_sessions for update
  using (auth.uid() = tester_id);

-- Recruiters can view sessions for their tests
create policy "Recruiters can view ai_interview_sessions for their tests"
  on ai_interview_sessions for select
  using (
    exists (
      select 1 from tests
      where tests.id = ai_interview_sessions.test_id
        and tests.recruiter_id = auth.uid()
    )
  );

-- Admins can view all sessions
create policy "Admins can view all ai_interview_sessions"
  on ai_interview_sessions for all
  using (
    exists (
      select 1 from user_roles
      where user_roles.user_id = auth.uid()
        and user_roles.role = 'admin'
    )
  );

-- Index for common lookups
create index ai_interview_sessions_tester_id_idx on ai_interview_sessions(tester_id);
create index ai_interview_sessions_test_id_idx on ai_interview_sessions(test_id);
create index ai_interview_sessions_status_idx on ai_interview_sessions(status);
