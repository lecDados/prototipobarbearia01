import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock3, Plus, Trash2, X } from "lucide-react";
import { AppShell, PageHeader, PrimaryButton, pageHead } from "@/components/AppShell";
import { initialServices, type Service } from "@/lib/servicos";

export const Route = createFileRoute("/servicos")({
  head: () => pageHead("Catálogo de serviços", "Serviços oferecidos pela barbearia com preços e duração."),
  component: Servicos,
});

const tones = ["bg-primary", "bg-chart-3", "bg-chart-1", "bg-success", "bg-chart-2", "bg-accent"];

const emptyForm = { name: "", price: "", time: "", cat: "" };

const inputClass =
  "w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

function Servicos() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const set = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const addService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price.trim()) return;
    const price = form.price.trim().replace(",", ".");
    const priceNum = Number(price.replace(/[^\d.]/g, ""));
    setServices((s) => [
      ...s,
      {
        name: form.name.trim(),
        price: Number.isFinite(priceNum) && priceNum > 0 ? `R$ ${priceNum.toFixed(0)}` : form.price.trim(),
        time: form.time.trim() || "30 min",
        cat: form.cat.trim() || "Cabelo",
        tone: tones[s.length % tones.length] ?? "bg-primary",
      },
    ]);
    setForm(emptyForm);
    setOpen(false);
  };

  const removeService = (name: string) => setServices((s) => s.filter((sv) => sv.name !== name));

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <PageHeader
          eyebrow="Catálogo"
          title="Serviços"
          action={
            <PrimaryButton onClick={() => setOpen(true)}>
              <Plus size={16} className="mr-1" />Novo serviço
            </PrimaryButton>
          }
        />
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <article key={s.name} className="glass-panel animate-float-in group relative rounded-lg border border-border p-5 shadow-soft transition hover:-translate-y-1" style={{ animationDelay: `${i * 60}ms` }}>
              <button
                onClick={() => removeService(s.name)}
                aria-label={`Apagar ${s.name}`}
                className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 size={15} />
              </button>
              <div className="flex items-center justify-between">
                <span className={`h-2 w-10 rounded-full ${s.tone}`} />
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">{s.cat}</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold">{s.name}</h3>
              <div className="mt-3 flex items-end justify-between">
                <strong className="text-2xl font-semibold">{s.price}</strong>
                <span className="flex items-center text-xs text-muted-foreground"><Clock3 size={14} className="mr-1" />{s.time}</span>
              </div>
            </article>
          ))}
        </section>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <form
            onSubmit={addService}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel animate-float-in w-full max-w-md rounded-xl border border-border p-6 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Novo serviço</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fechar" className="rounded-full p-1.5 text-muted-foreground hover:bg-muted">
                <X size={16} />
              </button>
            </div>
            <div className="mt-5 space-y-3">
              <input required placeholder="Nome do serviço" value={form.name} onChange={set("name")} className={inputClass} maxLength={60} />
              <input required placeholder="Preço (ex.: 45)" value={form.price} onChange={set("price")} className={inputClass} maxLength={10} />
              <input placeholder="Duração (ex.: 30 min)" value={form.time} onChange={set("time")} className={inputClass} maxLength={20} />
              <input placeholder="Categoria (ex.: Cabelo, Barba, Combo)" value={form.cat} onChange={set("cat")} className={inputClass} maxLength={30} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
                Cancelar
              </button>
              <PrimaryButton type="submit">Salvar</PrimaryButton>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
