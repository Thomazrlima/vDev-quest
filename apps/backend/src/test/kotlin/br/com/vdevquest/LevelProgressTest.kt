package br.com.vdevquest

import br.com.vdevquest.profile.LevelProgress
import br.com.vdevquest.profile.LevelRecord
import br.com.vdevquest.profile.levelProgress
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class LevelProgressTest {
    private val first = LevelRecord(1, 0, "Aventureiro")
    private val second = LevelRecord(2, 100, "Explorador")
    private val third = LevelRecord(3, 300, "Guardião")

    @Test
    fun `progress counts XP only within the current level interval`() {
        assertEquals(LevelProgress(25, 75), levelProgress(25, first, second))
        assertEquals(LevelProgress(25, 150), levelProgress(150, second, third))
    }

    @Test
    fun `progress resets on the next level and has no remainder at the highest level`() {
        assertEquals(LevelProgress(0, 200), levelProgress(100, second, third))
        assertEquals(LevelProgress(null, null), levelProgress(300, third, null))
    }
}
