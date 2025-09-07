pipeline {
    agent any

    tools {
        nodejs "NodeJS"   // Make sure "NodeJS" is configured in Jenkins -> Global Tool Configuration
    }

    environment {
        DOCKER_IMAGE = "bloodbank-app"
        DOCKER_TAG = "latest"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Bandamharshitha/Devops-Project.git',
                    credentialsId: 'github-credentials'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                // Right now your test script is just a dummy, but Jenkins will still run it ✅
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo 'Building Docker image...'
                    // This will only work once Dockerfile is added
                    sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                }
            }
        }

        stage('Run Containers') {
            steps {
                script {
                    echo 'Starting containers with docker-compose...'
                    // This will only work once docker-compose.yml is added
                    sh 'docker-compose up -d'
                }
            }
        }

        stage('Deploy') {
            steps {
                echo '✅ Deployment complete (placeholder, will be finalized later)'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        failure {
            echo '❌ Pipeline failed. Check logs.'
        }
        success {
            echo '✅ Pipeline succeeded!'
        }
    }
}
