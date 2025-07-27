# GitHub Repository Setup Guide

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Repository name: `arqtiva-shared-utils`
3. Owner: `manukyanv07`
4. Description: "Shared utilities for Arqtiva ERP microservices following AWS Lambda best practices"
5. Set to **Public** (required for GitHub Packages)
6. Initialize with README: **No** (we already have one)
7. Click "Create repository"

## Step 2: Configure Repository Settings

### Enable GitHub Packages
1. Go to repository → Settings → General
2. Scroll down to "Features" section
3. Ensure "Packages" is enabled

### Set Package Permissions
1. Go to repository → Settings → Actions → General
2. Under "Workflow permissions":
   - Select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"

## Step 3: Push Code to Repository

```bash
# Navigate to shared library directory
cd /Users/vahrammanukyan/IdeaProjects/test-abm/serverless-erp/microservices/shared

# Initialize git repository
git init

# Add remote origin
git remote add origin https://github.com/manukyanv07/arqtiva-shared-utils.git

# Add all files
git add .

# Create initial commit
git commit -m "feat: initial commit of shared utilities library

- AWS client factories with connection pooling
- Environment validation utilities  
- Health check utilities
- Lambda-optimized patterns
- Comprehensive test suite
- Publishing pipeline with Makefile

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to main branch
git branch -M main
git push -u origin main
```

## Step 4: Create GitHub Personal Access Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens/new)
2. Token name: `arqtiva-shared-utils-publish`
3. Expiration: Choose appropriate duration (recommend 90 days)
4. Select scopes:
   - ✅ `write:packages` - Upload packages to GitHub Package Registry
   - ✅ `read:packages` - Download packages from GitHub Package Registry
   - ✅ `repo` - Full control of private repositories (needed for package metadata)
5. Click "Generate token"
6. **IMPORTANT**: Copy the token immediately (you won't see it again)

## Step 5: Configure Local Authentication

```bash
# Run the setup command
make setup-auth

# Or manually create .npmrc
echo "@arqtiva:registry=https://npm.pkg.github.com" > .npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> .npmrc

# Add .npmrc to .gitignore (if not already)
echo ".npmrc" >> .gitignore
```

## Step 6: Test Publishing

```bash
# Test authentication
make check-auth

# Run full validation
make validate

# Publish first version
make publish-patch
```

## Repository Structure

Your repository will be available at:
- **Repository**: https://github.com/manukyanv07/arqtiva-shared-utils
- **Packages**: https://github.com/manukyanv07/arqtiva-shared-utils/packages
- **Package Registry**: `@arqtiva/shared-utils`

## Installation for Consumers

Users will install your package with:

```bash
# Configure npm to use GitHub Packages for @arqtiva scope
echo "@arqtiva:registry=https://npm.pkg.github.com" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> .npmrc

# Install the package
npm install @arqtiva/shared-utils
```

## Publishing Workflow

```bash
# Development workflow
make help                    # Show all available commands
make validate               # Run tests and linting
make publish-patch          # Patch version (1.0.0 → 1.0.1)
make publish-minor          # Minor version (1.0.0 → 1.1.0)
make publish-major          # Major version (1.0.0 → 2.0.0)
make release               # Full release workflow with git tags
```

## Security Notes

- ✅ `.npmrc` is added to `.gitignore` to protect your GitHub token
- ✅ Repository should be public for GitHub Packages to work
- ✅ Use tokens with minimal required scopes
- ✅ Rotate tokens regularly (every 90 days recommended)

## Troubleshooting

### Common Issues:

1. **Authentication Failed**
   ```bash
   make check-auth  # Verify authentication
   make setup-auth  # Reconfigure if needed
   ```

2. **Package Not Found**
   - Ensure repository is public
   - Check package name in package.json matches `@arqtiva/shared-utils`
   - Verify GitHub Packages is enabled in repository settings

3. **Permission Denied**
   - Check GitHub token has `write:packages` scope
   - Verify you own the repository `manukyanv07/arqtiva-shared-utils`

4. **Version Already Exists**
   ```bash
   make status  # Check published versions
   # Then use appropriate version bump command
   ```

For more help, run: `make help`