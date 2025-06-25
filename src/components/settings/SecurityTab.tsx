"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Trash2 } from "lucide-react"

interface SecurityTabProps {
  onPasswordChange: () => void
}

export function SecurityTab({ onPasswordChange }: SecurityTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Password & Security
          </CardTitle>
          <CardDescription>Manage your password and account security settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Change Password</h4>
              <p className="text-sm text-muted-foreground">Update your password to keep your account secure.</p>
            </div>
            <Button variant="outline" className="bg-background text-foreground border" onClick={onPasswordChange}>
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible and destructive actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
            <div>
              <h4 className="font-medium text-destructive">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all of your content. This action cannot be undone.
              </p>
            </div>
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                  alert("Account deletion functionality will be implemented in the future.")
                }
              }}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
