import { Sun, Monitor } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function SettingsForm() {
  const { theme, setTheme } = useTheme();
  return (
    <section aria-labelledby="appearance-heading" className="rounded-2xl border border-border bg-card shadow-sm p-6">
      <h2 id="appearance-heading" className="text-lg font-bold tracking-tight text-foreground mb-1">Appearance</h2>
      <p className="text-sm text-muted-foreground mb-4">Choose how DataForge looks to you.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { id: "light" as const, label: "Light", desc: "Clean white surfaces", icon: Sun },
          { id: "dark" as const, label: "Dark", desc: "Deep neutral background", icon: Sun },
          { id: "system" as const, label: "System", desc: "Follow system preference", icon: Monitor },
        ].map((opt) => {
          const Icon = opt.icon;
          const active = theme === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={cn(
                "relative rounded-xl border px-4 py-4 text-left transition-all hover:shadow-sm",
                active ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card hover:border-border/80"
              )}
              aria-pressed={active}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-semibold text-foreground">{opt.label}</span>
                {active && <span className="ml-auto text-[10px] font-medium text-primary">Selected</span>}
              </div>
              <p className="text-xs text-muted-foreground">{opt.desc}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
