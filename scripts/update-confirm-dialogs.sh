#!/bin/bash

# Script to add confirmation dialog import to multiple components
files=(
  "components/maintenance/maintenance-list.tsx"
  "components/properties/property-list.tsx"
  "components/tenants/tenant-list.tsx"
  "components/documents/document-manager.tsx"
  "components/analytics/reports-manager.tsx"
)

for file in "${files[@]}"; do
  echo "Updating $file..."
  
  # Check if file exists
  if [ -f "$file" ]; then
    # Add import if not already present
    if ! grep -q "ConfirmationDialog" "$file"; then
      # Find the last import line and add our import after it
      sed -i.bak '/^import.*from/a\
import { ConfirmationDialog, useDeleteConfirmation } from '\''@/components/ui/confirmation-dialog'\'';
' "$file"
      echo "  ✅ Added import to $file"
    else
      echo "  ⏭️  Import already exists in $file"
    fi
  else
    echo "  ❌ File not found: $file"
  fi
done

echo "Done! Please manually update the component logic to use the confirmation dialogs."