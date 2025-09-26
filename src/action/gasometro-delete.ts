'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function gasometroDelete(formData: FormData) {
  const codigo = String(formData.get('codigo') || '').trim();
  if (!codigo) throw new Error('Código ausente.');

  const basic = (await cookies()).get('basic')?.value;
  if (!basic) throw new Error('Não autenticado.');

  const res = await fetch(
    `http://localhost:8000/api/gasometros/${encodeURIComponent(codigo)}/`,
    {
      method: 'DELETE',
      headers: { Authorization: `Basic ${basic}` },
      cache: 'no-store',
    },
  );

  if (!res.ok && res.status !== 204) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Falha ao excluir gasômetro: ${res.status} ${txt}`);
  }

  revalidatePath('/gasometros');
}
