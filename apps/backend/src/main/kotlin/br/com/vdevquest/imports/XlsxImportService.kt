package br.com.vdevquest.imports

import br.com.vdevquest.auth.AuthenticatedUser
import br.com.vdevquest.gamification.XpLedgerService
import br.com.vdevquest.gamification.XpMovementType
import br.com.vdevquest.profile.UserContextService
import br.com.vdevquest.profile.UserRepository
import br.com.vdevquest.quests.MissionRepository
import br.com.vdevquest.quests.MissionStatus
import br.com.vdevquest.quests.RecurrenceType
import br.com.vdevquest.quests.SubmissionRepository
import br.com.vdevquest.quests.IdempotencyService
import br.com.vdevquest.shared.UuidV7
import org.apache.poi.ss.usermodel.DataFormatter
import org.apache.poi.xssf.usermodel.XSSFWorkbook
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.io.InputStream
import java.util.UUID

data class ImportRow(val line: Int, val missionId: UUID?, val email: String, val phase: Int?)
data class ImportError(val line: Int, val field: String, val reason: String)
data class ImportResult(val imported: Int)

class ImportValidationException(val errors: List<ImportError>) : RuntimeException("A planilha contém erros de validação.")

@Service
class XlsxImportService(
    private val contexts: UserContextService,
    private val users: UserRepository,
    private val missions: MissionRepository,
    private val submissions: SubmissionRepository,
    private val ledger: XpLedgerService,
    private val idempotency: IdempotencyService,
    private val ids: UuidV7,
) {
    fun parse(file: MultipartFile): List<ImportRow> {
        if (file.isEmpty || !file.originalFilename.orEmpty().endsWith(".xlsx", ignoreCase = true)) {
            throw ImportValidationException(listOf(ImportError(0, "arquivo", "Envie um arquivo .xlsx.")))
        }
        return try {
            file.inputStream.use(::parseStream)
        } catch (error: ImportValidationException) {
            throw error
        } catch (_: Exception) {
            throw ImportValidationException(listOf(ImportError(0, "arquivo", "O arquivo .xlsx está corrompido ou não é uma planilha válida.")))
        }
    }

    @Transactional
    fun import(user: AuthenticatedUser, rows: List<ImportRow>, idempotencyKey: UUID, fingerprint: String): ImportResult {
        val actor = contexts.establish(user)
        actor.requireManager()
        idempotency.existing(actor.email, idempotencyKey, fingerprint, ImportResult::class.java)?.let { return it }
        val errors = mutableListOf<ImportError>()
        if (rows.isEmpty()) errors += ImportError(1, "arquivo", "A planilha não contém linhas de dados.")

        val missionIds = rows.mapNotNull { it.missionId }.distinct().sorted()
        val missionMap = missionIds.associateWith { missions.find(it, lock = true) }
        val simulations = mutableMapOf<Pair<UUID, String>, MutableList<SimulatedSubmission>>()

        rows.forEach { row ->
            val missionId = row.missionId
            if (missionId == null) {
                errors += ImportError(row.line, "mission_id", "UUID inválido.")
                return@forEach
            }
            val mission = missionMap[missionId]
            if (mission == null || mission.status != MissionStatus.active) {
                errors += ImportError(row.line, "mission_id", "Missão ativa não encontrada.")
                return@forEach
            }
            if (mission.recurrenceType != RecurrenceType.none || mission.isCheckin) {
                errors += ImportError(row.line, "mission_id", "A importação aceita apenas missões não recorrentes.")
                return@forEach
            }
            val email = row.email.trim().lowercase()
            if (email.isBlank() || users.find(email) == null) {
                errors += ImportError(row.line, "email", "Colaborador existente não encontrado.")
                return@forEach
            }
            val phase = row.phase
            val phases = missions.phases(missionId)
            if (phase == null || phases.none { it.number == phase }) {
                errors += ImportError(row.line, "phase", "Fase inválida para a missão.")
                return@forEach
            }
            val state = simulations.getOrPut(missionId to email) {
                submissions.activeForMission(missionId, email).map { SimulatedSubmission(it.id, it.currentPhase) }.toMutableList()
            }
            if (phase == 1) {
                if (!mission.allowsMultipleSubmissions && state.isNotEmpty()) {
                    errors += ImportError(row.line, "phase", "Já existe uma submissão válida para esta missão.")
                } else {
                    state += SimulatedSubmission(ids.next(), 1)
                }
            } else {
                val candidate = state.firstOrNull { it.currentPhase == phase - 1 }
                if (candidate == null) errors += ImportError(row.line, "phase", "Não existe submissão FIFO elegível na fase anterior.")
                else candidate.currentPhase = phase
            }
        }
        if (errors.isNotEmpty()) throw ImportValidationException(errors)

        val replay = mutableMapOf<Pair<UUID, String>, MutableList<SimulatedSubmission>>()
        rows.forEach { row ->
            val missionId = requireNotNull(row.missionId)
            val email = row.email.trim().lowercase()
            val phase = requireNotNull(row.phase)
            val state = replay.getOrPut(missionId to email) {
                submissions.activeForMission(missionId, email).map { SimulatedSubmission(it.id, it.currentPhase) }.toMutableList()
            }
            val target = if (phase == 1) {
                val id = ids.next()
                submissions.insert(id, missionId, email, null)
                SimulatedSubmission(id, 1).also { state += it }
            } else {
                state.first { it.currentPhase == phase - 1 }.also { it.currentPhase = phase }
            }
            if (phase > 1) submissions.advance(target.id, phase)
            val reward = missions.phases(missionId).first { it.number == phase }.xpReward
            ledger.grant(email, target.id, phase, reward, XpMovementType.phase_reward)
        }
        return ImportResult(rows.size).also { idempotency.finish(actor.email, idempotencyKey, it) }
    }

    private fun parseStream(input: InputStream): List<ImportRow> = XSSFWorkbook(input).use { workbook ->
        val sheet = workbook.getSheetAt(0) ?: return emptyList()
        val formatter = DataFormatter()
        val header = sheet.getRow(0) ?: throw ImportValidationException(listOf(ImportError(1, "cabeçalho", "Use exatamente: mission_id, email, phase.")))
        val headers = (0..2).map { formatter.formatCellValue(header.getCell(it)).trim() }
        if (headers != listOf("mission_id", "email", "phase")) {
            throw ImportValidationException(listOf(ImportError(1, "cabeçalho", "Use exatamente: mission_id, email, phase.")))
        }
        (1..sheet.lastRowNum).mapNotNull { index ->
            val row = sheet.getRow(index) ?: return@mapNotNull null
            val mission = formatter.formatCellValue(row.getCell(0)).trim().let { runCatching { UUID.fromString(it) }.getOrNull() }
            val email = formatter.formatCellValue(row.getCell(1)).trim()
            val phase = formatter.formatCellValue(row.getCell(2)).trim().toIntOrNull()
            ImportRow(index + 1, mission, email, phase)
        }
    }
}

private data class SimulatedSubmission(val id: UUID, var currentPhase: Int)
