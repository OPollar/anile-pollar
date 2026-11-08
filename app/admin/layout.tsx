import { requireMaster } from "@/lib/data";

export const metadata = { title: "Painel do Mestre" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireMaster(); // 2ª barreira (a 1ª é o middleware, a 3ª é o RLS do banco)
  return <div className="min-h-screen">{children}</div>;
}
