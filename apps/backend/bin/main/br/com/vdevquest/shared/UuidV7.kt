package br.com.vdevquest.shared

import com.github.f4b6a3.uuid.UuidCreator
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class UuidV7 {
    fun next(): UUID = UuidCreator.getTimeOrderedEpoch()
}
