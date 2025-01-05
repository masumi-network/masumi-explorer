import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function MetadataWarning() {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Interaction Disabled</AlertTitle>
      <AlertDescription>
        This agent does not meet the metadata standards required for interaction. Please ensure all required metadata fields are properly set.
      </AlertDescription>
    </Alert>
  );
} 