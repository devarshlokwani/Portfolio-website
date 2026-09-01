import type { IconType } from 'react-icons'
import {
  SiExpress,
  SiFigma,
  SiGit,
  SiGreensock,
  SiJupyter,
  SiLit,
  SiMongodb,
  SiMysql,
  SiNodedotjs,
  SiNumpy,
  SiPandas,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiVite,
} from 'react-icons/si'
import { TbApi, TbSql } from 'react-icons/tb'

interface TechIconEntry {
  icon: IconType
  color: string
}

// Keyed by the exact display strings used in the stack/skills arrays across
// experience.json and projects.json — not every entry there names an actual
// tool (a job's "skills" list mixes in things like "Content Strategy"), so
// this only covers ones with a real brand mark; TechTag falls back to a
// plain label for anything not listed here.
export const TECH_ICONS: Record<string, TechIconEntry> = {
  TypeScript: { icon: SiTypescript, color: '#3178C6' },
  'Node.js': { icon: SiNodedotjs, color: '#5FA04E' },
  Express: { icon: SiExpress, color: 'var(--color-fg)' },
  MongoDB: { icon: SiMongodb, color: '#47A248' },
  Lit: { icon: SiLit, color: '#324FFF' },
  Vite: { icon: SiVite, color: '#646CFF' },
  React: { icon: SiReact, color: '#61DAFB' },
  'React Native': { icon: SiReact, color: '#61DAFB' },
  'Tailwind CSS': { icon: SiTailwindcss, color: '#38BDF8' },
  GSAP: { icon: SiGreensock, color: '#88CE02' },
  MySQL: { icon: SiMysql, color: '#4479A1' },
  SQL: { icon: TbSql, color: '#4479A1' },
  Python: { icon: SiPython, color: '#3776AB' },
  Pandas: { icon: SiPandas, color: '#150458' },
  NumPy: { icon: SiNumpy, color: '#4DABCF' },
  Jupyter: { icon: SiJupyter, color: '#F37626' },
  Figma: { icon: SiFigma, color: '#F24E1E' },
  Git: { icon: SiGit, color: '#F05032' },
  'REST APIs': { icon: TbApi, color: 'var(--color-fg-muted)' },
}
