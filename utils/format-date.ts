export function formatDate(value: string, variant: "short" | "full" = "short") {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: variant, timeStyle: "short" }).format(new Date(value));
}
