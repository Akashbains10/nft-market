import { Plus } from "lucide-react";

export function PortfolioHeader() {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
          Your Portfolio
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage and list your NFT collection
        </p>
      </div>
      <a
        href="/mint"
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
      >
        <Plus size={20} />
        Create NFT
      </a>
    </div>
  );
}