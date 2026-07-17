"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, type PanInfo } from "framer-motion"
import { Users, Gauge, Fuel } from "lucide-react"

export type VerticalStackItem = {
  id: string | number
  title: string
  imageSrc: string
  href: string
  year?: number
  fuelType?: string
  pricePerDay?: number
  [key: string]: unknown
}

type VerticalImageStackProps = {
  items: VerticalStackItem[]
  cardWidth?: number
  cardHeight?: number
}

export function VerticalImageStack({ items, cardWidth = 320, cardHeight = 500 }: VerticalImageStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const lastNavigationTime = useRef(0)
  const navigationCooldown = 400

  const navigate = useCallback((newDirection: number) => {
    const now = Date.now()
    if (now - lastNavigationTime.current < navigationCooldown) return
    lastNavigationTime.current = now

    setCurrentIndex((prev) => {
      if (newDirection > 0) {
        return prev === items.length - 1 ? 0 : prev + 1
      }
      return prev === 0 ? items.length - 1 : prev - 1
    })
  }, [items.length])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50
    if (info.offset.y < -threshold) {
      navigate(1)
    } else if (info.offset.y > threshold) {
      navigate(-1)
    }
  }

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 30) {
        if (e.deltaY > 0) {
          navigate(1)
        } else {
          navigate(-1)
        }
      }
    },
    [navigate],
  )

  useEffect(() => {
    window.addEventListener("wheel", handleWheel, { passive: true })
    return () => window.removeEventListener("wheel", handleWheel)
  }, [handleWheel])

  const getCardStyle = (index: number) => {
    const total = items.length
    let diff = index - currentIndex
    if (diff > total / 2) diff -= total
    if (diff < -total / 2) diff += total

    if (diff === 0) {
      return { y: 0, scale: 1, opacity: 1, zIndex: 5, rotateX: 0 }
    } else if (diff === -1) {
      return { y: -160, scale: 0.82, opacity: 0.6, zIndex: 4, rotateX: 8 }
    } else if (diff === -2) {
      return { y: -280, scale: 0.7, opacity: 0.3, zIndex: 3, rotateX: 15 }
    } else if (diff === 1) {
      return { y: 160, scale: 0.82, opacity: 0.6, zIndex: 4, rotateX: -8 }
    } else if (diff === 2) {
      return { y: 280, scale: 0.7, opacity: 0.3, zIndex: 3, rotateX: -15 }
    } else {
      return { y: diff > 0 ? 400 : -400, scale: 0.6, opacity: 0, zIndex: 0, rotateX: diff > 0 ? -20 : 20 }
    }
  }

  const isVisible = (index: number) => {
    const total = items.length
    let diff = index - currentIndex
    if (diff > total / 2) diff -= total
    if (diff < -total / 2) diff += total
    return Math.abs(diff) <= 2
  }

  return (
    <div className="relative flex w-full items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F39C12]/[0.03] blur-3xl" />
      </div>

      <div
        className="relative flex items-center justify-center"
        style={{ perspective: "1200px", width: cardWidth, height: cardHeight }}
      >
        {items.map((item, index) => {
          if (!isVisible(index)) return null
          const style = getCardStyle(index)
          const isCurrent = index === currentIndex

          return (
            <motion.div
              key={item.id}
              className="absolute cursor-grab active:cursor-grabbing"
              animate={{
                y: style.y,
                scale: style.scale,
                opacity: style.opacity,
                rotateX: style.rotateX,
                zIndex: style.zIndex,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 1,
              }}
              drag={isCurrent ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              style={{
                transformStyle: "preserve-3d",
                zIndex: style.zIndex,
              }}
            >
              <div
                className="relative h-[580px] w-[380px] rounded-3xl bg-[#0c1322] ring-1 ring-white/10 flex flex-col"
                style={{
                  boxShadow: isCurrent
                    ? "0 25px 50px -12px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)"
                    : "0 10px 30px -10px rgba(0,0,0,0.3)",
                }}
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/[0.06] via-transparent to-transparent" />

                <div className="relative shrink-0 h-[350px] overflow-hidden">
                  <img
                    src={item.imageSrc}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {item.year && (
                      <span className="text-[10px] font-bold tracking-wide uppercase text-white bg-[#395886]/80 backdrop-blur-sm px-2 py-1 rounded-full">
                        {item.year}
                      </span>
                    )}
                    {item.fuelType && (
                      <span className="text-[10px] font-bold tracking-wide uppercase text-white bg-[#F39C12]/80 backdrop-blur-sm px-2 py-1 rounded-full inline-flex items-center gap-1">
                        <Fuel size={10} />
                        {item.fuelType}
                      </span>
                    )}
                  </div>

                  {item.pricePerDay != null && (
                    <div className="absolute bottom-3 left-3 flex items-baseline gap-1 text-white drop-shadow-lg">
                      <span className="text-3xl font-black">{item.pricePerDay.toLocaleString()}</span>
                      <span className="text-xs font-semibold opacity-90">DH / jour</span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-black/60 backdrop-blur-md">
                  <p className="text-white font-bold text-sm truncate">{item.title}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    {item.Occupants && (
                      <span className="text-[11px] text-white/60 flex items-center gap-1">
                        <Users size={11} />
                        {item.Occupants}
                      </span>
                    )}
                    {item.km != null && (
                      <span className="text-[11px] text-white/60 flex items-center gap-1">
                        <Gauge size={11} />
                        {(item.km as number).toLocaleString()} km
                      </span>
                    )}
                  </div>
                  <a
                    href={item.href}
                    className="block w-full py-2.5 mt-3 rounded-xl bg-[#FF7B00] hover:bg-[#e66f00] text-[#1f2124] text-xs font-black uppercase tracking-wider text-center transition-colors"
                  >
                    Réserver
                  </a>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="absolute right-8 top-1/2 flex -translate-y-1/2 flex-col gap-2">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => {
              if (index !== currentIndex) {
                setCurrentIndex(index)
              }
            }}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? "h-6 bg-[#F39C12]" : "bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
