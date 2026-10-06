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
import { Spinner } from "@/components/ui/spinner"
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
  status: "Draft",
  customer: "Northwind Traders",
  email: "billing@northwind.example",
  issued: "Oct 6, 2026",
  due: "Nov 5, 2026",
  currency: "USD",
  lines: [
    { id: 1, description: "Design system audit", qty: 1, unit: 4800 },
    { id: 2, description: "Component build-out (40 hrs)", qty: 40, unit: 150 },
    { id: 3, description: "Accessibility review", qty: 1, unit: 1200 },
  ],
}

const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.currency }).format(n)

export default function InvoiceDetailPage() {
  const [sending, setSending] = React.useState(false)
  const [downloading, setDownloading] = React.useState(false)

  const total = invoice.lines.reduce((sum, l) => sum + l.qty * l.unit, 0)

  async function handleSend() {
    setSending(true)
    await new Promise((r) => setTimeout(r, 900))
    setSending(false)
    toast.success(`Invoice sent to ${invoice.email}`)
  }

  async function handleDownload() {
    setDownloading(true)
    await new Promise((r) => setTimeout(r, 700))
    setDownloading(false)
    toast.success("PDF downloaded")
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-4 md:p-8">
      <header className="flex flex-col gap-6">
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

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-balance text-foreground">
              {invoice.number}
            </h1>
            <Badge variant="secondary">{invoice.status}</Badge>
          </div>

          {/* Secondary sits left of primary; 20px between them. */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:gap-5">
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={downloading}
              aria-busy={downloading}
            >
              {downloading ? (
                <Spinner className="size-5" aria-hidden="true" />
              ) : (
                <DownloadIcon className="size-5" aria-hidden="true" />
              )}
              Download PDF
            </Button>
            <Button onClick={handleSend} disabled={sending} aria-busy={sending}>
              {sending ? (
                <Spinner className="size-5" aria-hidden="true" />
              ) : (
                <SendIcon className="size-5" aria-hidden="true" />
              )}
              Send invoice
            </Button>
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
            {[
              ["Customer", invoice.customer],
              ["Email", invoice.email],
              ["Issued", invoice.issued],
              ["Due", invoice.due],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col gap-1">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="text-base text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Line items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit price</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.lines.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{l.description}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{l.qty}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{money(l.unit)}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {money(l.qty * l.unit)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-medium">
                  Total
                </TableCell>
                <TableCell className="text-right font-mono font-medium tabular-nums">
                  {money(total)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
