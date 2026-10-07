import * as React from "react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"

type Order = {
  id: string
  customer: string
  date: string
  total: number
  status: OrderStatus
}

const orders: Order[] = [
  { id: "ORD-1001", customer: "Ava Thompson", date: "2026-09-28", total: 120.5, status: "delivered" },
  { id: "ORD-1002", customer: "Liam Chen", date: "2026-09-29", total: 89.0, status: "shipped" },
  { id: "ORD-1003", customer: "Noah Patel", date: "2026-09-30", total: 342.75, status: "processing" },
  { id: "ORD-1004", customer: "Mia Garcia", date: "2026-10-01", total: 45.99, status: "pending" },
  { id: "ORD-1005", customer: "Ethan Brown", date: "2026-10-02", total: 210.0, status: "cancelled" },
  { id: "ORD-1006", customer: "Sofia Rossi", date: "2026-10-03", total: 75.25, status: "refunded" },
]

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  },
  processing: {
    label: "Processing",
    className: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
  },
  shipped: {
    label: "Shipped",
    className: "border-transparent bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300",
  },
  delivered: {
    label: "Delivered",
    className: "border-transparent bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-transparent bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300",
  },
  refunded: {
    label: "Refunded",
    className: "border-transparent bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300",
  },
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = statusConfig[status]
  return <Badge className={className}>{label}</Badge>
}

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

export default function OrdersTableScreen() {
  return (
    <div className="mx-auto max-w-4xl p-6">
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
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right">{currency.format(order.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
