interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  hoverBorderColor: string;
  darkBorderColor: string;
  darkHoverBorderColor: string;
  bgColor: string;
  iconBgColor: string;
  iconColor: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  gradientFrom,
  gradientTo,
  borderColor,
  hoverBorderColor,
  darkBorderColor,
  darkHoverBorderColor,
  bgColor,
  iconBgColor,
  iconColor,
}: MetricCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradientFrom} ${gradientTo} to-transparent border ${borderColor} ${darkBorderColor} p-6 hover:${hoverBorderColor} dark:hover:${darkHoverBorderColor} transition-all duration-300`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${bgColor} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground">
            {title}
          </h3>
          <div className={`p-3 ${iconBgColor} rounded-lg group-hover:scale-110 transition-transform duration-300`}>
            <div className={`${iconColor}`}>{icon}</div>
          </div>
        </div>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
      </div>
    </div>
  );
}