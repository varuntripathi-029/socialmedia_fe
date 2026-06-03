import { useRef, useEffect, useState } from "react";
import {
  motion,
  useAnimation,
  useInView,
  type Variants,
  type TargetAndTransition,
} from "framer-motion";

type BlurTextProps = {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  threshold?: number;
  animationFrom?: TargetAndTransition;
  animationTo?: TargetAndTransition;
  onAnimationComplete?: () => void;
};

const buildVariants = (
  direction: "top" | "bottom",
  animationFrom?: TargetAndTransition,
  animationTo?: TargetAndTransition
): Variants => {
  const hidden: TargetAndTransition =
    animationFrom ??
    (direction === "top"
      ? { filter: "blur(10px)", opacity: 0, y: -20 }
      : { filter: "blur(10px)", opacity: 0, y: 20 });

  const visible: TargetAndTransition =
    animationTo ?? { filter: "blur(0px)", opacity: 1, y: 0 };

  return { hidden, visible };
};

type AnimatedSpanProps = {
  children: React.ReactNode;
  variants: Variants;
  controls: ReturnType<typeof useAnimation>;
  delay: number;
  duration?: number;
};

function AnimatedSpan({
  children,
  variants,
  controls,
  delay,
  duration = 0.55,
}: AnimatedSpanProps) {
  return (
    <motion.span
      initial="hidden"
      animate={controls}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
      className="inline-block will-change-[filter,transform,opacity]"
    >
      {children}
    </motion.span>
  );
}

export default function BlurText({
  text = "",
  delay = 200,
  className = "",
  animateBy = "words",
  direction = "bottom",
  threshold = 0.15,
  animationFrom,
  animationTo,
  onAnimationComplete,
}: BlurTextProps) {
  const controls = useAnimation();
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  const [hasStarted, setHasStarted] = useState(false);

  const tokens = animateBy === "words" ? text.split(" ") : text.split("");
  const variants = buildVariants(direction, animationFrom, animationTo);

  useEffect(() => {
    if (isInView && !hasStarted) {
      setHasStarted(true);
      controls.start("visible");
      if (onAnimationComplete) {
        const totalDuration = tokens.length * (delay / 1000) + 0.6;
        setTimeout(onAnimationComplete, totalDuration * 1000);
      }
    }
  }, [isInView, hasStarted, controls, tokens.length, delay, onAnimationComplete]);

  return (
    <p ref={ref} className={`flex flex-wrap ${className}`}>
      {tokens.map((token, i) => (
        <AnimatedSpan
          key={i}
          variants={variants}
          controls={controls}
          delay={i * (delay / 1000)}
        >
          {animateBy === "words" ? `${token}\u00A0` : token}
        </AnimatedSpan>
      ))}
    </p>
  );
}
