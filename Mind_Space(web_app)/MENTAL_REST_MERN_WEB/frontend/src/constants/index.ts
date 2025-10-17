// Animation durations
export const ANIMATION_DURATION = {
  FAST: 300,
  NORMAL: 500,
  SLOW: 1000,
} as const;

// Animation delays
export const ANIMATION_DELAY = {
  SHORT: 200,
  MEDIUM: 400,
  LONG: 600,
  EXTRA_LONG: 800,
} as const;

// Color gradients
export const GRADIENTS = {
  PRIMARY: 'from-blue-500 to-purple-600',
  SECONDARY: 'from-green-500 to-teal-600',
  ACCENT: 'from-purple-500 to-pink-600',
  NEUTRAL: 'from-gray-500 to-gray-600',
} as const;

// Background gradients
export const BACKGROUND_GRADIENTS = {
  HERO: 'from-blue-50 via-indigo-50 to-purple-50',
  LOGIN: 'from-blue-50 via-indigo-50 to-purple-50',
  REGISTER: 'from-green-50 via-teal-50 to-blue-50',
  FEATURES: 'bg-white',
  TESTIMONIALS: 'from-gray-50 to-blue-50',
  CTA: 'from-blue-600 via-purple-600 to-indigo-600',
} as const;

// Feature data
export const FEATURES = [
  {
    id: 1,
    icon: 'journal',
    title: 'Smart Journaling',
    description: 'Express your thoughts with guided prompts and AI-powered insights to understand your mental patterns.',
    gradient: 'from-blue-50 to-indigo-50',
    iconGradient: 'from-blue-500 to-blue-600',
    hoverColor: 'blue-600',
  },
  {
    id: 2,
    icon: 'chart',
    title: 'Mood Tracking',
    description: 'Visualize your emotional journey with beautiful charts and discover patterns in your well-being.',
    gradient: 'from-purple-50 to-pink-50',
    iconGradient: 'from-purple-500 to-purple-600',
    hoverColor: 'purple-600',
  },
  {
    id: 3,
    icon: 'heart',
    title: 'AI Insights',
    description: 'Get personalized recommendations and insights powered by advanced AI to support your mental health.',
    gradient: 'from-green-50 to-emerald-50',
    iconGradient: 'from-green-500 to-green-600',
    hoverColor: 'green-600',
  },
  {
    id: 4,
    icon: 'chat',
    title: 'Community Support',
    description: 'Connect with others on similar journeys in a safe, anonymous community space.',
    gradient: 'from-orange-50 to-red-50',
    iconGradient: 'from-orange-500 to-orange-600',
    hoverColor: 'orange-600',
  },
  {
    id: 5,
    icon: 'book',
    title: 'Wellness Resources',
    description: 'Access curated mindfulness exercises, breathing techniques, and mental health resources.',
    gradient: 'from-teal-50 to-cyan-50',
    iconGradient: 'from-teal-500 to-teal-600',
    hoverColor: 'teal-600',
  },
  {
    id: 6,
    icon: 'check',
    title: 'Progress Tracking',
    description: 'Monitor your mental health progress with detailed analytics and milestone celebrations.',
    gradient: 'from-indigo-50 to-blue-50',
    iconGradient: 'from-indigo-500 to-indigo-600',
    hoverColor: 'indigo-600',
  },
] as const;

// Testimonials data
export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Sarah M.',
    role: 'Student',
    content: 'MindSpace helped me understand my anxiety patterns. The AI insights are incredibly accurate and the journaling prompts are so helpful.',
    initial: 'S',
    gradient: 'from-blue-500 to-purple-600',
    hoverColor: 'blue-600',
  },
  {
    id: 2,
    name: 'Michael R.',
    role: 'Professional',
    content: 'The mood tracking feature is amazing. I can see my progress over time and it motivates me to keep working on my mental health.',
    initial: 'M',
    gradient: 'from-green-500 to-teal-600',
    hoverColor: 'green-600',
  },
  {
    id: 3,
    name: 'Alex K.',
    role: 'Parent',
    content: 'As a busy parent, MindSpace gives me the tools I need to prioritize my mental wellness. The community support is incredible.',
    initial: 'A',
    gradient: 'from-purple-500 to-pink-600',
    hoverColor: 'purple-600',
  },
] as const;

// Stats data
export const STATS = [
  {
    value: '10K+',
    label: 'Happy Users',
    color: 'blue-600',
  },
  {
    value: '50K+',
    label: 'Journal Entries',
    color: 'purple-600',
  },
  {
    value: '95%',
    label: 'Satisfaction Rate',
    color: 'indigo-600',
  },
] as const;
