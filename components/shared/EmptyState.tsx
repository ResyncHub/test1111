export function EmptyState({ icon, title, description }: {
  icon?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-4xl mb-3">{icon}</div>}
      <p className="font-medium" style={{ color: "hsl(215 20% 65%)" }}>{title}</p>
      {description && <p className="text-sm mt-1" style={{ color: "hsl(215 20% 45%)" }}>{description}</p>}
    </div>
  );
}
