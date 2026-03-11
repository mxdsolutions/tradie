import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Total Users
        const { count: totalUsers } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true });

        // 2. New Users (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { count: newUsers } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .gte("created_at", thirtyDaysAgo.toISOString());

        // 3. Active Projects (status not completed)
        const { count: activeProjects } = await supabase
            .from("projects")
            .select("*", { count: "exact", head: true })
            .neq("status", "completed");

        // 4. Active Jobs (status not completed or cancelled)
        const { count: activeJobs } = await supabase
            .from("jobs")
            .select("*", { count: "exact", head: true })
            .in("status", ["pending", "assigned", "in_progress"]);

        // 5. Total Revenue (sum of completed jobs cost)
        const { data: completedJobs } = await supabase
            .from("jobs")
            .select("cost")
            .eq("status", "completed");
        
        const totalRevenue = completedJobs?.reduce((sum, job) => sum + (job.cost || 0), 0) || 0;

        // 6. Recent Transactions (last 5 completed jobs)
        const { data: recentTransactions } = await supabase
            .from("jobs")
            .select(`
                id,
                cost,
                status,
                completed_at,
                project:projects(title),
                tradie:profiles(full_name)
            `)
            .eq("status", "completed")
            .order("completed_at", { ascending: false })
            .limit(5);

        return NextResponse.json({
            stats: {
                totalUsers: totalUsers || 0,
                newUsers: newUsers || 0,
                activeProjects: activeProjects || 0,
                activeJobs: activeJobs || 0,
                totalRevenue: totalRevenue,
            },
            recentTransactions: recentTransactions?.map(t => ({
                id: t.id,
                user: t.tradie ? (t.tradie as any).full_name : "System",
                action: `Job completed: ${t.project ? (t.project as any).title : "Untitled Project"}`,
                amount: `$${(t.cost || 0).toFixed(2)}`,
                status: "Success",
                date: t.completed_at ? new Date(t.completed_at).toLocaleDateString() : "Just now"
            })) || []
        });
    } catch (error: any) {
        console.error("Stats API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
