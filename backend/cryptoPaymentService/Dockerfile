# ============================================
# STAGE 1: Builder
# ============================================
ARG BUILD_TYPE=Release

FROM ubuntu:22.04 AS builder
ARG BUILD_TYPE
ENV BUILD_TYPE=${BUILD_TYPE}
RUN echo "Builder stage: BUILD_TYPE=${BUILD_TYPE}"

RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    ninja-build \
    g++ \
    libpq-dev \
    libssl-dev \
    libcurl4-openssl-dev \
    libboost-stacktrace-dev \
    git \
    tree \
    gdb \
    uuid-dev \
    zlib1g-dev \
    libjsoncpp-dev \
    && rm -rf /var/lib/apt/lists/*

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

COPY CMakeLists.txt /build/
COPY src /build/src
COPY config /build/config

# маппинг дебаг символов. страшно очень страшно.
# ну в clion по идее теперь маппить ничего не надо, оно само зарабоает по идее
RUN mkdir -p /build/build && cd /build/build && \
    echo "CMake build type: ${BUILD_TYPE}" && \
    if [ "${BUILD_TYPE}" = "Debug" ]; then \
        cmake .. -DCMAKE_BUILD_TYPE=${BUILD_TYPE} \
                 -DCMAKE_CXX_FLAGS="-g -O0 -fdebug-prefix-map=/build=/app"; \
    else \
        cmake .. -DCMAKE_BUILD_TYPE=${BUILD_TYPE}; \
    fi && \
    make -j$(nproc)

# ============================================
# STAGE 2: Runtime
# ============================================
FROM ubuntu:22.04

ARG BUILD_TYPE=Release
ENV BUILD_TYPE=${BUILD_TYPE}

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

RUN if [ "$BUILD_TYPE" = "Debug" ]; then \
        apt-get update && apt-get install -y gdbserver; \
    fi

COPY --from=builder /usr/local/lib/libdrogon.so* /usr/local/lib/
COPY --from=builder /usr/local/lib/libtrantor.so* /usr/local/lib/
RUN ldconfig

RUN mkdir -p /app/config /data/sounds

WORKDIR /app

COPY --from=builder /build/build/CryptoPaymentService /app/CryptoPaymentService
RUN chmod +x /app/CryptoPaymentService

COPY config /app/config

# Копируем исходники в /app/src (теперь пути в символах будут совпадать)
COPY --from=builder /build/src /app/src

EXPOSE 8080

CMD if [ "$BUILD_TYPE" = "Debug" ]; then \
        echo "Starting gdbserver on port 12345" && \
        gdbserver :12345 /app/CryptoPaymentService; \
    else \
        /app/CryptoPaymentService; \
    fi