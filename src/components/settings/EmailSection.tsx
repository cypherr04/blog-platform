import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Mail } from "lucide-react"

interface EmailSectionProps {
  user: any
}

export function EmailSection({ user }: EmailSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Address
        </CardTitle>
        <CardDescription>Your email address is associated with your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Input value={user?.email || ""} disabled className="flex-1" />
          <Badge className="bg-secondary text-secondary-foreground">Verified</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Email changes must be done through account security settings.
        </p>
      </CardContent>
    </Card>
  )
}
