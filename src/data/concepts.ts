import { ConceptTopic } from '../types';

export const CONCEPTS_DATA: ConceptTopic[] = [
  {
    id: 'cicd',
    title: 'CI/CD Pipeline',
    subtitle: 'Continuous Integration & Continuous Delivery',
    shortDesc: 'Automate the build, test, and deployment phases of your software delivery lifecycle to ship reliable code faster.',
    icon: 'GitPullRequest',
    interactiveTitle: 'Interactive Pipeline Visualizer',
    interactiveDesc: 'Click on the pipeline stages below to trigger the automation loop. Watch how code commits flow through builds, tests, and automated releases into production.',
    sections: [
      {
        title: 'Core Concepts of CI/CD',
        content: `**Continuous Integration (CI)** is the practice of automating the integration of code changes from multiple contributors into a single software project. Developers merge changes frequently to detect integration issues early.

**Continuous Delivery/Deployment (CD)** takes over where CI leaves off. Continuous Delivery ensures code is always in a deployable state, whereas Continuous Deployment goes a step further and automatically deploys every passing build straight to production.`,
        codeSnippets: [
          {
            filename: '.github/workflows/ci-cd.yml',
            language: 'yaml',
            code: `name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Linter
        run: npm run lint

      - name: Run Unit Tests
        run: npm test

  deploy-to-prod:
    needs: build-and-test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Cloud Run
        uses: google-github-actions/deploy-cloudrun@v2
        with:
          service: devops-learner-app
          region: us-central1
          image: gcr.io/my-project/app:latest`
          }
        ],
        commands: [
          { cmd: 'git commit -am "feat: add user login"', desc: 'Commit your local changes to trigger the webhook.' },
          { cmd: 'git push origin main', desc: 'Push code changes to GitHub, starting the CI action workflow.' }
        ]
      },
      {
        title: 'The 6 Pipeline Stages',
        content: `1. **Code (VCS)**: Developers write and commit code to a Version Control System like Git.
2. **Build**: The code is compiled, and dependencies are resolved. For containerized apps, a Docker image is built here.
3. **Test**: Run automated tests (unit, integration, and security scanning) to verify quality.
4. **Release**: The tested artifact (e.g., zip, jar, or Docker image) is tagged and stored in a registry.
5. **Deploy**: The artifact is pulled and deployed to staging or production environments.
6. **Monitor**: Active monitoring and alerting tools (like Prometheus or Datadog) measure user traffic and health indicators.`
      }
    ]
  },
  {
    id: 'docker',
    title: 'Containerization',
    subtitle: 'Docker & Microservices Packaging',
    shortDesc: 'Package software applications into standard, isolated units called containers that run consistently across any system.',
    icon: 'Layers',
    interactiveTitle: 'Interactive Container Builder',
    interactiveDesc: 'Interact with the Docker engine. Build a custom image from a Dockerfile, store it in an Image Registry, and run multiple replica containers with dynamic port bindings.',
    sections: [
      {
        title: 'What is Containerization?',
        content: `Historically, applications faced the **"works on my machine"** dilemma because differences in OS, libraries, and background configurations broke deployments. 

**Containers** solve this by packaging the application code together with its exact runtime, system tools, libraries, and settings. Unlike Virtual Machines (VMs) which virtualize entire hardware stacks including guest OSs, containers share the host OS kernel, making them lightweight, fast, and highly efficient.`,
        codeSnippets: [
          {
            filename: 'Dockerfile',
            language: 'dockerfile',
            code: `# Step 1: Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Step 2: Production Stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`
          },
          {
            filename: 'docker-compose.yml',
            language: 'yaml',
            code: `version: '3.8'

services:
  web:
    build: .
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
    depends_on:
      - api

  api:
    image: node:20-alpine
    command: npm run start:api
    volumes:
      - .:/app
    ports:
      - "5000:5000"`
          }
        ],
        commands: [
          { cmd: 'docker build -t my-app:v1 .', desc: 'Build an immutable Docker image from the local Dockerfile instructions.' },
          { cmd: 'docker run -d -p 8080:80 --name my-container my-app:v1', desc: 'Run the image inside a background container and map host port 8080 to container port 80.' },
          { cmd: 'docker ps', desc: 'List all running containers, their status, uptime, and port maps.' }
        ]
      }
    ]
  },
  {
    id: 'kubernetes',
    title: 'Kubernetes',
    subtitle: 'Container Orchestration & Scaling',
    shortDesc: 'Automate the deployment, scaling, management, and self-healing of large collections of containerized applications.',
    icon: 'Boxes',
    interactiveTitle: 'Interactive Cluster Simulator',
    interactiveDesc: 'Simulate cluster scale and load. Scale pods up or down dynamically, send HTTP traffic through a Load Balancer, and see how self-healing automatically restarts failed containers.',
    sections: [
      {
        title: 'Why Kubernetes (K8s)?',
        content: `While running a single Docker container is simple, orchestrating hundreds of containers across multiple physical or virtual servers is highly complex.

**Kubernetes** is an open-source container orchestration platform that coordinates cluster-level scheduling. Key capabilities include:
- **Service Discovery & Load Balancing**: Expose container ports to the web and distribute incoming traffic.
- **Horizontal Scaling**: Scale replicas up or down via simple CLI commands or automatically based on CPU usage.
- **Self-Healing**: Automatically restart containers that crash, replace pods when a node dies, and kill unhealthy containers.
- **Automated Rollouts & Rollbacks**: Seamlessly deploy updates without causing downtime.`,
        codeSnippets: [
          {
            filename: 'deployment.yaml',
            language: 'yaml',
            code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app-deployment
  labels:
    app: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web-app-container
        image: nginx:alpine
        ports:
        - containerPort: 80
        resources:
          limits:
            cpu: "500m"
            memory: "256Mi"`
          },
          {
            filename: 'service.yaml',
            language: 'yaml',
            code: `apiVersion: v1
kind: Service
metadata:
  name: web-app-service
spec:
  type: LoadBalancer
  selector:
    app: web-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80`
          }
        ],
        commands: [
          { cmd: 'kubectl apply -f deployment.yaml', desc: 'Create or update the deployment resources inside the active cluster.' },
          { cmd: 'kubectl get pods -o wide', desc: 'List all pods, their state, IP address, and node allocation.' },
          { cmd: 'kubectl scale deployment/web-app-deployment --replicas=5', desc: 'Instantly scale up the deployment replicas to handle high traffic spikes.' }
        ]
      }
    ]
  },
  {
    id: 'terraform',
    title: 'Infrastructure as Code',
    subtitle: 'Declarative Provisioning with Terraform',
    shortDesc: 'Define your multi-cloud networks, firewalls, and server instances safely using version-controlled configuration files.',
    icon: 'Cpu',
    interactiveTitle: 'Interactive IaC Engine',
    interactiveDesc: 'Walk through the 3-phase Terraform workflow. Write declarative HCL code, run dry-runs (plan) to analyze changes, and execute (apply) to build VPC networks, servers, and databases.',
    sections: [
      {
        title: 'Declaring Infrastructure as Code',
        content: `Traditionally, sysadmins provisioned resources manually by clicking around in the AWS, GCP, or Azure console, which was prone to human error, hard to audit, and impossible to replicate.

**Infrastructure as Code (IaC)** treats physical hardware and virtual cloud resources as source code. **Terraform** uses a declarative language called HashiCorp Configuration Language (HCL). You describe the *desired end state* (e.g., "I want 3 virtual servers and 1 virtual network"), and Terraform handles the precise ordering of dependencies to build it.`,
        codeSnippets: [
          {
            filename: 'main.tf',
            language: 'hcl',
            code: `terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = "devops-learner-project"
  region  = "us-central1"
}

# Create a Virtual Network
resource "google_compute_network" "vpc_network" {
  name                    = "devops-vpc"
  auto_create_subnetworks = true
}

# Create a Virtual Server instance
resource "google_compute_instance" "vm_instance" {
  name         = "web-server"
  machine_type = "e2-micro"
  zone         = "us-central1-a"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    network = google_compute_network.vpc_network.name
    access_config {
      // Ephemeral public IP address
    }
  }
}`
          }
        ],
        commands: [
          { cmd: 'terraform init', desc: 'Download provider plugins (e.g., AWS, GCP, Azure) and initialize directory.' },
          { cmd: 'terraform plan', desc: 'Perform a dry-run check to list what resources will be added, destroyed, or modified.' },
          { cmd: 'terraform apply -auto-approve', desc: 'Execute the action plan and provision the requested resources directly in the cloud.' }
        ]
      }
    ]
  },
  {
    id: 'gitops',
    title: 'GitOps Workflow',
    subtitle: 'Git as the Single Source of Truth',
    shortDesc: 'Manage infrastructure and application state declaratively, with automated synchronization from Git repositories.',
    icon: 'Network',
    interactiveTitle: 'Interactive GitOps Sync Loop',
    interactiveDesc: 'Simulate GitOps drift-correction. Push a code update to Git, watch the continuous deployment controller (like ArgoCD) detect the change, and automatically sync it with Kubernetes.',
    sections: [
      {
        title: 'What is GitOps?',
        content: `**GitOps** is an operational framework that takes DevOps best practices used for application development (like version control, collaboration, compliance, and CI/CD) and applies them to infrastructure automation.

In GitOps, the desired state of your infrastructure or cluster is declared in a **Git repository**. A GitOps operator (such as **ArgoCD** or **Flux**) runs continuously inside your Kubernetes cluster. It compares the *actual runtime state* of the cluster to the *desired state* defined in Git. If it detects any differences ("drift"), it automatically synchronizes the cluster back to the Git state.`,
        codeSnippets: [
          {
            filename: 'argocd-application.yaml',
            language: 'yaml',
            code: `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: devops-learner-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: 'https://github.com/my-org/devops-config.git'
    targetRevision: HEAD
    path: k8s-manifests
  destination:
    server: 'https://kubernetes.default.svc'
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true`
          }
        ],
        commands: [
          { cmd: 'git commit -m "update web replica count to 5"', desc: 'Update your declarative manifests in Git.' },
          { cmd: 'argocd app sync devops-learner-app', desc: 'Manually trigger a sync, or wait for ArgoCD’s automated polling (typically every 3 minutes).' }
        ]
      }
    ]
  }
];
