import { type EmblaCarouselType } from 'embla-carousel'
import { useCallback, useEffect, useRef } from 'react'

const lerp = (start: number, end: number, amt: number): number => {
  return start * (1 - amt) + end * amt
}

interface TweenNode {
  node: HTMLElement
  factor: number
  targetOpacity: number
  currentOpacity: number
}

export const useEmblaParallax = (emblaApi: EmblaCarouselType | undefined) => {
  const tweenNodes = useRef<TweenNode[]>([])
  const animationFrame = useRef(0)

  const setTweenNodes = useCallback((emblaApi: EmblaCarouselType): void => {
    tweenNodes.current = emblaApi.slideNodes().map((slideNode) => {
      const parallaxLayer = slideNode.querySelector('.embla__parallax__layer') as HTMLElement

      const factor = Number(slideNode.dataset.parallaxFactor) || 1

      if (parallaxLayer) {
        parallaxLayer.style.willChange = 'opacity'
      }

      return {
        currentOpacity: 1,
        factor,
        node: parallaxLayer,
        targetOpacity: 1,
      }
    })
  }, [])

  const tweenParallax = useCallback((emblaApi: EmblaCarouselType) => {
    const engine = emblaApi.internalEngine()
    const scrollProgress = emblaApi.scrollProgress()

    emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
      let diffToTarget = scrollSnap - scrollProgress
      const slidesInSnap = engine.slideRegistry[snapIndex]

      slidesInSnap.forEach((slideIndex) => {
        if (engine.options.loop) {
          engine.slideLooper.loopPoints.forEach((loopItem) => {
            const target = loopItem.target()
            if (slideIndex === loopItem.index && target !== 0) {
              const sign = Math.sign(target)
              if (sign === -1) diffToTarget = scrollSnap - (1 + scrollProgress)
              if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress)
            }
          })
        }

        const tweenNode = tweenNodes.current[slideIndex]
        if (!tweenNode) return

        const targetOpacity = 1 - Math.abs(diffToTarget) * 0.3

        tweenNode.targetOpacity = targetOpacity
      })
    })
  }, [])

  const animate = useCallback(() => {
    if (!tweenNodes.current.length) return

    tweenNodes.current.forEach((tweenNode) => {
      if (!tweenNode) return

      const { currentOpacity, node, targetOpacity } = tweenNode

      const smoothness = 0.5
      tweenNode.currentOpacity = lerp(currentOpacity, targetOpacity, smoothness)

      const opacity = tweenNode.currentOpacity.toFixed(3)
      node.style.opacity = opacity

      node.style.transform = ''
    })

    animationFrame.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    setTweenNodes(emblaApi)
    tweenParallax(emblaApi)

    emblaApi
      .on('reInit', () => {
        setTweenNodes(emblaApi)
        tweenParallax(emblaApi)
      })
      .on('scroll', () => tweenParallax(emblaApi))
      .on('slideFocus', () => tweenParallax(emblaApi))

    animationFrame.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrame.current)
      tweenNodes.current.forEach((tweenNode) => {
        if (tweenNode) {
          tweenNode.node.style.willChange = 'auto'
          tweenNode.node.style.transform = ''
        }
      })
    }
  }, [emblaApi, setTweenNodes, tweenParallax, animate])
}
