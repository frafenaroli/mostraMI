import { Icon } from '../icons/Icon';
import { LUOGO_COLORS } from '../lib/exhibits';

export function LuogoIcon({ luogo, size = 24, strokeWidth = 1.5 }) {
  const color = (LUOGO_COLORS[luogo] || LUOGO_COLORS.altro).fg;
  return <Icon name={luogo} size={size} color={color} strokeWidth={strokeWidth} />;
}
