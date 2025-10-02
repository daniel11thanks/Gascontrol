// src/app/cadastros/page.tsx
import styles from './cadastros.module.css';

import { getGasometros } from '@/query/data-gasometros';
import { getApartamentos } from '@/query/data-apartamentos';
import { getCondominios } from '@/query/data-condominios';
import { getTorres } from '@/query/data-torres';

import { cadastrosMultiPost } from '@/action/cadastros-multi-post';
import UnifiedCreateForm from '@/components/form/UnifiedCreateForm';

import { gasometroPost } from '@/action/gasometro-post';
import { gasometroDelete } from '@/action/gasometro-delete';

import { condominioPost } from '@/action/condominio-post';
import { condominioDelete } from '@/action/condominio-delete';

import { torrePost } from '@/action/torre-post';
import { torreDelete } from '@/action/torre-delete';

import GasometroCreateForm from '@/components/form/gasometro-create-form';
import CondominioCreateForm from '@/components/form/condominio-create-form';
import TorreCreateForm from '@/components/form/torre-create-form';

import PaginationGasometros from '@/components/pagination/pagination-gasometros';
import PaginationCondominios from '@/components/pagination/pagination-condominios';
import PaginationTorres from '@/components/pagination/pagination-torres';

export default async function CadastrosPage() {
  const [gasometros, apartamentos, condominios, torres] = await Promise.all([
    getGasometros(),
    getApartamentos(),
    getCondominios(),
    getTorres(),
  ]);

  const usados = new Set(gasometros.map((g) => g.apartamento));

  return (
    <section className={`${styles.wrapper} container mainContainer`}>
      <h1 className="title">Cadastros</h1>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Cadastros unificados</h2>
        <UnifiedCreateForm
          condominios={condominios}
          torres={torres}
          apartamentos={apartamentos}
          gasometros={gasometros}
          onSubmit={cadastrosMultiPost}
        />
      </div>

      {/* Condomínios */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Adicionar condomínio</h2>
        <CondominioCreateForm action={condominioPost} />

        <h2 className={styles.sectionTitle}>Lista de condomínios</h2>
        {condominios.length === 0 && <p>Não há condomínios cadastrados.</p>}
        {condominios.length > 0 && (
          <PaginationCondominios
            items={condominios}
            pageSize={5}
            onDeleteAction={condominioDelete}
          />
        )}
      </div>

      {/* Torres */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Adicionar torre</h2>
        <TorreCreateForm action={torrePost} condominios={condominios} />

        <h2 className={styles.sectionTitle}>Lista de torres</h2>
        {torres.length === 0 && <p>Não há torres cadastradas.</p>}
        {torres.length > 0 && (
          <PaginationTorres
            items={torres}
            pageSize={5}
            onDeleteAction={torreDelete}
          />
        )}
      </div>

      {/* Gasômetros 
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Adicionar gasômetro</h2>
        <GasometroCreateForm
          action={gasometroPost}
          apartamentos={apartamentos}
          apartamentosUsados={usados}
        />

        <h2 className={styles.sectionTitle}>Lista de gasômetros</h2>
        {gasometros.length === 0 && <p>Não há gasômetros cadastrados.</p>}
        {gasometros.length > 0 && (
          <PaginationGasometros
            items={gasometros}
            pageSize={5}
            onDeleteAction={gasometroDelete}
          />
        )}
      </div>
      */}
    </section>
  );
}
