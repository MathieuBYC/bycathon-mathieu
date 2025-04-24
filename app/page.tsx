"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { SlidingNumber } from "@/components/animate-ui/sliding-number";
import { FlipButton } from "@/components/animate-ui/flip-button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Timer() {
  const [value, setValue] = useState(0);
  const [rotation, setRotation] = useState(0); // 60 * 3.6
  const rotationRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [prevAngle, setPrevAngle] = useState(0);
  const knobRef = useRef<HTMLDivElement | null>(null);

  const [displayValue, setDisplayValue] = useState(value);

  // Update displayValue only when value stabilizes (debounce style)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDisplayValue(value);
    }, 50); // Adjust this delay (ms) to smooth vs responsiveness

    return () => clearTimeout(timeout);
  }, [value]);

  const getAngle = useCallback((e: MouseEvent, knob: HTMLDivElement) => {
    const rect = knob.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (angle < 0) angle += 360;
    return angle;
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !knobRef.current) return;

      const angle = getAngle(e, knobRef.current);
      let delta = angle - prevAngle;

      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      const tentativeRotation = rotationRef.current + delta;
      const tentativeValue = Math.round(tentativeRotation / 3.6);

      // ❗ Block rotation left if already at 0
      if (value <= 0 && delta < 0) return;

      // Clamp between 0 and 999
      const clampedValue = Math.max(0, Math.min(999, tentativeValue));
      const clampedRotation = clampedValue * 3.6;

      rotationRef.current = clampedRotation;
      setRotation(clampedRotation);
      setValue(clampedValue);
      setPrevAngle(angle);
    },
    [isDragging, prevAngle, getAngle, value]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (knobRef.current) {
      setIsDragging(true);
      const angle = getAngle(e.nativeEvent, knobRef.current);
      setPrevAngle(angle);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    toast.success(`Timer set to ${value} minute${value === 1 ? "" : "s"}.`);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="relative overflow-hidden text-center p-10 w-[calc(100%-30px)] max-w-[600px] rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[-30%] left-[-30%] w-[150%] h-[80%] rounded-full bg-white/15 blur-2xl rotate-12" />
          <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-white/5 to-transparent" />
        </div>
        <svg
          className="icon-back absolute left-[30px] top-[44px] text-white h-[26px] cursor-pointer"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 12H5M12 19L5 12L12 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <h1 className="text-2xl font-semibold mb-4 text-white drop-shadow relative">
          Timer
        </h1>

        {/* Knob */}
        <div className="relative mx-auto mb-6 w-64 h-64">
          <div className="absolute inset-0 rounded-full border-4 border-gray-300/30 shadow-inner" />
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0, rotate: -20 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {[...Array(60)].map((_, i) => {
              const isMajor = i % 5 === 0;
              const tickHeight = isMajor ? 14 : 8;
              const tickWidth = isMajor ? 3 : 2;

              return (
                <div
                  key={i}
                  className="absolute bg-gray-300/70 rounded-full"
                  style={{
                    width: `${tickWidth}px`,
                    height: `${tickHeight}px`,
                    left: "50%",
                    top: "50%",
                    transform: `
            rotate(${i * 6}deg)
            translateY(-128px)
            translateY(${tickHeight / -2}px)
          `,
                    transformOrigin: "center",
                  }}
                />
              );
            })}
          </motion.div>

          <div
            ref={knobRef}
            onMouseDown={handleMouseDown}
            className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg cursor-pointer transition-transform hover:scale-105"
            style={{
              transform: `rotate(${rotation}deg)`,
              boxShadow: `0 0 ${value / 5}px ${
                value / 20
              }px rgba(99, 102, 241, 0.6)`,
            }}
          >
            {isDragging && (
              <motion.div
                className="absolute inset-0 rounded-full bg-purple-500/10 z-[-1]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, scale: 1.1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            )}

            <div className="absolute left-1/2 top-4 w-2 h-8 bg-white rounded-full transform -translate-x-1/2" />
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
              <div className="text-sm text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="w-8 h-8"
                >
                  {/* Outer circular motion indicators */}
                  <g opacity="0.9" strokeLinecap="round">
                    {/* Circular arrow path - left */}
                    <path
                      d="M12,24 C12,17.373 17.373,12 24,12 C30.627,12 36,17.373 36,24"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeDasharray="2 3"
                    />

                    {/* Circular arrow path - right */}
                    <path
                      d="M36,24 C36,30.627 30.627,36 24,36 C17.373,36 12,30.627 12,24"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeDasharray="2 3"
                    />

                    {/* Arrow heads */}
                    <path
                      d="M9,24 L12,27 L15,24"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M39,24 L36,21 L33,24"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />
                  </g>

                  {/* Subtle gradient */}
                  <defs>
                    <radialGradient
                      id="radialGradient"
                      cx="24"
                      cy="22"
                      r="12"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="10%" stopColor="#e4ebf5" />
                      <stop offset="90%" stopColor="#bac8e0" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="text-5xl font-bold text-white mb-2">
          {value} minutes
        </div> */}
        <div className="text-5xl font-bold text-white mt-8 mb-2 flex justify-center items-end gap-2">
          <SlidingNumber number={displayValue} padStart className="text-4xl" />
          <span className="text-xl text-gray-300 mb-1">minutes</span>
        </div>

        <div className="text-center mt-5">
          <FlipButton
            frontText="Save"
            backText="Me!"
            from="right"
            frontClassName="bg-[#36126c]/50 text-white"
            backClassName="bg-white/50 text-gray-900"
            onClick={handleSave}
          />
        </div>
      </div>
      <Toaster
        position="bottom-center"
        toastOptions={{
          className: "glass-toast mb-4",
          style: {
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
            color: "white",
            fontWeight: 500,
          },
        }}
      />
    </div>
  );
}
