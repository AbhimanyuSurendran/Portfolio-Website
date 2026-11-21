import { prefersReducedMotion } from './mediaQueries'

const SPARK_COUNT = 8
const SPARK_DURATION_MS = 560

// A small burst of lines that fly out from the click point (a "click spark").
// `host` must be a positioned element (position: relative). The sparks are
// short-lived <i> elements added to it and removed when they finish.
// Pass the pointer event to burst from the pointer, or null to burst from the middle.
export function playSparks(host, pointerEvent) {
  if (prefersReducedMotion()) return

  const box = host.getBoundingClientRect()
  const x = pointerEvent ? pointerEvent.clientX - box.left : box.width / 2
  const y = pointerEvent ? pointerEvent.clientY - box.top : box.height / 2

  for (let index = 0; index < SPARK_COUNT; index++) {
    const degrees = (360 / SPARK_COUNT) * index
    const spark = document.createElement('i')
    spark.className = 'spark'
    spark.style.left = x + 'px'
    spark.style.top = y + 'px'
    host.appendChild(spark)

    const animation = spark.animate(
      [
        { transform: `rotate(${degrees}deg) translateX(8px) scaleX(1)`, opacity: 1 },
        { transform: `rotate(${degrees}deg) translateX(30px) scaleX(0.15)`, opacity: 0 },
      ],
      { duration: SPARK_DURATION_MS, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' }
    )
    animation.onfinish = () => spark.remove()
  }
}
