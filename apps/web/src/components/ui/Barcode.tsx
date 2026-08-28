"use client";

import React, { useMemo } from "react";

interface BarcodeProps {
  value: string;
  className?: string;
  height?: number;
  showText?: boolean;
}

// Code 128 (Subset B) pattern tables
// 107 patterns indexed 0-106. Each pattern is a binary string of 11 modules (bars & spaces).
const CODE128_PATTERNS: string[] = [
  "11011001100", "11001101100", "11001100110", "10010011000", "10010001100",
  "10001001100", "10011001000", "10011000100", "10001100100", "11001001000",
  "11001000100", "11000100100", "10110011100", "10011011100", "10011001110",
  "10111001100", "10011101100", "10011100110", "11001110010", "11001011100",
  "11001001110", "11011100100", "11001110100", "11101101110", "11101001100",
  "11100101100", "11100100110", "11101100100", "11100110100", "11100110010",
  "11011011000", "11011000110", "11000110110", "10100011000", "10001011000",
  "10001000110", "10110001000", "10001101000", "10001100010", "11010001000",
  "11000101000", "11000100010", "10110111000", "10110001110", "10001101110",
  "10111011000", "10111000110", "10001110110", "11101110110", "11010001110",
  "11000101110", "11011101000", "11011100010", "11011101110", "11101011000",
  "11101000110", "11100010110", "11101101000", "11101100010", "11100011010",
  "11101111010", "11001000010", "11110001010", "10100110000", "10100001100",
  "10010110000", "10010000110", "10000101100", "10000100110", "10110010000",
  "10110000100", "10011010000", "10011000010", "10000110100", "10000110010",
  "11000010010", "11001010000", "11110111010", "11000010100", "10001111010",
  "10100111100", "10010111100", "10010011110", "10111100100", "10011110100",
  "10011110010", "11110100100", "11110010100", "11110010010", "11011011110",
  "11011110110", "11110110110", "10101111000", "10100011110", "10001011110",
  "10111101000", "10111100010", "11110101000", "11110100010", "10111011110",
  "10111101110", "11101011110", "11110101110", "11010000100", "11010010000",
  "11010011100", "11000111010"
];
// Stop pattern: 13 modules
const STOP_PATTERN = "1100011101011";

function encodeCode128B(text: string): string {
  // Start with Start B (pattern 104)
  const values: number[] = [104];

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // ASCII 32 to 126 map directly to Code 128B index (code - 32)
    if (code >= 32 && code <= 126) {
      values.push(code - 32);
    } else {
      values.push(0); // space as fallback
    }
  }

  // Checksum calculation: (104 + sum(i * value[i])) % 103
  let checksum = values[0];
  for (let i = 1; i < values.length; i++) {
    checksum += i * values[i];
  }
  values.push(checksum % 103);

  // Generate binary string
  let binary = "";
  for (const v of values) {
    binary += CODE128_PATTERNS[v] || CODE128_PATTERNS[0];
  }
  binary += STOP_PATTERN;

  return binary;
}

export function Barcode({
  value,
  className = "",
  height = 48,
  showText = true,
}: BarcodeProps) {
  const cleanValue = (value || "IBZ-000000-01").toUpperCase().trim();

  const binaryString = useMemo(() => {
    try {
      return encodeCode128B(cleanValue);
    } catch {
      return encodeCode128B("IBZ-000000-01");
    }
  }, [cleanValue]);

  // Convert binary string to SVG rects (bars)
  const bars = useMemo(() => {
    const rects: Array<{ x: number; width: number }> = [];
    let currentX = 10; // Left quiet zone
    let barWidth = 0;

    for (let i = 0; i < binaryString.length; i++) {
      if (binaryString[i] === "1") {
        barWidth += 1;
      } else {
        if (barWidth > 0) {
          rects.push({ x: currentX, width: barWidth });
          currentX += barWidth;
          barWidth = 0;
        }
        currentX += 1; // space width
      }
    }

    if (barWidth > 0) {
      rects.push({ x: currentX, width: barWidth });
      currentX += barWidth;
    }

    const totalWidth = currentX + 10; // Right quiet zone
    return { rects, totalWidth };
  }, [binaryString]);

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox={`0 0 ${bars.totalWidth} ${height}`}
        className="w-full max-w-full h-auto"
        style={{ height: `${height}px` }}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="100%" height="100%" fill="#ffffff" />
        {bars.rects.map((bar, idx) => (
          <rect
            key={idx}
            x={bar.x}
            y={0}
            width={bar.width}
            height={height}
            fill="#000000"
          />
        ))}
      </svg>
      {showText && (
        <span className="font-mono font-bold text-xs tracking-widest text-black mt-1 uppercase text-center block">
          {cleanValue}
        </span>
      )}
    </div>
  );
}
