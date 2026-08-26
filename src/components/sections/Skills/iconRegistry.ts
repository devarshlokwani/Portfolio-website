import { FaAws } from 'react-icons/fa6'
import {
  SiAnthropic,
  SiCss,
  SiExpress,
  SiFigma,
  SiGit,
  SiGithub,
  SiGreensock,
  SiHtml5,
  SiJavascript,
  SiJupyter,
  SiMongodb,
  SiMysql,
  SiNodedotjs,
  SiNpm,
  SiNumpy,
  SiPandas,
  SiPython,
  SiReact,
  SiRender,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiVite,
} from 'react-icons/si'
import { TbApi, TbBrandVscode, TbChartHistogram, TbDatabase, TbRobot, TbSql } from 'react-icons/tb'
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
  SiTailwindcss,
  SiGreensock,
  SiPandas,
  SiNumpy,
  SiMysql,
  SiMongodb,
  SiGit,
  SiGithub,
  SiVercel,
  SiRender,
  SiVite,
  SiNpm,
  SiFigma,
  SiAnthropic,
  SiJupyter,
  TbSql,
  TbDatabase,
  TbApi,
  TbChartHistogram,
  TbRobot,
  TbBrandVscode,
  FaAws,
}

export type IconSet = 'si' | 'tb' | 'fa6'

export function resolveIcon(_set: IconSet, name: string): IconType | null {
  return ICONS[name] ?? null
}
