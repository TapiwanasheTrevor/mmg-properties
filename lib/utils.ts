import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatting utility
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Date formatting utility
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}

// Relative date formatting (e.g., "2 days ago")
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

// Phone number formatting for Zimbabwe
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // If it starts with 263, format as +263 XX XXX XXXX
  if (digits.startsWith('263')) {
    const cleaned = digits.substring(3);
    return `+263 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5)}`;
  }
  
  // If it's a local number starting with 0, format as +263
  if (digits.startsWith('0') && digits.length === 10) {
    const cleaned = digits.substring(1);
    return `+263 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5)}`;
  }
  
  // Return as-is if format not recognized
  return phone;
}

// National ID formatting for Zimbabwe
export function formatNationalId(id: string): string {
  // Remove all non-alphanumeric characters
  const cleaned = id.replace(/[^0-9A-Z]/gi, '').toUpperCase();
  
  // Format as XX-XXXXXXLXX
  if (cleaned.length >= 8) {
    return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 8)}${cleaned.substring(8)}`;
  }
  
  return cleaned;
}