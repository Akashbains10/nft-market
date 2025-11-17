'use client'

import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Get theme from document
    const isDark = document.documentElement.classList.contains('dark')
    
    // Subtle color palette matching design system
    const colors = isDark ? {
      bg: 'rgba(17, 24, 39, 0.02)',
      primary: 'rgba(82, 182, 214, 0.08)',
      accent: 'rgba(94, 200, 222, 0.06)',
      line: 'rgba(82, 182, 214, 0.04)'
    } : {
      bg: 'rgba(255, 255, 255, 0.02)',
      primary: 'rgba(66, 135, 165, 0.06)',
      accent: 'rgba(82, 182, 214, 0.05)',
      line: 'rgba(66, 135, 165, 0.03)'
    }

    // Particles for floating effect
    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      angle: number
      rotationSpeed: number
      life: number
    }

    const particles: Particle[] = []
    const particleCount = 40

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        life: Math.random() * 100
      })
    }

    // Draw floating circles (crypto icons representation)
    const drawParticles = () => {
      particles.forEach((p) => {
        // Update position
        p.x += p.vx
        p.y += p.vy
        p.angle += p.rotationSpeed
        p.life = (p.life + 1) % 200

        // Wrap around edges
        if (p.x < -20) p.x = canvas.width + 20
        if (p.x > canvas.width + 20) p.x = -20
        if (p.y < -20) p.y = canvas.height + 20
        if (p.y > canvas.height + 20) p.y = -20

        // Calculate opacity based on life cycle
        const opacity = Math.sin((p.life / 200) * Math.PI) * 0.3

        // Draw particle
        ctx.save()
        ctx.globalAlpha = opacity
        ctx.fillStyle = colors.primary
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        // Draw small line for blockchain aesthetic
        ctx.strokeStyle = colors.accent
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2)
        ctx.stroke()

        ctx.restore()
      })
    }

    // Draw gradient waves
    const drawWaves = () => {
      const time = Date.now() * 0.0002
      const amplitude = 15
      const frequency = 0.005
      const speed = 0.3

      ctx.strokeStyle = colors.line
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.3

      for (let waveIndex = 0; waveIndex < 4; waveIndex++) {
        ctx.beginPath()
        const offset = waveIndex * 80
        const yBase = canvas.height * 0.3 + offset

        for (let x = 0; x < canvas.width; x += 2) {
          const y = yBase + Math.sin((x * frequency) + time * speed + waveIndex) * amplitude
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
    }

    // Draw hexagonal grid (blockchain aesthetic)
    const drawBlockchainGrid = () => {
      const hexSize = 40
      const cols = Math.ceil(canvas.width / (hexSize * 1.5)) + 1
      const rows = Math.ceil(canvas.height / (hexSize * 1.7)) + 1

      ctx.strokeStyle = colors.line
      ctx.lineWidth = 0.5
      ctx.globalAlpha = 0.15

      const time = Date.now() * 0.00005

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * hexSize * 1.5
          const y = row * hexSize * 1.7 + (col % 2 ? hexSize * 0.85 : 0)

          // Draw hexagon with subtle animation
          const scale = 1 + Math.sin(time + row + col) * 0.05
          drawHexagon(x, y, hexSize * scale)
        }
      }
    }

    // Helper function to draw hexagon
    const drawHexagon = (x: number, y: number, size: number) => {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3
        const hx = x + size * Math.cos(angle)
        const hy = y + size * Math.sin(angle)
        if (i === 0) ctx.moveTo(hx, hy)
        else ctx.lineTo(hx, hy)
      }
      ctx.closePath()
      ctx.stroke()
    }

    // Animation loop
    const animate = () => {
      // Clear canvas with subtle background
      ctx.fillStyle = colors.bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw background elements
      ctx.globalAlpha = 1
      drawBlockchainGrid()
      drawWaves()
      drawParticles()

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10"
      style={{ opacity: 0.6 }}
    />
  )
}
// </parameter>
// </invoke>
// <invoke name="ReadFile">
// <parameter name="taskNameComplete">Read page.tsx for integration</parameter>
// <parameter name="filePath">app/page.tsx</parameter>
// <parameter name="taskNameActive">Reading page for updates
