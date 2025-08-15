# Firebase Composite Indexes Deployment Guide

## Overview
This document contains the Firebase CLI commands needed to deploy all composite indexes for the MMG Platform. These indexes optimize complex queries that use multiple fields and are essential for production performance.

## Prerequisites
1. Ensure you have Firebase CLI installed: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase in your project if not already done: `firebase init`

## Deployment Commands

### 1. Deploy All Indexes
```bash
firebase deploy --only firestore:indexes
```

### 2. Deploy Specific Index Configuration
```bash
firebase firestore:indexes:deploy firestore.indexes.json
```

### 3. List Current Indexes
```bash
firebase firestore:indexes
```

### 4. Delete Unused Indexes (if needed)
```bash
firebase firestore:indexes:delete
```

## Index Deployment Status
After running the deployment command, you can monitor the index creation status:

1. **Firebase Console**: Check the Firestore Database section under "Indexes"
2. **CLI Status**: Run `firebase firestore:indexes` to see build status
3. **Build Time**: Large indexes may take several minutes to build

## Important Notes

### Performance Impact
- Indexes improve query performance significantly
- Without proper indexes, queries may fail or be extremely slow
- Some queries are impossible without composite indexes

### Cost Considerations
- Each index consumes storage space
- Index writes have a cost impact
- Monitor usage in Firebase Console

### Maintenance
- Indexes are automatically maintained by Firebase
- No manual intervention needed once deployed
- Remove unused indexes to optimize costs

## Troubleshooting

### Common Issues
1. **Permission Errors**: Ensure you have Editor/Owner role in Firebase project
2. **Quota Limits**: Check if you've exceeded index limits
3. **Build Failures**: Review index configuration for conflicts

### Verification Commands
```bash
# Check project configuration
firebase use

# Verify index configuration syntax
firebase firestore:indexes:validate firestore.indexes.json

# Test specific queries after deployment
firebase firestore:query --help
```

## Next Steps
1. Deploy the indexes using the commands above
2. Test critical queries to ensure they work correctly
3. Monitor performance in Firebase Console
4. Set up alerts for query performance degradation

## Support
For issues with index deployment:
1. Check Firebase documentation: https://firebase.google.com/docs/firestore/query-data/indexing
2. Review Firebase Console error messages
3. Contact Firebase support for complex issues