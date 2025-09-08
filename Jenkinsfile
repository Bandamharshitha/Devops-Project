pipeline {
    agent any

    tools {
        nodejs "NodeJS"
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
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Test') {
            steps {
                dir('backend') {
                    sh 'npm test'
                }
            }
        }

        stage('Build') {
            steps {
                echo 'Build step (for frontend or packaging if needed)'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying application with Docker Compose...'
                sh 'docker-compose down || true'   // stop old containers if running
                sh 'docker-compose up -d --build'  // build and start fresh containers
            }
        }
    }
}
