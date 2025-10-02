// src/action/cadastros-multi-post.ts
'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function cadastrosMultiPost(formData: FormData) {
  const basic = (await cookies()).get('basic')?.value;
  if (!basic) throw new Error('Não autenticado.');

  // 1. Condomínio
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
  const creatingTorre = formData.get('creating_torre') === 'true';
  const torreValue = String(formData.get('torre') || '');
  const torreNumero = String(formData.get('torre_numero') || '').trim();
  const torreIdent = String(formData.get('torre_identificacao') || '').trim();
  let torreId: number;

  if (!creatingTorre && /^\d+$/.test(torreValue)) {
    torreId = Number(torreValue);
  } else if (creatingTorre && torreNumero && torreIdent) {
    const torrePayload = {
      numero: torreNumero,
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
    console.warn(
      'Nenhuma torre informada ou modo criação não ativado; pulando criação de apartamento.',
    );
    torreId = NaN;
  }

  // 3. Apartamento
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

  // 5. Gasômetro + Leitura usando código em vez de ID
  if (!isNaN(aptId)) {
    const gasCodigoInput = String(formData.get('gasometro') || '');
    const gasPayload = {
      codigo: gasCodigoInput,
      apartamento: aptId,
    };
    let gasId: number;
    let gasCodigo: string = gasCodigoInput;

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
            gasCodigoInput,
          )}`,
          { headers: { Authorization: `Basic ${basic}` }, cache: 'no-store' },
        );
        const data = await searchRes.json();
        gasId =
          Array.isArray(data.results) && data.results.length
            ? data.results[0].id
            : NaN;
        gasCodigo = data.results[0]?.codigo || gasCodigoInput;
      } else {
        throw new Error(`Erro ao criar gasômetro: ${txt}`);
      }
    } else {
      gasId = (await gasRes.json()).id;
    }

    if (!isNaN(gasId)) {
      const leituraPayload = {
        data_leitura: String(formData.get('data_leitura') || null),
        consumo_m3: Number(formData.get('consumo_m3')) || 0,
        periodicidade: String(formData.get('periodicidade') || ''),
        gasometro: gasCodigo,
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
