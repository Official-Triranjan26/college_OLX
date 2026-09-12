pipeline {
    //  pipeline version 2
    agent{
        docker {
            image 'node:22-alpine'
            reuseNode true
        }
    }
    options {
        // Wipes previous workspace BEFORE the run starts
        skipDefaultCheckout()
        disableConcurrentBuilds()
    }

    stages {
        //  STAGE 1 V:1.1
        stage('SCM checkout') {
            steps {
                // 👇 Wipes out the workspace directory after the run completes
                cleanWs()
                checkout scm
            }
        }
        //  STAGE 2 V:2.3
        stage('Install Dependencies'){
            steps {
                sh '''
                    # checking versions
                    node --version
                    npm --version
                    # checking must have files
                    for file in client/package.json client/package-lock.json server/package.json server/package-lock.json; do
                        [ -f "$file" ] && echo "✅ $file exists" || echo "❌ $file IS MISSING"
                    done
                '''
                //  installing clientside dependencies
                dir('client') {
                    sh 'npm ci'
                }
                //  installing serverside dependencies
                dir('server') {
                    sh 'npm ci'
                }
            }
        }
        stage('Lint'){
            //  STAGE 3 V:3.2
            steps {
                dir('client') {
                    //  list test clientside
                    sh 'npm run lint'
                }
                dir('server') {
                    //  list test serverside
                    sh 'npm run lint'
                }
            }
        }
        stage('Unit Test'){
            //  STAGE 4 V:4.4
            steps {
                dir('server') {
                    //  unit test serverside
                    sh 'npm run test'
                }
            }
        }
    }
    post {
        always {
            // Parses any JUnit XML reports produced under client/server folders
            junit testResults: '**/test-results/*.xml', allowEmptyResults: true
        }
    }
}
