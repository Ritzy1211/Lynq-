"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowUpRight, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  service: z.string().min(2, "Choose a service"),
  message: z.string().min(10, "A few more words please"),
});

type FormValues = z.infer<typeof schema>;

const SERVICE_OPTIONS = [
  "General inquiry",
  "Home cleaning",
  "Office cleaning",
  "Laundry & dry cleaning",
  "Fumigation & pest control",
  "Pressure washing",
  "Estate maintenance",
  "Facility management",
  "Corporate contract",
];

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { service: SERVICE_OPTIONS[0] },
  });

  const onSubmit = async (_data: FormValues) => {
    // Simulate network request
    await new Promise((r) => setTimeout(r, 700));
    setSubmitted(true);
    reset();
  };

  if (submitted) {
    return (
      <div className="rounded-3xl border border-accent/30 bg-accent/5 p-10 text-center">
        <div className="mx-auto grid place-items-center size-14 rounded-2xl bg-accent text-white shadow-glow">
          <Check className="size-6" />
        </div>
        <h3 className="mt-6 font-display text-2xl font-semibold">Message received.</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          A service lead will reply within one business hour. For urgent requests, call our 24/7 line.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm font-medium text-accent hover:underline underline-offset-4"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-3xl border border-border/70 bg-card p-8 sm:p-10 shadow-soft"
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Jane Doe" {...register("name")} aria-invalid={!!errors.name} />
          {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="jane@company.com" {...register("email")} aria-invalid={!!errors.email} />
          {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" {...register("phone")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service">Service</Label>
          <select
            id="service"
            {...register("service")}
            className="flex h-12 w-full rounded-2xl border border-border bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent"
          >
            {SERVICE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">How can we help?</Label>
        <Textarea
          id="message"
          rows={5}
          placeholder="Tell us about your property, scope and timing…"
          {...register("message")}
          aria-invalid={!!errors.message}
        />
        {errors.message && <p className="text-xs text-rose-500">{errors.message.message}</p>}
      </div>
      <Button type="submit" variant="accent" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send message"} <ArrowUpRight className="size-4" />
      </Button>
    </form>
  );
}
