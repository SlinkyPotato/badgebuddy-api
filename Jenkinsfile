pipeline {
    agent any
    environment {
        DOCKER_ACCESS_TOKEN = credentials('amaredeus-docker-token')
        GRANITE_HOST_IP = credentials('granite-host-ip')
        GH_TOKEN = credentials('gh-cli-jenkins-token')
    }
    stages {
        stage('Prepare Package Versions') {
            steps {
                script {
                    env.PROJECT_VERSION = sh(returnStdout: true, script: 'cat package.json | jq -r ".version"').trim()
                    env.NODE_VERSION = sh(returnStdout: true, script: 'cat package.json | jq -r ".engines.node"').trim()
                    env.PNPM_VERSION = sh(returnStdout: true, script: 'cat package.json | jq -r ".engines.pnpm"').trim()
                }
            }
        }
        stage('Build Docker Beta Image for dev branch') {
            when {
                branch 'dev'
            }
            environment {
                NODE_ENV = 'staging'
            }
            steps {
                sh 'docker image build ' +
                        '--build-arg NODE_VERSION=${NODE_VERSION} ' +
                        '--build-arg PNPM_VERSION=${PNPM_VERSION} ' +
                        '--build-arg NODE_ENV=${NODE_ENV} ' +
                        '-t amaredeus/badge-buddy-api:latest-beta .'
                sh 'docker tag amaredeus/badge-buddy-api:latest-beta ' +
                        'amaredeus/badge-buddy-api:${PROJECT_VERSION}'
            }
        }
        stage('Build Docker Production Image for main branch') {
            when {
                branch 'main'
            }
            environment {
                NODE_ENV = 'production'
            }
            steps {
                sh 'docker image build ' +
                        '--build-arg NODE_VERSION=${NODE_VERSION} ' +
                        '--build-arg PNPM_VERSION=${PNPM_VERSION} ' +
                        '--build-arg NODE_ENV=${NODE_ENV} ' +
                        '-t amaredeus/badge-buddy-api:latest .'
                sh 'docker tag amaredeus/badge-buddy-api:latest ' +
                        'amaredeus/badge-buddy-api:${PROJECT_VERSION}'
            }
        }
        stage('Push Images to Docker') {
            steps {
                sh 'echo ${DOCKER_ACCESS_TOKEN} | docker login -u amaredeus --password-stdin'
                sh 'docker push -a amaredeus/badge-buddy-api'
            }
        }
        stage('Archive dist for dev branch') {
            when {
                branch 'dev'
            }
            steps {
                sh 'docker cp $(docker create amaredeus/badge-buddy-api:latest-beta):/app/dist .'
                sh 'zip -r dist.zip dist'
                archiveArtifacts 'dist.zip'
            }
        }
        stage('Archive dist for main branch') {
            when {
                branch 'main'
            }
            steps {
                sh 'docker cp $(docker create amaredeus/badge-buddy-api:latest):/app/dist .'
                sh 'zip -r dist.zip dist'
                archiveArtifacts 'dist.zip'
            }
        }
        stage('Deploy Beta App for dev branch') {
            when {
                branch 'dev'
            }
            environment {
                DOTENV_KEY = credentials('dotenv-key-staging')
            }
            steps {
                sshagent(credentials: ['jenkins-ssh']) {
                    sh '''
                     ssh -o StrictHostKeychecking=no jenkins@${GRANITE_HOST_IP} rm -rf /home/jenkins/apps/badge-buddy-api_qa/**
                     scp -o StrictHostKeychecking=no -r dist/** jenkins@${GRANITE_HOST_IP}:/home/jenkins/apps/badge-buddy-api_qa/
                    '''
                }
                sh 'docker compose -f dist/compose.yml --profile staging down'
                sh 'DOTENV_KEY=${DOTENV_KEY} docker compose -f dist/compose.yml --profile staging up -d'
            }
        }
        stage('Deploy Production app for main branch') {
            when {
                branch 'main'
            }
            environment {
                DOTENV_KEY = credentials('dotenv-key-production')
            }
            steps {
                sshagent(credentials: ['jenkins-ssh']) {
                    sh '''
                     ssh -o StrictHostKeychecking=no jenkins@${GRANITE_HOST_IP} rm -rf /home/jenkins/apps/badge-buddy-api_prod/**
                     scp -o StrictHostKeychecking=no -r dist/** jenkins@${GRANITE_HOST_IP}:/home/jenkins/apps/badge-buddy-api_prod/
                    '''
                }
                sh 'docker compose -f dist/compose.yml --profile production down'
                sh 'DOTENV_KEY=${DOTENV_KEY} docker compose -f dist/compose.yml --profile production up -d'
            }
        }
        stage('Docker Cleanup') {
            steps {
                sh 'docker system prune -f'
            }
        }
        stage('Create Release for main branch') {
            when {
                allOf {
                    branch 'main'
                    expression {
                        GITHUB_PROJECT_TAG = sh(returnStdout: true, script: 'git tag -l ${PROJECT_VERSION}').trim();
                        return env.PROJECT_VERSION != GITHUB_PROJECT_TAG
                    }
                }
            }
            steps {
                sshagent(credentials: ['jenkins-ssh']) {
                    sh 'git tag -a ${PROJECT_VERSION} -m "automated release with jenkins"'
                    sh 'git push origin ${PROJECT_VERSION}'
                }
                sh 'gh release create ${PROJECT_VERSION} --generate-notes dist.zip'
            }
        }
    }
}
