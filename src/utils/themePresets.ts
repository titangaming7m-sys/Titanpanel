export interface ThemePreset {
  id: string;
  name: string;
  primary: string;      // primary action buttons, main accent, focus halos
  secondary: string;    // sub-accents, border highlights, secondary buttons
  accent: string;       // secondary labels, glow rings, minor accents
  bg: string;           // viewport/page canvas backings
  cardBg: string;       // glass cards, dropdown list backings
  borderColor?: string; // outline separators
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    primary: '#ec4899', // Hot Pink
    secondary: '#06b6d4', // Neon Cyan
    accent: '#3b82f6', // Bright Blue
    bg: '#020617', // Near Black Slate
    cardBg: '#0f172a', // Dark Slate
  },
  {
    id: 'matrix-digital',
    name: 'Matrix Digital',
    primary: '#22c55e', // Neon Lime
    secondary: '#15803d', // Dark Forest Green
    accent: '#10b981', // Emerald
    bg: '#020607', // Total Jet Black
    cardBg: '#09180f', // Dark green-tint slate
  },
  {
    id: 'royal-amethyst',
    name: 'Royal Amethyst',
    primary: '#8b5cf6', // Violet
    secondary: '#d946ef', // Fuchsia
    accent: '#f59e0b', // Gold Amber
    bg: '#090514', // Rich Plum Void
    cardBg: '#130c25', // Imperial Dark Purple
  },
  {
    id: 'midnight-sapphire',
    name: 'Midnight Sapphire',
    primary: '#2563eb', // Royal Sapphire Blue
    secondary: '#38bdf8', // Ice Blue
    accent: '#6366f1', // Indigo
    bg: '#030712', // Deep Abyss Gray
    cardBg: '#0b1329', // Dark Sea Navy
  },
  {
    id: 'sunset-crimson',
    name: 'Sunset Crimson',
    primary: '#dc2626', // Crimson Red
    secondary: '#ea580c', // Fire Orange
    accent: '#f59e0b', // Solar Amber
    bg: '#0c0404', // Dark Volcanic Ash
    cardBg: '#1c0c0c', // Lava Stone Grey
  },
  {
    id: 'forest-moss',
    name: 'Forest Moss',
    primary: '#10b981', // Emerald Mint
    secondary: '#eab308', // Autumn Gold
    accent: '#84cc16', // Lime Leaf
    bg: '#020804', // Silent Jungle Green
    cardBg: '#08170e', // Ancient Bark Brown-Green
  },
  {
    id: 'carbon-stealth',
    name: 'Carbon Stealth',
    primary: '#f3f4f6', // Cold Silver White
    secondary: '#9ca3af', // Warm Gray
    accent: '#6b7280', // Dark Iron
    bg: '#09090b', // Matte Black Carbon
    cardBg: '#18181b', // Brushed Graphite Steel
  },
  {
    id: 'vaporwave-dream',
    name: 'Vaporwave Dream',
    primary: '#f43f5e', // Strawberry Rose
    secondary: '#14b8a6', // Synthwave Teal
    accent: '#a855f7', // Dream Purple
    bg: '#0c0714', // Cyber Horizon Violet
    cardBg: '#1d1230', // Neon Grid Pink-Purple
  },
  {
    id: 'frozen-blizzard',
    name: 'Frozen Blizzard',
    primary: '#0ea5e9', // Ice Blue
    secondary: '#67e8f9', // Crystal Cyan
    accent: '#cbd5e1', // Glacial Silver
    bg: '#080e1a', // Arctic Ocean Blue
    cardBg: '#131e33', // Deep Glacial Fissure
  },
  {
    id: 'solar-flare',
    name: 'Solar Flare',
    primary: '#eab308', // Vibrant Yellow
    secondary: '#f97316', // Hot Orange
    accent: '#ef4444', // Ember Red
    bg: '#0c0702', // Corona Void Black
    cardBg: '#1a1208', // Sunbaked Obsidian
  },
  {
    id: 'atlantis-deep',
    name: 'Atlantis Teal',
    primary: '#0d9488', // Marine Teal
    secondary: '#10b981', // Aquamarine Emerald
    accent: '#3b82f6', // Coastal Sea Blue
    bg: '#010b0f', // Abyssal Oceanic Trench
    cardBg: '#061a24', // Corrosive Coral Gray
  },
  {
    id: 'sakura-rose',
    name: 'Sakura Rose',
    primary: '#fda4af', // Blossom Petal Pink
    secondary: '#f43f5e', // Vibrant Rose
    accent: '#f59e0b', // Gold Dust
    bg: '#0f0507', // Red Velvet Void
    cardBg: '#1c0c10', // Dark Plum Blossom
  },
  {
    id: 'acid-slime',
    name: 'Acid Slime',
    primary: '#a3e635', // Radioactive Lime
    secondary: '#eab308', // Nuclear Amber
    accent: '#a855f7', // Poison Purple
    bg: '#030704', // Toxified Dark Swamps
    cardBg: '#0b140d', // Corrupted Waste Cellar
  },
  {
    id: 'pumpkin-halloween',
    name: 'Pumpkin Hollow',
    primary: '#f97316', // Jack-O-Lantern Orange
    secondary: '#b45309', // Autumn Brown
    accent: '#facc15', // Candle Flame Yellow
    bg: '#070301', // Dark Spooky Forests
    cardBg: '#140c06', // Hollow Pumpkin Shell
  },
  {
    id: 'nebula-cosmic',
    name: 'Nebula Cosmic',
    primary: '#c084fc', // Nebula Pink-Purple
    secondary: '#ff2e93', // Supernova Magenta
    accent: '#6366f1', // Star Indigo
    bg: '#02020e', // Cosmic Empty Void
    cardBg: '#0d0d26', // Celestial Dust Cloud
  },
  {
    id: 'gilded-luxury',
    name: 'Gilded Luxury',
    primary: '#fbbf24', // Imperial Gold
    secondary: '#fef08a', // Champagne Glow
    accent: '#d97706', // Antique Bronze
    bg: '#050505', // Velvet Black Room
    cardBg: '#141412', // Dark Gilded Vault
  },
  {
    id: 'chocolate-dream',
    name: 'Chocolate Dream',
    primary: '#d97706', // Sweet Caramel
    secondary: '#ca8a04', // Butterscotch
    accent: '#fca5a5', // Strawberry Cream
    bg: '#0c0603', // Rich Cocoa Soil
    cardBg: '#1a0e08', // Dark Chocolate Log
  },
  {
    id: 'poison-violet',
    name: 'Poison Violet',
    primary: '#d946ef', // Acid Violet
    secondary: '#a3e635', // Biohazard Green
    accent: '#ffffff', // Neutral Ice White
    bg: '#0d020f', // Poisonous Cave Shadows
    cardBg: '#1b0c21', // Dark Witch Cauldron
  },
  {
    id: 'deep-crimson',
    name: 'Deep Crimson',
    primary: '#ef4444', // Blood Ruby
    secondary: '#991b1b', // Gothic Bordeaux
    accent: '#e2e8f0', // Cold Iron
    bg: '#080101', // Vampire Coffins
    cardBg: '#170707', // Dark Red Citadel
  },
  {
    id: 'cotton-candy',
    name: 'Cotton Candy',
    primary: '#ff7eb9', // Sugar Pink
    secondary: '#7afcff', // Electric Sky Blue
    accent: '#a855f7', // Violet Sweet
    bg: '#0c0719', // Carnival Dreamland
    cardBg: '#18112d', // Creamy Pastel Slate
  },
  {
    id: 'electric-storm',
    name: 'Electric Storm',
    primary: '#8b5cf6', // Indigo Bolt
    secondary: '#facc15', // Lightning Yellow
    accent: '#06b6d4', // Rain Cloud Cyan
    bg: '#04030a', // Tempest Sky Void
    cardBg: '#0e0b1f', // Storm Cloud Fortress
  },
  {
    id: 'nuclear-fallout',
    name: 'Nuclear Fallout',
    primary: '#22c55e', // Rad-X Green
    secondary: '#f97316', // Warning Flare Orange
    accent: '#eab308', // Radioactive Yellow
    bg: '#040704', // Post-Apo Ash Field
    cardBg: '#0c130c', // Fallout Shelter Bunker
  },
  {
    id: 'vampire-goth',
    name: 'Vampire Goth',
    primary: '#991b1b', // Dark Blood Red
    secondary: '#7c3aed', // Dark Violet
    accent: '#f3f4f6', // Cold Marble White
    bg: '#010103', // Pitch Midnight
    cardBg: '#0a0a0f', // Gothic Cathedral Pillar
  },
  {
    id: 'rust-industrial',
    name: 'Rust Industrial',
    primary: '#ea580c', // Oxidized Iron Orange
    secondary: '#a16207', // Coroded Bronze
    accent: '#94a3b8', // Galvanized Steel
    bg: '#0b0806', // Abandoned Mill Floor
    cardBg: '#1a1511', // Rusted Steel Beam
  },
  {
    id: 'cyber-shard',
    name: 'Cyber Shard',
    primary: '#06b6d4', // Glacial Cyan
    secondary: '#a855f7', // Matrix Violet
    accent: '#ec4899', // Laser Magenta
    bg: '#03050c', // Virtual Hologram Grid
    cardBg: '#0c1020', // Cybernetic Data Core
  },
  {
    id: 'desert-oasis',
    name: 'Desert Oasis',
    primary: '#eab308', // Sunlit Dunes
    secondary: '#06b6d4', // Cool Mirage Lake
    accent: '#22c55e', // Palm Oasis Green
    bg: '#0c0903', // Warm Desert Night
    cardBg: '#1c150c', // Nomadic Bedouin Tent
  },
  {
    id: 'deep-abyssal',
    name: 'Deep Abyssal',
    primary: '#6366f1', // Luminous Fish Blue
    secondary: '#0ea5e9', // Deep Water Sky
    accent: '#10b981', // Bio-Luminescent Algae
    bg: '#010206', // Absolute Ocean Dark
    cardBg: '#050a17', // Sunk Sunken Shipwreck
  },
  {
    id: 'high-vis-tech',
    name: 'High-Vis Tech',
    primary: '#adff2f', // High-Vis Lime Green
    secondary: '#ff4500', // Warning Red-Orange
    accent: '#ffffff', // High Contrast White
    bg: '#080a0c', // Technical Dark Room
    cardBg: '#12161a', // Tactical Gear Case
  },
  {
    id: 'steel-armor',
    name: 'Steel Armor',
    primary: '#94a3b8', // Titanium Grey
    secondary: '#475569', // Iron Sentry Slate
    accent: '#f1f5f9', // Polished Metal White
    bg: '#0f1115', // Military Base Hangars
    cardBg: '#1b1e24', // Heavy Armored Panel
  },
  {
    id: 'eldritch-void',
    name: 'Eldritch Void',
    primary: '#a855f7', // Eldritch Eye Purple
    secondary: '#0d9488', // Deep Void Slime Green
    accent: '#db2777', // Maddening Magenta
    bg: '#04010a', // Unfathomable Abyss
    cardBg: '#0f081d', // Dark Rune Chamber
  },
  {
    id: 'sweet-peach',
    name: 'Sweet Peach',
    primary: '#f97316', // Coral Peach Glow
    secondary: '#db2777', // Sweet Cherry Jam
    accent: '#facc15', // Golden Syrup
    bg: '#0d0502', // Warm Summer Twilight
    cardBg: '#1c0e08', // Roasted Almond Bowl
  },
  {
    id: 'mint-fresh',
    name: 'Mint Fresh',
    primary: '#2dd4bf', // Peppermint Green
    secondary: '#0f766e', // Cool Pine Teal
    accent: '#f8fafc', // Glacier Mint White
    bg: '#020a0a', // Frozen Ice Cavern
    cardBg: '#091a1a', // Arctic Refresh Cabin
  }
];

export const getThemeVariables = (
  activeThemeId: string = 'cyberpunk-neon',
  customOverride?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    bg?: string;
    cardBg?: string;
  }
) => {
  // Find the base preset
  const preset = THEME_PRESETS.find(t => t.id === activeThemeId) || THEME_PRESETS[0];

  // Merge with any custom properties
  const primary = customOverride?.primary || preset.primary;
  const secondary = customOverride?.secondary || preset.secondary;
  const accent = customOverride?.accent || preset.accent;
  const bg = customOverride?.bg || preset.bg;
  const cardBg = customOverride?.cardBg || preset.cardBg;

  // Let's create CSS custom property variables block
  return {
    '--theme-primary': primary,
    '--theme-secondary': secondary,
    '--theme-accent': accent,
    '--theme-bg': bg,
    '--theme-card-bg': cardBg,
    // Add translucent shadows and border configurations
    '--theme-primary-rgb': hexToRgb(primary),
    '--theme-secondary-rgb': hexToRgb(secondary),
    '--theme-bg-rgb': hexToRgb(bg),
    '--theme-card-bg-rgb': hexToRgb(cardBg),
  } as Record<string, string>;
};

// Helper to convert hex strings to rgb values for translucent rgba declarations
function hexToRgb(hex: string): string {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `${r}, ${g}, ${b}`;
  } else if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }
  return '99, 102, 241'; // Fallback Indigo RGB
}
