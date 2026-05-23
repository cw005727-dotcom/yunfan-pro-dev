import { memo } from 'react';
import * as LucideIcons from 'lucide-react';

const iconCache = {};

const toPascalCase = (str) => {
  if (!str) return 'Circle';
  if (iconCache[str]) return iconCache[str];
  const result = str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  iconCache[str] = result;
  return result;
};

const Icon = memo(({ name, className = '', size = 20 }) => {
  const pascalName = toPascalCase(name);
  const IconComponent = LucideIcons[pascalName] || LucideIcons.Circle;
  return <IconComponent className={className} size={size} strokeWidth={2.5} />;
});

export default Icon;
