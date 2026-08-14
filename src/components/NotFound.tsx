import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/Button";
import { Heading } from "@/components/ui/Heading";

export function NotFound() {
    return (
        <main className="grid min-h-screen place-items-center bg-black p-8 text-center text-white">
            <div>
                <Heading>Rota não encontrada</Heading>
                <Button asChild className="mt-6 px-5 text-[10px]">
                    <Link to="/ranking">Voltar ao ranking</Link>
                </Button>
            </div>
        </main>
    );
}
