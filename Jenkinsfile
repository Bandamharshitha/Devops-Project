pipeline {
    agent any

    tools {
        nodejs "NodeJS"
    }

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()  // Deletes everything in the workspace
            }
        }

        stage('Checkout') {
            steps {
                dir('blood-bank-backend') {   // folder where repo will be cloned
                    deleteDir()               // clean this folder if it exists
                    checkout([$class: 'GitSCM',
                        branches: [[name: 'refs/heads/main']],  // change branch if needed
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
                dir('blood-bank-backend/backend') {    // package.json is inside backend
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
                echo 'Deploying application with Docker Compose...'
                dir('blood-bank-backend') {
                    sh 'docker-compose down || true'   // stop old containers if running
                    sh 'docker-compose up -d --build'  // build and start fresh containers
                }
            }
        }
    }
}
