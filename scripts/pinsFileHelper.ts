import { Loc, PinsFile } from "@/app/(tabs)"
import { Pin } from "@/components/QRScanner"

export function isLoc(obj: any): obj is Loc {
    return obj != null && 
    typeof obj === 'object' && 
    typeof obj.lat === 'number' && 
    typeof obj.long === 'number'
  }

export function isPinsFile(obj: any): obj is PinsFile {
    return (
      obj != null &&
      typeof obj === 'object' &&
      Array.isArray((obj as any).pins) &&
      (obj as any).pins.every((p: any) => p && typeof p === 'object' && isLoc(p.choord) && typeof p.name === 'string')
    )
  }

export function isPin(obj: unknown): obj is Pin {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    typeof (obj as any).name === 'string' &&
    isLoc((obj as any).choord)
  )
}