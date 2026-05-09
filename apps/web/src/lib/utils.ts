import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes safely. Use this whenever a component accepts a
 * `className` prop so callers can override defaults without specificity wars.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
