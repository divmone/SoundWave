# Build stage
FROM ghcr.io/userver-framework/ubuntu-22.04-userver:v2.15 AS builder

WORKDIR /app

COPY CMakeLists.txt .
COPY cmake ./cmake

RUN cmake -B build-release \
    -DCMAKE_BUILD_TYPE=Release \
    -DUSERVER_FEATURE_MONGODB=ON \
    -DUSERVER_FEATURE_POSTGRESQL=OFF \
    -DUSERVER_FEATURE_GRPC=OFF \
    -DUSERVER_FEATURE_REDIS=OFF \
    -G Ninja \
    && cmake --build build-release --parallel $(nproc) \
    || true

COPY src ./src
COPY configs ./configs

RUN cmake -B build-release \
    -DCMAKE_BUILD_TYPE=Release \
    -DUSERVER_FEATURE_MONGODB=ON \
    -DUSERVER_FEATURE_POSTGRESQL=OFF \
    -DUSERVER_FEATURE_GRPC=OFF \
    -DUSERVER_FEATURE_REDIS=OFF \
    -G Ninja \
    && cmake --build build-release --parallel $(nproc) \
    && cmake --install build-release --prefix /install

RUN ldd /install/bin/commentService \
    | grep -oP '(?<=> )/[^ ]+' \
    | xargs -I{} cp --parents {} /install

# Runtime stage
FROM ubuntu:22.04 AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /install/bin/commentService /usr/local/bin/commentService
COPY --from=builder /install/etc/commentService /etc/commentService
COPY --from=builder /install/lib /usr/lib

EXPOSE 8080

ENV MONGO_URI=""

HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/ping || exit 1

CMD ["commentService", "-c", "/etc/commentService/static_config.yaml", "--config_vars", "/etc/commentService/config_vars.yaml"]
