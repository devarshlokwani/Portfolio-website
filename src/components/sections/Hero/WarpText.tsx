import { useEffect, useRef } from 'react'
import { Mesh, type OGLRenderingContext, Program, Renderer, Texture, Triangle } from 'ogl'

const vertex = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragment = `#version 300 es
precision highp float;

uniform sampler2D uTextTexture;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uTime;
uniform float uWarpStrength;
uniform float uWarpScale;
uniform float uSpeed;
uniform float uPointerInfluence;
uniform float uPointerStrength;
uniform float uRefraction;
uniform float uRipple;
uniform float uMotion;

in vec2 vUv;
out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p *= 2.02;
    amplitude *= 0.5;
  }
  return value;
}

vec4 sampleText(vec2 uv) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    return vec4(0.0);
  }
  return texture(uTextTexture, uv);
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float time = uTime * uSpeed;
  float scale = max(uWarpScale, 0.001);

  vec2 drift = vec2(time * 0.055, -time * 0.045);
  float n1 = fbm(uv * scale * 3.1 + drift);
  float n2 = fbm((uv + 19.17) * scale * 3.4 - drift.yx);
  vec2 ambient = (vec2(n1, n2) - 0.5) * uWarpStrength * 0.045 * uMotion;

  vec2 pointerDelta = uv - uPointer;
  vec2 aspectDelta = vec2(pointerDelta.x * aspect, pointerDelta.y);
  float dist = length(aspectDelta);
  float radius = max(uPointerInfluence, 0.001);
  float t = clamp(dist / radius, 0.0, 1.0);
  float lens = smoothstep(radius, 0.0, dist) * uPointerActive;
  float bulge = t * (1.0 - t) * (1.0 - t) * 6.75 * uPointerActive;
  vec2 dir = dist > 0.0001 ? vec2(aspectDelta.x / aspect, aspectDelta.y) / dist : vec2(0.0);

  float rippleWave = sin(dist * 28.0 - time * 4.2) * 0.5 + 0.5;
  float rippleRing = (rippleWave - 0.5) * uRipple;
  vec2 pointerWarp = -dir * bulge * uPointerStrength * 0.045;
  pointerWarp += dir * rippleRing * bulge * uPointerStrength * 0.016;

  vec2 displaced = uv + ambient + pointerWarp;
  vec2 splitDir = ambient + pointerWarp;
  float splitLen = length(splitDir);
  splitDir = splitLen > 0.00001 ? splitDir / splitLen : vec2(0.7071, 0.7071);
  vec2 split = splitDir * uRefraction * 0.16 * (0.35 + lens * 1.65);

  vec4 base = sampleText(displaced);
  float r = sampleText(displaced + split).r;
  float g = base.g;
  float b = sampleText(displaced - split).b;
  float a = max(max(sampleText(displaced + split).a, base.a), sampleText(displaced - split).a);

  vec3 color = vec3(r, g, b) + lens * base.a * 0.055;
  fragColor = vec4(color, a);
}
`

export interface GlyphTransition {
  /** character index within `text` (single-line only) */
  index: number
  /** 0 = old glyph still fully in place, 1 = fully replaced by the incoming one */
  progress: number
}

interface WarpTextProps {
  text: string
  color?: string
  warpStrength?: number
  warpScale?: number
  speed?: number
  pointerInfluence?: number
  pointerStrength?: number
  refraction?: number
  ripple?: boolean
  fontSize?: string | number
  fontWeight?: number
  fontFamily?: string
  letterSpacing?: string | number
  lineHeight?: number
  className?: string
  /** Accessible name, in case `text` is mid-animation (e.g. a scramble reveal) and doesn't match the final word. Defaults to `text`. */
  ariaLabel?: string
  /** Characters mid-"reload": each one's old glyph slides out to the left while a fresh copy slides in from the right, clipped to that character's own cell — a kinetic idle tic, not a content change (`text` stays the settled word throughout). */
  glyphTransitions?: GlyphTransition[] | null
}

interface TextCanvasProps {
  text: string
  color: string
  fontSize: string | number
  fontWeight: number
  fontFamily: string
  letterSpacing: string | number
  lineHeight: number
  glyphTransitions?: GlyphTransition[] | null
}

const getFontValue = (value: string | number) => (typeof value === 'number' ? `${value}px` : value)

const measureLine = (ctx: CanvasRenderingContext2D, line: string, letterSpacing: number) => {
  const chars = Array.from(line)
  const textWidth = chars.reduce((width, char) => width + ctx.measureText(char).width, 0)
  return textWidth + Math.max(0, chars.length - 1) * letterSpacing
}

const drawLine = (
  ctx: CanvasRenderingContext2D,
  line: string,
  x: number,
  y: number,
  letterSpacing: number,
  fontSizePx: number,
  glyphTransitions?: GlyphTransition[] | null,
) => {
  const chars = Array.from(line)
  let cursor = x - measureLine(ctx, line, letterSpacing) / 2

  chars.forEach((char, index) => {
    const charWidth = ctx.measureText(char).width
    const transition = glyphTransitions?.find((t) => t.index === index)

    if (transition) {
      const p = Math.min(Math.max(transition.progress, 0), 1)
      const slide = charWidth
      const alpha = ctx.globalAlpha
      // clip to this character's own cell (plus half the surrounding gap) so
      // the sliding glyph wipes out/in within its own slot instead of
      // smearing across the neighboring letter
      const pad = letterSpacing / 2
      ctx.save()
      ctx.beginPath()
      ctx.rect(cursor - pad, y - fontSizePx * 1.2, charWidth + pad * 2, fontSizePx * 2.4)
      ctx.clip()

      // outgoing glyph slides left and fades out
      ctx.globalAlpha = alpha * (1 - p)
      ctx.fillText(char, cursor - p * slide, y)

      // incoming glyph (same character) slides in from the right and fades in
      ctx.globalAlpha = alpha * p
      ctx.fillText(char, cursor + (1 - p) * slide, y)

      ctx.globalAlpha = alpha
      ctx.restore()
    } else {
      ctx.fillText(char, cursor, y)
    }

    cursor += charWidth + (index === chars.length - 1 ? 0 : letterSpacing)
  })
}

const buildTextCanvas = ({
  container,
  width,
  height,
  dpr,
  props,
}: {
  container: HTMLElement
  width: number
  height: number
  dpr: number
  props: TextCanvasProps
}) => {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.floor(width * dpr))
  canvas.height = Math.max(1, Math.floor(height * dpr))

  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  const probe = document.createElement('span')
  probe.textContent = props.text
  Object.assign(probe.style, {
    position: 'absolute',
    visibility: 'hidden',
    pointerEvents: 'none',
    whiteSpace: 'pre',
    inset: '0 auto auto 0',
    fontFamily: props.fontFamily,
    fontSize: getFontValue(props.fontSize),
    fontWeight: String(props.fontWeight),
    letterSpacing: getFontValue(props.letterSpacing),
    lineHeight: String(props.lineHeight),
  })
  container.appendChild(probe)
  const computed = window.getComputedStyle(probe)
  let fontSizePx = parseFloat(computed.fontSize) || 96
  const fontFamily = computed.fontFamily || 'sans-serif'
  const fontWeight = computed.fontWeight || String(props.fontWeight)
  let letterSpacing = computed.letterSpacing === 'normal' ? 0 : parseFloat(computed.letterSpacing) || 0
  let lineHeight = parseFloat(computed.lineHeight)
  if (!Number.isFinite(lineHeight)) {
    lineHeight = fontSizePx * props.lineHeight
  }
  probe.remove()

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = props.color
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  const lines = String(props.text || '').split('\n')
  const applyFont = () => {
    ctx.font = `${fontWeight} ${fontSizePx}px ${fontFamily}`
  }
  applyFont()

  const maxWidth = width * 0.9
  const maxHeight = height * 0.86
  const widest = Math.max(...lines.map((line) => measureLine(ctx, line, letterSpacing)), 1)
  const blockHeight = Math.max(lineHeight * lines.length, 1)
  const fit = Math.min(1, maxWidth / widest, maxHeight / blockHeight)

  if (fit < 1) {
    fontSizePx *= fit
    letterSpacing *= fit
    lineHeight *= fit
    applyFont()
  }

  const startY = height / 2 - (lineHeight * (lines.length - 1)) / 2
  lines.forEach((line, index) =>
    drawLine(
      ctx,
      line,
      width / 2,
      startY + index * lineHeight,
      letterSpacing,
      fontSizePx,
      index === 0 ? props.glyphTransitions : null,
    ),
  )

  return canvas
}

/**
 * Ported from React Bits' Warp Text (reactbits.dev) — text is rasterized to
 * a canvas texture, then a WebGL fragment shader fbm-warps it continuously
 * and splits the RGB channels near the pointer for a bending, chromatic-
 * aberration "bulge" effect. The text auto-fits to the container, so a
 * large container yields large text — this is what gives the hero name its
 * scale, not a fixed font size.
 *
 * The render loop deliberately doesn't start until the first rasterize()
 * has actually resolved (see `firstRasterDone` below) — rasterize awaits
 * document.fonts.ready before drawing, and starting the loop immediately on
 * mount used to render the mesh with its texture uniform still at ogl's
 * default (an opaque white 1x1 pixel) for however many frames that wait
 * took, which is what produced this component's earlier "white strip" bug.
 * That's no longer just latent — every current usage only ever mounts this
 * behind an already-opaque cover — but there's no reason to leave the
 * window open regardless.
 */
export function WarpText({
  text,
  color = '#f4f3ef',
  warpStrength = 0.01,
  warpScale = 0.1,
  speed = 1.35,
  pointerInfluence = 0.68,
  pointerStrength = 0.85,
  refraction = 0.045,
  ripple = true,
  fontSize = '20vw',
  fontWeight = 800,
  fontFamily = 'Space Grotesk, sans-serif',
  letterSpacing = '-0.06em',
  lineHeight = 0.9,
  className = '',
  ariaLabel,
  glyphTransitions = null,
}: WarpTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const propsRef = useRef({
    text,
    color,
    fontSize,
    fontWeight,
    fontFamily,
    letterSpacing,
    lineHeight,
    warpStrength,
    warpScale,
    speed,
    pointerInfluence,
    pointerStrength,
    refraction,
    ripple,
    glyphTransitions,
  })
  const contextRef = useRef<{ program: Program; rasterize: () => void } | null>(null)

  useEffect(() => {
    propsRef.current = {
      text,
      color,
      fontSize,
      fontWeight,
      fontFamily,
      letterSpacing,
      lineHeight,
      warpStrength,
      warpScale,
      speed,
      pointerInfluence,
      pointerStrength,
      refraction,
      ripple,
      glyphTransitions,
    }

    if (contextRef.current) {
      const { program, rasterize } = contextRef.current
      program.uniforms.uWarpStrength.value = warpStrength
      program.uniforms.uWarpScale.value = warpScale
      program.uniforms.uSpeed.value = speed
      program.uniforms.uPointerInfluence.value = pointerInfluence
      program.uniforms.uPointerStrength.value = pointerStrength
      program.uniforms.uRefraction.value = refraction
      program.uniforms.uRipple.value = ripple ? 1 : 0
      rasterize()
    }
  }, [
    text,
    color,
    fontSize,
    fontWeight,
    fontFamily,
    letterSpacing,
    lineHeight,
    warpStrength,
    warpScale,
    speed,
    pointerInfluence,
    pointerStrength,
    refraction,
    ripple,
    glyphTransitions,
  ])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    let renderer: Renderer
    let gl: OGLRenderingContext
    let program: Program
    let mesh: Mesh
    let texture: Texture
    let raf = 0
    let disposed = false
    let contextLost = false
    let visible = true
    let pageVisible = !document.hidden
    let reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    let rasterVersion = 0
    let firstRasterDone = false

    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: 0, activeTarget: 0 }
    const startTime = performance.now()

    try {
      renderer = new Renderer({
        webgl: 2,
        alpha: true,
        premultipliedAlpha: false,
        antialias: true,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      })
      gl = renderer.gl
    } catch (error) {
      console.warn('WarpText: WebGL could not be initialized.', error)
      return undefined
    }

    gl.clearColor(0, 0, 0, 0)
    const canvas = gl.canvas as HTMLCanvasElement
    canvas.style.position = 'absolute'
    canvas.style.inset = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    canvas.setAttribute('aria-hidden', 'true')
    container.appendChild(canvas)

    texture = new Texture(gl, {
      generateMipmaps: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE,
    })

    const geometry = new Triangle(gl)
    program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTextTexture: { value: texture },
        uResolution: { value: new Float32Array([1, 1]) },
        uPointer: { value: new Float32Array([0.5, 0.5]) },
        uPointerActive: { value: 0 },
        uTime: { value: 0 },
        uWarpStrength: { value: propsRef.current.warpStrength },
        uWarpScale: { value: propsRef.current.warpScale },
        uSpeed: { value: propsRef.current.speed },
        uPointerInfluence: { value: propsRef.current.pointerInfluence },
        uPointerStrength: { value: propsRef.current.pointerStrength },
        uRefraction: { value: propsRef.current.refraction },
        uRipple: { value: propsRef.current.ripple ? 1 : 0 },
        uMotion: { value: reduceMotion ? 0 : 1 },
      },
    })
    mesh = new Mesh(gl, { geometry, program })

    const renderOnce = () => {
      if (disposed || contextLost) return
      renderer.render({ scene: mesh })
    }

    // Only starts the loop once the mesh actually has real text data —
    // called both after a successful first rasterize and from the
    // visibility/intersection handlers, in case either fires first.
    const maybeStartLoop = () => {
      if (raf || disposed || contextLost) return
      if (!firstRasterDone || !visible || !pageVisible) return
      raf = requestAnimationFrame(loop)
    }

    const rasterize = async () => {
      const version = ++rasterVersion
      if (document.fonts?.ready) {
        try {
          await document.fonts.ready
        } catch {
          /* ignore */
        }
      }
      if (disposed || contextLost || version !== rasterVersion) return

      const rect = container.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const textCanvas = buildTextCanvas({
        container,
        width: rect.width,
        height: rect.height,
        dpr,
        props: propsRef.current,
      })
      texture.image = textCanvas
      texture.needsUpdate = true
      firstRasterDone = true
      renderOnce()
      maybeStartLoop()
    }

    const resize = () => {
      if (disposed || contextLost) return
      const rect = container.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return

      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2)
      renderer.setSize(rect.width, rect.height)
      program.uniforms.uResolution.value[0] = gl.drawingBufferWidth
      program.uniforms.uResolution.value[1] = gl.drawingBufferHeight
      rasterize()
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const rect = canvas.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return
      pointer.tx = (event.clientX - rect.left) / rect.width
      pointer.ty = 1 - (event.clientY - rect.top) / rect.height
      pointer.activeTarget = 1
    }

    const onPointerLeave = () => {
      pointer.activeTarget = 0
    }

    const onContextLost = (event: Event) => {
      event.preventDefault()
      contextLost = true
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }

    const onVisibility = () => {
      pageVisible = !document.hidden
      maybeStartLoop()
      if (!pageVisible && raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }

    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const onReducedMotion = (event: MediaQueryListEvent) => {
      reduceMotion = event.matches
      program.uniforms.uMotion.value = reduceMotion ? 0 : 1
      renderOnce()
    }

    const loop = (now: number) => {
      if (disposed || contextLost) return

      const elapsed = (now - startTime) * 0.001
      const idleX = 0.5 + Math.sin(elapsed * 0.33) * 0.12
      const idleY = 0.5 + Math.cos(elapsed * 0.27) * 0.1
      const targetX = pointer.activeTarget > 0 ? pointer.tx : idleX
      const targetY = pointer.activeTarget > 0 ? pointer.ty : idleY
      const damping = pointer.activeTarget > 0 ? 0.12 : 0.035

      pointer.x += (targetX - pointer.x) * damping
      pointer.y += (targetY - pointer.y) * damping
      pointer.active += ((pointer.activeTarget > 0 ? 1 : 0.18) - pointer.active) * 0.06

      program.uniforms.uPointer.value[0] = pointer.x
      program.uniforms.uPointer.value[1] = pointer.y
      program.uniforms.uPointerActive.value = reduceMotion ? pointer.active * 0.35 : pointer.active
      program.uniforms.uTime.value = reduceMotion ? 0 : elapsed

      renderOnce()
      raf = requestAnimationFrame(loop)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        maybeStartLoop()
        if (!visible && raf) {
          cancelAnimationFrame(raf)
          raf = 0
        }
      },
      { threshold: 0 },
    )
    intersectionObserver.observe(container)

    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerleave', onPointerLeave)
    canvas.addEventListener('webglcontextlost', onContextLost, false)
    document.addEventListener('visibilitychange', onVisibility)
    mediaQuery?.addEventListener('change', onReducedMotion)

    contextRef.current = { program, rasterize }
    resize()

    return () => {
      disposed = true
      contextRef.current = null
      if (raf) cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      document.removeEventListener('visibilitychange', onVisibility)
      mediaQuery?.removeEventListener('change', onReducedMotion)

      if (!contextLost) {
        try {
          if (texture.texture) gl.deleteTexture(texture.texture)
          gl.getExtension('WEBGL_lose_context')?.loseContext()
        } catch {
          /* ignore */
        }
      }

      if (canvas.parentNode === container) container.removeChild(canvas)
    }
  }, [])

  return (
    <div ref={containerRef} className={`warp-text ${className}`.trim()} role="img" aria-label={ariaLabel ?? text} />
  )
}
