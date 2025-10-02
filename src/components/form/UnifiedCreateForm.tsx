// src/components/form/UnifiedCreateForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import ConnectedSelect from './ConnectedSelect';
import SubmitSuccessButton from '@/components/form/submit-success-button';
import type { Condominio } from '@/query/data-condominios';
import type { Torre } from '@/query/data-torres';
import type { Apartamento } from '@/query/data-apartamentos';
import type { Gasometro } from '@/query/data-gasometros';
import styles from '@/app/cadastros/cadastros.module.css';

export default function UnifiedCreateForm({
  condominios,
  torres,
  apartamentos,
  gasometros,
  onSubmit,
}: {
  condominios: Condominio[];
  torres: Torre[];
  apartamentos: Apartamento[];
  gasometros: Gasometro[];
  onSubmit: (fd: FormData) => Promise<void>;
}) {
  const [state, setState] = useState<Record<string, string>>({});
  const [creatingCondominio, setCreatingCondominio] = useState(false);
  const [creatingTorre, setCreatingTorre] = useState(false);

  function setField(name: string, value: string) {
    setState((s) => ({ ...s, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(state).forEach(([k, v]) => fd.set(k, v));
    await onSubmit(fd);
    setState({});
    setCreatingCondominio(false);
    setCreatingTorre(false);
  }

  const noop = (_: boolean) => {};

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <label className={styles.field}>
        Condomínio
        <ConnectedSelect
          name="condominio"
          options={condominios.map((c) => ({ id: c.id, label: c.nome || '' }))}
          placeholder="Selecione condomínio"
          newPlaceholder="Nome do condomínio"
          value={state.condominio || ''}
          onChange={(v) => setField('condominio', v)}
          onCreateModeChange={setCreatingCondominio}
        />
      </label>
      {creatingCondominio && (
        <label className={styles.field}>
          Local do condomínio
          <input
            name="condominio_local"
            className={styles.input}
            value={state.condominio_local || ''}
            onChange={(e) => setField('condominio_local', e.target.value)}
            placeholder="Ex.: Rua Principal, 123"
            required
          />
        </label>
      )}

      <label className={styles.field}>
        Torre
        <ConnectedSelect
          name="torre"
          options={torres.map((t) => ({ id: t.id, label: t.numero || '' }))}
          placeholder="Selecione torre"
          newPlaceholder="Número da torre"
          value={state.torre || ''}
          onChange={(v) => setField('torre', v)}
          onCreateModeChange={setCreatingTorre}
        />
      </label>
      {creatingTorre && (
        <label className={styles.field}>
          Identificação da torre
          <input
            name="torre_identificacao"
            className={styles.input}
            value={state.torre_identificacao || ''}
            onChange={(e) => setField('torre_identificacao', e.target.value)}
            placeholder="Identificação da torre"
            required
          />
        </label>
      )}

      <label className={styles.field}>
        Apartamento
        <ConnectedSelect
          name="apartamento"
          options={apartamentos.map((a) => ({
            id: String(a.id),
            label: a.numero || '',
          }))}
          placeholder="Selecione apartamento"
          newPlaceholder="Número do apartamento"
          value={state.apartamento || ''}
          onChange={(v) => setField('apartamento', v)}
          onCreateModeChange={noop}
        />
      </label>

      <label className={styles.field}>
        Gasômetro
        <ConnectedSelect
          name="gasometro"
          options={gasometros.map((g) => ({
            id: String(g.id),
            label: g.codigo || '',
          }))}
          placeholder="Selecione gasômetro"
          newPlaceholder="Número do gasômetro"
          value={state.gasometro || ''}
          onChange={(v) => setField('gasometro', v)}
          onCreateModeChange={noop}
        />
      </label>

      <label className={styles.field}>
        Nome da pessoa
        <input
          name="pessoa_nome"
          className={styles.input}
          value={state.pessoa_nome || ''}
          onChange={(e) => setField('pessoa_nome', e.target.value)}
          placeholder="João"
          required
        />
      </label>

      <label className={styles.field}>
        Tipo de pessoa
        <select
          name="pessoa_tipo"
          className={styles.input}
          value={state.pessoa_tipo || ''}
          onChange={(e) => setField('pessoa_tipo', e.target.value)}
          required
        >
          <option value="" disabled>
            Selecione tipo
          </option>
          <option value="DONO">Dono</option>
          <option value="INQUILINO">Inquilino</option>
          <option value="MORADOR">Morador</option>
        </select>
      </label>

      <label className={styles.field}>
        Data da leitura
        <input
          name="data_leitura"
          type="date"
          className={styles.input}
          value={state.data_leitura || ''}
          onChange={(e) => setField('data_leitura', e.target.value)}
          required
        />
      </label>

      <label className={styles.field}>
        Consumo (m³)
        <input
          name="consumo_m3"
          type="number"
          className={styles.input}
          min={0}
          value={state.consumo_m3 || ''}
          onChange={(e) => setField('consumo_m3', e.target.value)}
          required
        />
      </label>

      <label className={styles.field}>
        Periodicidade
        <select
          name="periodicidade"
          className={styles.input}
          value={state.periodicidade || ''}
          onChange={(e) => setField('periodicidade', e.target.value)}
          required
        >
          <option value="" disabled>
            Selecione periodicidade
          </option>
          <option value="SEMANAL">Semanal</option>
          <option value="MENSAL">Mensal</option>
          <option value="BIMESTRAL">Bimestral</option>
          <option value="SEMESTRAL">Semestral</option>
        </select>
      </label>

      <div className={styles.formActions}>
        <SubmitSuccessButton className={styles.buttonPrimary}>
          Enviar todos cadastros
        </SubmitSuccessButton>
      </div>
    </form>
  );
}
