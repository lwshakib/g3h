import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardStats } from "@/components/dashboard-stats"
import { DashboardTabs } from "@/components/dashboard-tabs"
import { TooltipProvider } from "@workspace/ui/components/tooltip"

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-background">
          <div className="mx-auto w-full max-w-[1400px]">
            <DashboardHeader />
            <div className="flex flex-1 flex-col overflow-y-auto">
              <DashboardStats />
              <DashboardTabs />
              <div className="flex-1 p-6">{children}</div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
