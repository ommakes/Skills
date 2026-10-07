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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

type Order = {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: OrderStatus;
};

const ORDERS: Order[] = [
  { id: "ORD-1001", customer: "Ava Thompson", date: "2026-10-01", total: 129.99, status: "delivered" },
  { id: "ORD-1002", customer: "Liam Carter", date: "2026-10-02", total: 54.5, status: "shipped" },
  { id: "ORD-1003", customer: "Noah Patel", date: "2026-10-03", total: 312.0, status: "processing" },
  { id: "ORD-1004", customer: "Emma Rossi", date: "2026-10-04", total: 18.75, status: "pending" },
  { id: "ORD-1005", customer: "Olivia Kim", date: "2026-10-05", total: 76.2, status: "cancelled" },
];

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }
> = {
  pending: { label: "Pending", variant: "outline" },
  processing: { label: "Processing", variant: "secondary" },
  shipped: { label: "Shipped", variant: "default" },
  delivered: { label: "Delivered", variant: "default" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function OrdersList() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Recent orders and their current status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ORDERS.map((order) => {
                const status = STATUS_CONFIG[order.status];
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{currency.format(order.total)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
