import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Menu,
  Database,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { listDatasets } from "@/api/datasets";
import { logout } from "@/api/auth";
import type { Dataset } from "@/types";

export function TopHeader({
  title,
  breadcrumb,
  onMenuClick,
}: {
  title: string;
  breadcrumb?: string;
  onMenuClick?: () => void;
}) {
  const navigate = useNavigate();

  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] =
    useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  /*
   * Dataset search
   */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setDatasets([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);

        const response = await listDatasets();

        if (
          response.success &&
          Array.isArray(response.data)
        ) {
          const query = searchQuery
            .trim()
            .toLowerCase();

          const results = response.data.filter(
            (dataset) =>
              dataset.name
                ?.toLowerCase()
                .includes(query) ||
              dataset.originalFileName
                ?.toLowerCase()
                .includes(query)
          );

          setDatasets(results.slice(0, 8));
        } else {
          setDatasets([]);
        }
      } catch (error) {
        console.error(
          "Dataset search error:",
          error
        );
        setDatasets([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  /*
   * Close search and profile menus when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      const target = event.target as Node;

      if (
        searchRef.current &&
        !searchRef.current.contains(target)
      ) {
        setSearchFocused(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleDatasetClick = (
    datasetId: string
  ) => {
    setSearchQuery("");
    setSearchFocused(false);

    navigate(`/datasets/${datasetId}`);
  };

  /*
   * Logout
   */
  const handleLogout = async () => {
  try {
    setLoggingOut(true);

    await logout();

    setLogoutDialogOpen(false);
    setProfileOpen(false);

    window.location.href = "/login";
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    setLoggingOut(false);
  }
};

  const showResults =
    searchFocused &&
    searchQuery.trim().length > 0;

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        {/* Left */}
        <div className="flex min-w-0 items-center gap-3">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}

          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold leading-tight tracking-tight text-foreground">
              {title}
            </h1>

            {breadcrumb && (
              <div className="mt-0.5 truncate text-xs font-medium leading-none text-muted-foreground">
                {breadcrumb}
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <div
            ref={searchRef}
            className="relative hidden sm:block"
          >
            <div
              className={cn(
                "relative flex items-center rounded-lg border bg-muted/60 transition-all duration-200",
                searchFocused
                  ? "w-72 border-ring ring-2 ring-ring/10"
                  : "w-56 border-transparent hover:border-border"
              )}
            >
              <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />

              <input
                type="text"
                value={searchQuery}
                placeholder="Search datasets..."
                onFocus={() =>
                  setSearchFocused(true)
                }
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Escape"
                  ) {
                    setSearchQuery("");
                    setSearchFocused(false);
                  }

                  if (
                    event.key === "Enter" &&
                    datasets.length > 0
                  ) {
                    handleDatasetClick(
                      datasets[0]._id
                    );
                  }
                }}
                className="h-8 w-full bg-transparent pl-8 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                aria-label="Search datasets"
                autoComplete="off"
              />
            </div>

            {/* Search results */}
            {showResults && (
              <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
                {searchLoading ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground">
                    Searching datasets...
                  </div>
                ) : datasets.length > 0 ? (
                  <div className="py-1">
                    <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Datasets
                    </div>

                    {datasets.map((dataset) => (
                      <button
                        key={dataset._id}
                        type="button"
                        onMouseDown={(event) =>
                          event.preventDefault()
                        }
                        onClick={() =>
                          handleDatasetClick(
                            dataset._id
                          )
                        }
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                          <Database className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {dataset.name}
                          </p>

                          <p className="truncate text-xs text-muted-foreground">
                            {dataset.fileType}
                            {" · "}
                            {(
                              dataset.rowCount || 0
                            ).toLocaleString()}{" "}
                            rows
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                        <Search className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-foreground">
                          No datasets found
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Try a different name
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notifications */}
          <button
            type="button"
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-muted"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />

            <span
              className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background"
              aria-hidden="true"
            />
          </button>

          {/* Theme */}
          <ModeToggle />

          {/* Profile */}
          <div
            ref={profileRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setProfileOpen(
                  (current) => !current
                )
              }
              className={cn(
                "flex h-8 w-8 items-center justify-center overflow-hidden rounded-full ring-2 ring-border ring-offset-1 transition-all hover:ring-ring",
                profileOpen &&
                  "ring-ring"
              )}
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
            >
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop&crop=face"
                alt="User"
                className="h-full w-full object-cover"
              />
            </button>

            {/* Profile dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
                {/* User header */}
                <div className="border-b border-border px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop&crop=face"
                      alt="User"
                      className="h-9 w-9 rounded-full object-cover"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        Account
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        DataForge User
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu */}
                <div className="p-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/settings");
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/settings");
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    Settings
                  </button>

                  <div className="my-1.5 h-px bg-border" />

                  <button
                    type="button"
                    onClick={() =>
                      setLogoutDialogOpen(true)
                    }
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout confirmation dialog */}
      {logoutDialogOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={() =>
            !loggingOut &&
            setLogoutDialogOpen(false)
          }
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            aria-describedby="logout-description"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
          >
            {/* Icon */}
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
              <LogOut className="h-5 w-5 text-destructive" />
            </div>

            <h2
              id="logout-title"
              className="text-lg font-semibold text-foreground"
            >
              Logout?
            </h2>

            <p
              id="logout-description"
              className="mt-2 text-sm leading-6 text-muted-foreground"
            >
              Are you sure you want to logout from
              DataForge?
            </p>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={loggingOut}
                onClick={() =>
                  setLogoutDialogOpen(false)
                }
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={loggingOut}
                onClick={handleLogout}
                className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loggingOut
                  ? "Logging out..."
                  : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}