// shadcn's cn(). The registry items list it as `utils`, which is not a Vois file, so the harness supplies it.
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
