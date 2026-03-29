import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p>{profile?.full_name || "—"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p>{user.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Company</p>
            <p>{profile?.company_name || "—"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Plan</p>
            <p className="capitalize">{profile?.plan || "free"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Credits Remaining</p>
            <p>{profile?.credits_remaining ?? 10}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
