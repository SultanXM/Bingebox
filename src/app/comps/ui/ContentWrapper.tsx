"use client"

import { cn } from "@/app/lib/utils"
import { ReactNode } from "react"

interface ContentWrapperProps {
  children: ReactNode
  className?: string
  isLoading?: boolean
}

/**
 * ContentWrapper provides smooth fade-in animation when content loads
 * Use this to wrap content that should animate in after loading state
 */
export function ContentWrapper({ 
  children, 
  className,
  isLoading = false 
}: ContentWrapperProps) {
  return (
    <div 
      className={cn(
        "transition-all duration-500 ease-out",
        isLoading 
          ? "opacity-0 translate-y-4" 
          : "opacity-100 translate-y-0",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * StaggerContainer provides staggered animation for child elements
 * Children will fade in one after another with a slight delay
 */
interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

export function StaggerContainer({ 
  children, 
  className,
  staggerDelay = 50 
}: StaggerContainerProps) {
  return (
    <div 
      className={cn("stagger-children", className)}
      style={{ 
        // Custom property for dynamic stagger delay if needed
        ["--stagger-delay" as string]: `${staggerDelay}ms` 
      }}
    >
      {children}
    </div>
  )
}

/**
 * FadeIn provides a simple fade in animation for individual elements
 */
interface FadeInProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "none"
}

export function FadeIn({ 
  children, 
  className,
  delay = 0,
  direction = "up"
}: FadeInProps) {
  const directionClasses = {
    up: "translate-y-4",
    down: "-translate-y-4",
    left: "translate-x-4",
    right: "-translate-x-4",
    none: ""
  }

  return (
    <div 
      className={cn(
        "animate-fade-in-up",
        directionClasses[direction],
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/**
 * ImageWithSkeleton - Image component that shows skeleton while loading
 * and smoothly fades in when loaded
 */
interface ImageWithSkeletonProps {
  src: string
  alt: string
  className?: string
  containerClassName?: string
  aspectRatio?: string
}

export function ImageWithSkeleton({
  src,
  alt,
  className,
  containerClassName,
  aspectRatio = "aspect-[2/3]"
}: ImageWithSkeletonProps) {
  return (
    <div className={cn(
      "relative overflow-hidden bg-neutral-800",
      aspectRatio,
      containerClassName
    )}>
      {/* Skeleton placeholder */}
      <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
      
      {/* Actual image with fade in */}
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-500",
          "opacity-0",
          className
        )}
        onLoad={(e) => {
          e.currentTarget.classList.remove("opacity-0")
          e.currentTarget.classList.add("opacity-100")
        }}
      />
    </div>
  )
}
