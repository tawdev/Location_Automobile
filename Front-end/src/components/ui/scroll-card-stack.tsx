"use client"

import * as React from "react"
import { VariantProps, cva } from "class-variance-authority"
import {
  HTMLMotionProps,
  motion,
  useMotionTemplate,
  useMotionValue,
  animate,
} from "framer-motion"

import { cn } from "@/lib/utils"

const cardVariants = cva("absolute will-change-transform", {
  variants: {
    variant: {
      dark: "flex size-full flex-col items-center justify-center gap-6 rounded-2xl border border-stone-700/50 bg-[#0f1729]/90 p-6 backdrop-blur-md",
      light:
        "flex size-full flex-col items-center justify-center gap-6 rounded-2xl border border-[#D5DEEF]/40 bg-white/80 p-6 backdrop-blur-md",
    },
  },
  defaultVariants: {
    variant: "light",
  },
})

interface CardStickyProps
  extends HTMLMotionProps<"div">,
    VariantProps<typeof cardVariants> {
  arrayLength: number
  index: number
  incrementY?: number
  incrementZ?: number
  incrementRotation?: number
}

interface ActiveIndexContextValue {
  activeIndex: number
  total: number
}

const ActiveIndexContext = React.createContext<ActiveIndexContextValue | undefined>(
  undefined
)

function useActiveIndexContext() {
  const context = React.useContext(ActiveIndexContext)
  if (context === undefined) {
    throw new Error(
      "useActiveIndexContext must be used within an ActiveIndexContextProvider"
    )
  }
  return context
}

export const CardStack: React.FC<
  React.HTMLAttributes<HTMLDivElement> & {
    activeIndex: number
    total: number
  }
> = ({ children, activeIndex, total, className, ...props }) => {
  return (
    <ActiveIndexContext.Provider value={{ activeIndex, total }}>
      <div
        className={cn("relative", className)}
        style={{ perspective: "1000px" }}
        {...props}
      >
        {children}
      </div>
    </ActiveIndexContext.Provider>
  )
}
CardStack.displayName = "CardStack"

export const CardsContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn("relative", className)}
      style={{ perspective: "1000px" }}
      {...props}
    >
      {children}
    </div>
  )
}
CardsContainer.displayName = "CardsContainer"

export const CardTransformed = React.forwardRef<
  HTMLDivElement,
  CardStickyProps
>(
  (
    {
      arrayLength,
      index,
      incrementY = 10,
      incrementZ = 10,
      incrementRotation = -index + 90,
      className,
      variant,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const { activeIndex } = useActiveIndexContext()

    const distance = index - activeIndex

    const isAbove = distance < 0
    const isCurrent = distance === 0
    const isBelow = distance > 0

    const absDistance = Math.abs(distance)

    const yValue = isCurrent ? 0 : isBelow ? absDistance * 80 : -absDistance * 80
    const rotateValue = isCurrent ? 0 : distance * -4
    const zValue = isCurrent ? arrayLength * incrementZ : (arrayLength - absDistance) * incrementZ
    const scaleValue = isCurrent ? 1 : Math.max(0.92, 1 - absDistance * 0.04)
    const opacityValue = isCurrent ? 1 : Math.max(0, 1 - absDistance * 0.25)
    const blurValue = isCurrent ? 0 : Math.min(absDistance * 1.5, 8)

    const y = useMotionValue(yValue)
    const rotate = useMotionValue(rotateValue)
    const z = useMotionValue(zValue)
    const scale = useMotionValue(scaleValue)
    const opacity = useMotionValue(opacityValue)

    React.useEffect(() => {
      const controls = [
        animate(y, yValue, { duration: 0.5, ease: [0.22, 1, 0.36, 1] }),
        animate(rotate, rotateValue, { duration: 0.5, ease: [0.22, 1, 0.36, 1] }),
        animate(z, zValue, { duration: 0.5, ease: [0.22, 1, 0.36, 1] }),
        animate(scale, scaleValue, { duration: 0.5, ease: [0.22, 1, 0.36, 1] }),
        animate(opacity, opacityValue, { duration: 0.5, ease: [0.22, 1, 0.36, 1] }),
      ]
      return () => controls.forEach((c) => c.stop())
    }, [yValue, rotateValue, zValue, scaleValue, opacityValue])

    const transform = useMotionTemplate`translateZ(${z}px) translateY(${y}px) rotate(${rotate}deg) scale(${scale})`

    const dx = isCurrent ? 0 : distance * 2
    const dy = isCurrent ? 12 : 4
    const shadowBlur = isCurrent ? 24 : 2
    const alpha = isCurrent ? 0.2 : 0.15
    const filter =
      variant === "light"
        ? `drop-shadow(${dx}px ${dy}px ${shadowBlur}px rgba(0,0,0,${alpha}))`
        : "none"

    const cardStyle = {
      top: index * incrementY,
      transform,
      backfaceVisibility: "hidden" as const,
      zIndex: zValue,
      filter,
      opacity,
      ...style,
    }

    return (
      <motion.div
        layout="position"
        ref={ref}
        style={cardStyle}
        className={cn(cardVariants({ variant, className }))}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
CardTransformed.displayName = "CardTransformed"
