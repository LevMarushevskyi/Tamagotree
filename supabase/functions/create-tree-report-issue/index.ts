import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN');
const GITHUB_REPO_OWNER = 'LevMarushevskyi';
const GITHUB_REPO_NAME = 'Tomagotree';

interface ReportData {
  tree_id: string;
  tree_name: string;
  reason: string;
  details: string | null;
  reporter_username: string;
  tree_location: { latitude: number; longitude: number };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const reportData: ReportData = await req.json();

    if (!GITHUB_TOKEN) {
      console.error('GITHUB_TOKEN environment variable is not set');
      return new Response(
        JSON.stringify({ error: 'GitHub integration not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const reasonLabels: Record<string, string> = {
      'fake': 'Fake Tree',
      'duplicate': 'Duplicate',
      'wrong_location': 'Wrong Location',
      'incorrect_info': 'Incorrect Information',
      'inappropriate': 'Inappropriate Content',
      'other': 'Other Issue'
    };

    const reasonLabel = reasonLabels[reportData.reason] || reportData.reason;

    const issueTitle = `[Tree Report] ${reasonLabel}: ${reportData.tree_name}`;
    const issueBody = `## Tree Report

**Tree Name:** ${reportData.tree_name}
**Tree ID:** \`${reportData.tree_id}\`
**Issue Type:** ${reasonLabel}
**Reported by:** @${reportData.reporter_username}

### Location
Latitude: ${reportData.tree_location.latitude}
Longitude: ${reportData.tree_location.longitude}

[View on Google Maps](https://www.google.com/maps?q=${reportData.tree_location.latitude},${reportData.tree_location.longitude})

### Details
${reportData.details || '_No additional details provided_'}

---
*This issue was automatically created from a user report.*`;

    const githubResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/issues`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({
          title: issueTitle,
          body: issueBody,
          labels: ['tree-report', reportData.reason],
        }),
      }
    );

    if (!githubResponse.ok) {
      const errorData = await githubResponse.text();
      console.error('GitHub API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to create GitHub issue', details: errorData }),
        { status: githubResponse.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const issue = await githubResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        issue_url: issue.html_url,
        issue_number: issue.number
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error creating GitHub issue:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
});
