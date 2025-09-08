pipeline {
    agent any

    tools {
        nodejs "NodeJS"
    }

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()  // Clean entire workspace before starting
            }
        }

        stage('Checkout') {
            steps {
                dir('blood-bank-backend') {
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: 'refs/heads/backend']],  // Match original branch
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
                // Add any build steps here if needed
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
