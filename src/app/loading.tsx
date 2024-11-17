import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[300px] w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}