pipeline {
    agent any

    tools {
        nodejs "NodeJS"
    }

    stages {
        stage('Check Tools') {
            steps {
                script {
                    // Check if Docker is installed
                    sh 'docker --version'
                    // Check if Docker Compose is installed
                    sh 'docker-compose --version'
                }
            }
        }

        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout') {
            steps {
                dir('blood-bank-backend') {
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: 'refs/heads/backend']],
                        userRemoteConfigs: [[
                            url: 'https://github.com/Bandamharshitha/Devops-Project.git',
                            credentialsId: 'github-credentials'
                        ]]
                    ])
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('blood-bank-backend/backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Test') {
            steps {
                dir('blood-bank-backend/backend') {
                    sh 'npm test'
                }
            }
        }

        stage('Build') {
            steps {
                echo 'Building application...'
            }
        }

        stage('Deploy') {
            steps {
                dir('blood-bank-backend') {
                    sh 'docker-compose down --remove-orphans || true'
                    sh 'docker-compose up -d --build'
                }
            }
        }
    }
}
