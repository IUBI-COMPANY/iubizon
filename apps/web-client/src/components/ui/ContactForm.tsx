'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select, Card } from '@/components/ui';
import { Textarea } from './TextArea';
import { createClient } from '@/lib/supabase/client';

const contactSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Selecciona un tema'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactFormProps {
  onSuccess?: () => void;
}

export function ContactForm({ onSuccess }: ContactFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      const { error: insertError } = await supabase
        .from('contact_messages')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          subject: data.subject,
          message: data.message,
        });

      if (insertError) throw insertError;

      setSuccess(true);
      reset();
      onSuccess?.();
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError('Error al enviar el mensaje. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg">
          Mensaje enviado correctamente. Te contactaremos pronto.
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <Input
            {...register('name')}
            placeholder="Tu nombre completo"
            error={errors.name?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              {...register('email')}
              type="email"
              placeholder="tu@email.com"
              error={errors.email?.message}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono (opcional)</label>
            <Input
              {...register('phone')}
              type="tel"
              placeholder="+51 999 999 999"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tema</label>
          <Select {...register('subject')}>
            <option value="">Selecciona un tema</option>
            <option value="venta">Venta de producto</option>
            <option value="compra">Compra de producto</option>
            <option value="soporte">Soporte técnico</option>
            <option value="otro">Otro</option>
          </Select>
          {errors.subject && (
            <p className="text-sm text-red-500 mt-1">{errors.subject.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mensaje</label>
          <Textarea
            {...register('message')}
            placeholder="Cuéntanos en qué podemos ayudarte..."
            rows={4}
            error={errors.message?.message}
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Enviando...' : 'Enviar mensaje'}
        </Button>
      </form>
    </Card>
  );
}

export default ContactForm;