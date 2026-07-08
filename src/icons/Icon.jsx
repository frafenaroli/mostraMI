import {
  Ticket, Landmark, Image, Infinity as InfinityIcon, Box, MapPin, Tag,
  Search, X, ArrowLeft, ArrowUpRight, ArrowRight, ChevronRight, ChevronDown,
  Sparkle, Clock, Calendar, Filter, SearchX, LayoutGrid,
} from 'lucide-react';

// Semantic name -> lucide-react component. Keeps call sites (<Icon name="mostra" />)
// decoupled from the underlying icon set, per https://lucide.dev/icons.
const ICONS = {
  mostra: Ticket,
  museo: Landmark,
  galleria: Image,
  'mostra-permanente': InfinityIcon,
  installazione: Box,
  monumento: MapPin,
  altro: Tag,
  search: Search,
  searchX: SearchX,
  close: X,
  back: ArrowLeft,
  arrowUpRight: ArrowUpRight,
  arrowRight: ArrowRight,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  sparkles: Sparkle,
  clock: Clock,
  calendar: Calendar,
  mapPin: MapPin,
  filter: Filter,
  grid: LayoutGrid,
};

export function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 2, style, className }) {
  const Cmp = ICONS[name];
  if (!Cmp) return null;
  return <Cmp size={size} color={color} strokeWidth={strokeWidth} style={style} className={className} aria-hidden="true" />;
}
