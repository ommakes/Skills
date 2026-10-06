import * as React from "react"
import { Send, Mail, Download, Link2, Copy, MoreHorizontal } from "lucide-react"
import { toast, Toaster } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
  customer: "Acme Corp",
  email: "billing@acme.example",
  issued: "Oct 6, 2026",
  due: "Nov 5, 2026",
  items: [
    { id: 1, description: "Design system audit", qty: 1, rate: 4200 },
    { id: 2, description: "Component build (per sprint)", qty: 3, rate: 3800 },
    { id: 3, description: "Accessibility review", qty: 1, rate: 1500 },
  ],
}

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" })

export default function InvoicePage() {
  const [open, setOpen] = React.useState(false)
  const [to, setTo] = React.useState(invoice.email)
  const [sending, setSending] = React.useState(false)
  const [attachPdf, setAttachPdf] = React.useState(true)
  const [status, setStatus] = React.useState(invoice.status)

  const total = invoice.items.reduce((s, i) => s + i.qty * i.rate, 0)

  function handleSend() {
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setOpen(false)
      setStatus("Sent")
      toast.success(`Invoice ${invoice.number} sent to ${to}`)
    }, 900)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <Toaster />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{invoice.number}</h1>
            <Badge variant={status === "Sent" ? "default" : "secondary"}>
              {status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {invoice.customer} · Due {invoice.due}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setOpen(true)}>
            <Send />
            Send invoice
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="More actions">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setOpen(true)}>
                <Mail /> Send by email
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => toast.success("Payment link copied")}
              >
                <Link2 /> Copy payment link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => toast("Downloading PDF")}>
                <Download /> Download PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line items</CardTitle>
          <CardDescription>Issued {invoice.issued}</CardDescription>
        </CardHeader>
        <CardContent>
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
                <TableRow key={i.id}>
                  <TableCell>{i.description}</TableCell>
                  <TableCell className="text-right">{i.qty}</TableCell>
                  <TableCell className="text-right">{fmt(i.rate)}</TableCell>
                  <TableCell className="text-right">
                    {fmt(i.qty * i.rate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="justify-end gap-4 text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="text-lg font-semibold">{fmt(total)}</span>
        </CardFooter>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send invoice {invoice.number}</DialogTitle>
            <DialogDescription>
              {fmt(total)} will be emailed to your customer with a payment link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to">Recipient email</Label>
              <Input
                id="to"
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="pdf">Attach PDF</Label>
              <Switch
                id="pdf"
                checked={attachPdf}
                onCheckedChange={setAttachPdf}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sending || !to}>
              {sending ? "Sending..." : "Send invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
