pipeline {
    agent any
    
    environment {
        APP_DIR = '/code/StudentAttendanceApplication'
        GIT_REPO = 'github.com/thenabeelhassan/StudentAttendanceApplication.git'
        BRANCH = 'main'
    }

    triggers{
        githubPush()
    }
    
    stages {
        stage("Pull") {
            steps {
                dir("${APP_DIR}") {
                    withCredentials([usernamePassword(
                        credentialsId: 'git_studentAttendanceApplication',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_TOKEN'
                        )]) {
                            sh '''
                                git config --global --add safe.directory "$APP_DIR"
                                git pull "https://$GIT_USER:$GIT_TOKEN@$GIT_REPO" "$BRANCH"
                            '''
                        }
                }
            }
        }
    }
}