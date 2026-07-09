// web/constants/smartReply.ts

import {
  DollarSign,
  Sparkles,
  LifeBuoy,
  Presentation,
  ShoppingBag,
  Code,
  CreditCard,
  AlertTriangle,
  User,
  MessageSquare,
  LucideIcon,
} from "lucide-react";

export const INTENT_OPTIONS = [
  { value: 'pricing', label: 'Pricing' },
  { value: 'features', label: 'Features' },
  { value: 'support', label: 'Support' },
  { value: 'demo', label: 'Demo' },
  { value: 'sales', label: 'Sales' },
  { value: 'technical', label: 'Technical' },
  { value: 'billing', label: 'Billing' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'human', label: 'Human Agent' },
  { value: 'general', label: 'General' },
];

export const INTENT_LABELS: Record<string, string> = {
  pricing: 'Pricing',
  features: 'Features',
  support: 'Support',
  demo: 'Demo',
  sales: 'Sales',
  technical: 'Technical',
  billing: 'Billing',
  urgent: 'Urgent',
  human: 'Human Agent',
  general: 'General',
};

export const INTENT_ICONS: Record<string, LucideIcon> = {
  pricing: DollarSign,
  features: Sparkles,
  support: LifeBuoy,
  demo: Presentation,
  sales: ShoppingBag,
  technical: Code,
  billing: CreditCard,
  urgent: AlertTriangle,
  human: User,
  general: MessageSquare,
};