pipeline {
    //  pipeline version 3
    agent any
    options {
        skipDefaultCheckout()
        disableConcurrentBuilds()
    }
    stages {
        stage('SCM Checkout') {
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
            agent {
                docker {
                    image 'node:22-alpine'
                    args '-u root'
                    reuseNode true
                }
            }
            steps {

                dir('server') {
                    sh 'npm run test:unit'
                }
            }
        }
        stage('Integration Test') {
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
    }
    post {
        always {
            junit(
                testResults: '**/test-results/*.xml',
                allowEmptyResults: true
            )
            // Optional: Archive raw XML files as downloadable build artifacts
            archiveArtifacts artifacts: '**/test-results/*.xml', allowEmptyArchive: true
        }
    }
}