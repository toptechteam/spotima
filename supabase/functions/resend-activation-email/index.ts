
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

    console.log('Starting resend activation email...')

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

    // Get user email from request
    const { userEmail } = await req.json()
    console.log('Resending activation email for:', userEmail)
    
    if (!userEmail) {
      return new Response('User email is required', { status: 400, headers: corsHeaders })
    }

    // Pour les utilisateurs existants, utiliser resend avec type 'signup'
    // Cela renverra l'email de confirmation d'origine
    const { data: resendData, error: resendError } = await supabaseAdmin.auth.resend({
      type: 'signup',
      email: userEmail,
      options: {
        emailRedirectTo: `${req.headers.get('origin') || 'https://smart-bridge.soptime.fr/'}/`
      }
    })

    if (resendError) {
      console.error('Error resending confirmation email:', resendError)
      
      // Si resend échoue, essayer avec generateLink en mode recovery
      // Cela créera un lien de récupération qui permettra à l'utilisateur de confirmer son email
      const { data: recoveryData, error: recoveryError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: userEmail,
        options: {
          redirectTo: `${req.headers.get('origin') || 'https://smart-bridge.soptime.fr/'}/auth/callback`
        }
      })

      if (recoveryError) {
        console.error('Error generating recovery link:', recoveryError)
        return new Response('Error sending activation email', { status: 500, headers: corsHeaders })
      }

      console.log('Recovery link generated as fallback for:', userEmail)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Lien de récupération envoyé. L\'utilisateur peut l\'utiliser pour confirmer son email.',
          method: 'recovery'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Confirmation email resent successfully for:', userEmail)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email de confirmation renvoyé avec succès',
        method: 'resend'
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
