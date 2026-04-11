import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Background3D from '@/components/Background3D';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowLeft, ArrowRight, Plus, Trash2, GripVertical,
  Monitor, Smartphone, Tablet, Globe, Video, FileText,
  MessageSquare, ClipboardList, Layers, Eye, Shuffle, BookOpen,
  Target, Users, Zap, Bot, Wand2
} from 'lucide-react';
import AITestCreatorChat, { type TestSuggestion } from '@/components/AITestCreatorChat';

const TEST_TYPES = [
  { id: 'unmoderated', label: 'Unmoderated Test', icon: Video, desc: 'Tester completes tasks independently with screen recording' },
  { id: 'moderated', label: 'Moderated (Live)', icon: Users, desc: 'Live session between researcher and tester' },
  { id: 'survey', label: 'Survey', icon: ClipboardList, desc: 'Questions only, no recording needed' },
  { id: 'usability', label: 'Usability Test', icon: Target, desc: 'Task-based testing focused on ease of use' },
  { id: 'prototype', label: 'Prototype Test', icon: Layers, desc: 'Test Figma/Adobe XD prototypes with click tracking' },
  { id: 'first_impression', label: 'First Impression', icon: Eye, desc: '5-second test — what do users remember?' },
  { id: 'ab_test', label: 'A/B Test', icon: Shuffle, desc: 'Compare two versions to see which performs better' },
  { id: 'card_sort', label: 'Card Sorting', icon: GripVertical, desc: 'Users organize items into categories' },
  { id: 'tree_test', label: 'Tree Testing', icon: BookOpen, desc: 'Test navigation structure without UI' },
  { id: 'diary_study', label: 'Diary Study', icon: FileText, desc: 'Long-term feedback over days or weeks' },
  { id: 'ai_interview', label: 'AI Interview', icon: Bot, desc: 'Gemini-powered AI researcher conducts moderated sessions automatically' },
];

const CATEGORIES = ['Web App', 'Mobile App', 'E-commerce', 'SaaS', 'Landing Page', 'Game', 'Other'];
const DEVICES = ['desktop', 'mobile', 'tablet'];
const BROWSERS = ['Chrome', 'Firefox', 'Safari', 'Edge'];

interface TaskItem {
  title: string;
  description: string;
}

interface QuestionItem {
  question_text: string;
  question_type: 'open_text' | 'mcq' | 'rating' | 'yes_no';
  options: string[];
  required: boolean;
  task_index: number | null;
}

interface ScreenerQuestion {
  question: string;
  expected_answer: string;
}

export default function CreateTest() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  // Step 0: Test type
  const [testType, setTestType] = useState('unmoderated');

  // Step 1: Basic info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState(30);
  const [reward, setReward] = useState(10);
  const [maxTesters, setMaxTesters] = useState(100);
  const [prototypeUrl, setPrototypeUrl] = useState('');

  // Step 2: Tasks
  const [tasks, setTasks] = useState<TaskItem[]>([{ title: '', description: '' }]);

  // Step 3: Questions
  const [questions, setQuestions] = useState<QuestionItem[]>([]);

  // Step 4: Targeting
  const [targetAge, setTargetAge] = useState('');
  const [targetLocation, setTargetLocation] = useState('');
  const [deviceTargeting, setDeviceTargeting] = useState<string[]>([]);
  const [browserTargeting, setBrowserTargeting] = useState<string[]>([]);
  const [screenerQuestions, setScreenerQuestions] = useState<ScreenerQuestion[]>([]);

  if (authLoading) return null;
  if (!user || role !== 'recruiter') {
    navigate('/auth');
    return null;
  }

  const addTask = () => setTasks([...tasks, { title: '', description: '' }]);
  const removeTask = (i: number) => setTasks(tasks.filter((_, idx) => idx !== i));
  const updateTask = (i: number, field: keyof TaskItem, val: string) => {
    const updated = [...tasks];
    updated[i][field] = val;
    setTasks(updated);
  };

  const addQuestion = () => setQuestions([...questions, { question_text: '', question_type: 'open_text', options: [], required: true, task_index: null }]);
  const removeQuestion = (i: number) => setQuestions(questions.filter((_, idx) => idx !== i));
  const updateQuestion = (i: number, field: string, val: any) => {
    const updated = [...questions];
    (updated[i] as any)[field] = val;
    setQuestions(updated);
  };

  const addScreener = () => setScreenerQuestions([...screenerQuestions, { question: '', expected_answer: '' }]);
  const removeScreener = (i: number) => setScreenerQuestions(screenerQuestions.filter((_, idx) => idx !== i));

  const toggleDevice = (d: string) => {
    setDeviceTargeting(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };
  const toggleBrowser = (b: string) => {
    setBrowserTargeting(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  };

  const handleAIApply = (suggestion: TestSuggestion) => {
    if (suggestion.title) setTitle(suggestion.title);
    if (suggestion.description) setDescription(suggestion.description);
    if (suggestion.category) setCategory(suggestion.category);
    if (suggestion.estimated_duration) setDuration(suggestion.estimated_duration);
    if (suggestion.recommended_reward) setReward(suggestion.recommended_reward);
    if (suggestion.test_type) setTestType(suggestion.test_type);
    if (suggestion.tasks?.length) {
      setTasks(suggestion.tasks.map(t => ({ title: t.title, description: t.description || '' })));
    }
    if (suggestion.questions?.length) {
      setQuestions(suggestion.questions.map(q => ({
        question_text: q.question_text,
        question_type: (q.question_type as any) || 'open_text',
        options: q.options || [],
        required: q.required ?? true,
        task_index: null,
      })));
    }
    if (suggestion.screener_questions?.length) {
      setScreenerQuestions(suggestion.screener_questions.map(s => ({
        question: s.question,
        expected_answer: s.expected_answer,
      })));
    }
    if (suggestion.target_age) setTargetAge(suggestion.target_age);
    if (suggestion.target_location) setTargetLocation(suggestion.target_location);
    if (suggestion.device_targeting?.length) setDeviceTargeting(suggestion.device_targeting);
    // Jump to Basic Info step so recruiter can review
    setStep(1);
  };

  // If the recruiter started from the dashboard AI chat, prefill from stored suggestion
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('ai_test_suggestion');
      if (!raw) return;
      const parsed = JSON.parse(raw) as TestSuggestion;
      handleAIApply(parsed);
      sessionStorage.removeItem('ai_test_suggestion');
    } catch (err) {
      console.error('Failed to load AI test suggestion from sessionStorage', err);
    }
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: 'Title required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      // Create test
      const { data: test, error: testError } = await supabase
        .from('tests')
        .insert([{
          recruiter_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          category: category || null,
          estimated_duration: duration,
          reward_amount: reward,
          max_testers: maxTesters,
          test_type: testType,
          prototype_url: prototypeUrl.trim() || null,
          target_audience: { age: targetAge, location: targetLocation } as any,
          screener_questions: screenerQuestions.filter(s => s.question.trim()) as any,
          device_targeting: deviceTargeting,
          browser_targeting: browserTargeting,
          status: 'active',
        }])
        .select()
        .single();

      if (testError) throw testError;

      // Insert tasks
      const validTasks = tasks.filter(t => t.title.trim());
      if (validTasks.length > 0) {
        const { error: tasksError } = await supabase
          .from('test_tasks')
          .insert(validTasks.map((t, i) => ({
            test_id: test.id,
            title: t.title.trim(),
            description: t.description.trim() || null,
            sort_order: i,
          })));
        if (tasksError) throw tasksError;
      }

      // Get inserted task IDs for question linking
      let taskIds: string[] = [];
      if (validTasks.length > 0) {
        const { data: insertedTasks } = await supabase
          .from('test_tasks')
          .select('id')
          .eq('test_id', test.id)
          .order('sort_order');
        taskIds = insertedTasks?.map(t => t.id) || [];
      }

      // Insert questions
      const validQuestions = questions.filter(q => q.question_text.trim());
      if (validQuestions.length > 0) {
        const { error: qError } = await supabase
          .from('test_questions')
          .insert(validQuestions.map((q, i) => ({
            test_id: test.id,
            task_id: q.task_index !== null && taskIds[q.task_index] ? taskIds[q.task_index] : null,
            question_text: q.question_text.trim(),
            question_type: q.question_type,
            options: q.question_type === 'mcq' ? q.options.filter(o => o.trim()) : [],
            required: q.required,
            sort_order: i,
          })));
        if (qError) throw qError;
      }

      toast({ title: 'Test created successfully!' });

      // Send email notification to recruiter (non-blocking)
      supabase.functions.invoke('send-email', {
        body: {
          type: 'test_created',
          to: user.email!,
          data: { name: user.user_metadata?.full_name || 'Recruiter', test_title: title.trim() },
        },
      }).catch(() => {});

      navigate('/recruiter');
    } catch (err: any) {
      toast({ title: 'Error creating test', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const steps = ['Test Type', 'Basic Info', 'Tasks', 'Questions', 'Targeting', 'Review'];

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Create Test | UserNinjas</title></Helmet>
      <Background3D />
      <Navbar />

      {/* AI Test Creator floating button */}
      <button
        onClick={() => setAiChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white px-4 py-3 shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-200 border border-primary/30"
        title="AI Test Creator"
      >
        <div className="flex items-center justify-center rounded-lg bg-white/15 p-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.95" />
            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
          </svg>
        </div>
        <span className="text-sm font-semibold">Build with AI</span>
        <Wand2 className="h-4 w-4 opacity-80" />
      </button>

      <AITestCreatorChat
        open={aiChatOpen}
        onOpenChange={setAiChatOpen}
        onApply={handleAIApply}
      />
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl relative z-10">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <Button variant="ghost" size="icon" onClick={() => step > 0 ? setStep(step - 1) : navigate('/recruiter')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              {steps.map((s, i) => (
                <button key={s} onClick={() => setStep(i)} className={`text-xs font-medium transition-colors ${i <= step ? 'text-primary' : 'text-muted-foreground'}`}>{s}</button>
              ))}
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Step 0: Test Type */}
        {step === 0 && (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Choose Test Type</CardTitle>
              <CardDescription>Select the type of research you want to conduct</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TEST_TYPES.map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTestType(t.id)}
                      className={`flex items-start gap-3 p-4 rounded-lg border text-left transition-all ${testType === t.id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}
                    >
                      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${testType === t.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div>
                        <p className="font-medium text-sm">{t.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Basic Information</CardTitle>
              <CardDescription>Set up the core details for your test</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Test Title *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Checkout flow usability test" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What are you testing and why?" rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} min={5} max={120} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Reward Amount ($)</Label>
                  <Input type="number" value={reward} onChange={e => setReward(Number(e.target.value))} min={0} step={0.5} />
                </div>
                <div className="space-y-2">
                  <Label>Max Testers</Label>
                  <Input type="number" value={maxTesters} onChange={e => setMaxTesters(Number(e.target.value))} min={1} max={1000} />
                </div>
              </div>
              {(testType === 'prototype' || testType === 'ab_test') && (
                <div className="space-y-2">
                  <Label>Prototype / Website URL</Label>
                  <Input value={prototypeUrl} onChange={e => setPrototypeUrl(e.target.value)} placeholder="https://figma.com/proto/..." />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Tasks */}
        {step === 2 && (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Tasks</CardTitle>
              <CardDescription>Define step-by-step tasks for testers to complete</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasks.map((task, i) => (
                <div key={i} className="flex gap-3 p-4 border border-border rounded-lg">
                  <div className="flex items-center text-muted-foreground font-mono text-sm w-6 justify-center">{i + 1}</div>
                  <div className="flex-1 space-y-2">
                    <Input value={task.title} onChange={e => updateTask(i, 'title', e.target.value)} placeholder={`Task ${i + 1} title`} />
                    <Textarea value={task.description} onChange={e => updateTask(i, 'description', e.target.value)} placeholder="Detailed instructions (optional)" rows={2} />
                  </div>
                  {tasks.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeTask(i)} className="text-destructive shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addTask} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Task
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Questions */}
        {step === 3 && (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Questions</CardTitle>
              <CardDescription>Add questions testers should answer during or after tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((q, i) => (
                <div key={i} className="p-4 border border-border rounded-lg space-y-3">
                  <div className="flex gap-2">
                    <Input className="flex-1" value={q.question_text} onChange={e => updateQuestion(i, 'question_text', e.target.value)} placeholder="Question text" />
                    <Button variant="ghost" size="icon" onClick={() => removeQuestion(i)} className="text-destructive shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <Select value={q.question_type} onValueChange={v => updateQuestion(i, 'question_type', v)}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open_text">Open Text</SelectItem>
                        <SelectItem value="mcq">Multiple Choice</SelectItem>
                        <SelectItem value="rating">Rating (1–5)</SelectItem>
                        <SelectItem value="yes_no">Yes / No</SelectItem>
                      </SelectContent>
                    </Select>
                    {tasks.filter(t => t.title.trim()).length > 0 && (
                      <Select value={q.task_index !== null ? String(q.task_index) : 'none'} onValueChange={v => updateQuestion(i, 'task_index', v === 'none' ? null : Number(v))}>
                        <SelectTrigger className="w-44"><SelectValue placeholder="Link to task" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">General (no task)</SelectItem>
                          {tasks.map((t, ti) => t.title.trim() && <SelectItem key={ti} value={String(ti)}>After Task {ti + 1}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                    <div className="flex items-center gap-2">
                      <Checkbox checked={q.required} onCheckedChange={v => updateQuestion(i, 'required', v)} />
                      <Label className="text-xs">Required</Label>
                    </div>
                  </div>
                  {q.question_type === 'mcq' && (
                    <div className="space-y-2 pl-4">
                      {(q.options.length === 0 ? ['', ''] : q.options).map((opt, oi) => (
                        <div key={oi} className="flex gap-2">
                          <Input
                            value={opt}
                            onChange={e => {
                              const newOpts = [...(q.options.length === 0 ? ['', ''] : q.options)];
                              newOpts[oi] = e.target.value;
                              updateQuestion(i, 'options', newOpts);
                            }}
                            placeholder={`Option ${oi + 1}`}
                            className="text-sm"
                          />
                          {(q.options.length > 2 || q.options.length === 0) && oi >= 2 && (
                            <Button variant="ghost" size="icon" onClick={() => updateQuestion(i, 'options', q.options.filter((_, x) => x !== oi))}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" onClick={() => updateQuestion(i, 'options', [...(q.options.length === 0 ? ['', ''] : q.options), ''])}>
                        <Plus className="h-3 w-3 mr-1" /> Add Option
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addQuestion} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Question
              </Button>
              {questions.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">No questions added yet. Questions are optional.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Targeting */}
        {step === 4 && (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Targeting & Screening</CardTitle>
              <CardDescription>Define who should take your test</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Age Range</Label>
                  <Input value={targetAge} onChange={e => setTargetAge(e.target.value)} placeholder="e.g., 18-35" />
                </div>
                <div className="space-y-2">
                  <Label>Target Location</Label>
                  <Input value={targetLocation} onChange={e => setTargetLocation(e.target.value)} placeholder="e.g., US, India, Global" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Device Targeting</Label>
                <div className="flex gap-3">
                  {DEVICES.map(d => (
                    <button
                      key={d}
                      onClick={() => toggleDevice(d)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${deviceTargeting.includes(d) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
                    >
                      {d === 'desktop' ? <Monitor className="h-4 w-4" /> : d === 'mobile' ? <Smartphone className="h-4 w-4" /> : <Tablet className="h-4 w-4" />}
                      <span className="text-sm capitalize">{d}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Browser Targeting</Label>
                <div className="flex gap-3 flex-wrap">
                  {BROWSERS.map(b => (
                    <button
                      key={b}
                      onClick={() => toggleBrowser(b)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm ${browserTargeting.includes(b) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
                    >
                      <Globe className="h-4 w-4" /> {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Screener Questions</Label>
                <p className="text-xs text-muted-foreground">Filter testers before they start. Only testers matching expected answers will be approved.</p>
                {screenerQuestions.map((sq, i) => (
                  <div key={i} className="flex gap-2">
                    <Input className="flex-1" value={sq.question} onChange={e => { const u = [...screenerQuestions]; u[i].question = e.target.value; setScreenerQuestions(u); }} placeholder="Screener question" />
                    <Input className="w-40" value={sq.expected_answer} onChange={e => { const u = [...screenerQuestions]; u[i].expected_answer = e.target.value; setScreenerQuestions(u); }} placeholder="Expected answer" />
                    <Button variant="ghost" size="icon" onClick={() => removeScreener(i)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addScreener}><Plus className="h-4 w-4 mr-1" /> Add Screener</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Review & Publish</CardTitle>
              <CardDescription>Double-check everything before publishing your test</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium text-sm capitalize">{testType.replace('_', ' ')}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="font-medium text-sm">{category || 'None'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-medium text-sm">{duration} min</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Reward</p>
                  <p className="font-medium text-sm">${reward}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Title</p>
                <p className="font-medium">{title || '(untitled)'}</p>
              </div>
              {description && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-sm">{description}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{tasks.filter(t => t.title.trim()).length} tasks</Badge>
                <Badge variant="outline">{questions.filter(q => q.question_text.trim()).length} questions</Badge>
                {deviceTargeting.length > 0 && <Badge variant="outline">{deviceTargeting.join(', ')}</Badge>}
                {browserTargeting.length > 0 && <Badge variant="outline">{browserTargeting.join(', ')}</Badge>}
                {screenerQuestions.filter(s => s.question.trim()).length > 0 && <Badge variant="outline">{screenerQuestions.filter(s => s.question.trim()).length} screener(s)</Badge>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => step > 0 ? setStep(step - 1) : navigate('/recruiter')} disabled={saving}>
            <ArrowLeft className="h-4 w-4 mr-2" /> {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(step + 1)}>
              Next <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={saving}>
              <Zap className="h-4 w-4 mr-2" /> {saving ? 'Publishing...' : 'Publish Test'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
