'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  SYMPTOMS, SURVEY_CATEGORIES, FREQUENCY_OPTIONS, IMPACT_AREAS, DURATION_OPTIONS,
  type Symptom, getSymptomsByCategory, calculateSymptomScore, getMaxScoreForCategory,
  getFrequencyPoints, getDurationPoints 
} from '@/lib/survey-data';
import { 
  Brain, ChevronLeft, ChevronRight, Check, AlertCircle, 
  Clock, Target, Users, RotateCcw, Save, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SymptomAnswer {
  frequency: string;
  impactAreas: string[];
  duration: string;
}

interface CategoryResult {
  total: number;
  maxPossible: number;
  percentage: number;
  symptoms: string[];
  severity: 'low' | 'moderate' | 'high' | 'very_high';
}

export default function ADHDSurvey() {
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('adhd-survey-session');
      if (stored) return stored;
      const newId = uuidv4();
      sessionStorage.setItem('adhd-survey-session', newId);
      return newId;
    }
    return uuidv4();
  });

  const [currentSymptomIndex, setCurrentSymptomIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, SymptomAnswer>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentSymptom = SYMPTOMS[currentSymptomIndex];
  const currentCategory = SURVEY_CATEGORIES[currentSymptom.category];
  const progress = ((currentSymptomIndex + 1) / SYMPTOMS.length) * 100;

  // Load saved progress
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const res = await fetch(`/api/survey?sessionId=${sessionId}`);
        const data = await res.json();
        if (data.exists && data.answers) {
          const loadedAnswers: Record<string, SymptomAnswer> = {};
          data.answers.forEach((a: { symptomId: string; frequency: string; impactAreas: string[]; duration: string }) => {
            loadedAnswers[a.symptomId] = {
              frequency: a.frequency,
              impactAreas: a.impactAreas,
              duration: a.duration,
            };
          });
          setAnswers(loadedAnswers);
          if (data.completed) {
            setShowResults(true);
          }
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
      }
      setIsLoading(false);
    };
    loadProgress();
  }, [sessionId]);

  const saveProgress = useCallback(async (answersToSave: Record<string, SymptomAnswer>, completed: boolean = false) => {
    setIsSaving(true);
    try {
      const formattedAnswers = Object.entries(answersToSave).map(([symptomId, answer]) => {
        const symptom = SYMPTOMS.find(s => s.id === symptomId);
        return {
          symptomId,
          category: symptom?.category || 'inattentive',
          frequency: answer.frequency,
          impactAreas: answer.impactAreas,
          duration: answer.duration,
        };
      });

      await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, answers: formattedAnswers, completed }),
      });
    } catch (error) {
      console.error('Failed to save:', error);
    }
    setIsSaving(false);
  }, [sessionId]);

  const handleFrequencyChange = (value: string) => {
    const newAnswers = {
      ...answers,
      [currentSymptom.id]: {
        ...answers[currentSymptom.id],
        frequency: value,
        impactAreas: answers[currentSymptom.id]?.impactAreas || [],
        duration: answers[currentSymptom.id]?.duration || '',
      },
    };
    setAnswers(newAnswers);
    saveProgress(newAnswers);
  };

  const handleImpactChange = (value: string, checked: boolean) => {
    const currentImpact = answers[currentSymptom.id]?.impactAreas || [];
    const newImpact = checked
      ? [...currentImpact, value]
      : currentImpact.filter(v => v !== value);
    
    const newAnswers = {
      ...answers,
      [currentSymptom.id]: {
        ...answers[currentSymptom.id],
        frequency: answers[currentSymptom.id]?.frequency || '',
        impactAreas: newImpact,
        duration: answers[currentSymptom.id]?.duration || '',
      },
    };
    setAnswers(newAnswers);
    saveProgress(newAnswers);
  };

  const handleDurationChange = (value: string) => {
    const newAnswers = {
      ...answers,
      [currentSymptom.id]: {
        ...answers[currentSymptom.id],
        duration: value,
      },
    };
    setAnswers(newAnswers);
    saveProgress(newAnswers);
  };

  const goToNext = () => {
    if (currentSymptomIndex < SYMPTOMS.length - 1) {
      setCurrentSymptomIndex(currentSymptomIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentSymptomIndex > 0) {
      setCurrentSymptomIndex(currentSymptomIndex - 1);
    }
  };

  const jumpToSymptom = (index: number) => {
    setCurrentSymptomIndex(index);
  };

  const handleSubmit = async () => {
    await saveProgress(answers, true);
    setShowResults(true);
  };

  const handleRestart = async () => {
    await fetch(`/api/survey?sessionId=${sessionId}`, { method: 'DELETE' });
    setAnswers({});
    setCurrentSymptomIndex(0);
    setShowResults(false);
    sessionStorage.removeItem('adhd-survey-session');
  };

  const isCurrentAnswerComplete = () => {
    const answer = answers[currentSymptom.id];
    return answer?.frequency && answer?.duration;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).filter(id => {
      const a = answers[id];
      return a?.frequency && a?.duration;
    }).length;
  };

  // Get severity level based on percentage
  const getSeverity = (percentage: number): 'low' | 'moderate' | 'high' | 'very_high' => {
    if (percentage < 25) return 'low';
    if (percentage < 50) return 'moderate';
    if (percentage < 75) return 'high';
    return 'very_high';
  };

  const getSeverityLabel = (severity: 'low' | 'moderate' | 'high' | 'very_high'): string => {
    switch (severity) {
      case 'low': return 'منخفض';
      case 'moderate': return 'متوسط';
      case 'high': return 'مرتفع';
      case 'very_high': return 'مرتفع جداً';
    }
  };

  const getSeverityColor = (severity: 'low' | 'moderate' | 'high' | 'very_high'): string => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'very_high': return 'text-red-600 bg-red-100';
    }
  };

  // Calculate results with scores
  const calculateResults = (): Record<string, CategoryResult> => {
    const results: Record<string, CategoryResult> = {
      inattentive: { total: 0, maxPossible: getMaxScoreForCategory('inattentive'), percentage: 0, symptoms: [], severity: 'low' },
      hyperactive: { total: 0, maxPossible: getMaxScoreForCategory('hyperactive'), percentage: 0, symptoms: [], severity: 'low' },
      unofficial: { total: 0, maxPossible: getMaxScoreForCategory('unofficial'), percentage: 0, symptoms: [], severity: 'low' },
    };

    SYMPTOMS.forEach(symptom => {
      const answer = answers[symptom.id];
      if (answer?.frequency && answer?.duration) {
        const score = calculateSymptomScore({
          frequency: answer.frequency,
          impactAreas: answer.impactAreas || [],
          duration: answer.duration,
        });
        results[symptom.category].total += score;
        if (getFrequencyPoints(answer.frequency) >= 2) { // At least several times a month
          results[symptom.category].symptoms.push(symptom.id);
        }
      }
    });

    // Calculate percentages and severity
    Object.keys(results).forEach(key => {
      const cat = key as keyof typeof results;
      results[cat].percentage = Math.round((results[cat].total / results[cat].maxPossible) * 100);
      results[cat].severity = getSeverity(results[cat].percentage);
    });

    return results;
  };

  // Calculate current symptom score preview
  const getCurrentSymptomScore = (): number => {
    const answer = answers[currentSymptom.id];
    if (!answer?.frequency || !answer?.duration) return 0;
    return calculateSymptomScore({
      frequency: answer.frequency,
      impactAreas: answer.impactAreas || [],
      duration: answer.duration,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="text-center">
          <Brain className="w-16 h-16 mx-auto text-primary animate-pulse" />
          <p className="mt-4 text-muted-foreground">جاري تحميل الاستبيان...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const results = calculateResults();
    const totalScore = results.inattentive.total + results.hyperactive.total + results.unofficial.total;
    const totalMax = results.inattentive.maxPossible + results.hyperactive.maxPossible + results.unofficial.maxPossible;
    const totalPercentage = Math.round((totalScore / totalMax) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col" dir="rtl">
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">نتائج استبيان ADHD</h1>
                  <p className="text-sm text-muted-foreground">شكراً لإكمالك الاستبيان</p>
                </div>
              </div>
              <Button onClick={handleRestart} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                إعادة الاستبيان
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
          {/* Total Score Card */}
          <Card className="mb-6">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl">الدرجة الإجمالية</CardTitle>
              <CardDescription>
                بناءً على إجاباتك على جميع الأسئلة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-6">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="#e2e8f0"
                      strokeWidth="16"
                      fill="none"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="hsl(var(--primary))"
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={`${(totalPercentage / 100) * 553} 553`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-5xl font-bold">{totalScore}</span>
                      <p className="text-sm text-muted-foreground">من {totalMax}</p>
                      <p className="text-lg font-semibold text-primary">{totalPercentage}%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Badge className={`text-base px-4 py-2 ${getSeverityColor(getSeverity(totalPercentage))}`}>
                  شدة الأعراض: {getSeverityLabel(getSeverity(totalPercentage))}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Category Scores */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {Object.entries(SURVEY_CATEGORIES).map(([key, cat]) => {
              const result = results[key];
              const symptomCount = getSymptomsByCategory(key as 'inattentive' | 'hyperactive' | 'unofficial').length;
              
              return (
                <Card key={key} className="overflow-hidden">
                  <div className={`h-2 ${cat.color}`} />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{cat.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold">{result.total}</div>
                      <p className="text-sm text-muted-foreground">من {result.maxPossible} نقطة</p>
                    </div>
                    <Progress value={result.percentage} className="h-3 mb-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{result.percentage}%</span>
                      <Badge className={getSeverityColor(result.severity)}>
                        {getSeverityLabel(result.severity)}
                      </Badge>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">
                      {result.symptoms.length} من {symptomCount} عرض
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Warning Card */}
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-900">ملاحظة مهمة</h3>
                  <p className="text-amber-800 text-sm mt-1">
                    هذا الاستبيان هو أداة توعوية فقط وليس تشخيصاً طبياً. 
                    للحصول على تشخيص دقيق، يرجى استشارة أخصائي صحة نفسية مؤهل.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Symptoms */}
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الأعراض</CardTitle>
              <CardDescription>توزيع النقاط لكل عرض على حدة</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-96">
                <div className="space-y-4">
                  {Object.entries(SURVEY_CATEGORIES).map(([key, cat]) => {
                    const categorySymptoms = getSymptomsByCategory(key as 'inattentive' | 'hyperactive' | 'unofficial');
                    
                    return (
                      <div key={key}>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                          {cat.title}
                        </h4>
                        <div className="space-y-2">
                          {categorySymptoms.map(symptom => {
                            const answer = answers[symptom.id];
                            const score = answer?.frequency && answer?.duration 
                              ? calculateSymptomScore({
                                  frequency: answer.frequency,
                                  impactAreas: answer.impactAreas || [],
                                  duration: answer.duration,
                                })
                              : 0;
                            const freqLabel = answer?.frequency 
                              ? FREQUENCY_OPTIONS.find(f => f.value === answer.frequency)?.label 
                              : '-';
                            const durationLabel = answer?.duration 
                              ? DURATION_OPTIONS.find(d => d.value === answer.duration)?.label 
                              : '-';
                            
                            return (
                              <div key={symptom.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{symptom.title}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {freqLabel} • {durationLabel} • {answer?.impactAreas?.length || 0} مجالات متأثرة
                                  </div>
                                </div>
                                <Badge variant={score >= 7 ? 'destructive' : score >= 4 ? 'default' : 'secondary'}>
                                  {score} نقاط
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </main>

        <footer className="bg-white border-t py-4 mt-auto">
          <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
            استبيان ADHD - أداة توعوية وليست تشخيصاً طبياً
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">استبيان ADHD</h1>
                <p className="text-xs text-muted-foreground">
                  السؤال {currentSymptomIndex + 1} من {SYMPTOMS.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isSaving && (
                <Badge variant="secondary" className="gap-1">
                  <Save className="w-3 h-3" />
                  جاري الحفظ...
                </Badge>
              )}
              <Badge variant="outline">
                {getAnsweredCount()} / {SYMPTOMS.length} مكتمل
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      <div className="flex-1 flex max-w-6xl mx-auto w-full">
        {/* Sidebar - Symptoms List */}
        <aside className="hidden lg:block w-64 border-l bg-white p-4 overflow-y-auto">
          <h3 className="font-semibold mb-3 text-sm">الأعراض</h3>
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-1">
              {Object.entries(SURVEY_CATEGORIES).map(([key, cat]) => (
                <div key={key} className="mb-4">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">{cat.title}</h4>
                  {getSymptomsByCategory(key as 'inattentive' | 'hyperactive' | 'unofficial').map((symptom) => {
                    const globalIdx = SYMPTOMS.findIndex(s => s.id === symptom.id);
                    const answer = answers[symptom.id];
                    const isAnswered = answer?.frequency && answer?.duration;
                    const isCurrent = globalIdx === currentSymptomIndex;
                    const score = isAnswered ? calculateSymptomScore({
                      frequency: answer.frequency,
                      impactAreas: answer.impactAreas || [],
                      duration: answer.duration,
                    }) : 0;
                    
                    return (
                      <button
                        key={symptom.id}
                        onClick={() => jumpToSymptom(globalIdx)}
                        className={`w-full text-right px-2 py-1.5 rounded text-sm transition-colors flex items-center justify-between gap-2 ${
                          isCurrent 
                            ? 'bg-primary text-primary-foreground' 
                            : isAnswered
                              ? 'hover:bg-slate-100'
                              : 'hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                            isCurrent 
                              ? 'bg-white/20' 
                              : isAnswered
                                ? score >= 7 ? 'bg-red-200 text-red-700' : score >= 4 ? 'bg-orange-200 text-orange-700' : 'bg-green-200 text-green-700'
                                : 'bg-slate-200'
                          }`}>
                            {isAnswered ? score : globalIdx + 1}
                          </span>
                          <span className="truncate">{symptom.title}</span>
                        </div>
                        {isAnswered && !isCurrent && (
                          <Badge variant="outline" className="text-xs">
                            {score}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSymptomIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={currentCategory.color}>
                        {currentCategory.title}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        العرض {currentSymptomIndex + 1} من {SYMPTOMS.length}
                      </span>
                    </div>
                    {isCurrentAnswerComplete() && (
                      <Badge variant="outline" className="gap-1">
                        <Trophy className="w-3 h-3" />
                        {getCurrentSymptomScore()} نقاط
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl">{currentSymptom.title}</CardTitle>
                  <CardDescription className="text-base">
                    {currentSymptom.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Question 1: Frequency */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <h3 className="font-semibold">كم مرة تشعر بهذا العرض؟</h3>
                    </div>
                    <RadioGroup
                      value={answers[currentSymptom.id]?.frequency || ''}
                      onValueChange={handleFrequencyChange}
                      className="grid gap-2 sm:grid-cols-2"
                    >
                      {FREQUENCY_OPTIONS.map(option => (
                        <div 
                          key={option.value} 
                          className={`flex items-center justify-between space-x-2 space-x-reverse p-3 rounded-lg border transition-colors cursor-pointer ${
                            answers[currentSymptom.id]?.frequency === option.value 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:bg-slate-50'
                          }`}
                          onClick={() => handleFrequencyChange(option.value)}
                        >
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value={option.value} id={`freq-${option.value}`} />
                            <Label htmlFor={`freq-${option.value}`} className="cursor-pointer">
                              {option.label}
                            </Label>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {option.points} نقطة
                          </Badge>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* Question 2: Impact Areas */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-muted-foreground" />
                      <h3 className="font-semibold">هل يؤثر هذا العرض سلبًا على:</h3>
                      <Badge variant="outline" className="text-xs">كل واحد = 1 نقطة</Badge>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {IMPACT_AREAS.map(area => (
                        <div 
                          key={area.value} 
                          className={`flex items-center justify-between space-x-2 space-x-reverse p-3 rounded-lg border transition-colors cursor-pointer ${
                            answers[currentSymptom.id]?.impactAreas?.includes(area.value) 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Checkbox
                              id={`impact-${area.value}`}
                              checked={answers[currentSymptom.id]?.impactAreas?.includes(area.value) || false}
                              onCheckedChange={(checked) => handleImpactChange(area.value, checked as boolean)}
                            />
                            <Label htmlFor={`impact-${area.value}`} className="cursor-pointer">
                              {area.label}
                            </Label>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            +{area.points}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Question 3: Duration */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <h3 className="font-semibold">منذ متى وأنت تعاني من هذا العرض؟</h3>
                    </div>
                    <RadioGroup
                      value={answers[currentSymptom.id]?.duration || ''}
                      onValueChange={handleDurationChange}
                      className="grid gap-2"
                    >
                      {DURATION_OPTIONS.map(option => (
                        <div 
                          key={option.value} 
                          className={`flex items-center justify-between space-x-2 space-x-reverse p-3 rounded-lg border transition-colors cursor-pointer ${
                            answers[currentSymptom.id]?.duration === option.value 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:bg-slate-50'
                          }`}
                          onClick={() => handleDurationChange(option.value)}
                        >
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value={option.value} id={`dur-${option.value}`} />
                            <Label htmlFor={`dur-${option.value}`} className="cursor-pointer">
                              {option.label}
                            </Label>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {option.points} نقطة
                          </Badge>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={goToPrev}
              disabled={currentSymptomIndex === 0}
              className="gap-2"
            >
              <ChevronRight className="w-4 h-4" />
              السابق
            </Button>
            
            <div className="flex gap-2">
              {currentSymptomIndex === SYMPTOMS.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!isCurrentAnswerComplete()}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4" />
                  إنهاء الاستبيان
                </Button>
              ) : (
                <Button
                  onClick={goToNext}
                  disabled={!isCurrentAnswerComplete()}
                  className="gap-2"
                >
                  التالي
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Progress Indicator */}
          <div className="lg:hidden mt-6">
            <div className="flex flex-wrap justify-center gap-1">
              {SYMPTOMS.map((symptom, idx) => {
                const answer = answers[symptom.id];
                const isAnswered = answer?.frequency && answer?.duration;
                const isCurrent = idx === currentSymptomIndex;
                const score = isAnswered ? calculateSymptomScore({
                  frequency: answer.frequency,
                  impactAreas: answer.impactAreas || [],
                  duration: answer.duration,
                }) : 0;
                
                return (
                  <button
                    key={symptom.id}
                    onClick={() => jumpToSymptom(idx)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      isCurrent 
                        ? 'bg-primary' 
                        : isAnswered 
                          ? score >= 7 ? 'bg-red-500' : score >= 4 ? 'bg-orange-500' : 'bg-green-500'
                          : 'bg-slate-300'
                    }`}
                    title={`${symptom.title}: ${score} نقاط`}
                  />
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-3 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-muted-foreground">
          استبيان ADHD - أداة توعوية وليست تشخيصاً طبياً
        </div>
      </footer>
    </div>
  );
}
