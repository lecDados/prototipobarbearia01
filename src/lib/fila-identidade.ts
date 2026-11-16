export function identidadeFila(valor: unknown): { id: string; token: string } | null {
  if (!valor || typeof valor !== "object" || !("id" in valor) || !("token" in valor)) return null;
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return typeof valor.id === "string" && typeof valor.token === "string" && uuid.test(valor.id) && uuid.test(valor.token)
    ? { id: valor.id, token: valor.token } : null;
}

export function chaveProgresso(slug: string, clienteId: string) {
  return `fila:${slug}:cliente:${clienteId}`;
}