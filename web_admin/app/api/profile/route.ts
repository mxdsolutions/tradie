import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // In a real app, we'd get the user ID from the session/cookie
        // For now, we'll fetch the first admin user or a fixed test user if needed
        // Ideally we'd have middleware setting a header with the user ID
        
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
        if (authError || !users.length) throw new Error("Could not find any users");

        const testUser = users[0];
        
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", testUser.id)
            .single();

        if (profileError) throw profileError;

        return NextResponse.json({
            user: {
                id: testUser.id,
                email: testUser.email,
                firstName: profile.full_name?.split(' ')[0] || "",
                lastName: profile.full_name?.split(' ').slice(1).join(' ') || "",
                role: profile.role
            }
        });
    } catch (error: any) {
        console.error("Profile API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, firstName, lastName, email } = body;

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { error: updateError } = await supabase
            .from("profiles")
            .update({
                full_name: `${firstName} ${lastName}`.trim(),
            })
            .eq("id", id);

        if (updateError) throw updateError;

        // Note: updating email would require auth update if implemented

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
