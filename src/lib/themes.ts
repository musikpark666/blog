// Add a theme here and its color overrides in styles/global.css.
export const themes = [
  { id: 'light', label: 'ライト', description: 'いつもの白とネイビー' },
  { id: 'dark', label: 'ダーク', description: '落ち着いた濃紺' },
  { id: 'black', label: 'ブラック', description: '黒を基調に、明るさを控えめに' },
  { id: 'ink', label: 'インク', description: '紙と電子インクをイメージした白黒' },
  { id: 'sepia', label: 'セピア', description: '生成りの紙と深いグリーン' },
] as const;

export type Theme = typeof themes[number]['id'];

export function normalizeTheme(value: string | null | undefined): Theme {
  return themes.find((theme) => theme.id === value)?.id ?? 'light';
}
