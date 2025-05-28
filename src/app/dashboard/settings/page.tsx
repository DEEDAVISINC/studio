import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your application settings.</p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-primary" />
            Application Settings
          </CardTitle>
          <CardDescription>This section is under development. Future settings will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Customize your FleetFlow experience, manage notifications, user preferences, and more.
          </p>
          {/* Placeholder for future settings components */}
          <div className="mt-6 p-8 border-2 border-dashed border-border rounded-lg text-center">
            <p className="text-lg font-medium text-muted-foreground">More settings coming soon!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
