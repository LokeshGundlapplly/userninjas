pipeline {
    agent any

    stages {

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test -- --watchAll=false'
            }
        }

        stage('Build Application') {
            steps {
                sh 'npm run build'
            }
        }
    }

    post {

        success {
            echo 'UserNinjas Build Passed'
        }

        failure {
            echo 'UserNinjas Build Failed'
        }
    }
}
