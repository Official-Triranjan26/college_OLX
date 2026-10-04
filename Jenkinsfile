pipeline {
    agent any
    environment {
        APP_VERSION = "1.0.$BUILD_ID"
        AWS_REGION = 'us-east-1'
        AWS_ACCOUNT_ID = '247333588188' // Replace with your AWS Account ID
        AWS_ECS_CLUSTER = 'college_olx_cluster_prod'
        AWS_ECS_SERVICE = 'college_olx_ecs_task-prod-service-i4pp6iay'
        AWS_ECS_TD_PROD = 'college_olx_ecs_task-prod'
        AWS_ECR_REGISTRY = '247333588188.dkr.ecr.us-east-1.amazonaws.com'

        FRONTEND_IMAGE_LOCAL_NAME = 'collegeolx-frontend-service'
        BACKEND_IMAGE_LOCAL_NAME = 'collegeolx-backend-api'
        DATABASE_IMAGE_LOCAL_NAME = 'collegeolx-database'
    }
    parameters {
        choice(
            name: 'STAGE_TO_RUN',
            choices: ['ALL', 'Unit Test', 'Integration Test', 'Build & Smoke Test', 'E2E Test','Push to ECR','Deploy to ECS'],
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
                    params.STAGE_TO_RUN == 'E2E Test' ||
                    params.STAGE_TO_RUN == 'Push to ECR'
                }
            }
            steps {
                sh '''
                    docker compose -f docker-compose.e2e.yml build
                    docker images
                '''
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
        stage('Build Custom AWS-CLI') {
            when {
                expression { 
                    return params.STAGE_TO_RUN == 'ALL' || 
                    // params.STAGE_TO_RUN == 'Push to ECR' 
                }
            }
            steps {
                sh '''
                    echo "=== Building custom aws cli image ==="
                    docker build -f aws/Dockerfile.custom-aws-cli -t custom-aws-cli .
                '''
            }
        }
        stage('Push to ECR') {
            when {
                expression { 
                    return params.STAGE_TO_RUN == 'ALL' || params.STAGE_TO_RUN == 'Push to ECR' 
                }
            }
            agent {
                docker {
                    image 'custom-aws-cli'
                    reuseNode true
                    args "-u root -v /var/run/docker.sock:/var/run/docker.sock --entrypoint=''"
                    // Mount docker socket so the container can control host Docker daemon
                }
            }
            steps {
                //  If using AWS IAM User Credentials from Jenkins Credentials Manager
                 withCredentials([
                    aws(credentialsId: 'aws_ecr_ecs_credentials', 
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID', 
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                        sh '''
                            # checking aws version
                            aws --version

                            # checking image availablity locally
                            docker images

                            # tagging images before pushing
                            # docker tag college-olx-frontend $AWS_ECR_REGISTRY/$FRONTEND_APP:$APP_VERSION
                            # docker tag collegeolx-backend $AWS_ECR_REGISTRY/$BACKEND_APP:$APP_VERSION

                            # login to aws ecr
                            aws ecr get-login-password --region $AWS_REGION | docker login \
                            --username AWS \
                            --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

                            # check repo exists within registry
                            # aws ecr create-repository --repository-name ${FRONTEND_APP} --region ${AWS_REGION} || echo "Repository ${FRONTEND_APP} already exists."
                            # aws ecr create-repository --repository-name ${BACKEND_APP} --region ${AWS_REGION} || echo "Repository ${BACKEND_APP} already exists."

                            # push images to aws ecr
                            # docker push $AWS_ECR_REGISTRY/$FRONTEND_APP:$APP_VERSION
                            # docker push $AWS_ECR_REGISTRY/$BACKEND_APP:$APP_VERSION
                        '''
                        script {
                            // Define your distinct apps exactly as they are named in your docker-compose.yml file
                            def apps = ['$FRONTEND_IMAGE_LOCAL_NAME', '$BACKEND_IMAGE_LOCAL_NAME', '$DATABASE_IMAGE_LOCAL_NAME']
                            
                            // Loop through each image
                            for (int i = 0; i < apps.size(); i++) {
                                def appName = apps[i]
                                def localImage = "${appName}:latest"
                                def remoteImage = "${AWS_ECR_REGISTRY}/${appName}:${APP_VERSION}"
                                
                                echo "--------------------------------------------------------"
                                echo "Processing Service: ${appName}"
                                echo "--------------------------------------------------------"
                                
                                // 1. Verify if the local image built successfully in the previous stage
                                def imageExists = sh(script: "docker image inspect ${localImage} >/dev/null 2>&1", returnStatus: true)
                                
                                if (imageExists == 0) {
                                    echo "✅ Local image ${localImage} found."
                                    
                                    // 2. Pre-create the ECR repository if it does not exist yet
                                    sh """
                                        aws ecr create-repository --repository-name ${appName} --region ${AWS_REGION} || echo "Repository ${appName} already exists."
                                    """
                                    
                                    // 3. Tag the image using correct Docker syntax: docker tag SOURCE TARGET
                                    echo "Tagging image: ${localImage} -> ${remoteImage}"
                                    sh "docker tag ${localImage} ${remoteImage}"
                                    
                                    // 4. Push to ECR
                                    echo "Pushing image to AWS ECR..."
                                    sh "docker push ${remoteImage}"
                                    
                                } else {
                                    // Mark the pipeline stage as failed if an image is missing
                                    error "❌ Local image ${localImage} was not found! The build stage likely failed silently."
                                }
                            }
                        }
                    }
            }
        }
        stage('Deploy to ECS') {
            when {
                expression { 
                    return params.STAGE_TO_RUN == 'ALL' || params.STAGE_TO_RUN == 'Deploy to ECS' 
                }
            }
            agent {
                docker {
                    image 'amazon/aws-cli:latest'
                    reuseNode true
                    args "-u root --entrypoint=''"
                    // Mount docker socket so the container can control host Docker daemon
                    //  args '-v /var/run/docker.sock:/var/run/docker.sock -u 0'
                }
            }
            environment {
                AWS_REGION = 'us-east-1'
                AWS_ECS_CLUSTER = 'college_olx_cluster_prod'
                AWS_ECS_SERVICE = 'college_olx_ecs_task-prod-service-i4pp6iay'
                AWS_ECS_TD_PROD = 'college_olx_ecs_task-prod'
                // AWS_ACCOUNT_ID = '247333588188' // Replace with your AWS Account ID

            }
            steps {
                //  If using AWS IAM User Credentials from Jenkins Credentials Manager
                 withCredentials([
                    aws(credentialsId: 'aws_ecr_ecs_credentials', 
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID', 
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                        sh '''
                            aws --version
                            yum install jq -y
                            LATEST_TD_REVISION=$(aws ecs register-task-definition --cli-input-json file://aws/task-defination-prod.json|jq '.taskDefinition.revision')
                            aws ecs update-service \
                            --cluster $AWS_ECS_CLUSTER \
                            --service $AWS_ECS_SERVICE \
                            --task-definition $AWS_ECS_TD_PROD:$LATEST_TD_REVISION
                            aws ecs wait services-stable \
                            --cluster  $AWS_ECS_CLUSTER\
                            --services $AWS_ECS_SERVICE
                        '''
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