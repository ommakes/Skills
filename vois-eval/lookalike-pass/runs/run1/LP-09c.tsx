import * as React from "react"
import { CheckCircle2, Clock, Truck, XCircle, PackageCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type OrderStatus = "pending" | "shipped" | "delivered" | "cancelled" | "paid"

type Order = {
  id: string
  customer: string
  date: string
  total: number
  status: OrderStatus
}

const ORDERS: Order[] = [
  { id: "ORD-1042", customer: "Ava Thompson", date: "2026-10-01", total: 128.5, status: "paid" },
  { id: "ORD-1041", customer: "Liam Carter", date: "2026-09-30", total: 54.0, status: "pending" },
  { id: "ORD-1040", customer: "Noah Singh", date: "2026-09-29", total: 312.75, status: "shipped" },
  { id: "ORD-1039", customer: "Mia Rossi", date: "2026-09-27", total: 89.99, status: "delivered" },
  { id: "ORD-1038", customer: "Ethan Park", date: "2026-09-25", total: 205.0, status: "cancelled" },
]

// Each status pairs a Badge variant (token-driven color) with an icon and a text label,
// so color is never the only signal.
const STATUS: Record<
  OrderStatus,
  {
    label: string
    variant: React.ComponentProps<typeof Badge>["variant"]
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  }
> = {
  pending: { label: "Pending", variant: "outline", Icon: Clock },
  paid: { label: "Paid", variant: "secondary", Icon: CheckCircle2 },
  shipped: { label: "Shipped", variant: "default", Icon: Truck },
  delivered: { label: "Delivered", variant: "secondary", Icon: PackageCheck },
  cancelled: { label: "Cancelled", variant: "destructive", Icon: XCircle },
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, variant, Icon } = STATUS[status]
  return (
    <Badge variant={variant}>
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </Badge>
  )
}

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

export default function OrdersTable() {
  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-semibold text-foreground">Orders</h1>
      <div className="rounded-lg border border-border">
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
            {ORDERS.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-sm">{o.id}</TableCell>
                <TableCell>{o.customer}</TableCell>
                <TableCell className="text-muted-foreground">{o.date}</TableCell>
                <TableCell>
                  <StatusBadge status={o.status} />
                </TableCell>
                <TableCell className="text-right tabular-nums">{currency.format(o.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
