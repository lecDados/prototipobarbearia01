export function progressoEspera(inicio: number, totalMinutos: number, agora: number) {
  const totalMs = Math.max(0, totalMinutos) * 60_000;
  const restanteMs = Math.max(0, totalMs - Math.max(0, agora - inicio));
  return {
    minutos: Math.ceil(restanteMs / 60_000),
    percentual: totalMs > 0 ? (restanteMs / totalMs) * 100 : 0,
  };
}