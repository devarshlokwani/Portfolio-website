import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

// Only the plugins actually used across the site are registered here — GSAP's
// full toolkit (Draggable, MorphSVG, DrawSVG, MotionPath, etc.) is free to
// pull in later, but importing them unused only bloats the bundle for no gain.
gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, Flip)

// Lenis (not GSAP's own ticker) drives the frame loop — see useLenis. GSAP's
// ticker is repurposed to advance Lenis so scroll-linked tweens stay in sync.
gsap.ticker.lagSmoothing(0)

export { gsap, ScrollTrigger, SplitText, ScrambleTextPlugin, Flip }
