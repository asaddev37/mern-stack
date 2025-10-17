// Base component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Animation props
export interface AnimationProps {
  isVisible?: boolean;
  delay?: number;
  duration?: number;
}

// Form data interfaces
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

// Feature interface
export interface Feature {
  id: number;
  icon: string;
  title: string;
  description: string;
  gradient: string;
  iconGradient: string;
  hoverColor: string;
}

// Testimonial interface
export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  initial: string;
  gradient: string;
  hoverColor: string;
}

// Stat interface
export interface Stat {
  value: string;
  label: string;
  color: string;
}

// Mouse position interface
export interface MousePosition {
  x: number;
  y: number;
}

// Section visibility state
export interface SectionVisibility {
  [key: number]: boolean;
}
