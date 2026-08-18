import type { MuralMission } from "@/types/mission";

/**
 * O mural da temporada como o colaborador o vê. Os prazos são relativos a agosto de 2026, a
 * mesma temporada das outras fichas de exemplo, para o destaque de prazo próximo aparecer.
 */
export const MURAL_MISSIONS: MuralMission[] = [
    { id: "clean-code", title: "Código limpo, guilda forte", description: "Revise uma entrega recente, aplique boas práticas de legibilidade e envie as evidências da melhoria.", evidenceType: "PDF", xp: "500", deadline: "2026-08-18", state: "disponiveis" },
    { id: "guardioes-do-teste", title: "Guardiões do teste", description: "Cubra um módulo crítico com testes automatizados e mostre o relatório de cobertura.", evidenceType: "PDF", xp: "650", deadline: "2026-08-19", state: "disponiveis" },
    { id: "cacada-aos-bugs", title: "Caçada aos bugs", description: "Encontre e corrija três defeitos reportados pela guilda durante a temporada.", evidenceType: "Foto (PNG, JPEG)", xp: "400", deadline: "2026-09-02", state: "disponiveis" },
    { id: "forja-de-componentes", title: "Forja de componentes", description: "Extraia um componente reutilizável do produto e documente seu uso.", evidenceType: "PDF", xp: "720", deadline: "2026-09-15", state: "disponiveis" },
    { id: "sprint-em-andamento", title: "Sprint dos guardiões", description: "Participe da sprint e registre as entregas concluídas pela sua equipe.", evidenceType: "Foto (PNG, JPEG)", xp: "800", deadline: "2026-08-12", state: "aguardando" },
    { id: "ritual-da-revisao", title: "Ritual da revisão", description: "Revise o pull request de um colega e registre os apontamentos combinados.", evidenceType: "PDF", xp: "300", deadline: "2026-08-14", state: "aguardando" },
    { id: "pergaminho-do-onboarding", title: "Pergaminho do onboarding", description: "Escreva o guia de primeiros passos do projeto para novos aventureiros.", evidenceType: "PDF", xp: "900", deadline: "2026-07-30", state: "concluidas" },
    { id: "vigilia-do-deploy", title: "Vigília do deploy", description: "Acompanhe uma publicação em produção e registre o checklist executado.", evidenceType: "Foto (PNG, JPEG)", xp: "550", deadline: "2026-07-22", state: "concluidas" },
];
