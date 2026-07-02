"use client";

import { useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SERVICES, SERVICE_ACCENT_CLASSES } from "@/constants/services";
import { useBookingStore } from "./store";
import { formatCurrency, cn } from "@/lib/utils";
import { Check, MapPin, Calendar, Clock, Sparkles } from "lucide-react";

const TIME_SLOTS = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];

export function ServiceStep() {
  const { service, setService } = useBookingStore();
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {SERVICES.map((s) => {
        const a = SERVICE_ACCENT_CLASSES[s.accent];
        const active = service === s.slug;
        return (
          <button
            type="button"
            key={s.slug}
            onClick={() => setService(s.slug)}
            className={cn(
              "group relative text-left rounded-3xl border p-6 transition-all duration-300 overflow-hidden",
              active
                ? "border-foreground bg-foreground text-white shadow-lift"
                : "border-border/70 bg-card hover:border-foreground/30 hover:-translate-y-0.5 hover:shadow-soft",
            )}
          >
            {active && (
              <div className="absolute -top-24 -right-24 size-56 rounded-full bg-accent/40 blur-3xl pointer-events-none" />
            )}
            <div className="relative">
              <div className={cn(
                "grid place-items-center size-12 rounded-2xl ring-1",
                active ? "bg-white/10 ring-white/20 text-white" : `${a.bg} ${a.ring} ${a.text}`,
              )}>
                <s.icon className="size-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{s.shortTitle}</h3>
              <p className={cn("mt-2 text-sm line-clamp-2", active ? "text-white/70" : "text-muted-foreground")}>{s.description}</p>
              <div className={cn("mt-4 text-xs", active ? "text-white/60" : "text-muted-foreground")}>
                From {formatCurrency(s.startingPrice)} {s.unit}
              </div>
              {active && (
                <span className="absolute top-0 right-0 grid place-items-center size-7 rounded-full bg-accent text-white">
                  <Check className="size-4" />
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function LocationStep() {
  const { location, setLocation } = useBookingStore();
  return (
    <div className="rounded-3xl border border-border/70 bg-card p-8 shadow-subtle space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <span className="grid place-items-center size-11 rounded-2xl bg-accent/10 text-accent"><MapPin className="size-5" /></span>
        <div>
          <h3 className="font-display text-lg font-semibold">Where’s the service?</h3>
          <p className="text-xs text-muted-foreground">We’ll confirm coverage automatically.</p>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Street address</Label>
        <Input id="address" placeholder="123 Service Avenue, Suite 200" value={location.address} onChange={(e) => setLocation({ address: e.target.value })} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" placeholder="City" value={location.city} onChange={(e) => setLocation({ city: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postcode">Postcode</Label>
          <Input id="postcode" placeholder="10001" value={location.postcode} onChange={(e) => setLocation({ postcode: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

export function ScheduleStep() {
  const { schedule, setSchedule } = useBookingStore();
  const today = new Date().toISOString().split("T")[0];
  return (
    <div className="rounded-3xl border border-border/70 bg-card p-8 shadow-subtle space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <span className="grid place-items-center size-11 rounded-2xl bg-accent/10 text-accent"><Calendar className="size-5" /></span>
        <div>
          <h3 className="font-display text-lg font-semibold">Pick a date & time</h3>
          <p className="text-xs text-muted-foreground">Same-day availability in central zones.</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            min={today}
            value={schedule.date}
            onChange={(e) => setSchedule({ date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Arrival time</Label>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSchedule({ time: t })}
                className={cn(
                  "rounded-2xl border h-11 text-sm font-medium transition-all",
                  schedule.time === t
                    ? "border-foreground bg-foreground text-white"
                    : "border-border/70 bg-white hover:border-foreground/30",
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5" /> {t}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function UploadStep() {
  const { uploads, addUpload, removeUpload, notes, setNotes } = useBookingStore();
  const fileInput = useRef<HTMLInputElement>(null);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) =>
      addUpload({ name: f.name, size: f.size }),
    );
  };

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-8 shadow-subtle space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <span className="grid place-items-center size-11 rounded-2xl bg-accent/10 text-accent"><ImageIcon className="size-5" /></span>
        <div>
          <h3 className="font-display text-lg font-semibold">Add reference photos</h3>
          <p className="text-xs text-muted-foreground">Optional — helps our team scope accurately.</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        className="w-full border-2 border-dashed border-border rounded-3xl p-10 text-center hover:border-accent hover:bg-accent/5 transition-colors"
      >
        <Upload className="size-8 mx-auto text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">Drop images here or click to upload</p>
        <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB each</p>
      </button>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => onFiles(e.target.files)}
        className="hidden"
      />

      {uploads.length > 0 && (
        <ul className="space-y-2">
          {uploads.map((u) => (
            <li key={u.name} className="flex items-center justify-between rounded-2xl border border-border/70 bg-white p-3">
              <div className="flex items-center gap-3">
                <span className="grid place-items-center size-9 rounded-xl bg-foreground/5 text-muted-foreground">
                  <ImageIcon className="size-4" />
                </span>
                <div>
                  <div className="text-sm font-medium truncate max-w-[200px]">{u.name}</div>
                  <div className="text-[11px] text-muted-foreground">{(u.size / 1024).toFixed(0)} KB</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeUpload(u.name)}
                className="grid place-items-center size-8 rounded-full hover:bg-foreground/5 text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${u.name}`}
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Access instructions, special requests, pets at home…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </div>
  );
}

export function ReviewStep() {
  const { service, location, schedule, notes, contact, setContact } = useBookingStore();
  const svc = SERVICES.find((s) => s.slug === service);

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 rounded-3xl border border-border/70 bg-card p-8 shadow-subtle space-y-5">
        <h3 className="font-display text-lg font-semibold">Your details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cn">Full name</Label>
            <Input id="cn" value={contact.name} onChange={(e) => setContact({ name: e.target.value })} placeholder="Jane Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ce">Email</Label>
            <Input id="ce" type="email" value={contact.email} onChange={(e) => setContact({ email: e.target.value })} placeholder="jane@email.com" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cp">Phone</Label>
          <Input id="cp" type="tel" value={contact.phone} onChange={(e) => setContact({ phone: e.target.value })} placeholder="+1 555 000 0000" />
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="rounded-3xl bg-foreground text-white p-8 shadow-lift relative overflow-hidden">
          <div className="absolute -top-24 -right-20 size-56 rounded-full bg-accent/40 blur-3xl pointer-events-none" />
          <div className="relative space-y-4">
            <div className="text-xs uppercase tracking-widest text-white/60 flex items-center gap-2">
              <Sparkles className="size-3.5 text-accent" /> Booking summary
            </div>
            <SummaryRow label="Service" value={svc?.title ?? "—"} />
            <SummaryRow label="Address" value={location.address ? `${location.address}, ${location.city}` : "—"} />
            <SummaryRow label="Date" value={schedule.date || "—"} />
            <SummaryRow label="Time" value={schedule.time || "—"} />
            {notes && <SummaryRow label="Notes" value={notes} />}
            <div className="pt-4 border-t border-white/10 flex items-baseline justify-between">
              <span className="text-sm text-white/70">Starting from</span>
              <span className="font-display text-2xl font-semibold">
                {svc ? formatCurrency(svc.startingPrice) : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-white/60 shrink-0">{label}</span>
      <span className="text-white text-right font-medium">{value}</span>
    </div>
  );
}

export function ConfirmationStep() {
  const { service, schedule, contact } = useBookingStore();
  const svc = SERVICES.find((s) => s.slug === service);
  return (
    <div className="rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/5 to-secondary/5 p-10 text-center max-w-2xl">
      <div className="mx-auto grid place-items-center size-16 rounded-3xl bg-accent text-white shadow-glow">
        <Check className="size-7" />
      </div>
      <h3 className="mt-6 font-display text-3xl font-semibold tracking-tight">Booking confirmed</h3>
      <p className="mt-3 text-muted-foreground">
        We’ve received your request for <strong className="text-foreground">{svc?.title}</strong>
        {schedule.date && (
          <> on <strong className="text-foreground">{schedule.date}</strong> at <strong className="text-foreground">{schedule.time}</strong></>
        )}
        . A confirmation has been sent to <strong className="text-foreground">{contact.email || "your email"}</strong>.
      </p>
      <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="primary" size="lg">
          <a href="/">Back to home</a>
        </Button>
        <Button asChild variant="outline" size="lg">
          <a href="/services">Browse other services</a>
        </Button>
      </div>
    </div>
  );
}
