export interface Attribute {
  id: string
  traitType: string
  value: string
}

export interface FormData {
  name: string
  description: string
  collection: string
  mediaUrl: string
  mediaPreview: string
  attributes: Attribute[]
  priceETH: string
  priceUSDC?:string
  priceUSDT?:string
}

export type CurrentStep = "details" | "pricing" | "review"
