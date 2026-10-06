import * as React from "react";
import {
  CircleCheck,
  CircleDashed,
  CircleX,
  Clock,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled";

type Order = {
  id: string;
  customer: string;
  placed: string;
  total: number;
  status: OrderStatus;
};

// Every status pairs an icon with a word. Color is never the only signal.
const STATUS: Record<
  OrderStatus,
  {
    label: string;
    icon: LucideIcon;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  pending: { label: "Pending", icon: Clock, variant: "outline" },
  shipped: { label: "Shipped", icon: Truck, variant: "secondary" },
  delivered: { label: "Delivered", icon: CircleCheck, variant: "default" },
  cancelled: { label: "Cancelled", icon: CircleX, variant: "destructive" },
};

const ORDERS: Order[] = [
  { id: "ORD-1042", customer: "Amara Okafor", placed: "2026-10-05", total: 184.5, status: "pending" },
  { id: "ORD-1041", customer: "Liam Becker", placed: "2026-10-04", total: 62.0, status: "shipped" },
  { id: "ORD-1040", customer: "Sofia Marquez", placed: "2026-10-03", total: 349.99, status: "delivered" },
  { id: "ORD-1039", customer: "Noah Lindqvist", placed: "2026-10-02", total: 27.25, status: "cancelled" },
  { id: "ORD-1038", customer: "Priya Raman", placed: "2026-10-01", total: 112.4, status: "delivered" },
  { id: "ORD-1037", customer: "Hiro Tanaka", placed: "2026-09-30", total: 88.0, status: "shipped" },
];

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, icon: Icon, variant } = STATUS[status];
  return (
    <Badge variant={variant}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}

export default function OrdersList() {
  const [filter, setFilter] = React.useState<"all" | OrderStatus>("all");

  const rows = filter === "all" ? ORDERS : ORDERS.filter((o) => o.status === filter);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <Select value={filter} onValueChange={(v) => setFilter(v as "all" | OrderStatus)}>
          <SelectTrigger className="w-44" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(Object.keys(STATUS) as OrderStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border py-16 text-center">
          <CircleDashed aria-hidden="true" className="size-6 text-muted-foreground" />
          <p className="font-medium">No orders with this status</p>
          <p className="text-sm text-muted-foreground">Choose another status to see more orders.</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Placed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-semibold">{o.id}</TableCell>
                  <TableCell>{o.customer}</TableCell>
                  <TableCell>{dateFmt.format(new Date(o.placed))}</TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{money.format(o.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="mt-3 text-sm text-muted-foreground">
        1-{rows.length} of {rows.length}
      </p>
    </main>
  );
}
