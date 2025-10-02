// src/action/cadastros-multi-post.ts
'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function cadastrosMultiPost(formData: FormData) {
  const basic = (await cookies()).get('basic')?.value;
  if (!basic) throw new Error('Não autenticado.');

  // 1. Condomínio (mesma lógica anterior)
  const condValue = String(formData.get('condominio') || '');
  let condId: number;
  if (condValue === '__new__' || isNaN(Number(condValue))) {
    const condPayload = {
      nome: condValue,
      local: String(formData.get('condominio_local') || ''),
    };
    const condRes = await fetch('http://localhost:8000/api/condominios/', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(condPayload),
      cache: 'no-store',
    });
    if (!condRes.ok) {
      const txt = await condRes.text().catch(() => condRes.statusText);
      throw new Error(`Erro ao criar condomínio: ${txt}`);
    }
    condId = (await condRes.json()).id;
  } else {
    condId = Number(condValue);
  }

  // 2. Torre
  const torreValue = String(formData.get('torre') || '');
  const torreIdent = String(formData.get('torre_identificacao') || '').trim();
  let torreId: number;
  if (/^\d+$/.test(torreValue)) {
    // Selecionou torre existente
    torreId = Number(torreValue);
  } else if (torreIdent) {
    // Criar nova torre
    const torrePayload = {
      numero: torreIdent,
      identificacao: torreIdent,
      condominio: condId,
    };
    const torreRes = await fetch('http://localhost:8000/api/torres/', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(torrePayload),
      cache: 'no-store',
    });
    if (!torreRes.ok) {
      const txt = await torreRes.text().catch(() => torreRes.statusText);
      console.warn(`Não foi possível criar torre: ${txt}`);
      torreId = NaN;
    } else {
      torreId = (await torreRes.json()).id;
    }
  } else {
    // Nenhuma torre selecionada ou criada
    console.warn('Nenhuma torre informada; pulando criação de apartamento.');
    torreId = NaN;
  }

  // 3. Apartamento (só se torreId válido)
  let aptId: number = NaN;
  if (!isNaN(torreId)) {
    const aptPayload = {
      numero: String(formData.get('apartamento') || ''),
      torre: torreId,
    };
    const aptRes = await fetch('http://localhost:8000/api/apartamentos/', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aptPayload),
      cache: 'no-store',
    });
    if (!aptRes.ok) {
      const txt = await aptRes.text().catch(() => aptRes.statusText);
      throw new Error(`Erro ao criar apartamento: ${txt}`);
    }
    aptId = (await aptRes.json()).id;
  } else {
    console.warn('Apartamento não criado pois torre inválida.');
  }

  // 4. Pessoa
  if (!isNaN(aptId)) {
    const pessoaPayload = {
      nome: String(formData.get('pessoa_nome') || ''),
      tipo: String(formData.get('pessoa_tipo') || ''),
      apartamento: aptId,
    };
    const pessoaRes = await fetch('http://localhost:8000/api/pessoas/', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pessoaPayload),
      cache: 'no-store',
    });
    if (!pessoaRes.ok) {
      const txt = await pessoaRes.text().catch(() => pessoaRes.statusText);
      throw new Error(`Erro ao criar pessoa: ${txt}`);
    }
  }

  // 5. Gasômetro
  if (!isNaN(aptId)) {
    const gasPayload = {
      codigo: String(formData.get('gasometro') || ''),
      apartamento: aptId,
    };
    let gasId: number;
    const gasRes = await fetch('http://localhost:8000/api/gasometros/', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gasPayload),
      cache: 'no-store',
    });
    if (!gasRes.ok) {
      const txt = await gasRes.text().catch(() => gasRes.statusText);
      if (txt.includes('already exists')) {
        const searchRes = await fetch(
          `http://localhost:8000/api/gasometros/?codigo=${encodeURIComponent(
            gasPayload.codigo,
          )}`,
          { headers: { Authorization: `Basic ${basic}` }, cache: 'no-store' },
        );
        const data = await searchRes.json();
        gasId =
          Array.isArray(data.results) && data.results.length
            ? data.results[0].id
            : NaN;
      } else {
        throw new Error(`Erro ao criar gasômetro: ${txt}`);
      }
    } else {
      gasId = (await gasRes.json()).id;
    }

    // 6. Leitura
    if (!isNaN(gasId)) {
      const leituraPayload = {
        data_leitura: String(formData.get('data_leitura') || null),
        consumo_m3: Number(formData.get('consumo_m3')) || 0,
        periodicidade: String(formData.get('periodicidade') || ''),
        gasometro: gasId,
      };
      const leituraRes = await fetch('http://localhost:8000/api/leituras/', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basic}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leituraPayload),
        cache: 'no-store',
      });
      if (!leituraRes.ok) {
        const txt = await leituraRes.text().catch(() => leituraRes.statusText);
        throw new Error(`Erro ao criar leitura: ${txt}`);
      }
    }
  }

  revalidatePath('/cadastros');
}
