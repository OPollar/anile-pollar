import { requirePlayer } from "@/lib/data";

export const metadata = { title: "Painel do Player" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requirePlayer(); // 2ª barreira (a 1ª é o middleware, a 3ª é o RLS do banco)
  return <div className="min-h-screen">{children}</div>;
}
