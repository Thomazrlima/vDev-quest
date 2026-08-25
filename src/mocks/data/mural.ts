import type { MuralMission } from "@/types/mission";

/**
 * O mural da temporada como o colaborador o vê. Os prazos são relativos a agosto de 2026, a
 * mesma temporada das outras fichas de exemplo, para o destaque de prazo próximo aparecer.
 * O estado de cada missão vem das submissões, então há exemplos sem entrega, com recusa em
 * aberto, com histórico de várias tentativas, em análise e já aprovada. As entregas de foto
 * trazem a miniatura que o feed do perfil mostra; as enviadas pelo colaborador ganham a sua
 * no momento do envio.
 */
export const MURAL_MISSIONS: MuralMission[] = [
    {
        id: "clean-code",
        title: "Código limpo, guilda forte",
        description: "Revise uma entrega recente, aplique boas práticas de legibilidade e envie as evidências da melhoria.",
        evidenceType: "PDF",
        xp: "500",
        deadline: "2026-08-18",
        submissions: [],
    },
    {
        id: "guardioes-do-teste",
        title: "Guardiões do teste",
        description: "Cubra um módulo crítico com testes automatizados e mostre o relatório de cobertura.",
        evidenceType: "PDF",
        xp: "650",
        deadline: "2026-08-19",
        submissions: [],
    },
    {
        id: "cacada-aos-bugs",
        title: "Caçada aos bugs",
        description: "Encontre e corrija três defeitos reportados pela guilda durante a temporada.",
        evidenceType: "Foto (PNG, JPEG)",
        xp: "400",
        deadline: "2026-09-02",
        submissions: [{ id: "sub-001", kind: "file", value: "cacada-aos-bugs.png", preview: "/images/backgrounds/quest-landscape.png", submittedAt: "2026-08-10T13:24:00.000Z", status: "recusada", justification: "A captura mostra apenas um dos três defeitos corrigidos. Reenvie um registro em que os três chamados apareçam fechados, com o número de cada um visível.", reviewedAt: "2026-08-12T09:05:00.000Z" }],
    },
    {
        id: "forja-de-componentes",
        title: "Forja de componentes",
        description: "Extraia um componente reutilizável do produto e documente seu uso.",
        evidenceType: "Link",
        xp: "720",
        deadline: "2026-09-15",
        submissions: [],
    },
    {
        id: "cronica-da-jornada",
        title: "Crônica da jornada",
        description: "Relate o aprendizado que sua equipe tirou da última entrega e o que será levado para a próxima.",
        evidenceType: "Texto",
        xp: "350",
        deadline: "2026-09-05",
        submissions: [
            { id: "sub-002", kind: "text", value: "Entregamos a sprint no prazo e o time gostou do resultado.", submittedAt: "2026-08-05T14:02:00.000Z", status: "recusada", justification: "O relato não diz o que foi aprendido nem o que muda na próxima entrega. Traga exemplos concretos do que a equipe faria diferente.", reviewedAt: "2026-08-06T10:30:00.000Z" },
            { id: "sub-003", kind: "text", value: "Aprendemos que revisar o escopo antes da sprint evita retrabalho: nesta entrega dois cards voltaram por falta de critério de aceite.", submittedAt: "2026-08-08T09:15:00.000Z", status: "recusada", justification: "Melhorou, mas ainda falta o combinado da equipe para a próxima temporada. Feche o relato com o que vocês vão adotar.", reviewedAt: "2026-08-09T16:44:00.000Z" },
        ],
    },
    {
        id: "sprint-em-andamento",
        title: "Sprint dos guardiões",
        description: "Participe da sprint e registre as entregas concluídas pela sua equipe.",
        evidenceType: "Foto (PNG, JPEG)",
        xp: "800",
        deadline: "2026-08-12",
        submissions: [{ id: "sub-004", kind: "file", value: "sprint-entrega.png", preview: "/images/backgrounds/hall.png", submittedAt: "2026-08-11T18:40:00.000Z", status: "pendente" }],
    },
    {
        id: "ritual-da-revisao",
        title: "Ritual da revisão",
        description: "Revise o pull request de um colega e registre os apontamentos combinados.",
        evidenceType: "Link",
        xp: "300",
        deadline: "2026-08-14",
        submissions: [
            { id: "sub-005", kind: "link", value: "https://github.com/Thomazrlima/vDev-quest/pull/38", submittedAt: "2026-08-12T08:55:00.000Z", status: "recusada", justification: "O endereço aponta para um pull request que não é da guilda. Envie o link da revisão que você fez nesta temporada.", reviewedAt: "2026-08-12T17:10:00.000Z" },
            { id: "sub-006", kind: "link", value: "https://github.com/Thomazrlima/vDev-quest/pull/42", submittedAt: "2026-08-13T10:12:00.000Z", status: "pendente" },
        ],
    },
    {
        id: "pergaminho-do-onboarding",
        title: "Pergaminho do onboarding",
        description: "Escreva o guia de primeiros passos do projeto para novos aventureiros.",
        evidenceType: "PDF",
        xp: "900",
        deadline: "2026-07-30",
        submissions: [
            { id: "sub-007", kind: "file", value: "guia-rascunho.pdf", submittedAt: "2026-07-24T11:38:00.000Z", status: "recusada", justification: "O guia para no acesso ao repositório. Inclua a configuração do ambiente e o primeiro deploy antes de reenviar.", reviewedAt: "2026-07-25T09:12:00.000Z" },
            { id: "sub-008", kind: "file", value: "guia-de-onboarding.pdf", submittedAt: "2026-07-28T15:03:00.000Z", status: "aprovada", reviewedAt: "2026-07-29T11:20:00.000Z" },
        ],
    },
    {
        id: "vigilia-do-deploy",
        title: "Vigília do deploy",
        description: "Acompanhe uma publicação em produção e registre o checklist executado.",
        evidenceType: "Foto (PNG, JPEG)",
        xp: "550",
        deadline: "2026-07-22",
        submissions: [{ id: "sub-009", kind: "file", value: "checklist-do-deploy.jpeg", preview: "/images/backgrounds/ranking-castle-hall-v2.png", submittedAt: "2026-07-21T20:47:00.000Z", status: "aprovada", reviewedAt: "2026-07-22T08:15:00.000Z" }],
    },
];
