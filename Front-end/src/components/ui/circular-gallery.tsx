"use client"

import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react"

export type BrandItem = {
  id: string | number
  name: string
  logoSrc: string | null
}

type CircularGalleryProps = {
  items: BrandItem[]
  /** Diameter of the 3D circle in px */
  circleSize?: number
  /** Width of each item card */
  itemWidth?: number
  /** Height of each item card */
  itemHeight?: number
  /** Auto-rotate speed in degrees per frame (~60fps). 0 = disabled */
  autoRotateSpeed?: number
  /** Pause auto-rotate on hover */
  pauseOnHover?: boolean
  /** Additional className on the outer wrapper */
  className?: string
  /** Render function for each item (defaults to image + name) */
  renderItem?: (item: BrandItem, ctx: { active: boolean; angle: number }) => React.ReactNode
}

export type CircularGalleryHandle = {
  rotateTo: (angle: number) => void
  rotateBy: (delta: number) => void
}

export const CircularGallery = forwardRef<CircularGalleryHandle, CircularGalleryProps>(
  function CircularGallery(
    {
      items,
      circleSize = 600,
      itemWidth = 140,
      itemHeight = 160,
      autoRotateSpeed = 0.15,
      pauseOnHover = true,
      className = "",
      renderItem,
    },
    ref,
  ) {
  const [angle, setAngle] = useState(0)
  const [hovered, setHovered] = useState(false)
  const rafRef = useRef<number | null>(null)
  const angleRef = useRef(0)
  const [dims, setDims] = useState({ circleSize, itemWidth, itemHeight })

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w < 640) {
        setDims({ circleSize: Math.min(circleSize, 360), itemWidth: Math.min(itemWidth, 100), itemHeight: Math.min(itemHeight, 120) })
      } else if (w < 1024) {
        setDims({ circleSize: Math.min(circleSize, 600), itemWidth: Math.min(itemWidth, 130), itemHeight: Math.min(itemHeight, 150) })
      } else {
        setDims({ circleSize, itemWidth, itemHeight })
      }
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [circleSize, itemWidth, itemHeight])

  const count = items.length
  const angleStep = count > 0 ? 360 / count : 0
  const radius = dims.circleSize / 2

    useImperativeHandle(ref, () => ({
      rotateTo: (target: number) => {
        angleRef.current = target
        setAngle(target)
      },
      rotateBy: (delta: number) => {
        angleRef.current += delta
        setAngle(angleRef.current)
      },
    }))

    const tickRef = useRef<() => void>(() => {})

    useEffect(() => {
      tickRef.current = () => {
        if (autoRotateSpeed !== 0) {
          angleRef.current -= autoRotateSpeed
          setAngle(angleRef.current)
        }
        rafRef.current = requestAnimationFrame(tickRef.current)
      }
    }, [autoRotateSpeed])

    useEffect(() => {
      if (autoRotateSpeed === 0) return
      if (pauseOnHover && hovered) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        return
      }
      rafRef.current = requestAnimationFrame(tickRef.current)
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
      }
    }, [hovered, pauseOnHover, autoRotateSpeed])

    const handleWheel = useCallback(
      (e: React.WheelEvent) => {
        if (Math.abs(e.deltaY) > 10) {
          angleRef.current += e.deltaY * 0.05
          setAngle(angleRef.current)
        }
      },
      [],
    )

    const handlePointerDown = useRef({ x: 0, dragging: false })

    const onPointerDown = useCallback((e: React.PointerEvent) => {
      handlePointerDown.current = { x: e.clientX, dragging: true }
    }, [])

    const onPointerMove = useCallback((e: React.PointerEvent) => {
      if (!handlePointerDown.current.dragging) return
      const dx = e.clientX - handlePointerDown.current.x
      handlePointerDown.current.x = e.clientX
      angleRef.current += dx * 0.3
      setAngle(angleRef.current)
    }, [])

    const onPointerUp = useCallback(() => {
      handlePointerDown.current.dragging = false
    }, [])

    return (
      <div
        className={`relative select-none ${className}`}
        style={{ perspective: "1200px", width: dims.circleSize, height: dims.itemHeight + 40 }}
        onWheel={handleWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${angle}deg)`,
          }}
        >
          {items.map((item, i) => {
            const itemAngle = i * angleStep
            const normalizedAngle = ((itemAngle + angle) % 360 + 360) % 360
            const frontDist = Math.abs(normalizedAngle > 180 ? 360 - normalizedAngle : normalizedAngle)
            const opacity = frontDist < 90 ? 1 : frontDist < 130 ? 0.5 : 0.15
            const scale = frontDist < 90 ? 1 : frontDist < 130 ? 0.88 : 0.75
            const isActive = frontDist < 90 / count + 10

            return (
              <div
                key={item.id}
                className="absolute flex flex-col items-center justify-center"
                style={{
                  width: dims.itemWidth,
                  height: dims.itemHeight,
                  left: "50%",
                  top: "50%",
                  marginLeft: -dims.itemWidth / 2,
                  marginTop: -dims.itemHeight / 2,
                  transformStyle: "preserve-3d",
                  transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                  opacity,
                  transition: "opacity 0.4s ease, transform 0.4s ease",
                }}
              >
                {renderItem ? (
                  renderItem(item, { active: isActive, angle: itemAngle })
                ) : (
                  <DefaultBrandCard item={item} active={isActive} scale={scale} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  },
)

function DefaultBrandCard({
  item,
  active,
  scale,
}: {
  item: BrandItem
  active: boolean
  scale: number
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 transition-transform duration-300"
      style={{ transform: `scale(${scale})` }}
    >
      {item.logoSrc ? (
        <div className="w-24 h-24 rounded-2xl bg-white/5 dark:bg-white/[0.03] border border-white/10 flex items-center justify-center p-3 backdrop-blur-sm">
          <img
            src={item.logoSrc}
            alt={item.name}
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>
      ) : (
        <div className="w-24 h-24 rounded-2xl bg-[#395886]/10 dark:bg-[#395886]/20 border border-[#395886]/20 flex items-center justify-center">
          <span className="text-3xl font-black text-[#395886] dark:text-[#D5DEEF]">
            {item.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <span
        className={`text-sm font-bold text-center transition-colors duration-300 ${
          active
            ? "text-[#F39C12]"
            : "text-[#395886] dark:text-[#D5DEEF]/70"
        }`}
      >
        {item.name}
      </span>
    </div>
  )
}
