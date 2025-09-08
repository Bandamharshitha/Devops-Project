pipeline {
    agent any

    tools {
        nodejs "NodeJS"
    }

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()  // delete everything in the workspace root
            }
        }

        stage('Checkout') {
            steps {
                script {
                    // Remove the folder if exists
                    def repoDir = "${env.WORKSPACE}/blood-bank-backend"
                    if (fileExists(repoDir)) {
                        echo "Deleting existing repo folder..."
                        deleteDir()
                    }
                }
                // Clone fresh
                sh 'git clone -b backend https://github.com/Bandamharshitha/Devops-Project.git blood-bank-backend'
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
                echo 'Build step (for frontend or packaging if needed)'
            }
        }

        stage('Deploy') {
            steps {
                dir('blood-bank-backend') {
                    sh 'docker-compose down || true'
                    sh 'docker-compose up -d --build'
                }
            }
        }
    }
}
