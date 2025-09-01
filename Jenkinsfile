pipeline {
    agent any

    tools {
        nodejs "NodeJS"   // We'll configure this in Jenkins
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
                sh 'npm test'   // (tester must add "test" script in package.json)
            }
        }

        stage('Build') {
            steps {
                echo 'Build step (for frontend or packaging if needed)'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying application...'
                // Later we’ll add docker build/run here
            }
        }
    }
}
