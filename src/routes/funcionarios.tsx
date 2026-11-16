import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, Plus, Star, Trash2, X } from "lucide-react";
import { AppShell, PageHeader, PrimaryButton, pageHead } from "@/components/AppShell";

export const Route = createFileRoute("/funcionarios")({
  head: () => pageHead("Funcionários", "Equipe da barbearia, atendimentos e comissões."),
  component: Funcionarios,
});

type Employee = {
  name: string;
  role: string;
  email: string;
  cpf: string;
  phone: string;
  clients: number;
  rating: string;
  commission: string;
  online: boolean;
};

const initialTeam: Employee[] = [
  { name: "Marcos Silva", role: "Barbeiro sênior", email: "marcos@blackstudio.com", cpf: "123.456.789-00", phone: "(11) 98765-4321", clients: 142, rating: "4,9", commission: "R$ 3.420", online: true },
  { name: "André Costa", role: "Barbeiro", email: "andre@blackstudio.com", cpf: "234.567.890-11", phone: "(11) 97654-3210", clients: 118, rating: "4,8", commission: "R$ 2.860", online: true },
  { name: "Lucas Rocha", role: "Barbeiro", email: "lucas@blackstudio.com", cpf: "345.678.901-22", phone: "(11) 96543-2109", clients: 96, rating: "4,7", commission: "R$ 2.310", online: false },
  { name: "Bianca Moraes", role: "Recepcionista", email: "bianca@blackstudio.com", cpf: "456.789.012-33", phone: "(11) 95432-1098", clients: 0, rating: "5,0", commission: "—", online: true },
];

const emptyForm = { name: "", role: "", email: "", cpf: "", phone: "" };

const inputClass =
  "w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

function Funcionarios() {
  const [team, setTeam] = useState<Employee[]>(initialTeam);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const set = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const addEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setTeam((t) => [
      ...t,
      {
        name: form.name.trim(),
        role: form.role.trim() || "Barbeiro",
        email: form.email.trim(),
        cpf: form.cpf.trim(),
        phone: form.phone.trim(),
        clients: 0,
        rating: "—",
        commission: "—",
        online: true,
      },
    ]);
    setForm(emptyForm);
    setOpen(false);
  };

  const removeEmployee = (name: string) => setTeam((t) => t.filter((p) => p.name !== name));

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <PageHeader
          eyebrow="Equipe"
          title="Funcionários"
          action={
            <PrimaryButton onClick={() => setOpen(true)}>
              <Plus size={16} className="mr-1" />Adicionar
            </PrimaryButton>
          }
        />
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {team.map((p, i) => (
            <article key={p.name} className="glass-panel animate-float-in group relative rounded-lg border border-border p-5 text-center shadow-soft" style={{ animationDelay: `${i * 70}ms` }}>
              <button
                onClick={() => removeEmployee(p.name)}
                aria-label={`Apagar ${p.name}`}
                className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 size={15} />
              </button>
              <div className="relative mx-auto w-fit">
                <div className="bg-gradient-brand flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-primary-foreground shadow-glow">
                  {p.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <span className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background ${p.online ? "bg-success" : "bg-muted-foreground"}`} />
              </div>
              <h3 className="mt-4 font-semibold">{p.name}</h3>
              <p className="text-xs text-muted-foreground">{p.role}</p>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center justify-center gap-1 truncate"><Mail size={11} />{p.email}</p>
                <p className="flex items-center justify-center gap-1"><Phone size={11} />{p.phone || "—"}</p>
                <p>CPF: {p.cpf || "—"}</p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-xs">
                <div><p className="font-semibold">{p.clients}</p><p className="text-muted-foreground">Clientes</p></div>
                <div><p className="flex items-center justify-center font-semibold"><Star size={12} className="mr-0.5 text-chart-1" />{p.rating}</p><p className="text-muted-foreground">Nota</p></div>
                <div><p className="font-semibold">{p.commission}</p><p className="text-muted-foreground">Comissão</p></div>
              </div>
            </article>
          ))}
        </section>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <form
            onSubmit={addEmployee}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel animate-float-in w-full max-w-md rounded-xl border border-border p-6 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Novo funcionário</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fechar" className="rounded-full p-1.5 text-muted-foreground hover:bg-muted">
                <X size={16} />
              </button>
            </div>
            <div className="mt-5 space-y-3">
              <input required placeholder="Nome completo" value={form.name} onChange={set("name")} className={inputClass} maxLength={80} />
              <input placeholder="Cargo (ex.: Barbeiro)" value={form.role} onChange={set("role")} className={inputClass} maxLength={40} />
              <input required type="email" placeholder="E-mail" value={form.email} onChange={set("email")} className={inputClass} maxLength={120} />
              <input placeholder="CPF (000.000.000-00)" value={form.cpf} onChange={set("cpf")} className={inputClass} maxLength={14} />
              <input placeholder="Telefone ((11) 90000-0000)" value={form.phone} onChange={set("phone")} className={inputClass} maxLength={15} />
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
