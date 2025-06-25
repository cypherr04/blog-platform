import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"

interface AccountTabProps {
  user: any
}

export function AccountTab({ user }: AccountTabProps) {
  return (
    <div className="space-y-6">
      {/* Email Section */}
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

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>View your account details and membership information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Account ID</Label>
              <p className="text-sm text-muted-foreground font-mono">{user?.id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Member Since</Label>
              <p className="text-sm text-muted-foreground">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Last Sign In</Label>
              <p className="text-sm text-muted-foreground">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "Unknown"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Account Status</Label>
              <Badge>Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
