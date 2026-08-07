import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  FlaskConical,
  FolderTree,
  Film,
  Image as ImageIcon,
  LayoutDashboard,
  Loader2,
  LogOut,
  type LucideIcon,
  Mail,
  MessageSquare,
  MessageSquareQuote,
  Package,
  ShieldAlert,
  Tags,
  Users,
} from "lucide-react";
import AdminUsers from "./AdminUsers";
import AdminLabReports from "./AdminLabReports";
import AdminCategories from "./AdminCategories";
import AdminAssets from "./AdminAssets";
import AdminProducts from "./AdminProducts";
import AdminProductCategories from "./AdminProductCategories";
import AdminLeads from "./AdminLeads";
import AdminPopups from "./AdminPopups";
import AdminReels from "./AdminReels";
import AdminReviews from "./AdminReviews";

type AdminTab =
  | "overview"
  | "products"
  | "product-categories"
  | "lab-reports"
  | "lab-categories"
  | "assets"
  | "popups"
  | "reels"
  | "reviews"
  | "leads"
  | "users";

const NAV_ITEMS: { id: AdminTab; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "product-categories", label: "Product Categories", icon: Tags },
  { id: "lab-reports", label: "Lab Reports", icon: FlaskConical },
  { id: "lab-categories", label: "Lab Categories", icon: FolderTree },
  { id: "assets", label: "Assets", icon: ImageIcon },
  { id: "popups", label: "Popups", icon: MessageSquare },
  { id: "reels", label: "Reels", icon: Film },
  { id: "reviews", label: "Reviews", icon: MessageSquareQuote },
  { id: "leads", label: "Leads", icon: Mail },
  { id: "users", label: "Users", icon: Users },
];

function StatCard({
  label,
  value,
  icon: Icon,
  isLoading,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  isLoading: boolean;
}) {
  return (
    <Card className="min-w-[160px] flex-1 gap-3 py-5">
      <CardContent className="flex items-center gap-4 px-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          {isLoading ? (
            <Skeleton className="h-7 w-12" />
          ) : (
            <div className="font-condensed text-2xl leading-none font-black text-foreground">
              {value}
            </div>
          )}
          <div className="mt-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {label}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Overview() {
  const { data: stats, isLoading: statsLoading } = trpc.admin.stats.useQuery();
  const { data: categories, isLoading: catsLoading } =
    trpc.admin.categories.list.useQuery();
  const { data: reports, isLoading: reportsLoading } =
    trpc.admin.labReports.listAdmin.useQuery();

  return (
    <div className="space-y-6">
      <h2 className="font-condensed text-2xl font-black text-foreground">
        Dashboard Overview
      </h2>

      <div className="flex flex-wrap gap-4">
        <StatCard
          label="Total Users"
          value={stats?.users ?? 0}
          icon={Users}
          isLoading={statsLoading}
        />
        <StatCard
          label="Lab Reports"
          value={stats?.labReports ?? 0}
          icon={FlaskConical}
          isLoading={statsLoading}
        />
        <StatCard
          label="Categories"
          value={stats?.categories ?? 0}
          icon={FolderTree}
          isLoading={statsLoading}
        />
      </div>

      <Card>
        <CardContent className="px-5">
          <h3 className="mb-4 font-condensed text-lg font-extrabold text-foreground">
            Recent Lab Reports
          </h3>
          {reportsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : !reports || reports.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
              <FlaskConical size={28} className="opacity-50" />
              <p className="text-sm">
                No lab reports yet. Upload your first report in the Lab Reports
                tab.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {reports.slice(0, 5).map(r => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-primary/5 px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {r.title}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {r.productName} · {r.testDate}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold ${
                      r.isPublished
                        ? "bg-primary/20 text-primary"
                        : "bg-accent/20 text-accent"
                    }`}
                  >
                    {r.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-5">
          <h3 className="mb-4 font-condensed text-lg font-extrabold text-foreground">
            Report Categories
          </h3>
          {catsLoading ? (
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-7 w-24 rounded-full" />
              ))}
            </div>
          ) : !categories || categories.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
              <FolderTree size={28} className="opacity-50" />
              <p className="text-sm">
                No categories yet. Create one in the Categories tab.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <span
                  key={cat.id}
                  className="rounded-full border border-accent/30 bg-accent/15 px-3 py-1 text-sm font-semibold text-foreground"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDashboardLoading() {
  return (
    <div className="admin-shell flex min-h-screen items-center justify-center bg-background">
      <div className="flex items-center gap-3 text-primary">
        <Loader2 className="animate-spin" size={22} />
        <span className="font-condensed text-lg font-extrabold">
          Loading...
        </span>
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="admin-shell flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
      <ShieldAlert size={48} className="text-accent" />
      <h1 className="font-condensed text-3xl font-black text-foreground">
        Access Denied
      </h1>
      <p className="text-muted-foreground">
        You need admin privileges to access this area.
      </p>
      <Link
        href="/"
        className="mt-1 inline-flex items-center gap-1.5 font-bold text-primary hover:underline"
      >
        <ArrowLeft size={15} /> Back to Store
      </Link>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<AdminTab>("overview");

  useEffect(() => {
    if (!loading && !user) setLocation("/login");
  }, [loading, user, setLocation]);

  if (loading || !user) return <AdminDashboardLoading />;
  if (user.role !== "admin") return <AccessDenied />;

  const activeItem = NAV_ITEMS.find(n => n.id === tab)!;
  const initial = (user.name || user.email).charAt(0).toUpperCase();

  return (
    // Fixed to the viewport height (not min-height) so the page itself never
    // grows taller than the screen — that's what makes <main> below the only
    // scrolling region, while the sidebar (already `fixed` on desktop, a
    // Sheet drawer on mobile) stays put.
    <SidebarProvider className="admin-shell h-svh overflow-hidden">
      <Sidebar collapsible="icon">
        <SidebarHeader className="h-14 justify-center border-b border-sidebar-border px-3">
          <div className="flex items-center gap-2 font-condensed text-lg font-black text-sidebar-foreground">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm text-sidebar-primary-foreground">
              P
            </div>
            <span className="truncate group-data-[collapsible=icon]:hidden">
              Purple Co Admin
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu className="px-2 py-2">
            {NAV_ITEMS.map(item => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={tab === item.id}
                  onClick={() => setTab(item.id)}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center">
                <Avatar className="h-8 w-8 shrink-0 border border-sidebar-border">
                  <AvatarFallback className="bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                  <p className="truncate text-sm font-semibold text-sidebar-foreground">
                    {user.name || user.email}
                  </p>
                  <p className="truncate text-xs text-sidebar-foreground/60">
                    {user.email}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => setLocation("/")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Store
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={logout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
          <SidebarTrigger />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-xs font-semibold tracking-wide uppercase">
              Purple Co
            </span>
            <span>/</span>
            <span className="font-condensed text-base font-extrabold text-foreground">
              {activeItem.label}
            </span>
          </div>
          <div className="ml-auto hidden items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-xs font-semibold text-foreground">
              {user.name || user.email}
            </span>
            <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[0.65rem] font-extrabold tracking-wide text-accent uppercase">
              Admin
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {tab === "overview" && <Overview />}
          {tab === "products" && <AdminProducts />}
          {tab === "product-categories" && <AdminProductCategories />}
          {tab === "lab-reports" && <AdminLabReports />}
          {tab === "lab-categories" && <AdminCategories />}
          {tab === "assets" && <AdminAssets />}
          {tab === "popups" && <AdminPopups />}
          {tab === "reels" && <AdminReels />}
          {tab === "reviews" && <AdminReviews />}
          {tab === "leads" && <AdminLeads />}
          {tab === "users" && <AdminUsers />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
