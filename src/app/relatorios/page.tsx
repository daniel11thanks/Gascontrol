// app/relatorios/page.tsx
import styles from './relatorios.module.css';

// Query de leitura (server-only)
import { getRelatorios, type Relatorio } from '@/action/data';

// Actions de mutação (server actions)
import { relatorioPost } from '@/action/relatorio-post';
import { relatorioDelete } from '@/action/relatorio-delete';

// UI components
import RelatoriosFilters from '@/components/relatorios-filter/relatorios-filter';
import ConsumoPorPeriodo from '@/components/charts/consumo-por-periodo';
import RelatoriosCreateForm from '@/components/form/relatorios-create-form';
import Pagination from '@/components/pagination/pagination';

// Export CSV
import ExportCsv from '@/components/CSV/export-csv';

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: { tipo?: string; data_inicio?: string; data_fim?: string };
}) {
  const all = await getRelatorios(searchParams);

  // Colunas e ordem do CSV, tipadas via keyof Relatorio
  const headers: (keyof Relatorio)[] = [
    'id',
    'tipo',
    'referencia_id',
    'data_inicio',
    'data_fim',
    'total_consumo',
    'data_geracao',
  ];

  return (
    <section className={`${styles.wrapper} container mainContainer`}>
      <h1 className="title">Relatórios</h1>

      {/* Formulário de criação */}
      <h2 className={styles.sectionTitle}>Adicionar novo relatório</h2>
      <RelatoriosCreateForm action={relatorioPost} />

      {/* Filtros e seção de dados */}
      <h2 className={styles.sectionTitle}>Relatórios disponíveis</h2>
      <div className={styles.filtersBar}>
        <RelatoriosFilters
          defaultTipo={searchParams.tipo ?? 'TODOS'}
          defaultInicio={searchParams.data_inicio ?? ''}
          defaultFim={searchParams.data_fim ?? ''}
        />
      </div>

      {/* Gráfico com dataset completo (não paginado) */}
      {all.length > 0 && (
        <div className={styles.chartWrapper}>
          <div className={styles.chartInner}>
            <ConsumoPorPeriodo data={all} />
          </div>
        </div>
      )}

      {/* Ações superiores */}
      <div className={styles.actionsBar}>
        <ExportCsv<Relatorio>
          rows={all}
          headers={headers}
          filename="relatorios.csv"
          label="Exportar CSV"
          className={styles.buttonPrimary}
        />
      </div>

      {all.length === 0 && <p>Não há relatórios.</p>}

      {/* Lista paginada client-side (sem mudar URL) com botão Excluir em cada item */}
      <Pagination items={all} pageSize={5} onDeleteAction={relatorioDelete} />
    </section>
  );
}
