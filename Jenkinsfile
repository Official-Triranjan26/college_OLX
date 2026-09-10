pipeline {
    agent any

    stages {
        stage('Install Dependencies'){
            agent{
                docker {
                    image 'node:22-alpine'
                }
            }
            steps {
                sh '''
                    node --version
                    npm --version
                    ls -a
                '''
            }
        }
    }
}
