FROM alpine:3.20

ARG TARGETARCH
ARG MC_RELEASE=RELEASE.2025-08-13T08-35-41Z

RUN apk add --no-cache ca-certificates curl \
    && curl --fail --show-error --silent --location \
      "https://github.com/minio/mc/releases/download/${MC_RELEASE}/mc.linux-${TARGETARCH}.${MC_RELEASE}" \
      --output /usr/local/bin/mc \
    && chmod 0755 /usr/local/bin/mc

ENTRYPOINT ["/usr/local/bin/mc"]
