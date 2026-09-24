package br.com.vdevquest

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling

@EnableScheduling
@SpringBootApplication
class VdevQuestApplication

fun main(args: Array<String>) {
    runApplication<VdevQuestApplication>(*args)
}
