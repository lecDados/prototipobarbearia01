export function entradaComServico(slug: string, nome: string, whatsapp: string, servico: string) {
  const selecionado = servico.trim();
  if (selecionado.length < 2 || selecionado.length > 60) throw new Error("Selecione um serviço válido.");
  return { _slug: slug, _nome: nome, _whatsapp: whatsapp, _servico: selecionado };
}