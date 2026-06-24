import { colors } from '../theme/colors'

// Maps item name/category keywords → { ionicon name, background color }
const ICON_MAP = [
  { keys: ['plastic', 'bottle', 'pet', 'water'],   icon: 'water',            bg: '#3A7DBF', fg: '#fff' },
  { keys: ['card', 'cardboard', 'box', 'paper'],   icon: 'document-text',    bg: '#A0774A', fg: '#fff' },
  { keys: ['alum', 'can', 'tin', 'metal', 'steel'], icon: 'hardware-chip',   bg: '#8A9BA8', fg: '#fff' },
  { keys: ['glass', 'jar', 'bottle'],               icon: 'wine',             bg: '#20B2AA', fg: '#fff' },
  { keys: ['electronic', 'phone', 'battery', 'e-waste'], icon: 'phone-portrait', bg: '#4169E1', fg: '#fff' },
  { keys: ['organic', 'food', 'compost'],           icon: 'leaf',             bg: '#3A8C3A', fg: '#fff' },
  { keys: ['textile', 'cloth', 'shirt', 'fabric'], icon: 'shirt',            bg: '#9370DB', fg: '#fff' },
  { keys: ['hazard', 'chemical', 'paint'],          icon: 'warning',          bg: colors.accent, fg: '#fff' },
]

const DEFAULT = { icon: 'cube-outline', bg: colors.primary, fg: '#fff' }

export function getItemIcon(label = '') {
  const lower = label.toLowerCase()
  for (const entry of ICON_MAP) {
    if (entry.keys.some((k) => lower.includes(k))) return entry
  }
  return DEFAULT
}
