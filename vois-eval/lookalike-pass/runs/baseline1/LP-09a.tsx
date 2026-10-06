import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, Truck, XCircle } from "lucide-react";

type Status = "Pending" | "Shipped" | "Delivered" | "Cancelled";

type Order = {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: Status;
};

const orders: Order[] = [
  { id: "ORD-1001", customer: "Ava Thompson", date: "2026-09-28", total: 124.5, status: "Pending" },
  { id: "ORD-1002", customer: "Liam Chen", date: "2026-09-27", total: 89.0, status: "Shipped" },
  { id: "ORD-1003", customer: "Noah Patel", date: "2026-09-25", total: 342.75, status: "Delivered" },
  { id: "ORD-1004", customer: "Mia Rossi", date: "2026-09-24", total: 58.2, status: "Cancelled" },
  { id: "ORD-1005", customer: "Ethan Brooks", date: "2026-09-22", total: 210.0, status: "Delivered" },
  { id: "ORD-1006", customer: "Sofia Garcia", date: "2026-09-21", total: 76.9, status: "Shipped" },
];

const statusConfig: Record<
  Status,
  { icon: React.ElementType; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  Pending: { icon: Clock, variant: "secondary" },
  Shipped: { icon: Truck, variant: "outline" },
  Delivered: { icon: CheckCircle2, variant: "default" },
  Cancelled: { icon: XCircle, variant: "destructive" },
};

function StatusBadge({ status }: { status: Status }) {
  const { icon: Icon, variant } = statusConfig[status];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="size-3" aria-hidden="true" />
      {status}
    </Badge>
  );
}

export default function OrdersTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell className="text-right tabular-nums">
                  ${order.total.toFixed(2)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
