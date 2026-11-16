import { useCallback, useEffect, useState } from "react";
import { lerLancamentos, resumoFinanceiro, type Lancamento } from "@/lib/financeiro";

const chave = "black-studio:financeiro:v1";
const evento = "black-studio:financeiro";

export function useFinanceiro() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState("");
  useEffect(() => {
    const atualizar = () => {
      try { setLancamentos(lerLancamentos(localStorage.getItem(chave))); }
      catch { setErro("Não foi possível acessar os lançamentos salvos neste dispositivo."); }
      setPronto(true);
    };
    const storage = (e: StorageEvent) => { if (e.key === chave || e.key === null) atualizar(); };
    atualizar();
    window.addEventListener(evento, atualizar);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener(evento, atualizar);
      window.removeEventListener("storage", storage);
    };
  }, []);

  const adicionar = useCallback((item: Omit<Lancamento, "id" | "criadoEm">) => {
    if (!item.descricao.trim() || !Number.isFinite(item.valor) || item.valor <= 0) return false;
    try {
      const anteriores = lerLancamentos(localStorage.getItem(chave));
      const novos = [{ ...item, id: crypto.randomUUID(), criadoEm: new Date().toISOString() }, ...anteriores];
      localStorage.setItem(chave, JSON.stringify(novos));
      setErro("");
      window.dispatchEvent(new Event(evento));
      return true;
    } catch {
      setErro("Não foi possível salvar o lançamento. Verifique o armazenamento do navegador e tente novamente.");
      return false;
    }
  }, []);
  return { lancamentos, pronto, erro, adicionar, ...resumoFinanceiro(lancamentos) };
}