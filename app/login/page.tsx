"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, LockIcon, MailIcon, ShieldIcon, SparkIcon } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  function enterQuest(event?: FormEvent) {
    event?.preventDefault();
    setLoading(true);
    window.setTimeout(() => router.push("/perfil"), 450);
  }

  return (
    <main className="min-h-screen bg-ink lg:grid lg:grid-cols-[1.08fr_.92fr]">
      <section className="relative min-h-[36vh] overflow-hidden border-b-4 border-[#211707] lg:min-h-screen lg:border-b-0 lg:border-r-4" aria-label="Uma jornada medieval rumo ao castelo">
        <Image
          src="/art/quest-landscape.png"
          alt="Aventureiro observa uma trilha iluminada até um castelo nas montanhas"
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover object-[42%_center] [image-rendering:pixelated]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090b09] via-transparent to-[#09101833] lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#090b09cc]" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-12">
          <div className="max-w-xl">
            <div className="mb-3 flex items-center gap-3 text-gold-light">
              <span className="h-2 w-2 bg-gold shadow-[4px_0_0_#7d531a]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Capítulo I · Entre para a guilda</span>
            </div>
            <h1 className="text-balance text-2xl font-black uppercase leading-tight tracking-wide text-[#f5e5bd] [text-shadow:3px_3px_0_#251708] sm:text-4xl lg:text-5xl">
              Transforme cada desafio em uma conquista.
            </h1>
            <p className="mt-3 hidden max-w-lg text-sm leading-relaxed text-[#c7b994] sm:block lg:text-base">
              Complete missões, acumule cupons e dispute seu lugar entre os maiores aventureiros da guilda.
            </p>
          </div>
        </div>

        <div className="ember absolute left-[12%] top-[19%] hidden h-2 w-2 bg-gold shadow-[14px_20px_0_#9d6720,-18px_35px_0_#e4aa3d] lg:block" />
      </section>

      <section className="relative flex min-h-[64vh] items-center justify-center overflow-hidden bg-[#0c0f0d] px-5 py-10 sm:px-10 lg:min-h-screen lg:px-12 xl:px-20">
        <div className="pointer-events-none absolute inset-0 bg-noise bg-[length:24px_24px] opacity-50" />
        <div className="relative w-full max-w-[500px]">
          <div className="pixel-panel relative px-5 pb-7 pt-3 sm:px-9 sm:pb-9">
            <span className="absolute -left-[3px] -top-[3px] h-3 w-3 border-b-2 border-r-2 border-[#d9a43d] bg-[#0c0f0d]" />
            <span className="absolute -right-[3px] -top-[3px] h-3 w-3 border-b-2 border-l-2 border-[#d9a43d] bg-[#0c0f0d]" />

            <div className="mx-auto -mb-2 -mt-2 flex h-44 max-w-[300px] items-center justify-center overflow-hidden sm:h-48">
              <Image src="/quest-logo.png" alt="v(dev) Quest" width={512} height={512} priority className="h-full w-full object-contain [image-rendering:pixelated]" />
            </div>

            <div className="ornament-line mb-6 text-[10px] font-black uppercase tracking-[0.24em]">
              Retorne à guilda
            </div>

            <form onSubmit={enterQuest} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.15em] text-gold-light">E-mail</span>
                <span className="flex h-14 items-center border-2 border-[#76521e] bg-[#0c0e0c] px-4 shadow-[inset_3px_3px_0_#050605] focus-within:border-gold">
                  <MailIcon className="mr-3 h-5 w-5 shrink-0 text-[#bd852b]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="aventureiro@email.com"
                    className="h-full w-full bg-transparent text-sm text-cream outline-none placeholder:text-[#625f55]"
                    aria-label="E-mail"
                    required
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-[0.15em] text-gold-light">Senha</span>
                <span className="flex h-14 items-center border-2 border-[#76521e] bg-[#0c0e0c] px-4 shadow-[inset_3px_3px_0_#050605] focus-within:border-gold">
                  <LockIcon className="mr-3 h-5 w-5 shrink-0 text-[#bd852b]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Sua senha secreta"
                    className="h-full w-full bg-transparent text-sm text-cream outline-none placeholder:text-[#625f55]"
                    aria-label="Senha"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="p-2 text-[#77766e] transition hover:text-gold-light" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                    <EyeIcon className="h-5 w-5" />
                  </button>
                </span>
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3 text-[11px]">
                <label className="flex cursor-pointer items-center gap-2 text-[#a39c89]">
                  <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="peer sr-only" />
                  <span className="grid h-4 w-4 place-items-center border-2 border-[#6d6044] bg-[#0b0d0b] text-[10px] text-gold peer-checked:border-gold peer-checked:bg-[#3b2b12]">{remember ? "✓" : ""}</span>
                  Lembrar-me
                </label>
                <button type="button" className="font-bold text-[#cf9b3a] hover:text-gold-light hover:underline">Esqueceu sua senha?</button>
              </div>

              <button type="submit" disabled={loading} className="pixel-button h-14 w-full disabled:cursor-wait disabled:opacity-75">
                {loading ? <><SparkIcon className="h-5 w-5 animate-spin" /> Abrindo portal...</> : <>Entrar na jornada <span aria-hidden="true">›</span></>}
              </button>
            </form>

            <div className="ornament-line my-6 text-xs text-[#706d63]">ou</div>

            <button type="button" onClick={() => enterQuest()} className="pixel-button pixel-button-secondary h-14 w-full py-3.5 text-xs">
              <ShieldIcon className="h-5 w-5" /> Acessar com SSO
            </button>
          </div>

          <p className="mt-6 text-center text-[10px] uppercase tracking-[0.15em] text-[#656359]">
            Ao entrar, você aceita o <button className="text-[#a77a34] hover:text-gold-light">código da guilda</button>.
          </p>
        </div>
      </section>
    </main>
  );
}
