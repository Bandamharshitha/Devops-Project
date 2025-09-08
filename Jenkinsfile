pipeline {
    agent any

    tools {
        nodejs "NodeJS"
    }

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()  // Delete everything in the workspace
            }
        }

        stage('Checkout') {
            steps {
                script {
                    def repoDir = "${env.WORKSPACE}/blood-bank-backend"
                    if (fileExists(repoDir)) {
                        echo "Deleting existing repo folder..."
                        sh "rm -rf ${repoDir}"
                    }
                }
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
                echo 'Build step (frontend or packaging if needed)'
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
