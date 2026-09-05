 # Learning Docker by containerizing MERN application

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