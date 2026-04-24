# ============================================
# STAGE 1: Builder
# ============================================
ARG BUILD_TYPE=Release

FROM ubuntu:22.04 AS builder
ARG BUILD_TYPE
ENV BUILD_TYPE=${BUILD_TYPE}

# 1. Установка пакетов (меняется редко)
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    ninja-build \
    g++ \
    libpq-dev \
    libssl-dev \
    libcurl4-openssl-dev \
    git \
    uuid-dev \
    zlib1g-dev \
    libjsoncpp-dev \
    && rm -rf /var/lib/apt/lists/*

# 2. Сборка Drogon (меняется ещё реже)
#    Пересобирается только если изменился этот слой
RUN git clone https://github.com/drogonframework/drogon.git && \
    cd drogon && \
    git submodule update --init && \
    mkdir build && cd build && \
    cmake .. -DCMAKE_BUILD_TYPE=Release \
             -DBUILD_EXAMPLES=OFF \
             -DBUILD_CTL=OFF \
             -DUSE_ORM=ON \
             -DUSE_POSTGRES=ON && \
    make -j$(nproc) && \
    make install && \
    ldconfig

# 3. Копируем CMakeLists.txt отдельно (меняется реже кода)
COPY CMakeLists.txt /build/
COPY database /build/database

# 4. Сборка зависимостей (кэшируется, пока CMakeLists.txt не изменился)
RUN mkdir -p /build/build && cd /build/build && \
    cmake .. -DCMAKE_BUILD_TYPE=${BUILD_TYPE} && \
    make -j$(nproc)

# 5. Копируем исходники (меняется часто) — ПОСЛЕ сборки зависимостей
COPY src /build/src
COPY config /build/config

# 6. Пересобираем только код (зависимости уже собраны)
RUN cd /build/build && \
    make -j$(nproc)

# ============================================
# STAGE 2: Runtime
# ============================================
FROM ubuntu:22.04

# СНОВА объявляем ARG (обязательно!)
ARG BUILD_TYPE=Release
ENV BUILD_TYPE=${BUILD_TYPE}
RUN echo "Runtime stage: BUILD_TYPE=${BUILD_TYPE}"

RUN apt-get update && apt-get install -y \
    curl \
    libpq-dev \
    ca-certificates \
    libssl-dev \
    libcurl4 \
    uuid-runtime \
    zlib1g \
    libjsoncpp-dev \
    gettext-base \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем gdbserver только для Debug сборки
RUN if [ "$BUILD_TYPE" = "Debug" ]; then \
        echo "Installing gdbserver for Debug build" && \
        apt-get update && apt-get install -y gdbserver; \
    else \
        echo "Release build (${BUILD_TYPE}), skipping gdbserver"; \
    fi

COPY --from=builder /usr/local/lib/libdrogon.so* /usr/local/lib/
COPY --from=builder /usr/local/lib/libtrantor.so* /usr/local/lib/
RUN ldconfig

RUN mkdir -p /app/config /data/sounds

WORKDIR /app

COPY --from=builder /build/build/SoundsStorageService /app/SoundsStorageService
COPY config /app/config

RUN chmod +x /app/SoundsStorageService

EXPOSE 8080

CMD ["/app/SoundsStorageService"]