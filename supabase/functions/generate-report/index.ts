
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { renderAsync } from 'https://deno.land/x/pdfio@0.2.0/mod.ts';

// Get Supabase connection from environment
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid authorization header' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('account_type, institution_id')
      .eq('id', user.id)
      .single();
      
    if (profileError || !profile || profile.account_type !== 'institution') {
      return new Response(JSON.stringify({ error: 'Unauthorized. Only institution accounts can generate reports' }), { 
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Extract query parameters from request
    const url = new URL(req.url);
    const reportType = url.searchParams.get('type') || 'summary';
    const dateFrom = url.searchParams.get('from');
    const dateTo = url.searchParams.get('to');
    
    // Generate report based on type
    const report = await generateReport(supabase, {
      reportType,
      institutionId: profile.institution_id,
      dateFrom,
      dateTo
    });
    
    // Check if report was requested in PDF format
    if (url.searchParams.get('format') === 'pdf') {
      const pdfBuffer = await generatePDF(report, reportType);
      
      return new Response(pdfBuffer, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="mindgrove-report-${reportType}.pdf"`
        }
      });
    }
    
    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    
    return new Response(JSON.stringify({ error: 'Failed to generate report', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function generateReport(supabase, options) {
  const { reportType, institutionId, dateFrom, dateTo } = options;
  
  // Base query for filtering by date range
  const dateQuery = buildDateQuery(dateFrom, dateTo);
  
  switch (reportType) {
    case 'users':
      return generateUserReport(supabase, institutionId, dateQuery);
    case 'documents':
      return generateDocumentReport(supabase, institutionId, dateQuery);
    case 'research':
      return generateResearchReport(supabase, institutionId, dateQuery);
    case 'search':
      return generateSearchReport(supabase, institutionId, dateQuery);
    case 'summary':
    default:
      return generateSummaryReport(supabase, institutionId, dateQuery);
  }
}

async function generateSummaryReport(supabase, institutionId, dateQuery) {
  // Get institution details
  const { data: institution } = await supabase
    .from('institutions')
    .select('name, domain, is_premium')
    .eq('id', institutionId)
    .single();
  
  // Get user count
  const { count: userCount } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('institution_id', institutionId);
  
  // Get document count
  const { count: documentCount } = await supabase
    .from('research_uploads')
    .select('id', { count: 'exact', head: true })
    .eq('institution_id', institutionId);
  
  // Get research group count
  const { count: groupCount } = await supabase
    .from('research_groups')
    .select('id', { count: 'exact', head: true })
    .eq('institution_id', institutionId);
  
  // Get top 5 search terms
  const { data: topSearches } = await supabase
    .from('search_history')
    .select('query, count(*)')
    .eq('institution_id', institutionId)
    .group('query')
    .order('count', { ascending: false })
    .limit(5);
  
  // Get subscription status
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_type, status, expires_at')
    .eq('institution_id', institutionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  return {
    generated_at: new Date().toISOString(),
    institution: institution || { name: 'Unknown Institution' },
    metrics: {
      user_count: userCount || 0,
      document_count: documentCount || 0,
      group_count: groupCount || 0
    },
    top_searches: topSearches || [],
    subscription: subscription || { status: 'none' },
    report_type: 'summary'
  };
}

async function generateUserReport(supabase, institutionId, dateQuery) {
  // Get users by date joined
  const { data: usersByDate } = await supabase
    .from('profiles')
    .select('id, name, email, created_at')
    .eq('institution_id', institutionId)
    .order('created_at', { ascending: false });
  
  // Get most active users (by document uploads)
  const { data: mostActiveUsers } = await supabase
    .from('profiles')
    .select(`
      id, 
      name, 
      email,
      document_count,
      (
        select count(*)
        from research_uploads
        where research_uploads.user_id = profiles.id
      ) as upload_count
    `)
    .eq('institution_id', institutionId)
    .order('upload_count', { ascending: false })
    .limit(10);
  
  return {
    generated_at: new Date().toISOString(),
    users_by_date: usersByDate || [],
    most_active_users: mostActiveUsers || [],
    report_type: 'users'
  };
}

async function generateDocumentReport(supabase, institutionId, dateQuery) {
  // Get recently uploaded documents
  const { data: recentUploads } = await supabase
    .from('research_uploads')
    .select(`
      id,
      title,
      file_type,
      created_at,
      user_id,
      profiles (name)
    `)
    .eq('institution_id', institutionId)
    .order('created_at', { ascending: false })
    .limit(20);
  
  // Get document counts by type
  const { data: documentsByType } = await supabase
    .from('research_uploads')
    .select('file_type, count(*)')
    .eq('institution_id', institutionId)
    .group('file_type')
    .order('count', { ascending: false });
  
  return {
    generated_at: new Date().toISOString(),
    recent_uploads: recentUploads || [],
    documents_by_type: documentsByType || [],
    report_type: 'documents'
  };
}

async function generateResearchReport(supabase, institutionId, dateQuery) {
  // Get research groups
  const { data: researchGroups } = await supabase
    .from('research_groups')
    .select(`
      id,
      name,
      description,
      created_at,
      (
        select count(*)
        from group_members
        where group_members.group_id = research_groups.id
      ) as member_count,
      (
        select count(*)
        from research_uploads
        where research_uploads.group_id = research_groups.id
      ) as document_count
    `)
    .eq('institution_id', institutionId)
    .order('created_at', { ascending: false });
  
  return {
    generated_at: new Date().toISOString(),
    research_groups: researchGroups || [],
    report_type: 'research'
  };
}

async function generateSearchReport(supabase, institutionId, dateQuery) {
  // Get search terms frequency
  const { data: searchTerms } = await supabase
    .from('search_history')
    .select('query, count(*)')
    .eq('institution_id', institutionId)
    .group('query')
    .order('count', { ascending: false })
    .limit(50);
  
  // Get searches by date
  const { data: searchesByDate } = await supabase
    .from('search_history')
    .select('created_at, query')
    .eq('institution_id', institutionId)
    .order('created_at', { ascending: false })
    .limit(100);
  
  return {
    generated_at: new Date().toISOString(),
    search_terms: searchTerms || [],
    searches_by_date: searchesByDate || [],
    report_type: 'search'
  };
}

function buildDateQuery(dateFrom, dateTo) {
  let query = {};
  
  if (dateFrom) {
    query['created_at'] = 'gte.' + dateFrom;
  }
  
  if (dateTo) {
    query['created_at'] = query['created_at'] ? 
      query['created_at'] + ',lte.' + dateTo : 
      'lte.' + dateTo;
  }
  
  return query;
}

async function generatePDF(report, reportType) {
  // Basic PDF template using pdfio library
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>MindGrove ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        h1 { color: #2563eb; font-size: 24px; margin-bottom: 10px; }
        h2 { color: #4b5563; font-size: 18px; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
        th { background-color: #f3f4f6; }
        .header { padding-bottom: 20px; border-bottom: 1px solid #ddd; margin-bottom: 20px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>MindGrove ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h1>
        <p>Generated: ${new Date().toISOString().split('T')[0]}</p>
        ${report.institution ? `<p>Institution: ${report.institution.name}</p>` : ''}
      </div>
      
      <div id="content">
        ${generatePDFContent(report, reportType)}
      </div>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} MindGrove - Institutional Research Platform</p>
      </div>
    </body>
    </html>
  `;
  
  try {
    const pdfBuffer = await renderAsync(html);
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
}

function generatePDFContent(report, reportType) {
  switch (reportType) {
    case 'users':
      return `
        <h2>Most Active Users</h2>
        <table>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Documents</th>
          </tr>
          ${report.most_active_users?.map(user => `
            <tr>
              <td>${user.name || 'Anonymous'}</td>
              <td>${user.email || 'No email'}</td>
              <td>${user.upload_count || 0}</td>
            </tr>
          `).join('') || '<tr><td colspan="3">No users found</td></tr>'}
        </table>
      `;
      
    case 'documents':
      return `
        <h2>Recent Uploads</h2>
        <table>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Uploaded By</th>
            <th>Date</th>
          </tr>
          ${report.recent_uploads?.map(upload => `
            <tr>
              <td>${upload.title || 'Untitled'}</td>
              <td>${upload.file_type || 'Unknown'}</td>
              <td>${upload.profiles?.name || 'Anonymous'}</td>
              <td>${new Date(upload.created_at).toLocaleDateString()}</td>
            </tr>
          `).join('') || '<tr><td colspan="4">No documents found</td></tr>'}
        </table>
        
        <h2>Documents by Type</h2>
        <table>
          <tr>
            <th>Type</th>
            <th>Count</th>
          </tr>
          ${report.documents_by_type?.map(item => `
            <tr>
              <td>${item.file_type || 'Unknown'}</td>
              <td>${item.count || 0}</td>
            </tr>
          `).join('') || '<tr><td colspan="2">No document types found</td></tr>'}
        </table>
      `;
      
    case 'summary':
    default:
      return `
        <h2>Institution Summary</h2>
        <table>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>Number of Users</td>
            <td>${report.metrics?.user_count || 0}</td>
          </tr>
          <tr>
            <td>Number of Documents</td>
            <td>${report.metrics?.document_count || 0}</td>
          </tr>
          <tr>
            <td>Number of Research Groups</td>
            <td>${report.metrics?.group_count || 0}</td>
          </tr>
          <tr>
            <td>Subscription Status</td>
            <td>${report.subscription?.status || 'None'}</td>
          </tr>
        </table>
        
        <h2>Top Search Terms</h2>
        <table>
          <tr>
            <th>Search Term</th>
            <th>Count</th>
          </tr>
          ${report.top_searches?.map(item => `
            <tr>
              <td>${item.query || 'Unknown'}</td>
              <td>${item.count || 0}</td>
            </tr>
          `).join('') || '<tr><td colspan="2">No search data found</td></tr>'}
        </table>
      `;
  }
}
