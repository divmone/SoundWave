# ============================================
# STAGE 1: Builder
# ============================================    
FROM ubuntu:22.04 AS builder

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

WORKDIR /build

# Сборка Drogon
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

# Копируем исходники soundsStorageService
COPY src /build/src
COPY CMakeLists.txt /build/
COPY config /build/config
COPY database /build/database

# Сборка soundsStorageService
RUN mkdir -p /build/build && cd /build/build && \
    cmake .. -DCMAKE_BUILD_TYPE=Release && \
    make -j$(nproc)

# ============================================
# STAGE 2: Runtime
# ============================================
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    libpq-dev \
    ca-certificates \
    libssl-dev \
    libcurl4 \
    uuid-runtime \
    zlib1g \
    libjsoncpp-dev \
    gettext-base \
    && rm -rf /var/lib/apt/lists/*

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


#xfsdfasdasdadssad asdasd