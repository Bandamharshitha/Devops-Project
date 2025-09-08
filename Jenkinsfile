pipeline {
    agent any

    tools {
        nodejs "NodeJS"
    }

    stages {
        stage('Clean Workspace') {
            steps {
                deleteDir()  // ensures full cleanup
            }
        }

        stage('Checkout') {
            steps {
                sh 'git clone -b backend https://github.com/Bandamharshitha/Devops-Project.git backend_repo'
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('backend_repo/backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Test') {
            steps {
                dir('backend_repo/backend') {
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
                dir('backend_repo') {
                    sh 'docker-compose down || true'
                    sh 'docker-compose up -d --build'
                }
            }
        }
    }
}
