export const statusLabels: Record<string, string> = {
  pending_review: "Pending Review", approved: "Approved", rejected: "Rejected",
  in_progress: "In Progress", completed: "Completed", cancelled: "Cancelled",
};

export const statusColors: Record<string, string> = {
  pending_review: "bg-muted text-foreground border-border",
  approved: "bg-accent/10 text-accent border-accent/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
  in_progress: "bg-primary/10 text-primary border-primary/30",
  completed: "bg-accent/10 text-accent border-accent/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export const invoiceReference = (id: string) => `INV-RDZ-${id.slice(0, 8).toUpperCase()}`;

export function matchesOrderSearch(order: { id: string; plan_title: string; trx_id?: string | null; customer_name?: string; customer_email?: string }, search: string) {
  const query = search.trim().toLowerCase();
  return [order.id, invoiceReference(order.id), order.plan_title, order.trx_id, order.customer_name, order.customer_email]
    .some((value) => value?.toLowerCase().includes(query));
}

export const canCancelOrder = (status: string) => ["pending_review", "approved"].includes(status);

export async function withRequestTimeout<T>(request: PromiseLike<T>, ms = 12000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(request),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("Request timeout")), ms); }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function requestErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message :
    error && typeof error === "object" && "message" in error ? String(error.message) : "";
  if (message.includes("timeout")) return "This is taking longer than expected. Refresh to check whether your change was saved before trying again.";
  if (!navigator.onLine) return "You're offline. Check your connection, then try again.";
  return "We couldn't complete this request. Please try again. If it keeps happening, contact ReadzRaw.";
}