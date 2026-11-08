import { redirect } from "next/navigation";
import { getIsMaster } from "@/lib/data";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Entrada do Mestre" };

export default async function LoginPage() {
  if (await getIsMaster()) redirect("/admin");
  return <LoginForm />;
}
