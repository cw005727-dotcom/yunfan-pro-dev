import * as LucideIcons from 'lucide-react';

const toPascalCase = (str) => {
  if (!str) return 'Circle';
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

const Icon = ({ name, className = '', size = 20 }) => {
  const pascalName = toPascalCase(name);
  const IconComponent = LucideIcons[pascalName] || LucideIcons.Circle;
  return <IconComponent className={className} size={size} strokeWidth={2.5} />;
};

export default Icon;
