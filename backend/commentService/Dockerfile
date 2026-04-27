# ============================================
# STAGE 1: Builder
# ============================================
ARG BUILD_TYPE=Release

FROM ghcr.io/userver-framework/ubuntu-22.04-userver:v2.15 AS builder
ARG BUILD_TYPE
ENV BUILD_TYPE=${BUILD_TYPE}

WORKDIR /app

COPY CMakeLists.txt .
COPY cmake ./cmake

RUN cmake -B build \
    -DCMAKE_BUILD_TYPE=${BUILD_TYPE} \
    -DUSERVER_FEATURE_MONGODB=ON \
    -DUSERVER_FEATURE_POSTGRESQL=OFF \
    -DUSERVER_FEATURE_GRPC=OFF \
    -DUSERVER_FEATURE_REDIS=OFF \
    -G Ninja \
    && cmake --build build --parallel $(nproc) \
    || true

COPY src ./src
COPY configs ./configs

RUN if [ "${BUILD_TYPE}" = "Debug" ]; then \
        cmake -B build \
            -DCMAKE_BUILD_TYPE=${BUILD_TYPE} \
            -DUSERVER_FEATURE_MONGODB=ON \
            -DUSERVER_FEATURE_POSTGRESQL=OFF \
            -DUSERVER_FEATURE_GRPC=OFF \
            -DUSERVER_FEATURE_REDIS=OFF \
            -DCMAKE_CXX_FLAGS="-g -O0 -fdebug-prefix-map=/app=." \
            -G Ninja; \
    else \
        cmake -B build \
            -DCMAKE_BUILD_TYPE=${BUILD_TYPE} \
            -DUSERVER_FEATURE_MONGODB=ON \
            -DUSERVER_FEATURE_POSTGRESQL=OFF \
            -DUSERVER_FEATURE_GRPC=OFF \
            -DUSERVER_FEATURE_REDIS=OFF \
            -G Ninja; \
    fi && \
    cmake --build build --parallel $(nproc) && \
    cmake --install build --prefix /install

RUN ldd /install/bin/commentService \
    | grep -oP '(?<=> )/[^ ]+' \
    | xargs -I{} cp --parents {} /install

# ============================================
# STAGE 2: Runtime
# ============================================
FROM ubuntu:22.04

ARG BUILD_TYPE=Release
ENV BUILD_TYPE=${BUILD_TYPE}

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

RUN if [ "$BUILD_TYPE" = "Debug" ]; then \
        apt-get update && apt-get install -y gdbserver; \
    fi

COPY --from=builder /install/bin/commentService /usr/local/bin/commentService
COPY --from=builder /install/etc/commentService /etc/commentService
COPY --from=builder /install/lib /usr/lib
COPY --from=builder /app/src /app/src

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/ping || exit 1

CMD if [ "$BUILD_TYPE" = "Debug" ]; then \
        gdbserver :12345 /usr/local/bin/commentService; \
    else \
        /usr/local/bin/commentService -c /etc/commentService/static_config.yaml --config_vars /etc/commentService/config_vars.yaml; \
    fi