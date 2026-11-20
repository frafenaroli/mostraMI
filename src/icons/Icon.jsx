import { Search, X, ChevronLeft, Calendar, Shuffle, MapPin, Heart, ArrowUpRight } from 'lucide-react';

// Semantic name -> lucide-react component. Keeps call sites (<Icon name="calendar" />)
// decoupled from the underlying icon set, per https://lucide.dev/icons.
const ICONS = {
  search: Search,
  close: X,
  back: ChevronLeft,
  calendar: Calendar,
  shuffle: Shuffle,
  mapPin: MapPin,
  heart: Heart,
  arrowUpRight: ArrowUpRight,
};

export function Icon({ name, size = 20, color = 'currentColor', fill = 'none', strokeWidth = 2, style, className }) {
  const Cmp = ICONS[name];
  if (!Cmp) return null;
  return <Cmp size={size} color={color} fill={fill} strokeWidth={strokeWidth} style={style} className={className} aria-hidden="true" />;
}
