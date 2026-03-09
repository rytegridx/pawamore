import { useRef, useState, useEffect, ReactNode, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileScrollSectionProps {
  children: ReactNode[];
  className?: string;
  showArrows?: boolean;
  showDots?: boolean;
  showSwipeHint?: boolean;
  /** Style of progress indicator: 'dots' (default), 'bar', or 'counter' */
  indicatorStyle?: "dots" | "bar" | "counter";
}

const MobileScrollSection = ({
  children,
  className = "",
  showArrows = true,
  showDots = true,
  showSwipeHint = true,
  indicatorStyle = "dots",
}: MobileScrollSectionProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const isMobile = useIsMobile();
  const totalItems = children.length;

  const getChildPositions = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return [];
    const children = Array.from(el.children) as HTMLElement[];
    return children.map((child) => ({
      left: child.offsetLeft,
      width: child.offsetWidth,
      center: child.offsetLeft + child.offsetWidth / 2,
    }));
  }, []);

  const updateActiveIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollCenter = el.scrollLeft + el.clientWidth / 2;
    const positions = getChildPositions();
    let closest = 0;
    let minDist = Infinity;
    positions.forEach((pos, i) => {
      const dist = Math.abs(pos.center - scrollCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setActiveIndex(closest);
    if (el.scrollLeft > 10) setHasScrolled(true);
  }, [getChildPositions]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateActiveIndex, { passive: true });
    return () => el.removeEventListener("scroll", updateActiveIndex);
  }, [updateActiveIndex]);

  const scrollToIndex = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const positions = getChildPositions();
    if (!positions[index]) return;
    const targetScroll = positions[index].left - (el.clientWidth - positions[index].width) / 2;
    el.scrollTo({ left: targetScroll, behavior: "smooth" });
  }, [getChildPositions]);

  const scrollTo = (direction: "left" | "right") => {
    const newIndex = direction === "left"
      ? Math.max(0, activeIndex - 1)
      : Math.min(totalItems - 1, activeIndex + 1);
    scrollToIndex(newIndex);
  };

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide -mx-6 px-6"
      >
        {children.map((child, i) => (
          <div key={i} className="min-w-[280px] max-w-[85vw] snap-center flex-shrink-0">
            {child}
          </div>
        ))}
      </div>

      {/* Navigation arrows — positioned inside container edges */}
      {showArrows && totalItems > 1 && (
        <>
          {activeIndex > 0 && (
            <button
              onClick={() => scrollTo("left")}
              className="absolute left-1 top-[40%] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm shadow-lg border border-border/50 flex items-center justify-center active:scale-90 transition-all"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
          )}
          {activeIndex < totalItems - 1 && (
            <button
              onClick={() => scrollTo("right")}
              className="absolute right-1 top-[40%] -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm shadow-lg border border-border/50 flex items-center justify-center active:scale-90 transition-all"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
          )}
        </>
      )}

      {/* Indicators */}
      {showDots && totalItems > 1 && (
        <div className="mt-4">
          {indicatorStyle === "dots" && (
            <div className="flex justify-center gap-1.5">
              {Array.from({ length: totalItems }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToIndex(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? "w-6 h-2 bg-accent"
                      : "w-2 h-2 bg-muted-foreground/30"
                  }`}
                  aria-label={`Go to item ${i + 1}`}
                />
              ))}
            </div>
          )}
          {indicatorStyle === "bar" && (
            <div className="mx-auto max-w-[120px] h-1 bg-muted-foreground/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-300"
                style={{ width: `${((activeIndex + 1) / totalItems) * 100}%` }}
              />
            </div>
          )}
          {indicatorStyle === "counter" && (
            <div className="text-center">
              <span className="text-xs font-display font-bold text-accent">{activeIndex + 1}</span>
              <span className="text-xs text-muted-foreground/50 mx-1">/</span>
              <span className="text-xs text-muted-foreground/50">{totalItems}</span>
            </div>
          )}
        </div>
      )}

      {/* Swipe hint — only shows once */}
      {showSwipeHint && !hasScrolled && (
        <div className="flex items-center justify-center gap-1.5 mt-3 animate-pulse">
          <ChevronLeft className="w-3 h-3 text-muted-foreground/50" />
          <span className="text-[11px] text-muted-foreground/60 font-medium">Swipe to explore</span>
          <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
        </div>
      )}
    </div>
  );
};

export default MobileScrollSection;
