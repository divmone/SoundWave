# ============================================
# STAGE 1: Builder
# ============================================
ARG BUILD_TYPE=Release

FROM ubuntu:22.04 AS builder
ARG BUILD_TYPE
ENV BUILD_TYPE=${BUILD_TYPE}
RUN echo "Builder stage: BUILD_TYPE=${BUILD_TYPE}"

# 1. Install packages
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

# 2. Build Drogon (cached)
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

# 3. Copy project files
COPY CMakeLists.txt /build/
COPY src /build/src

# 4. Build project
RUN mkdir -p /build/build && cd /build/build && \
    echo "CMake build type: ${BUILD_TYPE}" && \
    cmake .. -DCMAKE_BUILD_TYPE=${BUILD_TYPE} && \
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
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/local/lib/libdrogon.so* /usr/local/lib/
COPY --from=builder /usr/local/lib/libtrantor.so* /usr/local/lib/
RUN ldconfig

RUN mkdir -p /app/config

WORKDIR /app

COPY --from=builder /build/build/PaymentService /app/PaymentService
COPY config /app/config

RUN chmod +x /app/PaymentService

EXPOSE 8080

CMD ["/app/PaymentService"]