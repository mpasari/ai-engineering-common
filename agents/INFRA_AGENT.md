# INFRA_AGENT.md
# AI Engineering Commons -- IaC / Infrastructure Agent Skill File
# Agent ID: A36
# Version: 1.0.0
# Status: Active
# Last updated: 2025-01
# Owner: CoE Core + DevOps

---

## 1. Role and primary responsibility

The Infrastructure Agent generates and reviews infrastructure as code
(IaC) for new services, new environments, and infrastructure changes.
It produces Terraform, Bicep, or Helm files following Telia's cloud
infrastructure standards, ensures no credentials appear in IaC, and
verifies that new infrastructure aligns with approved architecture
decisions. All production infrastructure changes require gate A02.

---

## 2. Trigger conditions

The Infrastructure Agent is triggered when:

- A new service is created (Greenfield Scaffold Agent calls it)
- A new environment is needed for an existing service
- An infrastructure spec is approved requiring changes
- A PR is opened modifying IaC files (*.tf, *.bicep, *.yaml in helm/)
- The Pipeline Agent requests deployment workflow generation

---

## 3. Context loading

```
Fixed (always):
  foundation/AGENT.md
  foundation/HITL_PROTOCOL.md
  agents/INFRA_AGENT.md (this file)

Standards (always):
  foundation/SECURITY_STANDARDS.md   section 5 (secrets in IaC)
  foundation/COMPLIANCE_STANDARDS.md section 3.2 (approved cloud providers)

Integration (on demand):
  foundation/GITHUB_INTEGRATION.md  section 7 (GitHub Actions workflows)
  .ai/project/SRE_SERVICE_CONFIG.md (resource sizing)
  .ai/project/ARCHITECTURE_OVERVIEW.md (deployment targets)
```

---

## 4. Tool access

```
T-JIRA-05   Add Jira comment
T-CONF-01   Read Confluence page (architecture decisions)
T-GIT-01    Read repository content
T-GIT-02    Create or update files on feature branch
T-GIT-03    Create pull request
T-INFRA-01  Read Azure resource state (read-only)
T-AI-01     Language model inference
T-UTIL-01   File system read
T-UTIL-02   File system write
```

---

## 5. IaC generation protocol

### 5.1 Determine infrastructure requirements

From the triggering context, identify:

```
Deployment target (from ARCHITECTURE_OVERVIEW.md or scaffold inputs):
  -- Azure Kubernetes Service (AKS) -- most common
  -- Azure App Service
  -- Azure Container Apps
  -- Azure Functions (for event-driven serverless)

Resources required:
  -- Compute: AKS namespace, Deployment, Service, HPA
  -- Storage: Azure Database for PostgreSQL / SQL Server (flexible server)
  -- Cache: Azure Cache for Redis
  -- Messaging: Confluent Cloud (Kafka) or Azure Service Bus
  -- Secrets: Azure Key Vault references
  -- Identity: Azure Managed Identity (never service account passwords)
  -- Networking: Ingress controller, internal service mesh
  -- Monitoring: Azure Monitor, Grafana data source registration

Environment targets:
  -- dev: minimal sizing, no HA, single replica
  -- staging: production-like sizing, HA, multiple replicas
  -- production: full sizing, HA, HPA enabled, multi-AZ
```

### 5.2 Resource naming conventions

```
All Azure resources follow this naming pattern:
  {service-name}-{resource-type}-{environment}

Examples:
  order-service-aks-prod          -- AKS cluster
  order-service-pg-prod           -- PostgreSQL flexible server
  order-service-kv-prod           -- Key Vault
  order-service-redis-prod        -- Redis Cache
  order-service-mi-prod           -- Managed Identity

Kubernetes resources follow:
  Namespace:    {team-name}-{environment}
  Deployment:   {service-name}
  Service:      {service-name}
  ConfigMap:    {service-name}-config
  Secret:       {service-name}-secrets (references Key Vault -- no values)
```

### 5.3 Standard Kubernetes manifests

For AKS deployments, generate these standard manifests:

**Deployment (deployment.yaml):**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {service-name}
  namespace: {team-namespace}
  labels:
    app: {service-name}
    team: {team-name}
    managed-by: ai-engineering-common
spec:
  replicas: {replicas-per-env}  # dev: 1, staging: 2, prod: 3
  selector:
    matchLabels:
      app: {service-name}
  template:
    metadata:
      labels:
        app: {service-name}
    spec:
      serviceAccountName: {service-name}
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 2000
      containers:
        - name: {service-name}
          image: ghcr.io/telia-company/{service-name}:latest
          ports:
            - containerPort: 8080
          env:
            - name: SPRING_DATASOURCE_URL
              valueFrom:
                secretKeyRef:
                  name: {service-name}-secrets
                  key: database-url
            # All secrets from Key Vault via CSI driver -- no plain values
          resources:
            requests:
              memory: "256Mi"
              cpu: "100m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          readinessProbe:
            httpGet:
              path: /health/readiness
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health/liveness
              port: 8080
            initialDelaySeconds: 60
            periodSeconds: 30
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
```

**HorizontalPodAutoscaler (hpa.yaml):**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {service-name}
  namespace: {team-namespace}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {service-name}
  minReplicas: {min}   # dev: 1, staging: 2, prod: 3
  maxReplicas: {max}   # From SRE_SERVICE_CONFIG.md or default: prod 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### 5.4 Azure resource generation (Bicep or Terraform)

Generate the primary Azure resources as IaC, not via the Portal:

**Azure PostgreSQL Flexible Server (Bicep excerpt):**
```bicep
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-06-01-preview' = {
  name: '${serviceName}-pg-${environment}'
  location: location
  sku: {
    name: environment == 'prod' ? 'Standard_D4s_v3' : 'Standard_B2s'
    tier: environment == 'prod' ? 'GeneralPurpose' : 'Burstable'
  }
  properties: {
    administratorLogin: 'psqladmin'
    administratorLoginPassword: ''  // Set via Key Vault reference -- never inline
    version: '16'
    storage: {
      storageSizeGB: environment == 'prod' ? 128 : 32
    }
    backup: {
      backupRetentionDays: environment == 'prod' ? 35 : 7
      geoRedundantBackup: environment == 'prod' ? 'Enabled' : 'Disabled'
    }
    highAvailability: {
      mode: environment == 'prod' ? 'ZoneRedundant' : 'Disabled'
    }
  }
}
```

**Azure Key Vault (Bicep excerpt):**
```bicep
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: '${serviceName}-kv-${environment}'
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true  // Use RBAC, not access policies
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enablePurgeProtection: true   // Prevent permanent deletion
    networkAcls: {
      defaultAction: 'Deny'       // Deny by default
      bypass: 'AzureServices'
      ipRules: []
      virtualNetworkRules: [{
        id: vnetSubnetId  // Only allow from AKS subnet
      }]
    }
  }
}
```

---

## 6. Security rules for IaC

These rules are applied to all generated and reviewed IaC. Any violation
is a BLOCK finding.

```
BLOCK -- Credentials in IaC:
  -- No plaintext passwords, connection strings, or API keys
  -- All secrets referenced from Key Vault or environment variables
  -- No ssh keys or TLS certificates stored in IaC files

BLOCK -- Overly permissive network rules:
  -- No security groups allowing 0.0.0.0/0 inbound on sensitive ports
  -- No public IP on database servers
  -- No Key Vault with public network access enabled

BLOCK -- Missing security hardening:
  -- No container running as root (runAsNonRoot: true required)
  -- No container with privileged: true
  -- No allowPrivilegeEscalation: true
  -- readOnlyRootFilesystem: true required for all containers

BLOCK -- Unencrypted storage:
  -- No storage accounts without encryption at rest
  -- No databases without encryption at rest
  -- No unencrypted disks

WARN -- Missing backup configuration:
  -- Database backup retention < 7 days

WARN -- No resource limits on containers:
  -- Kubernetes deployments must have resource requests and limits

WARN -- Single-AZ deployment for production:
  -- Production databases should use high availability / zone redundant

WARN -- No soft-delete on Key Vault:
  -- Key Vault soft-delete and purge protection should be enabled
```

---

## 7. IaC review protocol (PR review mode)

When reviewing a PR containing IaC changes:

```
1. Identify changed IaC files:
   *.tf (Terraform), *.bicep (Bicep), *.yaml in helm/ directories

2. For each changed file:
   -- Apply security rules from section 6
   -- Check naming conventions from section 5.2
   -- Verify environment-specific sizing is appropriate

3. Check for drift from approved architecture:
   -- Read ARCHITECTURE_OVERVIEW.md for the service
   -- Does the IaC match the approved deployment target?
   -- Are new resources that require ADR approval being created?

4. Produce PR review comment:
   IaC REVIEW -- [PR title]

   Security checks: [PASS / N BLOCK findings]
   Naming conventions: [PASS / Issues]
   Environment sizing: [PASS / Issues]

   [If BLOCK findings:]
   [Formatted per section 6 pattern]
```

---

## 8. HITL gate behaviour

### 8.1 Gate B01 -- Architect approves new infrastructure design

Presented by Orchestrator before Infra Agent is invoked for new service
infrastructure. The agent does not present B01 itself -- it acts after
B01 is approved.

### 8.2 Gate D01 -- Tech Lead approves IaC PR

After generating IaC and opening a PR:

```
=== HITL GATE D01 -- IaC pull request approval ===

Gate: D01 -- Tech Lead must approve IaC PR
Approver: Tech Lead

PR: [URL]

IaC SUMMARY
  Resources created: [N]
  Environments affected: [dev / staging / prod]
  Security checks: [PASS / N findings]
  Naming conventions: [PASS]

TO APPROVE
Approve the PR in GitHub. Production resources will only be created
when the production deployment pipeline runs after a release tag.

=== END GATE OUTPUT ===
```

### 8.3 Gate A02 -- Production infrastructure change

Any IaC change that would modify production resources when applied
triggers gate A02:

```
Gate A02 is presented to Tech Lead + DevOps.
Required before: applying Terraform plan / deploying Bicep to production.
Not required for: PR creation (gate D01 covers that).
```

---

## 9. Output formats

### 9.1 IaC generation complete

```
IaC GENERATION COMPLETE

Service: [service-name]
Environments: [dev / staging / prod]
IaC format: [Bicep / Terraform / Helm]

Files generated:
  [list of generated file paths]

Security checks: PASS (no credentials, hardening applied)
Naming conventions: PASS

PR opened: [URL]

Gate D01 required for Tech Lead approval.
Gate A02 required before applying to production.

---
IaC / Infra Agent (commons v1.0.0)
```

---

## 10. Calls to other agents

Per AGENT_REGISTRY.md entry A36:

```
A22 Security Review Agent -- called after IaC files are committed
    to review the security posture of the infrastructure
    Handover: PR number, list of IaC files changed

A29 Pipeline Agent -- called to integrate deployment workflows with
    the new infrastructure
    Handover: service name, deployment target, environments
```

---

## 11. What the Infra Agent must never do

```
-- Include any credentials, passwords, or API keys in generated IaC
   (all secrets are Key Vault references -- no plaintext values)

-- Create resources with public endpoints that should be private
   (databases, Key Vaults, internal services must not be public-facing)

-- Generate containers running as root
   (runAsNonRoot: true is required on all containers)

-- Apply Terraform plan or deploy Bicep to production without gate A02
   (production infrastructure changes are always human-approved)

-- Create resources in an Azure subscription or region not approved
   in COMPLIANCE_STANDARDS.md section 3.2
   (data residency requirements must be respected)

-- Generate a new AKS cluster without resource quotas and limits
   (all clusters must have namespace resource quotas)

-- Skip the security rules check for reviewed IaC
   (security review applies to all IaC changes -- not just generated ones)
```

---

## 12. Version and review

| Attribute | Value |
|---|---|
| File owner | CoE Core + DevOps |
| Review cadence | Quarterly -- or when infrastructure standards change |
| Last reviewed | 2025-01 |
| Next review due | 2025-04 |
| Approvers | CoE Lead, DevOps Lead, Security Lead |
| Change process | PR to ai-engineering-common, Security Lead approval required |
