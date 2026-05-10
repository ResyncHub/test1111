import { SupabaseClient } from "@supabase/supabase-js";

type ToolInput = Record<string, unknown>;

export interface ToolResult {
  tool_use_id: string;
  type: "tool_result";
  content: string;
  navigate?: { route: string; job_id?: string; customer_id?: string };
}

export async function executeTool(
  toolName: string,
  toolInput: ToolInput,
  toolUseId: string,
  supabase: SupabaseClient
): Promise<ToolResult> {
  let content: string;
  let navigate: ToolResult["navigate"] | undefined;

  try {
    switch (toolName) {

      // ---------- ZLECENIA ----------

      case "create_job": {
        const { data, error } = await supabase
          .from("jobs")
          .insert({
            title:            toolInput.title,
            customer_id:      toolInput.customer_id ?? null,
            category_id:      toolInput.category_id ?? null,
            description:      toolInput.description ?? null,
            status:           "nowe",
            scheduled_at:     toolInput.scheduled_at ?? null,
            scheduled_end_at: toolInput.scheduled_end_at ?? null,
            address:          toolInput.address ?? null,
            revenue:          toolInput.revenue ?? 0,
            notes:            toolInput.notes ?? null,
          })
          .select("*, customer:customers(full_name)")
          .single();
        if (error) throw error;
        content = JSON.stringify({ success: true, job: data, message: `Zlecenie "${data.title}" zostało utworzone. ID: ${data.id}` });
        break;
      }

      case "update_job": {
        const { job_id, ...fields } = toolInput;
        const { data, error } = await supabase
          .from("jobs")
          .update({ ...fields, updated_at: new Date().toISOString() })
          .eq("id", job_id as string)
          .select()
          .single();
        if (error) throw error;
        content = JSON.stringify({ success: true, job: data });
        break;
      }

      case "list_jobs": {
        let query = supabase
          .from("jobs")
          .select("id,title,status,scheduled_at,revenue,customer:customers(full_name)")
          .order("scheduled_at", { ascending: false })
          .limit((toolInput.limit as number) ?? 20);
        if (toolInput.status) query = query.eq("status", toolInput.status as string);
        if (toolInput.customer_id) query = query.eq("customer_id", toolInput.customer_id as string);
        if (toolInput.date_from) query = query.gte("scheduled_at", toolInput.date_from as string);
        if (toolInput.date_to)   query = query.lte("scheduled_at", toolInput.date_to as string);
        const { data, error } = await query;
        if (error) throw error;
        content = JSON.stringify(data);
        break;
      }

      case "get_job": {
        const { data, error } = await supabase
          .from("jobs")
          .select("*, customer:customers(*), category:service_categories(*), costs:job_costs(*)")
          .eq("id", toolInput.job_id as string)
          .single();
        if (error) throw error;
        content = JSON.stringify(data);
        break;
      }

      case "delete_job": {
        const { error } = await supabase.from("jobs").delete().eq("id", toolInput.job_id as string);
        if (error) throw error;
        content = JSON.stringify({ success: true, message: "Zlecenie usunięte." });
        break;
      }

      // ---------- KLIENCI ----------

      case "create_customer": {
        const { data, error } = await supabase
          .from("customers")
          .insert({
            full_name: toolInput.full_name,
            phone:     toolInput.phone ?? null,
            email:     toolInput.email ?? null,
            address:   toolInput.address ?? null,
            city:      toolInput.city ?? null,
            notes:     toolInput.notes ?? null,
          })
          .select()
          .single();
        if (error) throw error;
        content = JSON.stringify({ success: true, customer: data, message: `Klient "${data.full_name}" dodany. ID: ${data.id}` });
        break;
      }

      case "update_customer": {
        const { customer_id, ...fields } = toolInput;
        const { data, error } = await supabase
          .from("customers")
          .update({ ...fields, updated_at: new Date().toISOString() })
          .eq("id", customer_id as string)
          .select()
          .single();
        if (error) throw error;
        content = JSON.stringify({ success: true, customer: data });
        break;
      }

      case "search_customers": {
        const { data, error } = await supabase
          .from("customers")
          .select("id,full_name,phone,city")
          .ilike("full_name", `%${toolInput.query}%`)
          .limit((toolInput.limit as number) ?? 10);
        if (error) throw error;
        content = JSON.stringify(data);
        break;
      }

      case "get_customer": {
        const [customerRes, jobsRes] = await Promise.all([
          supabase.from("customers").select("*").eq("id", toolInput.customer_id as string).single(),
          supabase.from("jobs").select("id,title,status,scheduled_at,revenue").eq("customer_id", toolInput.customer_id as string).order("scheduled_at", { ascending: false }),
        ]);
        if (customerRes.error) throw customerRes.error;
        content = JSON.stringify({ ...customerRes.data, jobs: jobsRes.data ?? [] });
        break;
      }

      // ---------- KOSZTY ----------

      case "add_job_cost": {
        const { data, error } = await supabase
          .from("job_costs")
          .insert({
            job_id:      toolInput.job_id,
            description: toolInput.description,
            amount:      toolInput.amount,
            cost_date:   toolInput.cost_date ?? new Date().toISOString().split("T")[0],
          })
          .select()
          .single();
        if (error) throw error;
        content = JSON.stringify({ success: true, cost: data });
        break;
      }

      case "delete_job_cost": {
        const { error } = await supabase.from("job_costs").delete().eq("id", toolInput.cost_id as string);
        if (error) throw error;
        content = JSON.stringify({ success: true });
        break;
      }

      // ---------- KALENDARZ ----------

      case "get_calendar_events": {
        const { data, error } = await supabase
          .from("jobs")
          .select("id,title,status,scheduled_at,scheduled_end_at,customer:customers(full_name)")
          .gte("scheduled_at", toolInput.date_from as string)
          .lte("scheduled_at", toolInput.date_to as string)
          .not("scheduled_at", "is", null);
        if (error) throw error;
        content = JSON.stringify(data);
        break;
      }

      // ---------- FINANSE ----------

      case "get_financial_summary": {
        if (toolInput.month) {
          const { data, error } = await supabase.rpc("monthly_summary", { p_year: toolInput.year, p_month: toolInput.month });
          if (error) throw error;
          content = JSON.stringify(data?.[0] ?? { total_revenue: 0, total_costs: 0, profit: 0, job_count: 0 });
        } else {
          const months = await Promise.all(
            Array.from({ length: 12 }, (_, i) =>
              supabase.rpc("monthly_summary", { p_year: toolInput.year, p_month: i + 1 }).then(r => ({ month: i + 1, ...(r.data?.[0] ?? {}) }))
            )
          );
          content = JSON.stringify(months);
        }
        break;
      }

      case "get_dashboard_stats": {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
        const endOfDay   = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

        const [todayJobs, unpaidJobs, openJobs] = await Promise.all([
          supabase.from("jobs").select("id", { count: "exact" }).gte("scheduled_at", startOfDay).lt("scheduled_at", endOfDay),
          supabase.from("jobs").select("id", { count: "exact" }).eq("status", "zakonczone"),
          supabase.from("jobs").select("id", { count: "exact" }).in("status", ["nowe","w_trakcie"]),
        ]);
        content = JSON.stringify({
          todayJobsCount: todayJobs.count ?? 0,
          unpaidJobsCount: unpaidJobs.count ?? 0,
          openJobsCount: openJobs.count ?? 0,
        });
        break;
      }

      // ---------- KATEGORIE ----------

      case "list_service_categories": {
        const { data, error } = await supabase.from("service_categories").select("*").order("name");
        if (error) throw error;
        content = JSON.stringify(data);
        break;
      }

      // ---------- NAWIGACJA ----------

      case "navigate_to": {
        let route = toolInput.route as string;
        if (toolInput.job_id)      route = `/jobs/${toolInput.job_id}`;
        if (toolInput.customer_id) route = `/customers/${toolInput.customer_id}`;
        navigate = { route, job_id: toolInput.job_id as string, customer_id: toolInput.customer_id as string };
        content = JSON.stringify({ navigating: true, route });
        break;
      }

      default:
        content = JSON.stringify({ error: `Nieznane narzędzie: ${toolName}` });
    }
  } catch (err) {
    content = JSON.stringify({ error: err instanceof Error ? err.message : String(err) });
  }

  return { tool_use_id: toolUseId, type: "tool_result", content, navigate };
}
