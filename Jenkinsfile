pipeline {
    agent any

    tools {
        nodejs "NodeJS"
    }

    stages {
        stage('Clean Workspace') {
            steps {
                // Safe cleanup on Windows
                bat 'rmdir /S /Q backend_repo || echo No directory to remove'
            }
        }

        stage('Checkout') {
            steps {
                bat 'git clone -b main https://github.com/Bandamharshitha/Devops-Project.git backend_repo'
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('backend_repo/backend') {
                    bat 'npm install'
                }
            }
        }

        stage('Test') {
            steps {
                dir('backend_repo/backend') {
                    bat 'npm test'
                }
            }
        }

        stage('Build') {
            steps {
                echo 'Build step (frontend or packaging if needed)'
            }
        }

        stage('Deploy') {
            steps {
                dir('backend_repo') {
                    bat 'docker-compose down || exit 0'
                    bat 'docker-compose up -d --build'
                }
            }
        }
    }
}
