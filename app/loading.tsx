import { Loader } from "@/components/Loader";

// Aparece automaticamente em QUALQUER troca de página enquanto o servidor prepara a próxima.
export default function Loading() {
  return <Loader progress={null} />;
}
