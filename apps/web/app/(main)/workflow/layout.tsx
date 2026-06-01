import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"

export default function WorkflowLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-svh overflow-hidden bg-background">
        <div className="flex h-full w-full flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
