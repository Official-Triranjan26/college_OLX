 # Learning Jenkins by building CI-CD pipeline for a containerized mern application

                ┌─────────────────────────────────────┐
                │ 1. Checkout Source                  │
                └──────────────────┬──────────────────┘
                                   ▼
                ┌─────────────────────────────────────┐
                │ 2. Install Dependencies             │
                └──────────────────┬──────────────────┘
                                   ▼
                ┌─────────────────────────────────────┐
                │ 3. Lint                             │
                │                                     │
                │  Fast code quality validation       │
                └──────────────────┬──────────────────┘
                                   ▼
                ┌─────────────────────────────────────┐
                │ 4. Unit Tests                       │
                │                                     │
                │  Test isolated application logic    │
                └──────────────────┬──────────────────┘
                                   ▼
                ┌─────────────────────────────────────┐
                │ 5. Integration Tests                │
                │                                     │
                │  Backend + Database                 │
                └──────────────────┬──────────────────┘
                                   ▼
                ┌─────────────────────────────────────┐
                │ 6. Build Docker Images              │
                │                                     │
                │  Frontend + Backend                 │
                └──────────────────┬──────────────────┘
                                   ▼
                ┌─────────────────────────────────────┐
                │ 7. Start Containers                 │
                │                                     │
                │  docker compose up                  │
                └──────────────────┬──────────────────┘
                                   ▼
                ┌─────────────────────────────────────┐
                │ 8. Smoke Tests                      │
                │                                     │
                │  Are containers healthy?            │
                └──────────────────┬──────────────────┘
                                   ▼
                ┌─────────────────────────────────────┐
                │ 9. E2E Tests                        │
                │                                     │
                │  Playwright                         │
                └──────────────────┬──────────────────┘
                                   ▼
                ┌─────────────────────────────────────┐
                │ 10. Push Images to Registry         │
                └─────────────────────────────────────┘


 # Learning Docker by containerizing MERN application

 ## Stage 4
### Three containers , nginx serving react build , express handling backed requests , standalone mongodb container with persistent storage , everyone is within a custom bridge network , managing containers using docker compose              
                    ┌─────────────────────────────────────────────┐
                    │              Docker Compose                 │
                    │                                             │
                    │          college-olx-private-network        │
                    │                                             │
                    │  ┌────────────────┐    ┌────────────────┐   │
                    │  │    Frontend    │    │    Backend     │   │
                    │  │    Container   │    │    Container   │   │
                    │  │                │    │                │   │
                    │  │     NGINX      │───▶│    Express     │   │
                    │  │       │        │    │      API       │   │
                    │  │       ▼        │    │                │   │
                    │  │ React Static   │    └───────┬────────┘   │
                    │  │     Build      │            │            │
                    │  └────────────────┘            │            │
                    │                                │            │
                    │                                ▼            │
                    │                       ┌────────────────┐    │
                    │                       │    Database    │    │
                    │                       │    Container   │    │
                    │                       │                │    │
                    │                       │    MongoDB 6   │    │
                    │                       └───────┬────────┘    │
                    │                               │             │
                    └───────────────────────────────┼─────────────┘
                                                    │
                                           Persistent Volume
                                                    │
                                                    ▼
                                             mongo-data
                                             
 ## Stage 3 
### Two containers , nginx serving react build , express handling backed requests and db queries , manage containers using docker compose              
              ┌─────────────────────────────────────┐
              │       Docker Compose Network        │
              │                                     │
              │  ┌──────────────┐   ┌────────────┐  │
              │  │   Frontend   │   │  Backend   │  │
              │  │   Container  │   │ Container  │  │
              │  │              │   │            │  │
              │  │    NGINX     │──▶│  Express   │  │
              │  │              │   │    API     │  │
              │  │ React Build  │   │            │  │
              │  └──────────────┘   └─────┬──────┘  │
              │                           │         │
              └───────────────────────────┼─────────┘
                                          │
                                          ▼
                                  ┌───────────────┐
                                  │ MongoDB Atlas │
                                  └───────────────┘

 ## Stage 2 
### Two containers , nginx serving react build , express handling backed requests and db queries , both are communicating in custom bridge network

                  FRONTEND MULTI-STAGE BUILD

                ┌──────────────────────────────┐
                │       Build Stage            │
                │                              │
                │   Node.js + React Source     │
                │              │               │
                │              ▼               │
                │       npm run build          │
                │              │               │
                │              ▼               │
                │      React Static Build      │
                └──────────────┬───────────────┘
                        │
                        │ COPY build
                        ▼
                ┌──────────────────────────────┐
                │       Production Stage       │
                │                              │
                │            NGINX             │
                │              │               │
                │              ▼               │
                │      React Static Build      │
                └──────────────────────────────┘

              ┌─────────────────────────────────┐
              │       Docker Bridge Network     │
              │                                 │
              │  ┌─────────────┐  API  ┌──────┐ │
              │  │   NGINX     │ ─────>│Express││
              │  │   + React   │       │Backend││
              │  └─────────────┘       └───┬──┘ │
              │                             │   │
              └─────────────────────────────┼───┘
                                            │
                                            ▼
                                     MongoDB Atlas


 ## Stage 1 
 ### Single container , serving static build (React frontend) form express server 

                 ┌─────────────────────────────┐
                 │       Docker Container      │
                 │                             │
                 │   ┌───────────────────────┐ │
                 │   │    Express Server     │ │
                 │   │                       │ │
                 │   │  ┌─────────────────┐  │ │
                 │   │  │ React Static    │  │ │
                 │   │  │     Build       │  │ │
                 │   │  └─────────────────┘  │ │
                 │   │                       │ │
                 │   │  Backend / API        │ │
                 │   └───────────┬───────────┘ │
                 │               │             │
                 └───────────────┼─────────────┘
                                 │
                                 │ MongoDB Connection
                                 ▼
                         ┌─────────────────┐
                         │  MongoDB Atlas  │
                         └─────────────────┘