#!/bin/sh
echo "===== CHECKING PATH CONFIGURATIONS ====="

# Check artifact-manager.sh
echo "\n--- artifact-manager.sh paths ---"
grep -n "MASTER_REPO=" scripts/artifact-manager.sh
grep -n "WORKSPACE=" scripts/artifact-manager.sh
grep -n "CONFIG_FILE=" scripts/artifact-manager.sh

# Check branch-artifact-manager.sh
echo "\n--- branch-artifact-manager.sh paths ---"
grep -n "MASTER_REPO=" scripts/branch-artifact-manager.sh
grep -n "WORKSPACE=" scripts/branch-artifact-manager.sh

# Check monitor-artifacts.sh
echo "\n--- monitor-artifacts.sh paths ---"
grep -n "MASTER_REPO=" scripts/monitor-artifacts.sh
grep -n "REPO1=" scripts/monitor-artifacts.sh
grep -n "REPO2=" scripts/monitor-artifacts.sh

# Check sync-artifacts.sh
echo "\n--- sync-artifacts.sh paths ---"
grep -n "MASTER_REPO=" scripts/sync-artifacts.sh
grep -n "REPO1=" scripts/sync-artifacts.sh
grep -n "REPO2=" scripts/sync-artifacts.sh

# Check artifact config
echo "\n--- .artifact-config contents ---"
cat .artifact-config

# Directory structure
echo "\n--- Current directory structure ---"
pwd
ls -la