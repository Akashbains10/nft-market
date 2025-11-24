"use client"
import Header from "@/components/header"
import Footer from "@/components/footer"
import MintForm from "@/components/mint-form"
import WalletProvider from "@/components/wallet-provider"

export default function MintPage() {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">Create & Mint NFT</h1>
              <p className="text-lg text-muted-foreground">
                Upload your digital asset and set pricing across multiple blockchain networks
              </p>
            </div>
            <MintForm />
          </div>
        </main>
        <Footer />
      </div>
    </WalletProvider>
  )
}
