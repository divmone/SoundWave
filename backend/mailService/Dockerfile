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
    -G Ninja \
    && cmake --build build --parallel $(nproc) \
    || true

COPY src ./src
COPY configs ./configs

RUN if [ "${BUILD_TYPE}" = "Debug" ]; then \
        cmake -B build \
            -DCMAKE_BUILD_TYPE=${BUILD_TYPE} \
            -DCMAKE_CXX_FLAGS="-g -O0 -fdebug-prefix-map=/app=." \
            -G Ninja; \
    else \
        cmake -B build \
            -DCMAKE_BUILD_TYPE=${BUILD_TYPE} \
            -G Ninja; \
    fi && \
    cmake --build build --parallel $(nproc) && \
    cmake --install build --prefix /install

RUN ldd /install/bin/db_test \
    | grep -oP '(?<=> )/[^ ]+' \
    | xargs -I{} cp --parents {} /install || true

# ============================================
# STAGE 2: Runtime
# ============================================
FROM ubuntu:22.04

ARG BUILD_TYPE=Release
ENV BUILD_TYPE=${BUILD_TYPE}

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates libpq5 curl \
    && rm -rf /var/lib/apt/lists/*

RUN if [ "$BUILD_TYPE" = "Debug" ]; then \
        apt-get update && apt-get install -y gdbserver; \
    fi

COPY --from=builder /install/bin/db_test /usr/local/bin/db_test
COPY --from=builder /install/etc/db_test /etc/db_test
COPY --from=builder /install/lib/* /usr/local/lib/
RUN ldconfig

COPY --from=builder /app/src /app/src

EXPOSE 8080

ENV DB_CONNECTION=""

CMD if [ "$BUILD_TYPE" = "Debug" ]; then \
        gdbserver :12345 /usr/local/bin/db_test -c /etc/db_test/static_config.yaml --config_vars /etc/db_test/config_vars.yaml; \
    else \
        /usr/local/bin/db_test -c /etc/db_test/static_config.yaml --config_vars /etc/db_test/config_vars.yaml; \
    fi