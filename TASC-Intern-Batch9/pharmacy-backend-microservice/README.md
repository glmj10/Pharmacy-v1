# Pharmacy Backend Microservice

## 📋 Mục lục
- [Giới thiệu](#giới-thiệu)
- [Mô hình triển khai tổng thể](#mô-hình-triển-khai-tổng-thể)
- [Cấu trúc các Service](#cấu-trúc-các-service)
- [Luồng giao tiếp giữa các thành phần](#luồng-giao-tiếp-giữa-các-thành-phần)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Hướng dẫn cài đặt](#hướng-dẫn-cài-đặt)

---

## 🌟 Giới thiệu

Pharmacy Backend Microservice là một hệ thống backend được xây dựng theo kiến trúc microservices dành cho ứng dụng quản lý nhà thuốc trực tuyến. Hệ thống được thiết kế để đáp ứng các yêu cầu về tính mở rộng, độ tin cậy và hiệu suất cao.

---

## 🏗️ Mô hình triển khai tổng thể

### Kiến trúc Microservices

Hệ thống được chia thành các service độc lập, mỗi service đảm nhiệm một chức năng nghiệp vụ cụ thể:

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│                    (Web/Mobile Applications)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                       API GATEWAY                               │
│              (Spring Cloud Gateway - Port 8080)                 │
│         ┌────────────────────────────────────────┐              │
│         │  - Routing                             │              │
│         │  - Authentication/Authorization        │              │
│         │  - Rate Limiting                       │              │
│         │  - Load Balancing                      │              │
│         └────────────────────────────────────────┘              │
└─────┬──────────┬─────────┬──────────┬──────────┬───────────────┘
      │          │         │          │          │
┌─────▼──┐  ┌───▼────┐ ┌──▼─────┐ ┌─▼────┐  ┌──▼─────────┐
│Identity│  │Product │ │ Order  │ │ User │  │  Payment   │
│Service │  │Service │ │Service │ │Service  │  Service   │
└────────┘  └────────┘ └────────┘ └──────┘  └────────────┘
      │          │         │          │          │
┌─────▼──┐  ┌───▼────┐ ┌──▼─────┐ ┌─▼────┐  ┌──▼─────────┐
│  Cart  │  │  Blog  │ │  File  │ │Notifi│  │   Config   │
│Service │  │Service │ │Service │ │cation│  │   Server   │
└────────┘  └────────┘ └────────┘ └──────┘  └────────────┘
      │          │         │          │          │
┌─────┴──────────┴─────────┴──────────┴──────────┴─────────────┐
│                   INFRASTRUCTURE LAYER                        │
│  ┌─────────┐  ┌────────┐  ┌───────┐  ┌──────┐  ┌─────────┐  │
│  │  MySQL  │  │ Redis  │  │ Kafka │  │MinIO │  │Common   │  │
│  │Database │  │ Cache  │  │ Queue │  │Storage  │ Module  │  │
│  └─────────┘  └────────┘  └───────┘  └──────┘  └─────────┘  │
└───────────────────────────────────────────────────────────────┘
```

### Mô hình Deployment với Docker

```yaml
# Docker Compose Architecture
┌──────────────────────────────────────────────────────────────┐
│                    Docker Network: backend                   │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐      │
│  │   MySQL     │  │    Redis     │  │    Kafka      │      │
│  │   Port:3307 │  │   Port:6379  │  │   Port:9092   │      │
│  └─────────────┘  └──────────────┘  └───────────────┘      │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐      │
│  │   MinIO     │  │  Kafka UI    │  │               │      │
│  │ Port:9000/1 │  │  Port:9090   │  │               │      │
│  └─────────────┘  └──────────────┘  └───────────────┘      │
│                                                              │
│  ┌───────────────────────────────────────────────────┐      │
│  │          Microservices (Spring Boot)              │      │
│  │  - API Gateway (8080)                             │      │
│  │  - Config Server (8888)                           │      │
│  │  - Identity Service                               │      │
│  │  - Product Service                                │      │
│  │  - Order Service                                  │      │
│  │  - User Service                                   │      │
│  │  - Cart Service                                   │      │
│  │  - Payment Service                                │      │
│  │  - Blog Service                                   │      │
│  │  - File Service                                   │      │
│  │  - Notification Service                           │      │
│  └───────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔧 Cấu trúc các Service

### 1. **Config Server**
**Mô tả:** Quản lý cấu hình tập trung cho tất cả các microservices.
- **Port:** 8888
- **Chức năng:**
  - Lưu trữ cấu hình cho tất cả services
  - Hỗ trợ hot reload cấu hình
  - Quản lý profiles (dev, uat, prod)

### 2. **API Gateway**
**Mô tả:** Điểm vào duy nhất cho tất cả các request từ client.
- **Port:** 8080
- **Công nghệ:** Spring Cloud Gateway (WebFlux)
- **Chức năng:**
  - Routing requests đến các services tương ứng
  - Authentication & Authorization
  - Rate limiting
  - Load balancing
  - Request/Response logging
  - CORS handling

### 3. **Identity Service**
**Mô tả:** Quản lý xác thực và phân quyền người dùng.
- **Chức năng:**
  - Đăng ký, đăng nhập người dùng
  - Quản lý JWT tokens
  - Refresh token mechanism
  - Blacklist token (Redis)
  - OAuth2 integration
- **Database:** identity_db (MySQL)

### 4. **User Service**
**Mô tả:** Quản lý thông tin người dùng và hồ sơ cá nhân.
- **Chức năng:**
  - Quản lý thông tin người dùng
  - Profile management
  - Address management
  - User roles & permissions
- **Database:** user_db (MySQL)
- **Kafka:** Producer (USER_TOPIC)

### 5. **Product Service**
**Mô tả:** Quản lý sản phẩm, danh mục và thương hiệu.
- **Chức năng:**
  - CRUD operations cho products
  - Quản lý categories và brands
  - Product images management
  - Stock management
  - Promotion events (Quartz Scheduler)
  - Wishlist management
  - Cache warming (Redis)
  - Outbox pattern cho event publishing
- **Database:** product_db (MySQL)
- **Kafka:** 
  - Producer (PRODUCT_TOPIC)
  - Consumer (USER_TOPIC, ORDER_TOPIC)
- **Cache:** Redis (product details, stock, related products)
- **File Storage:** MinIO integration

### 6. **Order Service**
**Mô tả:** Xử lý đơn hàng và quản lý trạng thái đơn hàng.
- **Chức năng:**
  - Tạo và quản lý orders
  - Order status tracking
  - Order history
  - Revenue statistics
  - Order cancellation
  - Saga pattern implementation
- **Database:** order_db (MySQL)
- **Kafka:** 
  - Producer (ORDER_TOPIC)
  - Consumer (USER_TOPIC, PRODUCT_TOPIC, PROFILE_TOPIC, PAYMENT_TOPIC)

### 7. **Cart Service**
**Mô tả:** Quản lý giỏ hàng của người dùng.
- **Chức năng:**
  - Add/Remove/Update cart items
  - Cart persistence
  - Cart validation với product stock
- **Database:** cart_db (MySQL)
- **Kafka:** Consumer (PRODUCT_TOPIC, USER_TOPIC)

### 8. **Payment Service**
**Mô tả:** Xử lý thanh toán và tích hợp payment gateways.
- **Chức năng:**
  - Payment processing
  - VNPay integration
  - Payment verification
  - Transaction history
- **Database:** payment_db (MySQL)
- **Kafka:** Producer (PAYMENT_TOPIC)

### 9. **Blog Service**
**Mô tả:** Quản lý blog và bài viết.
- **Chức năng:**
  - CRUD operations cho blog posts
  - Blog categories management
  - Comments management
- **Database:** blog_db (MySQL)
- **Kafka:** Consumer (CATEGORY_TOPIC)

### 10. **File Service**
**Mô tả:** Quản lý file upload/download.
- **Port:** 6969
- **Chức năng:**
  - File upload/download
  - Image processing
  - File metadata management
- **Storage:** MinIO (Object Storage)
- **Database:** file_db (MySQL)

### 11. **Notification Service**
**Mô tả:** Gửi thông báo đến người dùng.
- **Chức năng:**
  - Email notifications
  - SMS notifications (future)
  - Push notifications (future)
  - Template management
- **Database:** notification_db (MySQL)
- **Kafka:** Consumer (ORDER_TOPIC, USER_TOPIC)

### 12. **Common Module**
**Mô tả:** Shared library chứa code dùng chung.
- **Chức năng:**
  - Common DTOs
  - Common exceptions
  - Security utilities
  - Kafka event models
  - Redis service
  - Base entities
  - Mappers interfaces
  - Enums

---

## 🔄 Luồng giao tiếp giữa các thành phần

### Sơ đồ tổng quan (PlantUML)

```plantuml
@startuml
!theme plain
skinparam backgroundColor #FEFEFE
skinparam componentStyle rectangle

title Pharmacy Backend - Component Communication Flow

actor Client
component "API Gateway\n(Port 8080)" as Gateway
component "Config Server\n(Port 8888)" as Config

package "Microservices Layer" {
    component "Identity Service" as Identity
    component "User Service" as User
    component "Product Service" as Product
    component "Order Service" as Order
    component "Cart Service" as Cart
    component "Payment Service" as Payment
    component "Blog Service" as Blog
    component "File Service\n(Port 6969)" as File
    component "Notification Service" as Notification
}

package "Infrastructure Layer" {
    database "MySQL\n(Port 3307)" as MySQL {
        database "identity_db"
        database "user_db"
        database "product_db"
        database "order_db"
        database "cart_db"
        database "payment_db"
        database "blog_db"
        database "file_db"
        database "notification_db"
    }
    
    database "Redis\n(Port 6379)" as Redis
    queue "Kafka\n(Port 9092)" as Kafka
    storage "MinIO\n(Port 9000)" as MinIO
}

' Client connections
Client --> Gateway : HTTP/HTTPS

' Gateway to Services
Gateway --> Identity : REST
Gateway --> User : REST
Gateway --> Product : REST
Gateway --> Order : REST
Gateway --> Cart : REST
Gateway --> Payment : REST
Gateway --> Blog : REST
Gateway --> File : REST
Gateway --> Notification : REST

' Config Server connections
Config <.. Identity : Config
Config <.. User : Config
Config <.. Product : Config
Config <.. Order : Config
Config <.. Cart : Config
Config <.. Payment : Config
Config <.. Blog : Config
Config <.. File : Config
Config <.. Notification : Config

' Service to Database
Identity --> identity_db
User --> user_db
Product --> product_db
Order --> order_db
Cart --> cart_db
Payment --> payment_db
Blog --> blog_db
File --> file_db
Notification --> notification_db

' Redis connections
Gateway --> Redis : Token Blacklist
Product --> Redis : Cache
Order --> Redis : Cache

' Kafka Pub/Sub
User ..> Kafka : Publish USER_TOPIC
Product ..> Kafka : Publish PRODUCT_TOPIC
Order ..> Kafka : Publish ORDER_TOPIC
Payment ..> Kafka : Publish PAYMENT_TOPIC

Kafka ..> Product : Subscribe USER_TOPIC,\nORDER_TOPIC
Kafka ..> Order : Subscribe USER_TOPIC,\nPRODUCT_TOPIC,\nPAYMENT_TOPIC
Kafka ..> Cart : Subscribe PRODUCT_TOPIC,\nUSER_TOPIC
Kafka ..> Notification : Subscribe ORDER_TOPIC,\nUSER_TOPIC
Kafka ..> Blog : Subscribe CATEGORY_TOPIC

' File Service connections
Product --> File : Upload/Download
File --> MinIO : Store Files
User --> File : Upload/Download

' Inter-service communication
Product ..> File : Feign Client
Order ..> Product : Event-driven

@enduml
```

### Luồng xử lý đặt hàng (Order Flow)

```plantuml
@startuml
!theme plain
title Order Processing Flow

actor Customer
participant "API Gateway" as Gateway
participant "Cart Service" as Cart
participant "Order Service" as Order
participant "Product Service" as Product
participant "Payment Service" as Payment
participant "Notification Service" as Notification
queue "Kafka" as Kafka
database "Redis" as Redis
database "MySQL" as MySQL

Customer -> Gateway: 1. View Cart
Gateway -> Cart: Get Cart Items
Cart -> MySQL: Query cart_db
MySQL --> Cart: Cart Data
Cart --> Gateway: Cart Items
Gateway --> Customer: Display Cart

Customer -> Gateway: 2. Checkout
Gateway -> Order: Create Order
Order -> MySQL: Insert order_db
Order -> Kafka: Publish ORDER_CREATED
Order --> Gateway: Order Created
Gateway --> Customer: Order Confirmation

Kafka -> Product: Consume ORDER_CREATED
Product -> MySQL: Update Stock (product_db)
Product -> Redis: Update Stock Cache
Product -> Kafka: Publish PRODUCT_UPDATED

Kafka -> Notification: Consume ORDER_CREATED
Notification -> Notification: Send Email Confirmation

Customer -> Gateway: 3. Make Payment
Gateway -> Payment: Process Payment
Payment -> Payment: VNPay Integration
Payment -> MySQL: Insert payment_db
Payment -> Kafka: Publish PAYMENT_COMPLETED
Payment --> Gateway: Payment Success
Gateway --> Customer: Payment Confirmation

Kafka -> Order: Consume PAYMENT_COMPLETED
Order -> MySQL: Update order_status\n(order_db)
Order -> Kafka: Publish ORDER_CONFIRMED

Kafka -> Notification: Consume ORDER_CONFIRMED
Notification -> Notification: Send Order\nConfirmed Email

note right of Order
  Saga Pattern:
  - Orchestrates transactions
  - Handles compensating actions
  - Ensures data consistency
end note

@enduml
```

### Luồng Authentication & Authorization

```plantuml
@startuml
!theme plain
title Authentication & Authorization Flow

actor User
participant "API Gateway" as Gateway
participant "Identity Service" as Identity
participant "User Service" as UserService
participant "Other Services" as Services
database "Redis" as Redis
database "MySQL" as MySQL

User -> Gateway: 1. Login Request\n(username, password)
Gateway -> Identity: Forward Login
Identity -> MySQL: Query user credentials\n(identity_db)
MySQL --> Identity: User Data

alt Valid Credentials
    Identity -> Identity: Generate JWT\n(Access + Refresh Token)
    Identity -> Redis: Store Refresh Token
    Identity --> Gateway: Tokens + User Info
    Gateway --> User: Login Success
else Invalid Credentials
    Identity --> Gateway: 401 Unauthorized
    Gateway --> User: Login Failed
end

User -> Gateway: 2. API Request\n+ Access Token
Gateway -> Gateway: Validate JWT
Gateway -> Redis: Check Token Blacklist

alt Token Valid
    Gateway -> Services: Forward Request\n+ User Context
    Services -> MySQL: Process Business Logic
    Services --> Gateway: Response
    Gateway --> User: Success Response
else Token Invalid/Expired
    Gateway --> User: 401 Unauthorized
    User -> Gateway: 3. Refresh Token
    Gateway -> Identity: Refresh Request
    Identity -> Redis: Verify Refresh Token
    alt Refresh Token Valid
        Identity -> Identity: Generate New Access Token
        Identity --> Gateway: New Access Token
        Gateway --> User: New Token
    else Refresh Token Invalid
        Identity --> Gateway: 401 Unauthorized
        Gateway --> User: Re-login Required
    end
end

User -> Gateway: 4. Logout
Gateway -> Identity: Logout Request
Identity -> Redis: Add Token to Blacklist
Identity -> Redis: Remove Refresh Token
Identity --> Gateway: Logout Success
Gateway --> User: Logged Out

@enduml
```

### Luồng Product Cache Management

```plantuml
@startuml
!theme plain
title Product Cache Management Flow

actor Admin
actor Customer
participant "API Gateway" as Gateway
participant "Product Service" as Product
database "Redis Cache" as Redis
database "MySQL" as MySQL
queue "Kafka" as Kafka

== Cache Warming (Application Startup) ==
Product -> Product: Application Start
Product -> MySQL: Load Popular Products\n(product_db)
MySQL --> Product: Product Data
Product -> Redis: Warm Up Cache\n- Product Details\n- Stock Info\n- Related Products
Redis --> Product: Cache Ready

== Customer Product View ==
Customer -> Gateway: GET /products/{slug}
Gateway -> Product: Get Product Detail
Product -> Redis: Check Cache
alt Cache Hit
    Redis --> Product: Cached Data
    Product --> Gateway: Product Detail
else Cache Miss
    Product -> MySQL: Query product_db
    MySQL --> Product: Product Data
    Product -> Redis: Cache Product Detail
    Product --> Gateway: Product Detail
end
Gateway --> Customer: Display Product

== Admin Product Update ==
Admin -> Gateway: PUT /products/{id}
Gateway -> Product: Update Product
Product -> MySQL: Update product_db
MySQL --> Product: Updated
Product -> Redis: Invalidate Cache\n- Product Detail\n- Related Products\n- Stock
Product -> Kafka: Publish PRODUCT_UPDATED
Product --> Gateway: Update Success
Gateway --> Admin: Confirmation

Kafka -> Product: Consume PRODUCT_UPDATED
Product -> Redis: Update Cache

== Stock Update (Order Placed) ==
Kafka -> Product: Consume ORDER_CREATED
Product -> MySQL: Deduct Stock
Product -> Redis: Update Stock Cache
Product -> Kafka: Publish PRODUCT_UPDATED

note right of Redis
  Cache Keys:
  - product:detail:{slug}
  - product:stock:{id}
  - product:related:{id}
  - wishlist:user:{userId}
end note

@enduml
```

### Luồng Event-Driven Communication (Outbox Pattern)

```plantuml
@startuml
!theme plain
title Event-Driven Communication with Outbox Pattern

participant "Product Service" as Product
database "product_db\n(MySQL)" as MySQL
participant "Outbox Poller\n(Scheduled Job)" as Poller
queue "Kafka" as Kafka
participant "Order Service" as Order
participant "Cart Service" as Cart
participant "Notification Service" as Notification

== Product Update Event ==
Product -> Product: Business Transaction
activate Product
Product -> MySQL: 1. Update Product Table
Product -> MySQL: 2. Insert Outbox Event\n(Same Transaction)
note right
  Outbox Event:
  - aggregate_id
  - event_type
  - payload
  - status: PENDING
end note
Product --> Product: Commit Transaction
deactivate Product

== Outbox Pattern Polling ==
loop Every 5 seconds
    Poller -> MySQL: 3. SELECT * FROM outbox\nWHERE status = 'PENDING'\nLIMIT 100
    MySQL --> Poller: Pending Events
    
    loop For Each Event
        Poller -> Kafka: 4. Publish Event
        alt Publish Success
            Kafka --> Poller: ACK
            Poller -> MySQL: 5. UPDATE outbox\nSET status = 'SENT'
        else Publish Failed
            Kafka --> Poller: NACK
            Poller -> MySQL: 5. UPDATE outbox\nSET status = 'FAILED'\nretry_count++
        end
    end
end

== Event Consumption ==
Kafka -> Order: 6. Consume PRODUCT_UPDATED
activate Order
Order -> Order: Update Product Cache
Order -> Order: Validate Orders
Order --> Kafka: ACK
deactivate Order

Kafka -> Cart: 6. Consume PRODUCT_UPDATED
activate Cart
Cart -> Cart: Update Cart Items
Cart -> Cart: Validate Stock
Cart --> Kafka: ACK
deactivate Cart

note over Product, Notification
  Benefits of Outbox Pattern:
  1. Ensures atomicity between DB update & event publishing
  2. Guarantees at-least-once delivery
  3. Maintains event ordering
  4. Handles transient failures
  5. Provides audit trail
end note

@enduml
```

### Luồng File Upload & Management

```plantuml
@startuml
!theme plain
title File Upload & Management Flow

actor User
participant "API Gateway" as Gateway
participant "Product Service" as Product
participant "File Service" as File
storage "MinIO" as MinIO
database "file_db\n(MySQL)" as FileDB
database "product_db\n(MySQL)" as ProductDB

== Product Creation with Images ==
User -> Gateway: POST /products\n+ thumbnail\n+ images[]
Gateway -> Product: Create Product Request

activate Product
Product -> File: 1. Upload Thumbnail
activate File
File -> MinIO: Store File
MinIO --> File: File Path
File -> FileDB: Save Metadata
FileDB --> File: File Metadata
File --> Product: FileMetadataResponse\n(id, path, url)
deactivate File

loop For Each Image
    Product -> File: 2. Upload Image
    activate File
    File -> MinIO: Store File
    MinIO --> File: File Path
    File -> FileDB: Save Metadata
    File --> Product: FileMetadataResponse
    deactivate File
end

Product -> ProductDB: 3. Save Product\n+ thumbnail_uuid\n+ thumbnail_path
ProductDB --> Product: Product Created
Product --> Gateway: Product Response
Gateway --> User: Success
deactivate Product

== Product Image Update ==
User -> Gateway: PUT /products/{id}\n+ new images
Gateway -> Product: Update Product

activate Product
alt Has New Thumbnail
    Product -> File: Delete Old Thumbnail
    activate File
    File -> MinIO: Delete File
    File -> FileDB: Update Status
    File --> Product: Deleted
    deactivate File
    
    Product -> File: Upload New Thumbnail
    activate File
    File -> MinIO: Store File
    File -> FileDB: Save Metadata
    File --> Product: New Metadata
    deactivate File
end

Product -> ProductDB: Update Product Info
Product --> Gateway: Updated
Gateway --> User: Success
deactivate Product

== File Serving ==
User -> Gateway: GET /files/{uuid}
Gateway -> File: Get File
File -> FileDB: Query Metadata
FileDB --> File: File Info
File -> MinIO: Get File
MinIO --> File: File Data
File --> Gateway: File Stream
Gateway --> User: File Content

note right of MinIO
  MinIO Buckets:
  - pharmacy-product
  - pharmacy-category
  - pharmacy-blog
  - pharmacy-user
  
  File Categories:
  - PRODUCT
  - CATEGORY
  - BLOG
  - USER_AVATAR
end note

@enduml
```

---

## 🏛️ Kiến trúc hệ thống

### Patterns và Principles

1. **Microservices Architecture**
   - Service Independence
   - Database per Service
   - Decentralized Data Management

2. **Event-Driven Architecture**
   - Asynchronous Communication via Kafka
   - Event Sourcing
   - CQRS (Command Query Responsibility Segregation)

3. **Outbox Pattern**
   - Ensures atomicity between DB updates and event publishing
   - Transactional outbox table
   - Polling publisher

4. **Saga Pattern**
   - Distributed transaction management
   - Orchestration-based saga in Order Service
   - Compensating transactions

5. **API Gateway Pattern**
   - Single entry point
   - Centralized authentication
   - Request routing and composition

6. **Cache-Aside Pattern**
   - Redis caching for frequently accessed data
   - Cache invalidation strategies
   - Cache warming on startup

7. **Circuit Breaker Pattern** (Future)
   - Resilience4j integration planned
   - Fault tolerance
   - Fallback mechanisms

---

## 💻 Công nghệ sử dụng

### Backend Framework
- **Spring Boot 3.5.5** - Core framework
- **Spring Cloud Gateway** - API Gateway
- **Spring Cloud Config** - Configuration management
- **Spring Data JPA** - Data persistence
- **Spring Security** - Authentication & Authorization
- **Spring Kafka** - Event streaming
- **Spring WebFlux** - Reactive programming (Gateway)

### Database & Storage
- **MySQL 8.x** - Relational database
- **Redis** - Caching & Session management
- **MinIO** - Object storage for files

### Message Queue
- **Apache Kafka** - Event streaming platform
- **Kafka UI** - Kafka management interface

### Others
- **MapStruct** - Object mapping
- **Lombok** - Boilerplate code reduction
- **Quartz Scheduler** - Job scheduling
- **JWT** - Token-based authentication
- **Docker & Docker Compose** - Containerization
- **Maven** - Build tool

---

## 🚀 Hướng dẫn cài đặt

### Prerequisites

- **Java 17+**
- **Maven 3.8+**
- **Docker & Docker Compose**
- **Git**

### Clone Repository

```bash
git clone https://github.com/your-repo/pharmacy-backend-microservice.git
cd pharmacy-backend-microservice
```

### Setup Infrastructure với Docker Compose

```bash
# Start all infrastructure services
docker-compose up -d

# Verify services are running
docker-compose ps

# View logs
docker-compose logs -f
```

### Build Common Module

```bash
cd common
mvn clean install
cd ..
```

### Build và chạy các Microservices

#### Option 1: Run từng service riêng

```bash
# Config Server (chạy đầu tiên)
cd config-server
mvn spring-boot:run

# API Gateway
cd ../api-gateway
mvn spring-boot:run

# Other services
cd ../identity-service
mvn spring-boot:run

cd ../user-service
mvn spring-boot:run

cd ../product-service
mvn spring-boot:run

cd ../order-service
mvn spring-boot:run

cd ../cart-service
mvn spring-boot:run

cd ../payment-service
mvn spring-boot:run

cd ../blog-service
mvn spring-boot:run

cd ../file-service
mvn spring-boot:run

cd ../notification-service
mvn spring-boot:run
```

#### Option 2: Build tất cả

```bash
# Build all services
mvn clean install -DskipTests

# Run each service in separate terminal
```

### Cấu hình Environment Variables

Mỗi service cần cấu hình các biến môi trường:

```properties
# Config Server
CONFIG_SERVER_URI=http://localhost:8888
SPRING_PROFILES_ACTIVE=dev

# Database
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3307/[db_name]
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=1234

# Redis
SPRING_REDIS_HOST=localhost
SPRING_REDIS_PORT=6379

# Kafka
SPRING_KAFKA_BOOTSTRAP_SERVERS=localhost:29092

# MinIO (File Service)
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

### Truy cập các Services

| Service | URL | Description |
|---------|-----|-------------|
| API Gateway | http://localhost:8080 | Main entry point |
| Config Server | http://localhost:8888 | Configuration server |
| Kafka UI | http://localhost:9090 | Kafka management |
| MinIO Console | http://localhost:9001 | Object storage console |
| MySQL | localhost:3307 | Database |
| Redis | localhost:6379 | Cache server |

### Tạo Kafka Topics

```bash
# Exec into Kafka container
docker exec -it kafka bash

# Create topics
kafka-topics --create --topic USER_TOPIC --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
kafka-topics --create --topic PRODUCT_TOPIC --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
kafka-topics --create --topic ORDER_TOPIC --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
kafka-topics --create --topic PAYMENT_TOPIC --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
kafka-topics --create --topic CATEGORY_TOPIC --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1

# List topics
kafka-topics --list --bootstrap-server localhost:9092
```

### Testing

```bash
# Run tests
mvn test

# Run tests for specific service
cd product-service
mvn test
```

---

## 📚 API Documentation

API documentation được tự động sinh ra bằng Swagger/OpenAPI cho mỗi service.

- **API Gateway Swagger UI**: http://localhost:8080/swagger-ui.html
- **Service Documentation**: http://localhost:{service-port}/swagger-ui.html

---

## 🔐 Security

- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control (RBAC)
- **Token Management**: Access token + Refresh token
- **Token Blacklist**: Redis-based token blacklist for logout
- **Password Encryption**: BCrypt

---

## 📊 Monitoring & Logging (Future)

- **Spring Boot Actuator** - Health checks and metrics
- **Prometheus** - Metrics collection
- **Grafana** - Metrics visualization
- **ELK Stack** - Centralized logging
- **Zipkin/Jaeger** - Distributed tracing

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Team

- **Backend Team** - TASC Intern Batch 9

---

## 📧 Contact

For any questions or support, please contact: [your-email@example.com]

---

## 🗺️ Roadmap

- [ ] Implement Circuit Breaker pattern
- [ ] Add distributed tracing (Zipkin/Jaeger)
- [ ] Implement API rate limiting per user
- [ ] Add GraphQL support
- [ ] Implement WebSocket for real-time notifications
- [ ] Add comprehensive monitoring dashboard
- [ ] Implement automated backup strategies
- [ ] Add multi-language support
- [ ] Implement advanced search with Elasticsearch
- [ ] Add mobile app backend support
