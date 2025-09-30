
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Starting debug user status check...')

    // Verify the user is authenticated and has admin role
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Check if user has admin role
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || userRole?.role !== 'admin') {
      console.error('Role error:', roleError, 'Role:', userRole?.role)
      return new Response('Forbidden', { status: 403, headers: corsHeaders })
    }

    // Get all auth users
    const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authUsersError) {
      console.error('Error fetching auth users:', authUsersError)
      return new Response('Error fetching users', { status: 500, headers: corsHeaders })
    }

    console.log('Total auth users found:', authUsers.users.length)

    // Format the debug response with detailed user info
    const userDebugInfo = authUsers.users.map(authUser => {
      return {
        id: authUser.id,
        email: authUser.email,
        email_confirmed_at: authUser.email_confirmed_at,
        last_sign_in_at: authUser.last_sign_in_at,
        created_at: authUser.created_at,
        updated_at: authUser.updated_at,
        phone_confirmed_at: authUser.phone_confirmed_at,
        confirmed_at: authUser.confirmed_at,
        is_active_calculated: !!(authUser.email_confirmed_at && authUser.last_sign_in_at)
      }
    })

    console.log('User debug info:', JSON.stringify(userDebugInfo, null, 2))

    return new Response(
      JSON.stringify({ 
        total_users: authUsers.users.length,
        users: userDebugInfo 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders })
  }
})
