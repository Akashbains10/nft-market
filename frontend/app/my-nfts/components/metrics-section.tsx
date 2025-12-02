import {
  TrendingUp,
  List,
  CheckCircle,
  Package,
} from "lucide-react";
import { MetricCard } from "./metric-card";

interface MetricsSectionProps {
  totalNFTs: number;
  activeListingCount: number;
  soldCount: number;
  activeListedValue: number;
}

export function MetricsSection({
  totalNFTs,
  activeListingCount,
  soldCount,
  activeListedValue,
}: MetricsSectionProps) {
  
  const metrics = [
    {
      title: "Total NFTs",
      value: totalNFTs,
      subtitle: "In your collection",
      icon: <Package size={20} />,
      gradientFrom: "from-blue-500/10",
      gradientTo: "via-blue-500/5",
      borderColor: "border-blue-200/20",
      hoverBorderColor: "hover:border-blue-300/40",
      darkBorderColor: "dark:border-blue-800/30",
      darkHoverBorderColor: "dark:hover:border-blue-700/50",
      bgColor: "from-blue-400/5",
      iconBgColor: "bg-blue-500/20",
      iconColor: "text-blue-500",
    },
    {
      title: "Active Listings",
      value: activeListingCount,
      subtitle: "Currently listed",
      icon: <List size={20} />,
      gradientFrom: "from-teal-500/10",
      gradientTo: "via-teal-500/5",
      borderColor: "border-teal-200/20",
      hoverBorderColor: "hover:border-teal-300/40",
      darkBorderColor: "dark:border-teal-800/30",
      darkHoverBorderColor: "dark:hover:border-teal-700/50",
      bgColor: "from-teal-400/5",
      iconBgColor: "bg-teal-500/20",
      iconColor: "text-teal-500",
    },
    {
      title: "Sold",
      value: soldCount,
      subtitle: "Completed sales",
      icon: <CheckCircle size={20} />,
      gradientFrom: "from-purple-500/10",
      gradientTo: "via-purple-500/5",
      borderColor: "border-purple-200/20",
      hoverBorderColor: "hover:border-purple-300/40",
      darkBorderColor: "dark:border-purple-800/30",
      darkHoverBorderColor: "dark:hover:border-purple-700/50",
      bgColor: "from-purple-400/5",
      iconBgColor: "bg-purple-500/20",
      iconColor: "text-purple-500",
    },
    {
      title: "Active Value",
      value: `${activeListedValue} ETH`,
      subtitle: "Listed value",
      icon: <TrendingUp size={20} />,
      gradientFrom: "from-emerald-500/10",
      gradientTo: "via-emerald-500/5",
      borderColor: "border-emerald-200/20",
      hoverBorderColor: "hover:border-emerald-300/40",
      darkBorderColor: "dark:border-emerald-800/30",
      darkHoverBorderColor: "dark:hover:border-emerald-700/50",
      bgColor: "from-emerald-400/5",
      iconBgColor: "bg-emerald-500/20",
      iconColor: "text-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}
