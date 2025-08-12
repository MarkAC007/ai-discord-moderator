# GitHub Actions Setup

This document explains how to set up GitHub Actions for automated Docker builds and deployments.

## Overview

The repository includes three GitHub Actions workflows:

1. **Docker Build & Push** - Builds and pushes Docker images to Docker Hub
2. **Test** - Runs tests and linting on pull requests
3. **Security Scan** - Scans for vulnerabilities in dependencies and containers

## Required Secrets

To use these workflows, you need to configure the following secrets in your GitHub repository:

### Docker Hub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add the following secrets:

#### `DOCKERHUB_USERNAME`
Your Docker Hub username (e.g., `markac007`)

#### `DOCKERHUB_TOKEN`
Your Docker Hub access token (not your password)

**To create a Docker Hub token:**
1. Go to [Docker Hub](https://hub.docker.com/)
2. Sign in to your account
3. Go to **Account Settings** → **Security**
4. Click **New Access Token**
5. Give it a name (e.g., "GitHub Actions")
6. Copy the token and save it as `DOCKERHUB_TOKEN`

## Workflow Details

### Docker Build & Push (`docker-build.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**What it does:**
- Builds Docker image for multiple platforms (linux/amd64, linux/arm64)
- Pushes to Docker Hub with automatic tagging
- Creates GitHub releases with changelog
- Only pushes on merge to main (not on PRs)

**Tags created:**
- `latest` - Latest version from main branch
- `v{run_number}` - Version based on GitHub run number
- `main-{sha}` - Branch-specific tags for development

### Test (`test.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**What it does:**
- Runs tests on Node.js 18 and 20
- Runs linting checks
- Builds the project
- Uploads test results as artifacts

### Security Scan (`security.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch
- Weekly schedule (Mondays at 2 AM)

**What it does:**
- Runs `npm audit` for dependency vulnerabilities
- Scans Docker image with Trivy
- Uploads security results to GitHub Security tab

## Workflow Execution

### On Pull Request
1. **Test workflow** runs to ensure code quality
2. **Security Scan** runs to check for vulnerabilities
3. **Docker Build** runs but doesn't push (dry run)

### On Merge to Main
1. **Test workflow** runs to ensure code quality
2. **Security Scan** runs to check for vulnerabilities
3. **Docker Build & Push** builds and pushes the image
4. **GitHub Release** is created automatically

## Manual Workflow Execution

You can manually trigger workflows:

1. Go to **Actions** tab in your repository
2. Select the workflow you want to run
3. Click **Run workflow**
4. Select the branch and click **Run workflow**

## Monitoring

### View Workflow Runs
- Go to **Actions** tab in your repository
- Click on a workflow to see its runs
- Click on a run to see detailed logs

### View Security Issues
- Go to **Security** tab in your repository
- View **Code scanning alerts** for container vulnerabilities
- View **Dependabot alerts** for dependency issues

### View Releases
- Go to **Releases** in your repository
- Each merge to main creates a new release
- Releases include changelog and deployment instructions

## Troubleshooting

### Common Issues

#### Docker Hub Authentication Failed
- Verify `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` are set correctly
- Ensure the token has write permissions to your Docker Hub repository
- Check if the token has expired

#### Build Failures
- Check the workflow logs for specific error messages
- Ensure all dependencies are properly specified in `package.json`
- Verify the Dockerfile is correct

#### Test Failures
- Run tests locally first: `npm test`
- Check for linting issues: `npm run lint`
- Ensure all tests pass before pushing

#### Security Scan Failures
- Review the security alerts in the **Security** tab
- Update vulnerable dependencies
- Consider if vulnerabilities are acceptable for your use case

### Debugging

#### Enable Debug Logging
Add this secret to enable debug logging:
- Name: `ACTIONS_STEP_DEBUG`
- Value: `true`

#### View Detailed Logs
- Go to the failed workflow run
- Click on the failed step
- Expand the logs to see detailed output

## Customization

### Modify Image Name
Edit `.github/workflows/docker-build.yml`:
```yaml
env:
  REGISTRY: docker.io
  IMAGE_NAME: your-username/your-image-name
```

### Add More Platforms
Edit the platforms in the build step:
```yaml
platforms: linux/amd64,linux/arm64,linux/arm/v7
```

### Change Release Schedule
Edit the cron schedule in `security.yml`:
```yaml
schedule:
  - cron: '0 2 * * 1'  # Weekly on Mondays at 2 AM
```

### Add More Tests
Edit `.github/workflows/test.yml` to add additional test steps:
```yaml
- name: Run additional tests
  run: npm run test:integration
```

## Best Practices

1. **Always test locally** before pushing
2. **Review security alerts** regularly
3. **Keep dependencies updated** to minimize vulnerabilities
4. **Use semantic versioning** for releases
5. **Monitor workflow performance** and optimize as needed
6. **Set up branch protection** to require workflow success before merging

## Support

If you encounter issues with the GitHub Actions:

1. Check the workflow logs for error messages
2. Verify all secrets are configured correctly
3. Test the build process locally
4. Open an issue in the repository with detailed error information
