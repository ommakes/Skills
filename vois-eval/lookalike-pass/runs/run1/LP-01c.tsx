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

const invoice = {
  number: "INV-1042",
  customer: "Acme Corp",
  status: "Draft",
  total: "$4,280.00",
  due: "Nov 5, 2026",
}

export default function InvoicePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-4">
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

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{invoice.number}</h1>
            <Badge variant="secondary">{invoice.status}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => toast.success("Download started")}
            >
              <DownloadIcon className="size-4" />
              Download PDF
            </Button>
            <Button onClick={() => toast.success(`Invoice sent to ${invoice.customer}`)}>
              <SendIcon className="size-4" />
              Send invoice
            </Button>
          </div>
        </div>
      </header>

      <dl className="grid gap-6 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-muted-foreground">Customer</dt>
          <dd>{invoice.customer}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Total</dt>
          <dd>{invoice.total}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Due date</dt>
          <dd>{invoice.due}</dd>
        </div>
      </dl>
    </div>
  )
}
