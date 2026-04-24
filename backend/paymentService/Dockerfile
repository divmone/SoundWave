# Build stage
FROM ghcr.io/userver-framework/ubuntu-22.04-userver:v2.15 AS builder

WORKDIR /app

# Сначала копируем только файлы с зависимостями
COPY CMakeLists.txt .
COPY cmake ./cmake

# Собираем зависимости (этот слой будет кэшироваться, пока не изменится CMakeLists.txt или cmake/)
RUN cmake -B build-release \
    -DCMAKE_BUILD_TYPE=Release \
    -DUSERVER_FEATURE_POSTGRESQL=ON \
    -G Ninja \
    && cmake --build build-release --parallel $(nproc) \
    || true  # Может упасть из-за отсутствия исходников, игнорируем

# Теперь копируем исходники
COPY src ./src
COPY configs ./configs

# Собираем проект (будет пересобираться только при изменении src/)
RUN cmake -B build-release \
    -DCMAKE_BUILD_TYPE=Release \
    -DUSERVER_FEATURE_POSTGRESQL=ON \
    -G Ninja \
    && cmake --build build-release --parallel $(nproc) \
    && cmake --install build-release --prefix /install

# Collect all shared library dependencies
RUN ldd /install/bin/paymentService \
    | grep -oP '(?<=> )/[^ ]+' \
    | xargs -I{} cp --parents {} /install

# Runtime stage
FROM ubuntu:22.04 AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /install/bin/paymentService /usr/local/bin/paymentService
COPY --from=builder /install/etc/paymentService /etc/paymentService
COPY --from=builder /install/lib /usr/lib

EXPOSE 8080

ENV DB_CONNECTION=""

CMD ["paymentService", "-c", "/etc/paymentService/static_config.yaml", "--config_vars", "/etc/paymentService/config_vars.yaml"]