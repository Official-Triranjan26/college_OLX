pipeline {
    agent any

    stages {
        //  STAGE 2 V:2.1
        stage('Install Dependencies'){
            agent{
                docker {
                    image 'node:22-alpine'
                }
            }
            steps {
                sh '''
                    # checking versions
                    node --version
                    npm --version
                    # checking must have files
                    for file in client/package.json client/package-lock.json server/package.json server/package-lock.json; do
                        [ -f "$file" ] && echo "✅ $file exists" || echo "❌ $file IS MISSING"
                    done
                    # installing clientside dependencies
                    cd /client
                    npm ci
                    ls -la
                    cd ..
                    # installing serverside dependencies
                    cd /server
                    npm ci
                    ls -la
                '''
            }
        }
    }
}
