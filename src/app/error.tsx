'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page Error:', error);
  }, [error]);

  return (
    <DashboardLayout>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Something went wrong!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {error.message || 'An error occurred while loading the page.'}
          </p>
          <Button onClick={reset}>Try again</Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}