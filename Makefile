# Makefile for @arqtiva/shared-utils
# Publishes shared library to GitHub Packages under manukyanv07

.PHONY: help clean install test lint build publish publish-patch publish-minor publish-major check-auth setup-auth status unpublish

# Default target
help: ## Show this help message
	@echo "Available commands for @arqtiva/shared-utils:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "GitHub Packages Configuration:"
	@echo "  Registry:    https://npm.pkg.github.com"
	@echo "  Package:     @arqtiva/shared-utils"
	@echo "  Repository:  https://github.com/manukyanv07/arqtiva-shared-utils"
	@echo "  Owner:       manukyanv07"
	@echo ""

# Development commands
clean: ## Clean node_modules and package-lock.json
	@echo "🧹 Cleaning dependencies..."
	rm -rf node_modules package-lock.json
	@echo "✅ Clean complete"

install: ## Install dependencies
	@echo "📦 Installing dependencies..."
	npm install
	@echo "✅ Dependencies installed"

test: ## Run tests
	@echo "🧪 Running tests..."
	npm test
	@echo "✅ Tests completed"

test-coverage: ## Run tests with coverage
	@echo "🧪 Running tests with coverage..."
	npm run test:coverage
	@echo "✅ Tests with coverage completed"

lint: ## Run linting
	@echo "🔍 Running linter..."
	npm run lint
	@echo "✅ Linting completed"

lint-fix: ## Run linting with auto-fix
	@echo "🔧 Running linter with auto-fix..."
	npm run lint:fix
	@echo "✅ Auto-fix completed"

# Pre-publish validation
validate: clean install test lint ## Full validation (clean, install, test, lint)
	@echo "✅ All validation checks passed"

# GitHub authentication
check-auth: ## Check GitHub authentication status
	@echo "🔐 Checking GitHub authentication..."
	@if ! npm whoami --registry=https://npm.pkg.github.com >/dev/null 2>&1; then \
		echo "❌ Not authenticated to GitHub Packages"; \
		echo "💡 Run 'make setup-auth' to configure authentication"; \
		exit 1; \
	else \
		echo "✅ Authenticated as: $$(npm whoami --registry=https://npm.pkg.github.com)"; \
	fi

setup-auth: ## Setup GitHub Packages authentication
	@echo "🔐 Setting up GitHub Packages authentication for manukyanv07..."
	@echo ""
	@echo "📋 Instructions:"
	@echo "1. Go to: https://github.com/settings/tokens/new"
	@echo "2. Token name: 'arqtiva-shared-utils-publish'"
	@echo "3. Required scopes: write:packages, read:packages, repo"
	@echo "4. Repository access: Select 'manukyanv07/arqtiva-shared-utils'"
	@echo ""
	@read -s -p "Enter your GitHub Personal Access Token: " token; \
	echo ""; \
	echo "@arqtiva:registry=https://npm.pkg.github.com" > .npmrc; \
	echo "//npm.pkg.github.com/:_authToken=$$token" >> .npmrc; \
	echo "✅ Authentication configured for manukyanv07 in .npmrc"
	@echo "⚠️  Remember to add .npmrc to .gitignore to keep your token secure"

# Version and publish commands
publish-patch: validate check-auth ## Publish patch version (1.0.0 -> 1.0.1)
	@echo "📈 Publishing patch version..."
	npm version patch
	@$(MAKE) _publish

publish-minor: validate check-auth ## Publish minor version (1.0.0 -> 1.1.0)
	@echo "📈 Publishing minor version..."
	npm version minor
	@$(MAKE) _publish

publish-major: validate check-auth ## Publish major version (1.0.0 -> 2.0.0)
	@echo "📈 Publishing major version..."
	npm version major
	@$(MAKE) _publish

publish: validate check-auth ## Publish current version (no version bump)
	@echo "📦 Publishing current version..."
	@$(MAKE) _publish

# Internal publish command
_publish:
	@echo "🚀 Publishing to GitHub Packages..."
	npm publish --registry=https://npm.pkg.github.com
	@echo "✅ Package published successfully!"
	@echo ""
	@echo "📋 Installation instructions:"
	@echo "  echo '@arqtiva:registry=https://npm.pkg.github.com' >> .npmrc"
	@echo "  echo '//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN' >> .npmrc"
	@echo "  npm install @arqtiva/shared-utils@$$(node -p "require('./package.json').version")"
	@echo ""
	@echo "🔗 Package URL: https://github.com/manukyanv07/arqtiva-shared-utils/packages"

# Status and information commands
status: ## Show package status and latest published version
	@echo "📊 Package Status:"
	@echo "  Local version:  $$(node -p "require('./package.json').version")"
	@echo "  Package name:   $$(node -p "require('./package.json').name")"
	@echo "  Registry:       https://npm.pkg.github.com"
	@echo ""
	@echo "🔍 Checking published versions..."
	@npm view @arqtiva/shared-utils versions --registry=https://npm.pkg.github.com --json 2>/dev/null || echo "  No published versions found or not authenticated"

info: status ## Alias for status command

# Development workflow commands
dev-publish: ## Development workflow: quick publish after validation
	@echo "🔄 Development publish workflow..."
	@$(MAKE) validate
	@$(MAKE) check-auth
	@echo ""
	@read -p "Ready to publish? Current version: $$(node -p "require('./package.json').version") (y/N): " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		$(MAKE) _publish; \
	else \
		echo "❌ Publish cancelled"; \
	fi

quick-patch: ## Quick patch publish (skip some validations)
	@echo "⚡ Quick patch publish..."
	npm version patch
	npm publish --registry=https://npm.pkg.github.com
	@echo "✅ Quick patch published!"

# Utility commands
unpublish: ## Unpublish a specific version (USE WITH CAUTION)
	@echo "⚠️  DANGER: This will unpublish a version from GitHub Packages"
	@read -p "Enter version to unpublish (e.g., 1.0.0): " version; \
	read -p "Are you sure? This cannot be undone (y/N): " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		npm unpublish @arqtiva/shared-utils@$$version --registry=https://npm.pkg.github.com; \
		echo "✅ Version $$version unpublished"; \
	else \
		echo "❌ Unpublish cancelled"; \
	fi

check-registry: ## Check if package exists in registry
	@echo "🔍 Checking package in registry..."
	@npm view @arqtiva/shared-utils --registry=https://npm.pkg.github.com 2>/dev/null || echo "Package not found in registry"

list-files: ## List files that will be included in the package
	@echo "📁 Files to be included in package:"
	@npm pack --dry-run 2>/dev/null | grep -E "^\s*[0-9]" || echo "Run 'npm install' first"

# CI/CD commands (for GitHub Actions)
ci-publish: ## CI/CD publish command (uses CI environment)
	@echo "🤖 CI/CD Publishing..."
	@if [ -z "$$CI" ]; then \
		echo "❌ This command should only be run in CI/CD environment"; \
		exit 1; \
	fi
	npm ci
	npm test
	npm run lint
	npm publish --registry=https://npm.pkg.github.com
	@echo "✅ CI/CD publish completed"

# Default version commands with confirmation
safe-patch: ## Safe patch publish with confirmation prompts
	@echo "🛡️  Safe patch publish with confirmations..."
	@$(MAKE) validate
	@$(MAKE) check-auth
	@echo ""
	@echo "Current version: $$(node -p "require('./package.json').version")"
	@read -p "Proceed with patch version bump? (y/N): " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		npm version patch; \
		echo "New version: $$(node -p "require('./package.json').version")"; \
		read -p "Publish to GitHub Packages? (y/N): " publish_confirm; \
		if [ "$$publish_confirm" = "y" ] || [ "$$publish_confirm" = "Y" ]; then \
			$(MAKE) _publish; \
		else \
			echo "❌ Publish cancelled (version was still bumped)"; \
		fi \
	else \
		echo "❌ Version bump cancelled"; \
	fi

# Git integration
git-tag: ## Create and push git tag for current version
	@echo "🏷️  Creating git tag for version $$(node -p "require('./package.json').version")..."
	git add package.json package-lock.json
	git commit -m "chore: bump version to $$(node -p "require('./package.json').version")" || true
	git tag "v$$(node -p "require('./package.json').version")"
	git push origin main
	git push origin "v$$(node -p "require('./package.json').version")"
	@echo "✅ Git tag created and pushed"

# Combined workflow
release: validate check-auth ## Full release workflow (patch, publish, git tag)
	@echo "🚀 Full release workflow..."
	npm version patch
	@$(MAKE) _publish
	@$(MAKE) git-tag
	@echo "🎉 Release completed successfully!"

# Environment commands
create-npmrc: ## Create .npmrc file for GitHub Packages
	@echo "📝 Creating .npmrc file..."
	@echo "@arqtiva:registry=https://npm.pkg.github.com" > .npmrc
	@echo "# Add your GitHub token: //npm.pkg.github.com/:_authToken=YOUR_TOKEN" >> .npmrc
	@echo "✅ .npmrc created (remember to add your GitHub token)"

check-env: ## Check environment and configuration
	@echo "🔍 Environment Check:"
	@echo "  Node version:   $$(node --version)"
	@echo "  NPM version:    $$(npm --version)"
	@echo "  Current dir:    $$(pwd)"
	@echo "  Package name:   $$(node -p "require('./package.json').name")"
	@echo "  Package version: $$(node -p "require('./package.json').version")"
	@echo ""
	@echo "📁 Important files:"
	@ls -la package.json 2>/dev/null && echo "  ✅ package.json exists" || echo "  ❌ package.json missing"
	@ls -la .npmrc 2>/dev/null && echo "  ✅ .npmrc exists" || echo "  ⚠️  .npmrc missing (needed for auth)"
	@ls -la README.md 2>/dev/null && echo "  ✅ README.md exists" || echo "  ⚠️  README.md missing"