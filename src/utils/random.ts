import { Dimensions, PixelRatio, Platform } from "react-native";
import { ClientMeasurements } from "../types/client";

// Get device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Base dimensions that we're designing for
// Change these values to match your design specifications
const baseWidth = 375; // iPhone X width
const baseHeight = 812; // iPhone X height

// Determine scale ratio based on current device width vs. base width
const widthRatio = SCREEN_WIDTH / baseWidth;
const heightRatio = SCREEN_HEIGHT / baseHeight;

// We'll use a combination of width and height scaling
// This prevents excessive scaling on tablets
const ratio = Math.min(widthRatio, heightRatio);

/**
 * Scale a value based on the device screen size
 * @param size - The original size in pixels
 * @param factor - Optional factor to adjust the scaling (default: 0.5)
 * @returns The scaled size
 */
export const scale = (size: number, factor: number = 0.5): number => {
  // We apply a factor to prevent too aggressive scaling
  const scaledSize = size + size * (ratio - 1) * factor;
  return Math.round(scaledSize);
};

/**
 * Scale font size with platform specific adjustments
 * @param size - The original font size
 * @returns The scaled font size
 */
export const scaleFontSize = (size: number): number => {
  const newSize = scale(size, 0.4);

  // Different pixel densities on Android vs iOS
  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    // Android sometimes needs slightly larger fonts
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) + 1;
  }
};

/**
 * Horizontal scale - scales values specifically for horizontal dimensions
 * @param size - The original size
 * @returns The horizontally scaled size
 */
export const scaleWidth = (size: number): number => {
  return Math.round(size * widthRatio);
};

/**
 * Vertical scale - scales values specifically for vertical dimensions
 * @param size - The original size
 * @returns The vertically scaled size
 */
export const scaleHeight = (size: number): number => {
  return Math.round(size * heightRatio);
};

/**
 * Calculate appropriate spacing for different screen sizes
 * @param size - Original spacing value
 * @returns The scaled spacing
 */
export const spacing = (size: number): number => {
  return scale(size, 0.3);
};

/**
 * Extracts the initials from a person's name
 *
 * @param name - The full name to extract initials from
 * @param maxInitials - Maximum number of initials to return (default: 2)
 * @param fallback - Fallback character if no valid initials can be extracted (default: '?')
 * @returns The extracted initials (uppercase)
 */
export const GetInitials = (
  name: string | null | undefined,
  maxInitials: number = 2,
  fallback: string = "N/A"
): string => {
  // Return fallback if name is null, undefined, or empty after trimming
  if (!name?.trim()) {
    return fallback;
  }

  // Split the name into parts and filter out empty parts
  const nameParts = name
    .trim()
    .split(/[\s-]+/) // Split by spaces and hyphens
    .filter((part) => part.length > 0);

  if (nameParts.length === 0) {
    return fallback;
  }

  // If there's only one name part, use the first two characters or just the first
  if (nameParts.length === 1) {
    const singleName = nameParts[0];
    // If the name is just one character, return it
    if (singleName.length === 1) {
      return singleName.toUpperCase();
    }
    // Otherwise take the first character
    return singleName.charAt(0).toUpperCase();
  }

  // For multiple name parts, get initials based on maxInitials preference
  let initials = "";

  // Determine which parts to use (prefer first and last name)
  const partsToUse =
    nameParts.length <= maxInitials
      ? nameParts
      : [
          ...nameParts.slice(0, Math.ceil(maxInitials / 2)),
          ...nameParts.slice(-Math.floor(maxInitials / 2)),
        ];

  // Extract first character from each selected part
  for (let i = 0; i < Math.min(partsToUse.length, maxInitials); i++) {
    const initial = partsToUse[i].charAt(0);
    if (initial.match(/[a-z]/i)) {
      // Only use alphabetic characters
      initials += initial.toUpperCase();
    }
  }

  // If no valid initials found, return fallback
  return initials || fallback;
};

interface BoxWidthConfig {
  gap?: number;
  padding?: number;
  boxCount: number;
}

/**
 * Generates the width for individual boxes based on screen size and layout constraints.
 * * @param config - The layout parameters (screenWidth, gap, padding, boxCount)
 * @returns The calculated width for a single box
 */
export const CalculateBoxWidth = ({
  gap = 30,
  padding = 20,
  boxCount = 4,
}: BoxWidthConfig): number => {
  const contentWidth = SCREEN_WIDTH - padding * 2;
  const totalGapWidth = gap * (boxCount - 1);
  const totalBoxWidth = contentWidth - totalGapWidth;

  const boxWidth = totalBoxWidth / boxCount;

  return boxWidth;
};

/**
 * Determines if a given 24-hour time string is AM or PM.
 * * @param time - A string in the format "HH:MM" (e.g., "22:44")
 * @returns "AM" or "PM"
 */
export const GetAmPm = (time: string): "AM" | "PM" => {
  // 1. Split the string by the colon ":"
  // "22:44" becomes ["22", "44"]
  const [hoursStr] = time.split(":");

  // 2. Convert the hours string into a number
  const hours = parseInt(hoursStr, 10);

  // 3. Logic: 12:00 through 23:59 are PM, 00:00 through 11:59 are AM
  if (hours >= 12) {
    return "PM";
  } else {
    return "AM";
  }
};

/**
 * Get current date in "Thursday, 8 January 2026" format
 */
export const GetFormattedDate = (): string => {
  const date = new Date();

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  return date.toLocaleDateString("en-US", options);
};

/**
 * Helper to remove ".0" from formatted numbers (e.g., "1.0m" -> "1m")
 */
const cleanDecimal = (val: string): string => {
  return val.endsWith(".0") ? val.slice(0, -2) : val;
};

/**
 * Formats a numeric string into a shorthand Naira representation.
 * @param value - The currency string (e.g., "1,500,000")
 * @returns A formatted string (e.g., "₦1.5m")
 */
export const FormatNairaShorthand = (value: string): string => {
  // 1. Remove commas and convert to a number
  const numericValue = parseFloat(value.replace(/,/g, ""));

  // Handle cases where the input isn't a valid number
  if (isNaN(numericValue)) return "₦0";

  const nairaSymbol = "₦";

  // 2. Determine formatting based on size
  if (numericValue >= 1_000_000_000) {
    // Billions
    const formatted = (numericValue / 1_000_000_000).toFixed(1);
    return `${nairaSymbol}${cleanDecimal(formatted)}b`;
  }

  if (numericValue >= 1_000_000) {
    // Millions
    const formatted = (numericValue / 1_000_000).toFixed(1);
    return `${nairaSymbol}${cleanDecimal(formatted)}m`;
  }

  if (numericValue >= 1_000) {
    // Thousands
    const formatted = (numericValue / 1_000).toFixed(1);
    return `${nairaSymbol}${cleanDecimal(formatted)}k`;
  }

  // Under 1000, just return the number with the symbol
  return `${nairaSymbol}${numericValue}`;
};

/**
 * Formats a date string into a readable shorthand.
 * @param dateString - Example: "10 January 2026 at 12:46:43 UTC+1"
 * @param showYear - Boolean to determine if the year should be included
 * @returns Formatted string like "10 Jan 2026" or "10 Jan"
 */
export const FormatOrderDate = (
  dateString: string,
  showYear: boolean = true
): string => {
  // 1. Remove the word "at" which often breaks the Date parser
  const sanitizedDate = dateString.replace(/\bat\b/g, "");

  const date = new Date(sanitizedDate);

  // Check if the date is invalid
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  // 2. Configure the formatter
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short", // "Jan", "Feb", etc.
    ...(showYear && { year: "numeric" }), // Only add year if showYear is true
  };

  // 3. Format to "10 Jan 2026"
  return new Intl.DateTimeFormat("en-GB", options).format(date);
};

/**
 * Capitalizes the first letter of the first name in a full name string.
 * @param fullName - The full name to process
 * @returns The full name with the first name capitalized
 */
export const CapitalizeFirstName = (fullName: string | undefined): string => {
  if (!fullName || !fullName.trim()) return "Unnamed";

  const nameParts = fullName.trim().split(" ");
  if (nameParts.length === 0) return fullName;

  // Capitalize the first name
  nameParts[0] = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);

  return nameParts.join(" ");
};

/**
 * Converts a measurements object into a displayable array
 */
export const FormatMeasurementsForUI = (measurements?: ClientMeasurements) => {
  if (!measurements) return [];
  return Object.entries(measurements)
    .filter(([key, value]) => {
      const excluded = ["notes", "sleeveType", "dressType"];
      return !excluded.includes(key) && value !== "" && value !== undefined;
    })
    .map(([key, value]) => {
      return {
        label: key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()),
        value: value,
        key: key,
      };
    });
};
