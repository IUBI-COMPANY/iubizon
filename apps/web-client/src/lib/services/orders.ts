import { createServerClient } from '@/lib/supabase/server';
import type { Order } from '@/types';

export async function getUserOrders(userId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('orders')
    .select('*, product:products(*, images:product_images(*)), buyer:profiles(*), seller:profiles(*), shipping:shippings(*)')
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Order[];
}

export async function getOrderById(orderId: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('orders')
    .select('*, product:products(*, images:product_images(*), category:categories(*), seller:profiles(*)), buyer:profiles(*), seller:profiles(*), shipping:shippings(*)')
    .eq('id', orderId)
    .single();

  if (error) throw error;
  return data as Order;
}

export async function createOrder(orderData: {
  product_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  payment_method: string;
}) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}