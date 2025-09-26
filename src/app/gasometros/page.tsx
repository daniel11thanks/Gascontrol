import styles from './gasometros.module.css';
import { getGasometros } from '@/query/data-gasometros';
import { getApartamentos } from '@/query/data-apartamentos';
import { gasometroPost } from '@/action/gasometro-post';
import { gasometroDelete } from '@/action/gasometro-delete';
import GasometroCreateForm from '@/components/form/gasometro-create-form';
import PaginationGasometros from '@/components/pagination/pagination-gasometros';

export default async function GasometrosPage() {
  const [all, apartamentos] = await Promise.all([
    getGasometros(),
    getApartamentos(),
  ]);

  // IDs de apartamentos já ocupados por gasômetros existentes
  const usados = new Set(all.map((g) => g.apartamento)); // ex.: [101, 202, ...] [web:1108]

  return (
    <section className={`${styles.wrapper} container mainContainer`}>
      <h1 className="title">Gasômetros</h1>

      <h2 className={styles.sectionTitle}>Adicionar gasômetro</h2>
      <GasometroCreateForm
        action={gasometroPost}
        apartamentos={apartamentos}
        apartamentosUsados={usados}
      />

      <h2 className={styles.sectionTitle}>Lista de gasômetros</h2>

      {all.length === 0 && <p>Não há gasômetros cadastrados.</p>}
      <p className={styles.aviso}>
        não estou conseguindo adicionar novos gasometros, acredito que é porque
        o backend não foi configurado para que os itens tenham IDs, isso faz o
        backend rejeitar novas inserções
      </p>

      {all.length > 0 && (
        <PaginationGasometros
          items={all}
          pageSize={5}
          onDeleteAction={gasometroDelete}
        />
      )}
    </section>
  );
}
