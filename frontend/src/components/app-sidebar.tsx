import {
  LayoutDashboard,
  Database,
  ChartNoAxesCombined,
  Gauge,
  Settings,
  CircleHelp,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Datasets", href: "/datasets", icon: Database }
  // { label: "Visualizations", href: "/visualizations", icon: ChartNoAxesCombined },
  // { label: "Performance Lab", href: "/performance", icon: Gauge },
];

const bottomItems = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help", href: "/help", icon: CircleHelp },
];

export function AppSidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
  currentPath = "/",
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  currentPath?: string;
}) {

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-2xl transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="navigation"
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col px-3 py-4">
          <div className="flex items-center justify-between px-2 pb-6">
            <Brand collapsed={false} />
            <button
              onClick={onMobileClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="flex-1 space-y-1" aria-label="Main navigation">
            {navItems.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                active={currentPath === item.href || (item.href !== "/" && currentPath.startsWith(item.href))}
                collapsed={false}
                
                
                
              />
            ))}
          </nav>
          <div className="mt-auto pt-4 border-t border-sidebar-border space-y-1">
            {bottomItems.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                active={currentPath === item.href}
                collapsed={false}
                
                
                
              />
            ))}
          </div>
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col fixed top-0 left-0 z-30 h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-none transition-all duration-300 ease-out",
          collapsed ? "w-16" : "w-[14.5rem]"
        )}
        role="navigation"
        aria-label="Sidebar"
      >
        <div className="flex h-full flex-col px-2.5 py-4">
          <div className="flex items-center justify-between px-1.5 pb-5">
            <Brand collapsed={collapsed} />
            <button
              onClick={onToggle}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            </button>
          </div>

          <nav className="flex-1 space-y-0.5" aria-label="Main navigation">
            {navItems.map((item) => (
              <div key={item.href} className="relative">
                <SidebarLink
                  item={item}
                  active={currentPath === item.href || (item.href !== "/" && currentPath.startsWith(item.href))}
                  collapsed={collapsed}
                  
                  
                  
                />
                {/* Tooltip when collapsed */}
                {collapsed && false && (
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 rounded-md bg-foreground text-background px-2.5 py-1 text-xs font-medium whitespace-nowrap shadow-xl pointer-events-none">
                    {item.label}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="mt-auto pt-3 border-t border-sidebar-border space-y-0.5">
            {bottomItems.map((item) => (
              <div key={item.href} className="relative">
                <SidebarLink
                  item={item}
                  active={currentPath === item.href}
                  collapsed={collapsed}
                  
                  
                  
                />
                {collapsed && false && (
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 rounded-md bg-foreground text-background px-2.5 py-1 text-xs font-medium whitespace-nowrap shadow-xl pointer-events-none">
                    {item.label}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <a href="/" className="flex items-center gap-2.5 px-1 group" aria-label="Datavora Home">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary shadow-sm ring-1 ring-primary/10">
        <Sparkles className="h-4 w-4 text-primary-foreground" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <div className="text-base font-semibold leading-none tracking-tight text-foreground">Datavora</div>
          <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 tracking-wide">Performance-first analytics</div>
        </div>
      )}
    </a>
  );
}

function SidebarLink({
  item,
  active,
  collapsed,
}: {
  item: (typeof navItems)[0];
  active: boolean;
  collapsed: boolean;


  
}) {
  const Icon = item.icon;
  return (
    <a
      href={item.href}
      
      
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
        collapsed ? "justify-center px-2" : "",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm ring-1 ring-sidebar-primary/20"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className={cn("h-4 w-4 shrink-0", collapsed ? "h-[18px] w-[18px]" : "")} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </a>
  );
}
