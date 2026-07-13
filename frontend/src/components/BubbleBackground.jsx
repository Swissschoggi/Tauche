import { useEffect, useRef } from "react"

export default function BubbleBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    let animId

    const bubbles = Array.from({ length: 40 }, () => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + Math.random() * 200,
      r: 2 + Math.random() * 8,
      speed: 0.15 + Math.random() * 0.45,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.005 + Math.random() * 0.015,
      wobbleAmp: 0.3 + Math.random() * 0.7,
      alpha: 0.15 + Math.random() * 0.3,
    }))

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const b of bubbles) {
        b.y -= b.speed
        b.wobble += b.wobbleSpeed
        b.x += Math.sin(b.wobble) * b.wobbleAmp

        if (b.y + b.r < 0) {
          b.y = canvas.height + b.r
          b.x = Math.random() * canvas.width
        }

        const gradient = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r)
        gradient.addColorStop(0, `rgba(56, 189, 248, ${b.alpha})`)
        gradient.addColorStop(0.6, `rgba(56, 189, 248, ${b.alpha * 0.4})`)
        gradient.addColorStop(1, `rgba(56, 189, 248, 0)`)

        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        ctx.beginPath()
        ctx.arc(b.x - b.r * 0.25, b.y - b.r * 0.25, b.r * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 0.3})`
        ctx.fill()
      }

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  )
}
