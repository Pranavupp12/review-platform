// lib/category-icons.ts
import { 
  Landmark, Plane, ShoppingBag, Monitor, 
  Stethoscope, Car, Home, Utensils, 
  Dumbbell, Dog, Briefcase, Globe, 
  LayoutGrid 
} from 'lucide-react';

// Map category names (lowercase) to Lucide components
export const iconMap: Record<string, any> = {
  'bank': Landmark,
  'travel insurance': Plane,
  'retail': ShoppingBag,
  'software': Monitor,
  'health': Stethoscope,
  'automotive': Car,
  'real estate': Home,
  'restaurants': Utensils,
  'fitness': Dumbbell,
  'pet store': Dog,
  'services': Briefcase,
  'travel': Globe,
};

export function getCategoryIcon(name: string) {
  const normalizedName = name.toLowerCase();
  // Return the matched icon, or a default 'LayoutGrid' icon if not found
  return iconMap[normalizedName] || LayoutGrid;
}