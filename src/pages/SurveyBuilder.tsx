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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, ArrowLeft, Send, BarChart3, ClipboardList, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface SurveyQuestion {
  question_text: string;
  question_type: 'open_text' | 'mcq' | 'rating' | 'yes_no';
  options: string[];
  required: boolean;
  logic_branch: { condition: string; skip_to: number } | null;
}

interface Survey {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
}

export default function SurveyBuilder() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState('create');

  // Create form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<SurveyQuestion[]>([
    { question_text: '', question_type: 'open_text', options: [], required: true, logic_branch: null }
  ]);
  const [saving, setSaving] = useState(false);

  // List
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);
  const [responses, setResponses] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && user && role === 'recruiter') fetchSurveys();
  }, [authLoading, user, role]);

  if (authLoading) return null;
  if (!user || role !== 'recruiter') { navigate('/auth'); return null; }

  async function fetchSurveys() {
    setLoading(true);
    const { data } = await supabase.from('surveys').select('*').eq('recruiter_id', user!.id).order('created_at', { ascending: false });
    setSurveys((data as Survey[]) || []);
    setLoading(false);
  }

  async function fetchResponses(surveyId: string) {
    setSelectedSurvey(surveyId);
    const { data } = await supabase.from('survey_responses').select('*').eq('survey_id', surveyId).order('created_at', { ascending: false });
    setResponses(data || []);
  }

  const addQ = () => setQuestions([...questions, { question_text: '', question_type: 'open_text', options: [], required: true, logic_branch: null }]);
  const removeQ = (i: number) => setQuestions(questions.filter((_, idx) => idx !== i));
  const updateQ = (i: number, field: string, val: any) => {
    const updated = [...questions];
    (updated[i] as any)[field] = val;
    setQuestions(updated);
  };

  const handleCreate = async () => {
    if (!title.trim()) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      const { data: survey, error } = await supabase
        .from('surveys')
        .insert({ recruiter_id: user!.id, title: title.trim(), description: description.trim() || null, status: 'active' })
        .select().single();
      if (error) throw error;

      const validQs = questions.filter(q => q.question_text.trim());
      if (validQs.length > 0) {
        const { error: qErr } = await supabase.from('survey_questions').insert(
          validQs.map((q, i) => ({
            survey_id: (survey as any).id,
            question_text: q.question_text.trim(),
            question_type: q.question_type,
            options: q.question_type === 'mcq' ? q.options.filter(o => o.trim()) : [],
            required: q.required,
            logic_branch: q.logic_branch,
            sort_order: i,
          }))
        );
        if (qErr) throw qErr;
      }

      toast({ title: 'Survey created!' });
      setTitle(''); setDescription(''); setQuestions([{ question_text: '', question_type: 'open_text', options: [], required: true, logic_branch: null }]);
      fetchSurveys();
      setTab('manage');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Surveys | UserNinjas</title></Helmet>
      <Background3D />
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-5xl relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/recruiter')}><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="text-3xl font-bold text-foreground">Surveys</h1>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="create"><Plus className="h-4 w-4 mr-1" /> Create</TabsTrigger>
            <TabsTrigger value="manage"><ClipboardList className="h-4 w-4 mr-1" /> Manage</TabsTrigger>
            <TabsTrigger value="results"><BarChart3 className="h-4 w-4 mr-1" /> Results</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Create Survey</CardTitle>
                <CardDescription>Build a standalone survey with multiple question types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Survey Title *</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Product satisfaction survey" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." rows={3} />
                </div>

                <div className="space-y-3">
                  <Label>Questions</Label>
                  {questions.map((q, i) => (
                    <div key={i} className="p-4 border border-border rounded-lg space-y-3">
                      <div className="flex gap-2">
                        <span className="text-muted-foreground font-mono text-sm mt-2 w-6 text-center">{i + 1}</span>
                        <Input className="flex-1" value={q.question_text} onChange={e => updateQ(i, 'question_text', e.target.value)} placeholder="Question text" />
                        <Button variant="ghost" size="icon" onClick={() => removeQ(i)} className="text-destructive shrink-0"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                      <div className="flex gap-3 flex-wrap pl-8">
                        <Select value={q.question_type} onValueChange={v => updateQ(i, 'question_type', v)}>
                          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open_text">Open Text</SelectItem>
                            <SelectItem value="mcq">Multiple Choice</SelectItem>
                            <SelectItem value="rating">Rating (1–5)</SelectItem>
                            <SelectItem value="yes_no">Yes / No</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                          <Checkbox checked={q.required} onCheckedChange={v => updateQ(i, 'required', v)} />
                          <Label className="text-xs">Required</Label>
                        </div>
                      </div>
                      {q.question_type === 'mcq' && (
                        <div className="space-y-2 pl-8">
                          {(q.options.length === 0 ? ['', ''] : q.options).map((opt, oi) => (
                            <Input key={oi} value={opt} onChange={e => {
                              const newOpts = [...(q.options.length === 0 ? ['', ''] : q.options)];
                              newOpts[oi] = e.target.value;
                              updateQ(i, 'options', newOpts);
                            }} placeholder={`Option ${oi + 1}`} className="text-sm" />
                          ))}
                          <Button variant="ghost" size="sm" onClick={() => updateQ(i, 'options', [...(q.options.length === 0 ? ['', ''] : q.options), ''])}>
                            <Plus className="h-3 w-3 mr-1" /> Add Option
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" onClick={addQ} className="w-full"><Plus className="h-4 w-4 mr-2" /> Add Question</Button>
                </div>

                <Button onClick={handleCreate} disabled={saving} className="w-full">
                  <Send className="h-4 w-4 mr-2" /> {saving ? 'Creating...' : 'Create & Publish Survey'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader><CardTitle>Your Surveys</CardTitle></CardHeader>
              <CardContent>
                {loading ? <p className="text-muted-foreground text-center py-8">Loading...</p> : surveys.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No surveys yet. Create one!</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {surveys.map(s => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.title}</TableCell>
                          <TableCell><Badge variant={s.status === 'active' ? 'default' : 'secondary'}>{s.status}</Badge></TableCell>
                          <TableCell className="text-muted-foreground text-sm">{format(new Date(s.created_at), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => { fetchResponses(s.id); setTab('results'); }}>
                              <Eye className="h-4 w-4 mr-1" /> Results
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Survey Results</CardTitle>
                <CardDescription>{selectedSurvey ? `${responses.length} responses` : 'Select a survey from Manage tab'}</CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedSurvey ? (
                  <p className="text-muted-foreground text-center py-8">Select a survey to view results</p>
                ) : responses.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No responses yet</p>
                ) : (
                  <div className="space-y-3">
                    {responses.map((r, i) => (
                      <div key={r.id} className="p-4 border border-border rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2">Response {i + 1} · {format(new Date(r.created_at), 'MMM d, yyyy HH:mm')}</p>
                        <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(r.answers, null, 2)}</pre>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
