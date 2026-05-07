export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PostTemplate {
  id: string;
  category: TemplateCategory;
  title: string;
  description: string;
  structure: string;
  icon: string;
  example?: string;
}

export type TemplateCategory =
  | 'historia-pessoal'
  | 'dica-pratica'
  | 'case-sucesso'
  | 'ia-tecnologia'
  | 'esg-cultura'
  | 'tendencias';

export interface PostAnalysis {
  score: number;
  hookStrength: number;
  authenticity: number;
  structure: number;
  cta: number;
  suggestions: string[];
  warnings: string[];
}

export interface CarouselSlide {
  id: string;
  order: number;
  title: string;
  content: string;
  type: 'cover' | 'content' | 'cta';
}

export interface Carousel {
  id: string;
  title: string;
  slides: CarouselSlide[];
  createdAt: Date;
}

export interface CalendarPost {
  id: string;
  title: string;
  content: string;
  category: TemplateCategory;
  scheduledDate: Date;
  status: 'rascunho' | 'agendado' | 'publicado';
  createdAt: Date;
}
