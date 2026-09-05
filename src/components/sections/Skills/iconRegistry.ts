import { FaAws } from 'react-icons/fa6'
import {
  SiClaude,
  SiCss,
  SiDjango,
  SiExpress,
  SiFigma,
  SiGit,
  SiGithub,
  SiGreensock,
  SiHtml5,
  SiJavascript,
  SiJupyter,
  SiLangchain,
  SiMongodb,
  SiMysql,
  SiNodedotjs,
  SiNumpy,
  SiPandas,
  SiPostgresql,
  SiPython,
  SiReact,
  SiRender,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiVite,
} from 'react-icons/si'
import { TbSparkles, TbSql } from 'react-icons/tb'
import type { IconType } from 'react-icons'

// Explicit named imports (rather than `import *`) so bundlers can tree-shake
// the unused 99% of each icon set instead of pulling every brand icon in.
const ICONS: Record<string, IconType> = {
  SiJavascript,
  SiTypescript,
  SiPython,
  SiHtml5,
  SiCss,
  SiReact,
  SiNodedotjs,
  SiExpress,
  SiDjango,
  SiTailwindcss,
  SiGreensock,
  SiPandas,
  SiNumpy,
  SiMysql,
  SiPostgresql,
  SiMongodb,
  SiGit,
  SiGithub,
  SiVercel,
  SiRender,
  SiVite,
  SiFigma,
  SiClaude,
  SiJupyter,
  SiLangchain,
  TbSql,
  TbSparkles,
  FaAws,
}

export type IconSet = 'si' | 'tb' | 'fa6'

export function resolveIcon(_set: IconSet, name: string): IconType | null {
  return ICONS[name] ?? null
}
