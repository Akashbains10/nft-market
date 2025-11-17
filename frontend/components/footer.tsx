'use client'

export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border/40 mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">✦</span>
              </div>
              <span className="font-semibold text-foreground">NFT Market</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The premier destination for curated digital assets and blockchain-verified collectibles.
            </p>
          </div>

          {/* Marketplace */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-sm">Marketplace</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">Explore</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">Collections</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">Create</a></li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-sm">Community</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">Discord</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">Twitter</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">Blog</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-sm">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">Help Center</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">Terms of Use</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>&copy; 2025 NFT Marketplace. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors duration-200">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors duration-200">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors duration-200">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
