import { CheckCircle2, Clock, Truck, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Status = "Pending" | "Shipped" | "Delivered" | "Cancelled"

type Order = {
  id: string
  customer: string
  date: string
  total: number
  status: Status
}

const ORDERS: Order[] = [
  { id: "ORD-1042", customer: "Amara Okafor", date: "Oct 4, 2026", total: 184.5, status: "Pending" },
  { id: "ORD-1041", customer: "Liam Chen", date: "Oct 3, 2026", total: 62.0, status: "Shipped" },
  { id: "ORD-1040", customer: "Sofia Rossi", date: "Oct 2, 2026", total: 340.25, status: "Delivered" },
  { id: "ORD-1039", customer: "Noah Williams", date: "Oct 1, 2026", total: 29.99, status: "Cancelled" },
  { id: "ORD-1038", customer: "Priya Patel", date: "Sep 30, 2026", total: 118.0, status: "Delivered" },
  { id: "ORD-1037", customer: "Mateo García", date: "Sep 29, 2026", total: 76.4, status: "Shipped" },
]

// Each status pairs a badge variant with an icon and a text label,
// so color is never the only signal.
const STATUS: Record<
  Status,
  { variant: "default" | "secondary" | "outline" | "destructive"; Icon: typeof Clock }
> = {
  Pending: { variant: "outline", Icon: Clock },
  Shipped: { variant: "secondary", Icon: Truck },
  Delivered: { variant: "default", Icon: CheckCircle2 },
  Cancelled: { variant: "destructive", Icon: XCircle },
}

function StatusBadge({ status }: { status: Status }) {
  const { variant, Icon } = STATUS[status]
  return (
    <Badge variant={variant}>
      <Icon aria-hidden="true" />
      {status}
    </Badge>
  )
}

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

export default function OrdersTable() {
  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <h1 className="mb-4 text-xl font-semibold">Orders</h1>
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
              <TableCell className="font-semibold">{o.id}</TableCell>
              <TableCell>{o.customer}</TableCell>
              <TableCell className="text-muted-foreground">{o.date}</TableCell>
              <TableCell>
                <StatusBadge status={o.status} />
              </TableCell>
              <TableCell className="text-right tabular-nums">{money.format(o.total)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
