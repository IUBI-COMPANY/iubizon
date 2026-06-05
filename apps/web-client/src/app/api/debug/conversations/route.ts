import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * DIAGNOSTIC ENDPOINT
 * GET  → inspect conversations + messages state
 * POST → attempt to create a test conversation (to diagnose RLS/insert errors)
 */
export async function GET() {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated', authError }, { status: 401 });
  }

  const { data: myConversations, error: myConvError } = await supabase
    .from('conversations')
    .select('id, buyer_id, seller_id, product_id, created_at')
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

  const { count: totalConvCount } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true });

  const { data: myProducts } = await supabase
    .from('products')
    .select('id, title')
    .eq('seller_id', user.id)
    .limit(3);

  return NextResponse.json({
    currentUser: { id: user.id, email: user.email },
    totalConversationsVisible: totalConvCount,
    myConversations: myConversations ?? [],
    myConversationsError: myConvError,
    myProducts: myProducts ?? [],
  });
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { buyer_id, seller_id, product_id } = body;

  if (!buyer_id || !seller_id || !product_id) {
    return NextResponse.json({
      error: 'Required: buyer_id, seller_id, product_id',
      currentUserId: user.id,
    }, { status: 400 });
  }

  // Attempt the insert from the server side (with user's JWT via cookie)
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .insert({ buyer_id, seller_id, product_id })
    .select('id')
    .single();

  if (convError) {
    return NextResponse.json({
      success: false,
      error: convError,
      hint: 'RLS or schema issue',
      currentUserId: user.id,
    }, { status: 400 });
  }

  // Insert initial message
  const { error: msgError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conv.id,
      sender_id: user.id,
      content: 'Hola, me interesa tu producto (test desde debug endpoint)',
    });

  return NextResponse.json({
    success: true,
    conversationId: conv.id,
    messageError: msgError,
    currentUserId: user.id,
  });
}
