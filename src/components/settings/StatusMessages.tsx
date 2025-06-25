import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle } from "lucide-react"

interface StatusMessagesProps {
  error: string | null
  success: string | null
}

export function StatusMessages({ error, success }: StatusMessagesProps) {
  if (!error && !success) return null

  return (
    <div className="space-y-4">
      {error && (
        <Alert className="border-destructive text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
