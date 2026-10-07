import { Download, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const invoice = {
  number: "INV-1042",
  customer: "Acme Corp",
  status: "Draft",
  total: "$2,480.00",
  due: "Oct 31, 2026",
};

export default function InvoicePage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{invoice.number}</h1>
            <Badge variant="secondary">{invoice.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {invoice.customer} · Due {invoice.due}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download />
            Download
          </Button>
          <Button>
            <Send />
            Send
          </Button>
        </div>
      </header>
      <p className="mt-6 text-lg font-medium">Total: {invoice.total}</p>
    </div>
  );
}
