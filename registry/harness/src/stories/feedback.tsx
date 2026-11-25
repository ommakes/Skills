import * as React from "react"
import type { Story } from "../frame"
import { Toast, ToastAction, ToastDescription, ToastProvider, ToastTitle, ToastViewport, type ToastVariant } from "@/components/ui/toast"

const rows: { variant: ToastVariant; text: string }[] = [
  { variant: "default", text: "This is a standard toast message" },
  { variant: "notice", text: "This is a warning toast message" },
  { variant: "negative", text: "This is a negative toast message" },
  { variant: "positive", text: "This is a positive toast message" },
  { variant: "info", text: "This is an informational message" },
]

export const toast: Story = {
  title: "Toast",
  items: ["vois-toast"],
  render: () => (
    <ToastProvider duration={Infinity} label="Notifications">
      {rows.map((r) => (
        <Toast key={r.variant} variant={r.variant} open>
          <ToastDescription>{r.text}</ToastDescription>
        </Toast>
      ))}
      <Toast variant="default" open icon={false}>
        <ToastTitle>Message sent</ToastTitle>
        <ToastDescription>Sent to 3 people.</ToastDescription>
        <ToastAction altText="Undo sending the message">Undo</ToastAction>
      </Toast>
      <ToastViewport className="static max-w-none p-0" />
    </ToastProvider>
  ),
}
