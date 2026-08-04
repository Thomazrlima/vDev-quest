import { LoginHero } from "@/components/molecules/LoginHero";
import { LoginForm } from "@/components/organisms/LoginForm";

export function LoginTemplate() { return <main className="min-h-screen bg-ink lg:grid lg:grid-cols-[1.08fr_.92fr]"><LoginHero /><LoginForm /></main>; }
