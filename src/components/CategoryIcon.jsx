import {
  LuGraduationCap as GraduationCap,
  LuGrid3X3 as Grid3x3,
  LuHammer as Hammer,
  LuHouse as House,
  LuKeyRound as KeyRound,
  LuLeaf as Leaf,
  LuPaintbrush as Paintbrush,
  LuRuler as Ruler,
  LuSnowflake as Snowflake,
  LuSparkles as Sparkles,
  LuStore as Store,
  LuTruck as Truck,
  LuWrench as Wrench,
  LuZap as Zap,
} from 'react-icons/lu';

// Icon name stored in categories.icon (Lucide names, rendered with react-icons/lu) -> [icon, colour, soft background]
const ICONS = {
  wrench: [Wrench, '#0277bd', '#e1f3fd'],
  zap: [Zap, '#b7791f', '#fff7db'],
  sparkles: [Sparkles, '#00897b', '#e0f5f2'],
  leaf: [Leaf, '#2e7d32', '#e8f5e9'],
  hammer: [Hammer, '#5d4037', '#f3ece9'],
  paintbrush: [Paintbrush, '#c2185b', '#fce8f0'],
  ruler: [Ruler, '#8d5a3b', '#f7eee8'],
  'grid-3x3': [Grid3x3, '#455a64', '#eceff1'],
  house: [House, '#d84315', '#fdede7'],
  'key-round': [KeyRound, '#6a1b9a', '#f3e8fa'],
  snowflake: [Snowflake, '#0288d1', '#e3f4fd'],
  truck: [Truck, '#e65100', '#fff0e0'],
  'graduation-cap': [GraduationCap, '#3949ab', '#e8eaf8'],
};
const FALLBACK = [Store, '#0288d1', '#e1f3fd'];

export function CategoryIcon({ icon, size = 18, ...props }) {
  const [Icon] = ICONS[icon] || FALLBACK;
  return <Icon size={size} {...props} />;
}

/** Rounded, tinted tile showing the trade's icon. */
export function CategoryTile({ icon, size = 48 }) {
  const [Icon, color] = ICONS[icon] || FALLBACK;
  // Tint made from the icon colour so it works in light and dark mode.
  return (
    <span className="tile cat-tile" style={{ width: size, height: size, '--cat': color, borderRadius: size > 60 ? 18 : 12 }}>
      <Icon size={Math.round(size * 0.48)} />
    </span>
  );
}
