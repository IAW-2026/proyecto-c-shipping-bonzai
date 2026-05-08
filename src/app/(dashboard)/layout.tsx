import { syncUserProfile } from "@/lib/auth-helpers"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await syncUserProfile()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {children}
      </div>
    </div>
  )
}