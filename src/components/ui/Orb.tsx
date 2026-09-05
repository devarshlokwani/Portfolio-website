import { Mesh, Program, Renderer, Triangle, Vec3 } from 'ogl'
import { useEffect, useRef } from 'react'

import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useTheme } from '@/hooks/useTheme'

/**
 * Adapted from React Bits' `Orb` background (MIT, https://reactbits.dev),
 * which builds it on `ogl`, already a dependency here for the hero's
 * WarpText, so this costs no new package.
 *
 * Changes from the original: typed, hue defaulted to the site's accent, the
 * background colour resolved from the live theme token rather than a fixed
 * hex, reduced-motion support, and most significantly, rendering is
 * suspended while the orb is off-screen. The original runs its rAF loop for
 * the life of the page; this orb sits at the foot of *every* route, so left
 * alone it would drive the GPU continuously the entire time someone is on
 * the site.
 */

const vert = /* glsl */ `
  precision highp float;
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const frag = /* glsl */ `
  precision highp float;

  uniform float iTime;
  uniform vec3 iResolution;
  uniform float hue;
  uniform float hover;
  uniform float rot;
  uniform float hoverIntensity;
  uniform vec3 backgroundColor;
  varying vec2 vUv;

  vec3 rgb2yiq(vec3 c) {
    float y = dot(c, vec3(0.299, 0.587, 0.114));
    float i = dot(c, vec3(0.596, -0.274, -0.322));
    float q = dot(c, vec3(0.211, -0.523, 0.312));
    return vec3(y, i, q);
  }

  vec3 yiq2rgb(vec3 c) {
    float r = c.x + 0.956 * c.y + 0.621 * c.z;
    float g = c.x - 0.272 * c.y - 0.647 * c.z;
    float b = c.x - 1.106 * c.y + 1.703 * c.z;
    return vec3(r, g, b);
  }

  vec3 adjustHue(vec3 color, float hueDeg) {
    float hueRad = hueDeg * 3.14159265 / 180.0;
    vec3 yiq = rgb2yiq(color);
    float cosA = cos(hueRad);
    float sinA = sin(hueRad);
    float i = yiq.y * cosA - yiq.z * sinA;
    float q = yiq.y * sinA + yiq.z * cosA;
    yiq.y = i;
    yiq.z = q;
    return yiq2rgb(yiq);
  }

  vec3 hash33(vec3 p3) {
    p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
    p3 += dot(p3, p3.yxz + 19.19);
    return -1.0 + 2.0 * fract(vec3(
      p3.x + p3.y,
      p3.x + p3.z,
      p3.y + p3.z
    ) * p3.zyx);
  }

  float snoise3(vec3 p) {
    const float K1 = 0.333333333;
    const float K2 = 0.166666667;
    vec3 i = floor(p + (p.x + p.y + p.z) * K1);
    vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
    vec3 e = step(vec3(0.0), d0 - d0.yzx);
    vec3 i1 = e * (1.0 - e.zxy);
    vec3 i2 = 1.0 - e.zxy * (1.0 - e);
    vec3 d1 = d0 - (i1 - K2);
    vec3 d2 = d0 - (i2 - K1);
    vec3 d3 = d0 - 0.5;
    vec4 h = max(0.6 - vec4(
      dot(d0, d0),
      dot(d1, d1),
      dot(d2, d2),
      dot(d3, d3)
    ), 0.0);
    vec4 n = h * h * h * h * vec4(
      dot(d0, hash33(i)),
      dot(d1, hash33(i + i1)),
      dot(d2, hash33(i + i2)),
      dot(d3, hash33(i + 1.0))
    );
    return dot(vec4(31.316), n);
  }

  vec4 extractAlpha(vec3 colorIn) {
    float a = max(max(colorIn.r, colorIn.g), colorIn.b);
    return vec4(colorIn.rgb / (a + 1e-5), a);
  }

  // The original's violet/cyan/indigo, replaced with the site's own ember
  // range. Rotating hue off a violet base to reach orange is guesswork.
  // YIQ rotation isn't a true hue shift, and a first attempt at it landed on
  // green. Naming the three colours outright is exact and readable.
  const vec3 baseColor1 = vec3(1.000000, 0.352941, 0.235294);
  const vec3 baseColor2 = vec3(1.000000, 0.698039, 0.478431);
  const vec3 baseColor3 = vec3(0.290196, 0.070588, 0.023529);
  const float innerRadius = 0.6;
  const float noiseScale = 0.65;

  float light1(float intensity, float attenuation, float dist) {
    return intensity / (1.0 + dist * attenuation);
  }
  float light2(float intensity, float attenuation, float dist) {
    return intensity / (1.0 + dist * dist * attenuation);
  }

  vec4 draw(vec2 uv) {
    vec3 color1 = adjustHue(baseColor1, hue);
    vec3 color2 = adjustHue(baseColor2, hue);
    vec3 color3 = adjustHue(baseColor3, hue);

    float ang = atan(uv.y, uv.x);
    float len = length(uv);
    float invLen = len > 0.0 ? 1.0 / len : 0.0;

    float bgLuminance = dot(backgroundColor, vec3(0.299, 0.587, 0.114));

    float n0 = snoise3(vec3(uv * noiseScale, iTime * 0.5)) * 0.5 + 0.5;
    float r0 = mix(mix(innerRadius, 1.0, 0.4), mix(innerRadius, 1.0, 0.6), n0);
    float d0 = distance(uv, (r0 * invLen) * uv);
    float v0 = light1(1.0, 10.0, d0);

    v0 *= smoothstep(r0 * 1.05, r0, len);
    float innerFade = smoothstep(r0 * 0.8, r0 * 0.95, len);
    v0 *= mix(innerFade, 1.0, bgLuminance * 0.7);
    float cl = cos(ang + iTime * 2.0) * 0.5 + 0.5;

    float a = iTime * -1.0;
    vec2 pos = vec2(cos(a), sin(a)) * r0;
    float d = distance(uv, pos);
    float v1 = light2(1.5, 5.0, d);
    v1 *= light1(1.0, 50.0, d0);

    float v2 = smoothstep(1.0, mix(innerRadius, 1.0, n0 * 0.5), len);
    float v3 = smoothstep(innerRadius, mix(innerRadius, 1.0, 0.5), len);

    vec3 colBase = mix(color1, color2, cl);
    float fadeAmount = mix(1.0, 0.1, bgLuminance);

    vec3 darkCol = mix(color3, colBase, v0);
    darkCol = (darkCol + v1) * v2 * v3;
    darkCol = clamp(darkCol, 0.0, 1.0);

    vec3 lightCol = (colBase + v1) * mix(1.0, v2 * v3, fadeAmount);
    lightCol = mix(backgroundColor, lightCol, v0);
    lightCol = clamp(lightCol, 0.0, 1.0);

    vec3 finalCol = mix(darkCol, lightCol, bgLuminance);

    return extractAlpha(finalCol);
  }

  vec4 mainImage(vec2 fragCoord) {
    vec2 center = iResolution.xy * 0.5;
    float size = min(iResolution.x, iResolution.y);
    vec2 uv = (fragCoord - center) / size * 2.0;

    float angle = rot;
    float s = sin(angle);
    float c = cos(angle);
    uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);

    uv.x += hover * hoverIntensity * 0.1 * sin(uv.y * 10.0 + iTime);
    uv.y += hover * hoverIntensity * 0.1 * sin(uv.x * 10.0 + iTime);

    return draw(uv);
  }

  void main() {
    vec2 fragCoord = vUv * iResolution.xy;
    vec4 col = mainImage(fragCoord);
    gl_FragColor = vec4(col.rgb * col.a, col.a);
  }
`

/** Parses whatever form a resolved CSS custom property comes back in. */
function cssColorToVec3(color: string) {
  const value = color.trim()

  if (value.startsWith('#')) {
    const hex =
      value.length === 4
        ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
        : value
    return new Vec3(
      parseInt(hex.slice(1, 3), 16) / 255,
      parseInt(hex.slice(3, 5), 16) / 255,
      parseInt(hex.slice(5, 7), 16) / 255,
    )
  }

  const rgb = value.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/)
  if (rgb) {
    return new Vec3(Number(rgb[1]) / 255, Number(rgb[2]) / 255, Number(rgb[3]) / 255)
  }

  return new Vec3(0, 0, 0)
}

interface OrbProps {
  /** Optional hue rotation off the base ember palette. 0 keeps it on-theme. */
  hue?: number
  hoverIntensity?: number
  rotateOnHover?: boolean
  className?: string
}

export function Orb({
  hue = 0,
  hoverIntensity = 0.35,
  rotateOnHover = true,
  className = '',
}: OrbProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const programRef = useRef<Program | null>(null)
  const reducedMotion = useReducedMotion()
  const { theme } = useTheme()

  // Uniforms are updated in place rather than being effect dependencies.
  // Rebuilding the GL context on every theme toggle or prop tweak means
  // tearing down and re-creating the renderer, browsers cap live WebGL
  // contexts and start dropping the oldest, which shows up as a dead canvas.
  useEffect(() => {
    const program = programRef.current
    if (!program) return
    program.uniforms.hue.value = hue
    program.uniforms.hoverIntensity.value = hoverIntensity
    program.uniforms.backgroundColor.value = cssColorToVec3(
      getComputedStyle(document.documentElement).getPropertyValue('--color-bg'),
    )
  }, [hue, hoverIntensity, theme])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    container.appendChild(gl.canvas)

    const bg = cssColorToVec3(
      getComputedStyle(document.documentElement).getPropertyValue('--color-bg'),
    )

    const program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Vec3(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height),
        },
        hue: { value: hue },
        hover: { value: 0 },
        rot: { value: 0 },
        hoverIntensity: { value: hoverIntensity },
        backgroundColor: { value: bg },
      },
    })
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })
    programRef.current = program

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = container.clientWidth
      const height = container.clientHeight
      renderer.setSize(width * dpr, height * dpr)
      gl.canvas.style.width = `${width}px`
      gl.canvas.style.height = `${height}px`
      program.uniforms.iResolution.value.set(
        gl.canvas.width,
        gl.canvas.height,
        gl.canvas.width / gl.canvas.height,
      )
    }
    window.addEventListener('resize', resize)
    resize()

    let targetHover = 0
    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const size = Math.min(rect.width, rect.height)
      const uvX = ((e.clientX - rect.left - rect.width / 2) / size) * 2
      const uvY = ((e.clientY - rect.top - rect.height / 2) / size) * 2
      targetHover = Math.hypot(uvX, uvY) < 0.8 ? 1 : 0
    }
    const onLeave = () => {
      targetHover = 0
    }
    container.addEventListener('mousemove', onMove)
    container.addEventListener('mouseleave', onLeave)

    // Reduced motion still gets an orb, just a still one, painted once.
    if (reducedMotion) {
      program.uniforms.iTime.value = 1.4
      renderer.render({ scene: mesh })
      return () => {
        window.removeEventListener('resize', resize)
        container.removeEventListener('mousemove', onMove)
        container.removeEventListener('mouseleave', onLeave)
        if (gl.canvas.parentNode === container) container.removeChild(gl.canvas)
        programRef.current = null
        gl.getExtension('WEBGL_lose_context')?.loseContext()
      }
    }

    let raf = 0
    let last = 0
    let rot = 0
    let running = false

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame)
      const dt = last ? (t - last) * 0.001 : 0
      last = t
      program.uniforms.iTime.value = t * 0.001
      program.uniforms.hover.value += (targetHover - program.uniforms.hover.value) * 0.1
      if (rotateOnHover && targetHover > 0.5) rot += dt * 0.3
      program.uniforms.rot.value = rot
      renderer.render({ scene: mesh })
    }

    const start = () => {
      if (running) return
      running = true
      last = 0
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      if (!running) return
      running = false
      cancelAnimationFrame(raf)
    }

    // Only render while it's actually on screen. This sits at the foot of
    // every route, so an always-on loop would cost the whole visit.
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: '120px' },
    )
    io.observe(container)

    return () => {
      stop()
      io.disconnect()
      window.removeEventListener('resize', resize)
      container.removeEventListener('mousemove', onMove)
      container.removeEventListener('mouseleave', onLeave)
      container.removeChild(gl.canvas)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
    // Deliberately only the two things that change what gets *built*. Colour
    // and hue are pushed into the live uniforms by the effect above instead.
  }, [rotateOnHover, reducedMotion])

  return <div ref={containerRef} aria-hidden="true" className={className} />
}
