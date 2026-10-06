import * as React from "react"
import { Send } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const invoice = {
  number: "INV-2048",
  status: "Draft" as "Draft" | "Sent",
  issued: "Oct 6, 2026",
  due: "Nov 5, 2026",
  customer: "Northwind Traders",
  email: "billing@northwind.example",
  items: [
    { description: "Design system audit", qty: 1, rate: 4800 },
    { description: "Component build, 3 weeks", qty: 3, rate: 3200 },
    { description: "Accessibility review", qty: 1, rate: 1500 },
  ],
}

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" })

export default function InvoiceDetailPage() {
  const [status, setStatus] = React.useState(invoice.status)
  const [open, setOpen] = React.useState(false)
  const [sending, setSending] = React.useState(false)
  const [to, setTo] = React.useState(invoice.email)
  const [message, setMessage] = React.useState(
    `Hi Northwind team,\n\nInvoice ${invoice.number} is attached. It's due ${invoice.due}.\n\nThanks,\nOm`
  )
  const [error, setError] = React.useState<string | null>(null)

  const total = invoice.items.reduce((s, i) => s + i.qty * i.rate, 0)

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(to)) {
      setError("Enter a valid email address.")
      return
    }
    setError(null)
    setSending(true)
    await new Promise((r) => setTimeout(r, 900))
    setSending(false)
    setOpen(false)
    setStatus("Sent")
    toast.success(`Invoice ${invoice.number} sent to ${to}`)
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 p-6">
      <header className="flex flex-col gap-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Invoices</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{invoice.number}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold">{invoice.number}</h1>
            <Badge variant={status === "Sent" ? "default" : "secondary"}>
              {status}
            </Badge>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Send />
            {status === "Sent" ? "Send again" : "Send invoice"}
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {[
          ["Customer", invoice.customer],
          ["Billing email", invoice.email],
          ["Issued", invoice.issued],
          ["Due", invoice.due],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span>{value}</span>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Line items</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((i) => (
              <TableRow key={i.description}>
                <TableCell>{i.description}</TableCell>
                <TableCell className="text-right">{i.qty}</TableCell>
                <TableCell className="text-right">{money(i.rate)}</TableCell>
                <TableCell className="text-right">{money(i.qty * i.rate)}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3} className="text-right font-medium">
                Total
              </TableCell>
              <TableCell className="text-right font-medium">{money(total)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <Dialog open={open} onOpenChange={(o) => !sending && setOpen(o)}>
        <DialogContent className="max-w-[var(--width-dialog-lg)]">
          <form onSubmit={handleSend} className="flex flex-col gap-6">
            <DialogHeader>
              <DialogTitle>Send invoice {invoice.number}</DialogTitle>
              <DialogDescription>
                {money(total)} due {invoice.due}. The PDF is attached.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <Label htmlFor="invoice-to">To</Label>
              <Input
                id="invoice-to"
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                aria-invalid={!!error}
                aria-describedby={error ? "invoice-to-error" : undefined}
                className="max-w-[var(--width-field-max)]"
              />
              {error && (
                <p id="invoice-to-error" className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="invoice-message">Message</Label>
              <Textarea
                id="invoice-message"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <DialogFooter className="gap-5">
              <Button
                type="button"
                variant="outline"
                disabled={sending}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={sending}>
                {sending ? <Spinner /> : <Send />}
                {sending ? "Sending" : "Send invoice"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}
