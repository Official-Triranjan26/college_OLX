pipeline {
    agent any
    parameters {
        choice(
            name: 'STAGE_TO_RUN',
            choices: ['ALL', 'Unit Test', 'Integration Test', 'Build & Smoke Test', 'E2E Test'],
            description: 'Select a specific stage to run, or ALL for a complete pipeline run.'
        )
    }
    options {
        skipDefaultCheckout()
        disableConcurrentBuilds()
    }
    stages {
        stage('SCM Checkout') {
        // SCM Checkout always runs to retrieve codebase
            steps {
                cleanWs()
                checkout scm
                // git(
                //     url: 'https://github.com/Official-Triranjan26/college_OLX.git',
                //     branch: 'main'
                // )
            }
        }

        stage('Install Dependencies') {
        // Skips if running Integration Test alone or Build-only tests
            when {
                expression { 
                    return params.STAGE_TO_RUN == 'ALL' || params.STAGE_TO_RUN == 'Unit Test' 
                }
            }
            agent {
                docker {
                    image 'node:22-alpine'
                    args '-u root'
                    reuseNode true
                }
            }
            steps {
                sh '''
                    node --version
                    npm --version

                    for file in \
                        client/package.json \
                        client/package-lock.json \
                        server/package.json \
                        server/package-lock.json
                    do
                        if [ -f "$file" ]; then
                            echo "✅ $file exists"
                        else
                            echo "❌ $file IS MISSING"
                            exit 1
                        fi
                    done
                '''
                dir('client') {
                    sh '''
                        echo "===== CLIENT npm ci ====="
                        npm ci
                    '''
                }
                dir('server') {
                    sh '''
                        echo "===== SERVER npm ci ====="
                        npm ci
                    '''
                }
            }
        }
        stage('Lint') {
            when {
                expression { return params.STAGE_TO_RUN == 'ALL' }
            }
            agent {
                docker {
                    image 'node:22-alpine'
                    args '-u root'
                    reuseNode true
                }
            }
            steps {
                dir('client') {
                    sh 'npm run lint'
                }
                dir('server') {
                    sh 'npm run lint'
                }
            }
        }
        stage('Unit Test') {
            when {
                expression { 
                    return params.STAGE_TO_RUN == 'ALL' || params.STAGE_TO_RUN == 'Unit Test' 
                }
            }
            agent {
                docker {
                    image 'node:22-alpine'
                    args '-u root'
                    reuseNode true
                }
            }
            steps {

                dir('server') {
                    sh 'npm run test:unit:junit'
                }
            }
        }
        stage('Integration Test') {
            when {
                expression { 
                    return params.STAGE_TO_RUN == 'ALL' || params.STAGE_TO_RUN == 'Integration Test' 
                }
            }
            environment {
                // Path to your test compose file relative to repository root
                COMPOSE_FILE = 'server/tests/setup/docker-compose.test.yml'
            }
            steps {
                script {
                    echo 'Starting Integration Test Suite via Docker Compose...'
                    sh 'docker version'
                    
                    try {
                        // 1. Build and run tests. --exit-code-from app-test ensures Jenkins 
                        // captures Jest failures directly.
                        sh """
                            docker compose -f ${COMPOSE_FILE} build --no-cache app-test
                            docker compose -f ${COMPOSE_FILE} up --exit-code-from app-test --abort-on-container-exit --attach app-test
                        """
                    } finally {
                        // 2. Always clean up containers, networks, and volumes (even if tests fail)
                        echo 'Cleaning up test containers and networks...'
                        sh "docker compose -f ${COMPOSE_FILE} down -v --remove-orphans"
                    }
                }
            }
        }
        stage('Build Docker Images') {
            when {
                expression { 
                    return params.STAGE_TO_RUN == 'ALL' || 
                    params.STAGE_TO_RUN == 'Build & Smoke Test'  ||
                     params.STAGE_TO_RUN == 'E2E Test'
                }
            }
            steps {
                sh 'docker compose -f docker-compose.e2e.yml build'
            }
        }

        stage('Start Containers & Smoke Tests') {
            when {
                expression { 
                    return params.STAGE_TO_RUN == 'ALL' ||
                     params.STAGE_TO_RUN == 'Build & Smoke Test' ||
                     params.STAGE_TO_RUN == 'E2E Test'
                }
            }
            steps {
                sh '''
                    # Start containers
                    docker compose -f docker-compose.e2e.yml up -d frontend backend database

                    echo "=== Checking Container Status ==="

                    docker compose -f docker-compose.e2e.yml ps

                    echo "Waiting for services to spin up..."
                    sleep 15

                    echo "=== Checking Frontend ==="

                    docker compose -f docker-compose.e2e.yml \
                        exec -T frontend curl --fail http://localhost:80

                    echo "=== Checking Backend ==="

                    docker compose -f docker-compose.e2e.yml \
                        exec -T backend \
                        node -e "http.get('http://localhost:4000/api/healthcheck', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

                    echo "=== Smoke Tests Passed ==="
                '''
            }
        }
        stage('E2E Test') {
            when {
                expression { 
                    return params.STAGE_TO_RUN == 'ALL' || params.STAGE_TO_RUN == 'E2E Test' 
                }
            }
            steps {
                sh '''
                echo "=== Running Playwright E2E Tests ==="
                    docker compose -f docker-compose.e2e.yml run --rm playwright /bin/sh -c "npm ci && npx playwright test"
                '''
            }
        }
    }
    post {
        always {
            junit(
                testResults: '**/test-results/*.xml',
                allowEmptyResults: true
            )
            // Optional: Archive raw XML files as downloadable build artifacts
            echo "=== Archiving Unit Test Results ==="
            archiveArtifacts (
                artifacts: '**/test-results/*.xml', 
                allowEmptyArchive: true
            )
            echo "=== Archiving Playwright Results ==="

            archiveArtifacts(
                artifacts: 'test-results/**/*.xml',
                allowEmptyArchive: true
            )

            echo "=== Archiving Playwright HTML Report ==="

            archiveArtifacts(
                artifacts: 'playwright-report/**/*',
                allowEmptyArchive: true
            )
            echo "=== Cleaning up running containers ==="
            sh 'docker compose -f docker-compose.e2e.yml down -v --remove-orphans'
        }


    }
}