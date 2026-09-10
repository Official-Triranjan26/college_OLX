pipeline {
    agent any

    stages {
        //  STAGE 2 V:2.3
        stage('Install Dependencies'){
            agent{
                docker {
                    image 'node:22-alpine'
                    reuseNode true
                }
            }
            steps {
                sh '''
                    # 👇 Wipes out the workspace directory after the run completes
                    cleanWs()
                    # checking versions
                    node --version
                    npm --version
                    # checking must have files
                    for file in client/package.json client/package-lock.json server/package.json server/package-lock.json; do
                        [ -f "$file" ] && echo "✅ $file exists" || echo "❌ $file IS MISSING"
                    done
                    # installing clientside dependencies
                    cd client
                    npm ci
                    ls -la
                    cd ..
                    # installing serverside dependencies
                    cd server
                    npm ci
                    ls -la
                '''
            }
        }
        stage('Lint'){
            //  STAGE 3 V:3.1
            agent{
                docker {
                    image 'node:22-alpine'
                    reuseNode true
                }
            }
            steps {
                sh '''
                    # checking versions
                    node --version
                    npm --version
                    # list test clientside
                    cd client
                    npm run lint
                    # list test serverside
                    cd ../server
                    npm run lint
                '''
            }
        }
    }
}
