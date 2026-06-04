import React, { useState, useEffect } from 'react';
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
import {
  ArrowLeft, Plus, Trash2, Save, Target, Users, Clock, Award, HelpCircle
} from 'lucide-react';
import type { UXTemplate, TemplateQuestion } from '@/data/templates';

const CATEGORIES = ['UX Research', 'User Interviews', 'Surveys', 'Recruitment', 'Product Research'] as const;
const TEST_TYPES = [
  { id: 'usability', label: 'Usability Test' },
  { id: 'unmoderated', label: 'Unmoderated Test' },
  { id: 'moderated', label: 'Moderated (Live)' },
  { id: 'survey', label: 'Survey' },
  { id: 'prototype', label: 'Prototype Test' },
  { id: 'first_impression', label: 'First Impression' },
  { id: 'ai_interview', label: 'AI Interview' },
];

export default function CreateStudy() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [objective, setObjective] = useState('');
  const [participantCriteria, setParticipantCriteria] = useState('');
  const [category, setCategory] = useState<string>('UX Research');
  const [testType, setTestType] = useState<string>('usability');
  const [duration, setDuration] = useState<number>(20);
  const [reward, setReward] = useState<number>(10);
  const [questions, setQuestions] = useState<TemplateQuestion[]>([
    { question_text: '', question_type: 'open_text', options: [], required: true }
  ]);

  // Load template from storage if available
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('use_template_data');
      if (raw) {
        const tpl = JSON.parse(raw) as UXTemplate;
        setTitle(tpl.name || '');
        setDescription(tpl.description || '');
        setObjective(tpl.objective || '');
        setParticipantCriteria(tpl.participantCriteria || '');
        setCategory(tpl.category || 'UX Research');
        setTestType(tpl.testType || 'usability');
        setDuration(tpl.duration || 20);
        setReward(tpl.rewardAmount || 10);
        
        if (tpl.questions && tpl.questions.length > 0) {
          setQuestions(tpl.questions);
        }

        // Clean up
        sessionStorage.removeItem('use_template_data');
        toast({
          title: 'Template Loaded',
          description: `Loaded fields from "${tpl.name}" template.`,
        });
      }
    } catch (e) {
      console.error('Failed to load template in CreateStudy', e);
    }
  }, [toast]);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && (!user || role !== 'recruiter')) {
      navigate('/auth');
      toast({
        title: 'Recruiter access required',
        description: 'Please sign in with a recruiter account to access this page.',
        variant: 'destructive',
      });
    }
  }, [authLoading, user, role, navigate, toast]);

  if (authLoading || !user || role !== 'recruiter') return null;

  // Questions Management
  const addQuestion = () => {
    setQuestions([...questions, { question_text: '', question_type: 'open_text', options: [], required: true }]);
  };

  const removeQuestion = (idx: number) => {
    if (questions.length === 1) {
      toast({
        title: 'Required field',
        description: 'A study must have at least one research question.',
        variant: 'destructive',
      });
      return;
    }
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const updateQuestionText = (idx: number, text: string) => {
    const updated = [...questions];
    updated[idx].question_text = text;
    setQuestions(updated);
  };

  const updateQuestionType = (idx: number, type: TemplateQuestion['question_type']) => {
    const updated = [...questions];
    updated[idx].question_type = type;
    if (type !== 'mcq') {
      updated[idx].options = [];
    } else {
      updated[idx].options = ['Option 1', 'Option 2'];
    }
    setQuestions(updated);
  };

  const updateQuestionRequired = (idx: number, req: boolean) => {
    const updated = [...questions];
    updated[idx].required = req;
    setQuestions(updated);
  };

  const addOption = (qIdx: number) => {
    const updated = [...questions];
    updated[qIdx].options.push(`Option ${updated[qIdx].options.length + 1}`);
    setQuestions(updated);
  };

  const updateOptionText = (qIdx: number, oIdx: number, val: string) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = val;
    setQuestions(updated);
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    const updated = [...questions];
    updated[qIdx].options = updated[qIdx].options.filter((_, i) => i !== oIdx);
    setQuestions(updated);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: 'Study Title is required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      // Map questions to match database requirements
      const formattedQuestions = questions.map((q, idx) => ({
        question_text: q.question_text.trim(),
        question_type: q.question_type,
        options: q.options,
        required: q.required,
        task_index: null,
      }));

      // Insert to Supabase tests table
      const { data, error } = await supabase
        .from('tests')
        .insert([{
          recruiter_id: user.id,
          title: title.trim(),
          description: `${description.trim()}\n\nObjective: ${objective.trim()}`,
          category: category,
          estimated_duration: duration,
          reward_amount: reward,
          max_testers: 50, // default limit
          test_type: testType,
          status: 'active',
          target_audience: { location: participantCriteria } as any,
        }])
        .select()
        .single();

      if (error) throw error;

      // Save test to local storage queue sync
      try {
        const localTestsRaw = localStorage.getItem('userninjas_local_tests');
        const localTests = localTestsRaw ? JSON.parse(localTestsRaw) : [];
        if (Array.isArray(localTests)) {
          localTests.unshift(data);
          localStorage.setItem('userninjas_local_tests', JSON.stringify(localTests));
        }
      } catch (err) {
        console.error('Failed to sync created study to local storage:', err);
      }

      toast({
        title: 'Study Published!',
        description: 'Your research study has been created and is now active for testers.',
      });

      // Redirect back to dashboard tests section
      navigate('/recruiter#tests');
    } catch (e: any) {
      console.error('Error saving study:', e);
      toast({
        title: 'Failed to create study',
        description: e.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Research Study - User Ninjas</title>
      </Helmet>

      <Background3D />
      <Navbar />

      <main className="min-h-screen pt-24 pb-16 relative z-10 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="rounded-xl border border-border/20 bg-card/20 backdrop-blur-sm text-xs font-semibold gap-1.5 hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>

          {/* Form Card */}
          <Card className="bg-card/70 border-border/40 backdrop-blur-md shadow-2xl">
            <CardHeader className="border-b border-border/20 pb-4">
              <CardTitle className="font-display text-2xl font-bold text-foreground">
                Create Research Study
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                Customize your study parameters, participant criteria, and research questions.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handlePublish} className="space-y-6">
                
                {/* 1. Basic Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-l-2 border-primary pl-2">
                    1. Basic Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="title" className="text-xs font-semibold">Study Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g. Website Navigation Friction"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="bg-secondary/20 border-border/40 focus:border-primary rounded-xl text-xs h-10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="category" className="text-xs font-semibold">Research Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="category" className="bg-secondary/20 border-border/40 rounded-xl text-xs h-10">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border/40 text-xs">
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="testType" className="text-xs font-semibold">Study Format</Label>
                      <Select value={testType} onValueChange={setTestType}>
                        <SelectTrigger id="testType" className="bg-secondary/20 border-border/40 rounded-xl text-xs h-10">
                          <SelectValue placeholder="Select Format" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border/40 text-xs">
                          {TEST_TYPES.map(type => (
                            <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="duration" className="text-xs font-semibold flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Duration (mins)
                        </Label>
                        <Input
                          id="duration"
                          type="number"
                          min={1}
                          max={180}
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                          required
                          className="bg-secondary/20 border-border/40 rounded-xl text-xs h-10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="reward" className="text-xs font-semibold flex items-center gap-1">
                          <Award className="h-3.5 w-3.5 text-muted-foreground" /> Reward ($)
                        </Label>
                        <Input
                          id="reward"
                          type="number"
                          min={1}
                          max={500}
                          value={reward}
                          onChange={(e) => setReward(Number(e.target.value))}
                          required
                          className="bg-secondary/20 border-border/40 rounded-xl text-xs h-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="description" className="text-xs font-semibold">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Briefly describe your study. What will participants be doing?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-secondary/20 border-border/40 rounded-xl text-xs min-h-[70px] resize-none"
                    />
                  </div>
                </div>

                {/* 2. Research Alignment */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-l-2 border-primary pl-2">
                    2. Targeting & Objectives
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="objective" className="text-xs font-semibold flex items-center gap-1">
                        <Target className="h-3.5 w-3.5 text-accent" /> Study Objective
                      </Label>
                      <Input
                        id="objective"
                        placeholder="What specific question or hypothesis are you trying to answer?"
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        className="bg-secondary/20 border-border/40 rounded-xl text-xs h-10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="criteria" className="text-xs font-semibold flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-primary" /> Participant Demographics / Criteria
                      </Label>
                      <Input
                        id="criteria"
                        placeholder="e.g. Android users, E-commerce shoppers, SaaS users aged 25-45"
                        value={participantCriteria}
                        onChange={(e) => setParticipantCriteria(e.target.value)}
                        className="bg-secondary/20 border-border/40 rounded-xl text-xs h-10"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Research Questions */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-l-2 border-primary pl-2">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                      3. Research Questions
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addQuestion}
                      className="h-7 rounded-lg text-[10px] gap-1 border-primary/20 hover:bg-primary/10 text-primary"
                    >
                      <Plus className="h-3 w-3" /> Add Question
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {questions.map((q, qIdx) => (
                      <div key={qIdx} className="p-4 rounded-xl bg-secondary/30 border border-border/20 space-y-3 relative group">
                        
                        {/* Question Number & Remove */}
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-[11px] font-bold text-muted-foreground uppercase">
                            Question {qIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeQuestion(qIdx)}
                            className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Question Text & Type selector */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-2 space-y-1">
                            <Input
                              placeholder="Type your question here..."
                              value={q.question_text}
                              onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                              required
                              className="bg-card border-border/30 rounded-xl text-xs h-9"
                            />
                          </div>
                          <div>
                            <Select
                              value={q.question_type}
                              onValueChange={(val) => updateQuestionType(qIdx, val as any)}
                            >
                              <SelectTrigger className="bg-card border-border/30 rounded-xl text-xs h-9">
                                <SelectValue placeholder="Question Type" />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-border/40 text-xs">
                                <SelectItem value="open_text">Open Text</SelectItem>
                                <SelectItem value="mcq">Multiple Choice</SelectItem>
                                <SelectItem value="rating">Rating (1-5)</SelectItem>
                                <SelectItem value="yes_no">Yes / No</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* MCQ Options editor */}
                        {q.question_type === 'mcq' && (
                          <div className="pl-6 space-y-2 border-l border-border/20 pt-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                                Multiple Choice Options
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => addOption(qIdx)}
                                className="h-6 text-[9px] gap-1 hover:bg-secondary text-primary"
                              >
                                <Plus className="h-2.5 w-2.5" /> Add Option
                              </Button>
                            </div>
                            <div className="space-y-1.5">
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                  <Input
                                    value={opt}
                                    onChange={(e) => updateOptionText(qIdx, oIdx, e.target.value)}
                                    required
                                    className="bg-card border-border/30 rounded-lg text-[11px] h-8 flex-1"
                                  />
                                  {q.options.length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => removeOption(qIdx, oIdx)}
                                      className="p-1 text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Required toggle */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="checkbox"
                            id={`req-${qIdx}`}
                            checked={q.required}
                            onChange={(e) => updateQuestionRequired(qIdx, e.target.checked)}
                            className="rounded border-border/30 bg-card text-primary focus:ring-primary w-3.5 h-3.5"
                          />
                          <Label htmlFor={`req-${qIdx}`} className="text-[10px] font-medium text-muted-foreground select-none cursor-pointer">
                            Required Question
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Publish & Cancel Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border/20">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="rounded-xl border-border/50 text-xs h-10 px-5"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="btn-magnetic bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl gap-2 text-xs h-10 px-6 shadow-lg shadow-primary/10"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Publishing...' : 'Publish Study'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
