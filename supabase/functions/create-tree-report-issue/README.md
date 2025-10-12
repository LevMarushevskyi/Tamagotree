# Create Tree Report Issue Edge Function

This Supabase Edge Function creates GitHub issues automatically when users report trees.

## Setup

This function requires a GitHub Personal Access Token to create issues in the repository.

### Creating a GitHub Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name like "Tomagotree Reports"
4. Select the following scope:
   - `public_repo` (for creating issues in public repositories)
5. Click "Generate token" and copy the token

### Setting the Environment Variable in Supabase

1. Go to your Supabase project dashboard
2. Navigate to Edge Functions → Secrets
3. Add a new secret:
   - **Name:** `GITHUB_TOKEN`
   - **Value:** Your GitHub personal access token

## How It Works

When a user reports a tree issue:
1. The report is saved to the `tree_reports` database table
2. This edge function is called to create a GitHub issue
3. The issue includes:
   - Tree name and ID
   - Issue type (fake, duplicate, wrong location, etc.)
   - Reporter's username
   - Tree location with Google Maps link
   - Additional details provided by the reporter
   - Automatic labels: `tree-report` and the issue type

## Example GitHub Issue

```
[Tree Report] Fake Tree: Old Oak

## Tree Report

**Tree Name:** Old Oak
**Tree ID:** `abc123-def456`
**Issue Type:** Fake Tree
**Reported by:** @username

### Location
Latitude: 35.9940
Longitude: -78.8986

[View on Google Maps](https://www.google.com/maps?q=35.9940,-78.8986)

### Details
This tree doesn't exist at this location anymore. It was removed last month.

---
*This issue was automatically created from a user report.*
```

## Labels

The function automatically adds these labels to issues:
- `tree-report` (all reports)
- One of: `fake`, `duplicate`, `wrong_location`, `incorrect_info`, `inappropriate`, or `other`
