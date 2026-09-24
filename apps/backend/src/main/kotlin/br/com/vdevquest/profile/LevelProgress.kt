package br.com.vdevquest.profile

data class LevelProgress(val percent: Int?, val xpToNextLevel: Long?)

fun levelProgress(xp: Long, current: LevelRecord, next: LevelRecord?): LevelProgress {
    if (next == null) return LevelProgress(null, null)
    val interval = next.minimumXp - current.minimumXp
    val percent = if (interval <= 0) 100 else (((xp - current.minimumXp) * 100) / interval).toInt().coerceIn(0, 100)
    return LevelProgress(percent, next.minimumXp - xp)
}
