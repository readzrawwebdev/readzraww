import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { withRequestTimeout } from "@/lib/orders";

export const useOrders = (admin = false) => {
  const { user, isAdmin } = useAuth();
  return useQuery({
    queryKey: ["orders", admin ? "admin" : "customer", user?.id],
    enabled: Boolean(user && (!admin || isAdmin)),
    queryFn: async () => {
      if (!user) return [];
      let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (!admin) query = query.eq("user_id", user.id);
      const { data, error } = await withRequestTimeout(query);
      if (error) throw error;
      return data ?? [];
    },
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });
};