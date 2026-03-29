import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { count: candidateCount } = await supabase
    .from("candidates")
    .select("*", { count: "exact", head: true });

  const { count: completedCount } = await supabase
    .from("candidates")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed");

  const { count: pendingRefCount } = await supabase
    .from("referees")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "email_sent"]);

  const { count: fraudCount } = await supabase
    .from("fraud_signals")
    .select("*", { count: "exact", head: true })
    .eq("dismissed", false)
    .in("severity", ["high", "critical"]);

  const { data: recentCandidates } = await supabase
    .from("candidates")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    { label: "Total Candidates", value: candidateCount ?? 0, icon: Users, color: "text-blue-600" },
    { label: "Completed", value: completedCount ?? 0, icon: CheckCircle, color: "text-green-600" },
    { label: "Pending References", value: pendingRefCount ?? 0, icon: FileText, color: "text-yellow-600" },
    { label: "Fraud Alerts", value: fraudCount ?? 0, icon: AlertTriangle, color: "text-red-600" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your reference checks</p>
        </div>
        <Link href="/candidates/new">
          <Button>Add Candidate</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          {recentCandidates && recentCandidates.length > 0 ? (
            <div className="space-y-3">
              {recentCandidates.map((candidate) => (
                <Link
                  key={candidate.id}
                  href={`/candidates/${candidate.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{candidate.full_name}</p>
                    <p className="text-sm text-muted-foreground">{candidate.position_applied}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    candidate.status === "completed" ? "bg-green-100 text-green-800" :
                    candidate.status === "submitted" ? "bg-purple-100 text-purple-800" :
                    candidate.status === "invited" ? "bg-blue-100 text-blue-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {candidate.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No candidates yet.</p>
              <Link href="/candidates/new">
                <Button variant="outline" className="mt-2">Add your first candidate</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
