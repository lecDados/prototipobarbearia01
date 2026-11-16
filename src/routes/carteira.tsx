import { createFileRoute, redirect } from "@tanstack/react-router";
import { pageHead } from "@/components/AppShell";

export const Route = createFileRoute("/carteira")({
  head: () => pageHead("Carteira integrada", "A carteira da Black Studio agora está integrada ao Dashboard."),
  beforeLoad: () => { throw redirect({ to: "/dashboard", statusCode: 301 }); },
});
