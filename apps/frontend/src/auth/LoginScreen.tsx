import { useAuth } from "@/auth/useAuth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function LoginScreen() {
    const { signIn, error } = useAuth();
    return (
        <main className="grid min-h-screen place-items-center bg-[linear-gradient(var(--color-black-overlay),var(--color-black-overlay)),url('/images/backgrounds/quest-landscape.png')] bg-cover bg-center p-5">
            <section className="w-full max-w-lg border-4 border-primary-dark bg-black/90 p-7 text-center shadow-[8px_8px_0_var(--color-black)] sm:p-10">
                <Logo priority className="mx-auto flex h-24 w-40 items-center justify-center" imageClassName="h-24 w-40" />
                <h1 className="mt-7 text-3xl font-black tracking-[.03em] text-primary-light">Sua jornada começa aqui</h1>
                <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white-muted">Entre com sua conta corporativa para ver missões, progresso e conquistas da guilda.</p>
                {error ? <Alert tone="error" className="mt-5 text-left" title="Login não concluído">{error}</Alert> : null}
                <Button onClick={() => void signIn()} className="mt-8 px-6 py-4 text-sm">Entrar com SSO</Button>
            </section>
        </main>
    );
}
