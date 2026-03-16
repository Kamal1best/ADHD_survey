export interface Symptom {
  id: string;
  title: string;
  description: string;
  category: 'inattentive' | 'hyperactive' | 'unofficial';
}

export const SURVEY_CATEGORIES = {
  inattentive: {
    title: 'أعراض تشتت الانتباه',
    titleEn: 'Inattentive Symptoms',
    color: 'bg-amber-500',
    borderColor: 'border-amber-500',
    maxScore: 72, // 9 symptoms × 8 max points per symptom (4 frequency + 3 impact + 1 duration max base, but let's calculate properly)
  },
  hyperactive: {
    title: 'أعراض الاندفاعية وفرط الحركة',
    titleEn: 'Hyperactive Symptoms',
    color: 'bg-rose-500',
    borderColor: 'border-rose-500',
    maxScore: 72,
  },
  unofficial: {
    title: 'أعراض غير رسمية/إضافية',
    titleEn: 'Unofficial Symptoms',
    color: 'bg-purple-500',
    borderColor: 'border-purple-500',
    maxScore: 56,
  },
} as const;

export const SYMPTOMS: Symptom[] = [
  // Part 1: Inattentive Symptoms (9 symptoms)
  {
    id: 'distractibility',
    title: 'سهولة التشتت',
    description: 'التأثر السريع بالمؤثرات الخارجية.',
    category: 'inattentive',
  },
  {
    id: 'not_listening',
    title: 'يبدو كأنه لا يستمع',
    description: 'حتى عند التحدث إليه مباشرة.',
    category: 'inattentive',
  },
  {
    id: 'organization_issues',
    title: 'صعوبات في التنظيم',
    description: 'صعوبة في ترتيب المهام والأنشطة.',
    category: 'inattentive',
  },
  {
    id: 'focus_difficulty',
    title: 'صعوبة في الحفاظ على التركيز',
    description: 'العجز عن الاستمرار في التركيز لفترة طويلة.',
    category: 'inattentive',
  },
  {
    id: 'careless_mistakes',
    title: 'ارتكاب الأخطاء',
    description: 'خاصة الأخطاء الناتجة عن عدم الانتباه للتفاصيل.',
    category: 'inattentive',
  },
  {
    id: 'following_instructions',
    title: 'صعوبات في اتباع التعليمات',
    description: 'الفشل في إنهاء المهام المطلوبة.',
    category: 'inattentive',
  },
  {
    id: 'avoiding_tasks',
    title: 'تجنب المهام الصعبة',
    description: 'النفور من المهام التي تتطلب مجهوداً ذهنياً مستمراً.',
    category: 'inattentive',
  },
  {
    id: 'losing_things',
    title: 'فقدان الأشياء',
    description: 'إضاعة الأدوات الضرورية (مثل المفاتيح، الأقلام، أو المحفظة).',
    category: 'inattentive',
  },
  {
    id: 'forgetfulness',
    title: 'النسيان',
    description: 'نسيان المواعيد أو المهام اليومية المتكررة.',
    category: 'inattentive',
  },
  // Part 2: Hyperactive Symptoms (9 symptoms)
  {
    id: 'fidgeting',
    title: 'التململ',
    description: 'كثرة حركات اليدين أو القدمين أو التحرك في المقعد.',
    category: 'hyperactive',
  },
  {
    id: 'leaving_seat',
    title: 'ترك المقعد كثيراً',
    description: 'عدم القدرة على الجلوس لفترات طويلة.',
    category: 'hyperactive',
  },
  {
    id: 'inner_restlessness',
    title: 'الشعور بالاضطراب',
    description: 'شعور داخلي بعدم الارتياح أو الرغبة في الحركة.',
    category: 'hyperactive',
  },
  {
    id: 'difficulty_relaxing',
    title: 'صعوبة في الاسترخاء',
    description: 'العجز عن الاستمتاع بالهدوء.',
    category: 'hyperactive',
  },
  {
    id: 'always_moving',
    title: 'دائم الحركة',
    description: 'الشعور وكأن الشخص "مدفوع بمحرك".',
    category: 'hyperactive',
  },
  {
    id: 'excessive_talking',
    title: 'التحدث بكثرة',
    description: 'الكلام المفرط أو المتواصل.',
    category: 'hyperactive',
  },
  {
    id: 'blurting_answers',
    title: 'التسرع في الإجابة',
    description: 'الإجابة قبل انتهاء السؤال.',
    category: 'hyperactive',
  },
  {
    id: 'interrupting',
    title: 'مقاطعة الآخرين',
    description: 'التدخل في أحاديث أو ألعاب الآخرين.',
    category: 'hyperactive',
  },
  {
    id: 'difficulty_waiting',
    title: 'صعوبة في الانتظار',
    description: 'عدم الصبر عند انتظار الدور.',
    category: 'hyperactive',
  },
  // Part 3: Unofficial Symptoms (7 symptoms)
  {
    id: 'emotional_regulation',
    title: 'عدم القدرة على تنظيم العواطف',
    description: 'تقلبات مزاجية سريعة أو صعوبة في التحكم بالمشاعر.',
    category: 'unofficial',
  },
  {
    id: 'sleep_problems',
    title: 'مشاكل في النوم',
    description: 'صعوبة في الدخول في النوم أو الأرق.',
    category: 'unofficial',
  },
  {
    id: 'sensory_sensitivity',
    title: 'الحساسية الحسية',
    description: 'الحساسية المفرطة تجاه الأصوات، الأضواء، أو ملمس الملابس.',
    category: 'unofficial',
  },
  {
    id: 'social_confusion',
    title: 'الارتباك الاجتماعي',
    description: 'صعوبة في فهم الإشارات الاجتماعية غير اللفظية.',
    category: 'unofficial',
  },
  {
    id: 'rsd',
    title: 'حساسية الرفض (RSD)',
    description: 'ألم عاطفي شديد عند التعرض للنقد أو الرفض.',
    category: 'unofficial',
  },
  {
    id: 'time_blindness',
    title: 'ضعف الإدراك بالوقت',
    description: 'صعوبة في تقدير الوقت أو الالتزام بالمواعيد.',
    category: 'unofficial',
  },
  {
    id: 'hyperfocus',
    title: 'التركيز المفرط (Hyperfocus)',
    description: 'الاندماج الكلي في نشاط معين لدرجة نسيان ما حوله.',
    category: 'unofficial',
  },
];

export const FREQUENCY_OPTIONS = [
  { value: 'rarely', label: 'نادرًا', points: 1 },
  { value: 'monthly', label: 'عدة مرات في الشهر', points: 2 },
  { value: 'weekly', label: 'عدة مرات في الأسبوع', points: 3 },
  { value: 'daily', label: 'عدة مرات في اليوم', points: 4 },
] as const;

export const IMPACT_AREAS = [
  { value: 'work_study', label: 'العمل - الدراسة', points: 1 },
  { value: 'family_home', label: 'العائلة - المنزل', points: 1 },
  { value: 'friends_hobbies', label: 'الأصدقاء - الهوايات', points: 1 },
] as const;

export const DURATION_OPTIONS = [
  { value: 'less_6_months', label: 'لأقل من ستة أشهر', points: 1 },
  { value: 'more_6_months', label: 'لأكثر من ستة أشهر', points: 2 },
  { value: 'lifetime', label: 'طوال حياتي', points: 3 },
] as const;

export interface SurveyAnswer {
  symptomId: string;
  frequency: string;
  impactAreas: string[];
  duration: string;
}

export function getSymptomsByCategory(category: Symptom['category']): Symptom[] {
  return SYMPTOMS.filter(s => s.category === category);
}

export function getFrequencyPoints(value: string): number {
  const option = FREQUENCY_OPTIONS.find(o => o.value === value);
  return option?.points || 0;
}

export function getDurationPoints(value: string): number {
  const option = DURATION_OPTIONS.find(o => o.value === value);
  return option?.points || 0;
}

export function getImpactPoints(impactAreas: string[]): number {
  return impactAreas.length; // Each impact area = 1 point
}

export function calculateSymptomScore(answer: { frequency: string; impactAreas: string[]; duration: string }): number {
  const frequencyPoints = getFrequencyPoints(answer.frequency);
  const impactPoints = getImpactPoints(answer.impactAreas);
  const durationPoints = getDurationPoints(answer.duration);
  
  return frequencyPoints + impactPoints + durationPoints;
}

// Max score per symptom: 4 (frequency) + 3 (impact) + 3 (duration) = 10
export const MAX_SCORE_PER_SYMPTOM = 10;

export function getMaxScoreForCategory(category: 'inattentive' | 'hyperactive' | 'unofficial'): number {
  const count = getSymptomsByCategory(category).length;
  return count * MAX_SCORE_PER_SYMPTOM;
}
