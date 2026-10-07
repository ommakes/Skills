import * as React from "react"
import { DownloadIcon, SendIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const invoice = {
  number: "INV-2041",
  status: "Draft" as const,
  customer: "Acme Corp",
  email: "billing@acme.example",
  issued: "Oct 1, 2026",
  due: "Oct 31, 2026",
  items: [
    { id: 1, description: "Design retainer (October)", qty: 1, price: 4500 },
    { id: 2, description: "Additional revision rounds", qty: 3, price: 250 },
    { id: 3, description: "Stock licensing", qty: 2, price: 120 },
  ],
}

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" })

export default function InvoiceDetailPage() {
  const [sending, setSending] = React.useState(false)
  const total = invoice.items.reduce((s, i) => s + i.qty * i.price, 0)

  function handleSend() {
    setSending(true)
    setTimeout(() => {
      setSending(false)
      toast.success(`Invoice ${invoice.number} sent to ${invoice.email}`)
    }, 800)
  }

  function handleDownload() {
    toast.info("Preparing PDF...")
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/invoices">Invoices</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{invoice.number}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {invoice.number}
          </h1>
          <Badge variant="secondary">{invoice.status}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <DownloadIcon />
            Download PDF
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            <SendIcon />
            {sending ? "Sending..." : "Send invoice"}
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Customer</p>
            <p className="font-medium">{invoice.customer}</p>
            <p className="text-sm text-muted-foreground">{invoice.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Issued</p>
            <p className="font-medium">{invoice.issued}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Due</p>
            <p className="font-medium">{invoice.due}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Line items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.qty}</TableCell>
                  <TableCell className="text-right">{fmt(item.price)}</TableCell>
                  <TableCell className="text-right">
                    {fmt(item.qty * item.price)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-medium">
                  Total
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {fmt(total)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
