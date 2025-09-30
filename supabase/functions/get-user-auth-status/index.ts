
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

    console.log('Starting auth status check...')

    // Verify the user is authenticated and has admin role
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    console.log('User authenticated:', user.email)

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

    console.log('User has admin role')

    // Get user IDs from request
    const { userIds } = await req.json()
    console.log('Requested user IDs:', userIds)
    
    if (!userIds || !Array.isArray(userIds)) {
      return new Response('Invalid user IDs', { status: 400, headers: corsHeaders })
    }

    // Get auth users with admin API
    const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authUsersError) {
      console.error('Error fetching auth users:', authUsersError)
      return new Response('Error fetching users', { status: 500, headers: corsHeaders })
    }

    console.log('Total auth users found:', authUsers.users.length)

    // Filter and format the response with correct activation logic
    const userAuthStatus = userIds.map(userId => {
      const authUser = authUsers.users.find(u => u.id === userId)
      
      console.log(`Processing user ${userId}:`, {
        found: !!authUser,
        email: authUser?.email,
        email_confirmed_at: authUser?.email_confirmed_at,
        last_sign_in_at: authUser?.last_sign_in_at
      })
      
      // Un utilisateur est actif s'il a confirmé son email ET s'est connecté au moins une fois
      // Si email_confirmed_at existe ET last_sign_in_at existe, alors l'utilisateur est actif
      const isActive = !!(authUser?.email_confirmed_at && authUser?.last_sign_in_at)
      
      console.log(`User ${userId} is_active:`, isActive, {
        email_confirmed: !!authUser?.email_confirmed_at,
        has_signed_in: !!authUser?.last_sign_in_at
      })
      
      return {
        id: userId,
        email_confirmed_at: authUser?.email_confirmed_at || null,
        last_sign_in_at: authUser?.last_sign_in_at || null,
        is_active: isActive
      }
    })

    console.log('Final user auth status:', userAuthStatus)

    return new Response(
      JSON.stringify({ users: userAuthStatus }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders })
  }
})
