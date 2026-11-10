import { redirect } from "next/navigation";
import { getRole } from "@/lib/data";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Entrar" };

export default async function LoginPage() {
  const role = await getRole();
  if (role === "player") redirect("/admin");
  if (role === "master") redirect("/");
  return <LoginForm />;
}
