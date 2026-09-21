FROM gradle:8.13-jdk21-alpine AS build
WORKDIR /workspace
COPY --chown=gradle:gradle . .
RUN gradle bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S vdev && adduser -S vdev -G vdev
COPY --from=build /workspace/build/libs/*.jar app.jar
USER vdev
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
