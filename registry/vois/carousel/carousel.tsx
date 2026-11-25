// Vois Carousel. shadcn/ui's components/ui/carousel.tsx (Embla) with the same parts: Carousel, CarouselContent,
// CarouselItem, CarouselPrevious and CarouselNext, and the same props (`opts`, `plugins`, `orientation`, `setApi`). The
// controls are Vois Buttons, so install vois-button with it.
//
// Roles. Carousel is a region with aria-roledescription="carousel", and each CarouselItem is a group with
// aria-roledescription="slide". A region is a landmark only with a name, so pass `aria-label` to Carousel
// ("Product photos"). Give each CarouselItem an `aria-label` too ("1 of 5") so a screen reader says which slide it is on.
//
// Keyboard. The arrow keys move between slides while focus is inside the carousel: Left and Right for a horizontal
// one, Up and Down for a vertical one. They do nothing when focus is in a text field, a select or an editable area (the
// arrow keys belong to that control), and nothing when a modifier key is held or something else already took the key.
// The Previous and Next buttons are the way for a pointer, a switch and a screen reader. Tab reaches them like any
// button, and a slide that takes focus is scrolled into view (Embla's watchFocus).
//
// Ends. At the first and last slide (with `loop` off) the button for that way is aria-disabled, not disabled, so it
// keeps focus when the last press lands on the end and the keyboard user is not dropped to the top of the page. It reads
// as disabled and ignores presses (vois-button stops an aria-disabled button).
//
// Look. The buttons are 36 outline icon buttons (48 on a coarse pointer, DS-ICON-003) with the Vois focus outline, in
// the gutter just outside the slides: 48 from the edge. Leave 48 of room on each side, or pass `className` to
// CarouselPrevious and CarouselNext to place them elsewhere. Slides are one gap apart (--space-16) and each fills the
// carousel; set `className="basis-1/2"` on a CarouselItem to show more than one.
//
// Motion. Embla animates by physics in script, not by a CSS duration, so there is no duration here to take from the
// motion tokens. Under reduced motion every move made by a button or a key jumps to the slide at once (Embla's `jump`).
// A drag still follows the pointer and settles with Embla's friction, which is the input and not decoration.
import * as React from "react"
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
  orientation: "horizontal" | "vertical"
} & Pick<CarouselProps, "opts">

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }
  return context
}

const REDUCED = "(prefers-reduced-motion: reduce)"
function subscribeReduced(onChange: () => void) {
  const query = window.matchMedia(REDUCED)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}
/** Whether the person asked for reduced motion. False on the server. */
function useReducedMotion() {
  return React.useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false
  )
}

/** A control that owns the arrow keys: a text field, a select, an editable area. The carousel leaves them alone. */
function ownsArrowKeys(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true
  if (target instanceof HTMLInputElement) {
    // These input types take no arrow keys, so a slide with a checkbox or a button input still moves.
    return !["button", "checkbox", "radio", "submit", "reset", "image", "file", "color"].includes(target.type)
  }
  return target.getAttribute("role") === "textbox" || target.getAttribute("role") === "combobox" || target.getAttribute("role") === "slider" || target.getAttribute("role") === "spinbutton"
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  onKeyDownCapture,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)
  const reduced = useReducedMotion()

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => api?.scrollPrev(reduced), [api, reduced])
  const scrollNext = React.useCallback(() => api?.scrollNext(reduced), [api, reduced])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDownCapture?.(event)
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    if (ownsArrowKeys(event.target)) return
    const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp"
    const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown"
    if (event.key === prevKey) {
      event.preventDefault()
      scrollPrev()
    } else if (event.key === nextKey) {
      event.preventDefault()
      scrollNext()
    }
  }

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)
    return () => {
      api.off("reInit", onSelect)
      api.off("select", onSelect)
    }
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        data-slot="carousel"
        data-orientation={orientation}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel()
  return (
    <div ref={carouselRef} className="overflow-hidden" data-slot="carousel-content">
      <div className={cn("flex", orientation === "horizontal" ? "-ml-[var(--space-16)]" : "-mt-[var(--space-16)] flex-col", className)} {...props} />
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()
  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "pl-[var(--space-16)]" : "pt-[var(--space-16)]", className)}
      {...props}
    />
  )
}

function ArrowLeft(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
}

function ArrowRight(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
}

// An aria-disabled button keeps focus at the end of the run. vois-button stops its presses, and its disabled look is a
// `disabled:` selector, so the same look is set for aria-disabled here.
const endLook =
  "aria-disabled:border-[color:var(--border-state-disabled)] aria-disabled:bg-[color:var(--action-secondary-disabled)] aria-disabled:text-[color:var(--text-state-disabled)]"

function CarouselPrevious({ className, variant = "outline", size = "icon", ...props }: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()
  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute rounded-full",
        orientation === "horizontal" ? "top-1/2 -left-[var(--space-48)] -translate-y-1/2" : "-top-[var(--space-48)] left-1/2 -translate-x-1/2 rotate-90",
        endLook,
        className
      )}
      aria-disabled={!canScrollPrev ? true : undefined}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({ className, variant = "outline", size = "icon", ...props }: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()
  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute rounded-full",
        orientation === "horizontal" ? "top-1/2 -right-[var(--space-48)] -translate-y-1/2" : "-bottom-[var(--space-48)] left-1/2 -translate-x-1/2 rotate-90",
        endLook,
        className
      )}
      aria-disabled={!canScrollNext ? true : undefined}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

export { type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, useCarousel }
