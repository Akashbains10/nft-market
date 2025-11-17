import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Property {
  trait: string
  value: string
}

interface NFTPropertyGridProps {
  properties: Property[]
}

export default function NFTPropertyGrid({ properties }: NFTPropertyGridProps) {
  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Properties</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {properties.map((prop, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-muted/60 to-muted/30 rounded-xl p-4 hover:from-muted/80 hover:to-muted/40 transition-all duration-300 group cursor-default border border-border/30"
            >
              <p className="text-xs text-muted-foreground font-semibold mb-2 group-hover:text-muted-foreground/90 transition-colors">
                {prop.trait}
              </p>
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                {prop.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
