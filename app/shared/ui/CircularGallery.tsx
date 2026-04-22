import {
  forwardRef,
  type HTMLAttributes,
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { CartridgeLabel, type CartridgeLabelProps } from "./Cartridge";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export interface GalleryItem {
  common: string;
  binomial: string;
  description?: string;
  color?: string;
  href?: string;
  cartridge?: CartridgeLabelProps;
  onActivate?: (event: MouseEvent<HTMLAnchorElement>) => void;
  photo?: {
    url: string;
    text: string;
    pos?: string;
    by: string;
  };
}

interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  radius?: number;
  autoRotateSpeed?: number;
}

export const CircularGallery = forwardRef<HTMLDivElement, CircularGalleryProps>(
  ({ items, className, radius = 600, autoRotateSpeed = 0.02, ...props }, ref) => {
    const rotationRef = useRef(0);
    const isScrollingRef = useRef(false);
    const rotatingContainerRef = useRef<HTMLDivElement | null>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const anglePerItem = items.length > 0 ? 360 / items.length : 0;

    const applyRotation = useCallback(
      (value: number) => {
        const rotation = ((value % 360) + 360) % 360;
        rotationRef.current = rotation;

        if (rotatingContainerRef.current) {
          rotatingContainerRef.current.style.transform = `rotateY(${rotation}deg)`;
        }

        itemRefs.current.forEach((element, index) => {
          if (!element) return;

          const itemAngle = index * anglePerItem;
          const relativeAngle = (itemAngle + rotation + 360) % 360;
          const normalizedAngle = Math.abs(
            relativeAngle > 180 ? 360 - relativeAngle : relativeAngle
          );
          const opacity = Math.max(0.28, 1 - normalizedAngle / 180);
          const scale = 0.86 + (1 - normalizedAngle / 180) * 0.14;

          element.style.opacity = String(opacity);
          element.style.transform = `rotateY(${itemAngle}deg) translateZ(${radius}px) scale(${scale})`;
        });
      },
      [anglePerItem, radius]
    );

    useEffect(() => {
      const handleScroll = () => {
        isScrollingRef.current = true;
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
        applyRotation(scrollProgress * 360);

        scrollTimeoutRef.current = setTimeout(() => {
          isScrollingRef.current = false;
        }, 150);
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }, [applyRotation]);

    useEffect(() => {
      const autoRotate = () => {
        if (!isScrollingRef.current) {
          applyRotation(rotationRef.current + autoRotateSpeed);
        }
        animationFrameRef.current = requestAnimationFrame(autoRotate);
      };

      animationFrameRef.current = requestAnimationFrame(autoRotate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [applyRotation, autoRotateSpeed]);

    useEffect(() => {
      applyRotation(rotationRef.current);
    }, [applyRotation]);

    return (
      <div
        ref={ref}
        className={cn("relative flex h-full w-full items-center justify-center", className)}
        style={{ perspective: "2000px" }}
        {...props}
      >
        <div
          ref={rotatingContainerRef}
          className="relative h-full w-full"
          style={{
            transform: `rotateY(${rotationRef.current}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {items.map((item, index) => {
            const itemAngle = index * anglePerItem;
            const relativeAngle = (itemAngle + rotationRef.current + 360) % 360;
            const normalizedAngle = Math.abs(
              relativeAngle > 180 ? 360 - relativeAngle : relativeAngle
            );
            const opacity = Math.max(0.28, 1 - normalizedAngle / 180);
            const scale = 0.86 + (1 - normalizedAngle / 180) * 0.14;
            const content = item.cartridge ? (
              <div className="group relative grid h-full w-full grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-md border border-white/15 bg-[#121217] p-2 shadow-2xl backdrop-blur-lg">
                <div className="flex items-center justify-between gap-2 px-1 pb-2 font-mono text-[0.55rem] font-black uppercase tracking-[0.2em] text-white/46">
                  <span>{item.binomial}</span>
                  <span style={{ color: item.color ?? "#38bdf8" }}>Loaded</span>
                </div>
                <CartridgeLabel {...item.cartridge} compact />
              </div>
            ) : (
              <div className="group relative h-full w-full overflow-hidden rounded-md border border-white/15 bg-slate-950/70 shadow-2xl backdrop-blur-lg">
                {item.photo ? (
                  <img
                    src={item.photo.url}
                    alt={item.photo.text}
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: item.photo.pos || "center" }}
                  />
                ) : null}
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(2,6,23,0.08), rgba(2,6,23,0.04) 42%, rgba(2,6,23,0.92)), radial-gradient(circle at 50% 18%, rgba(255,255,255,0.18), transparent 34%)",
                  }}
                />
                <div className="absolute bottom-0 left-0 w-full p-4 text-white">
                  <div className="mb-2 text-[0.62rem] font-black uppercase tracking-[0.28em] text-white/65">
                    {item.binomial}
                  </div>
                  <h2 className="text-2xl font-black uppercase leading-none sm:text-3xl">
                    {item.common}
                  </h2>
                  {item.description ? (
                    <p className="mt-3 line-clamp-2 text-sm leading-snug text-white/72">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </div>
            );

            return (
              <div
                key={`${item.common}-${item.href ?? item.binomial}`}
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                className="absolute h-[340px] w-[245px] sm:h-[400px] sm:w-[300px]"
                style={{
                  left: "50%",
                  marginLeft: "clamp(-150px, -38vw, -122px)",
                  marginTop: "clamp(-200px, -42vh, -170px)",
                  opacity,
                  top: "50%",
                  transform: `rotateY(${itemAngle}deg) translateZ(${radius}px) scale(${scale})`,
                  transition: "opacity 0.3s linear",
                }}
              >
                {item.href ? (
                  <a
                    href={item.href}
                    className="block h-full w-full focus:outline-none focus:ring-2 focus:ring-cyan-200"
                    onClick={item.onActivate}
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

CircularGallery.displayName = "CircularGallery";
