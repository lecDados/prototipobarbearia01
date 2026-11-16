export function donoDaFila(userId: string, ownerId: string): boolean {
  return userId.length > 0 && userId === ownerId;
}

export function novaBarbearia(userId: string) {
  if (!userId) throw new Error("Entre na sua conta para abrir a fila.");
  return { owner_id: userId, slug: `barbearia-${userId}` };
}