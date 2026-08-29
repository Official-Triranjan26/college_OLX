 # Learning Docker by containerizing MERN application
 ## Stage 1 : Single container , serving static build (React frontend) form express server 

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