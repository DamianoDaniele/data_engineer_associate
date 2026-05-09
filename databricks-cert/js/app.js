(function () {
  'use strict'

  const STORAGE_KEY = 'db_de_progress'

  const data = {
    sections: [
      {
        id: '1',
        title: 'Databricks Intelligence Platform',
        weight: '10%',
        topics: [
          { id: '1.1', title: 'Data Layout & Query Optimization' },
          { id: '1.2', title: 'Value of the Data Intelligence Platform' },
          { id: '1.3', title: 'Compute Selection' },
        ]
      },
      {
        id: '2',
        title: 'Development & Ingestion',
        weight: '30%',
        topics: [
          { id: '2.1', title: 'Databricks Connect' },
          { id: '2.2', title: 'Notebooks Functionality' },
          { id: '2.3', title: 'Auto Loader Sources & Use Cases' },
          { id: '2.4', title: 'Auto Loader Syntax' },
          { id: '2.5', title: 'Debugging Tools' },
        ]
      },
      {
        id: '3',
        title: 'Data Processing & Transformations',
        weight: '31%',
        topics: [
          { id: '3.1', title: 'Medallion Architecture' },
          { id: '3.2', title: 'Cluster Configuration for Performance' },
          { id: '3.3', title: 'LDP Advantages' },
          { id: '3.4', title: 'LDP Implementation' },
          { id: '3.5', title: 'DDL/DML Features' },
          { id: '3.6', title: 'PySpark Complex Aggregations' },
        ]
      },
      {
        id: '4',
        title: 'Productionizing Data Pipelines',
        weight: '18%',
        topics: [
          { id: '4.1', title: 'DAB vs Traditional Deployment' },
          { id: '4.2', title: 'Structure of Asset Bundles' },
          { id: '4.3', title: 'Deploy, Repair & Rerun Workflows' },
          { id: '4.4', title: 'Serverless for Production' },
          { id: '4.5', title: 'Spark UI Analysis' },
        ]
      },
      {
        id: '5',
        title: 'Governance & Security',
        weight: '11%',
        topics: [
          { id: '5.1', title: 'Unity Catalog Overview' },
          { id: '5.2', title: 'Identity & Access Management' },
          { id: '5.3', title: 'Privileges & RBAC' },
          { id: '5.4', title: 'Data Masking & Filtering' },
          { id: '5.5', title: 'Data Lineage' },
          { id: '5.6', title: 'System Tables & Audit' },
          { id: '5.7', title: 'External Data Access' },
          { id: '5.8', title: 'Secrets Management' },
          { id: '5.9', title: 'Delta Sharing' },
          { id: '5.10', title: 'Lakehouse Monitoring' },
        ]
      }
    ],
    topics: {
      // ═══════════════════════════════════════════════════════════
      // 1.1 — Data Layout & Query Optimization
      // ═══════════════════════════════════════════════════════════
      '1.1': {
        sectionId: '1',
        title: '1.1 — Enable features that simplify data layout decisions and optimize query performance',
        subtitle: 'Liquid Clustering, Predictive Optimization, Photon Engine',
        parts: [
          // ── LIQUID CLUSTERING ──
          {
            type: 'heading',
            level: 3,
            text: 'Liquid Clustering',
          },
          {
            type: 'paragraph',
            text: 'Liquid Clustering è una tecnica di organizzazione dati che sostituisce il partizionamento tradizionale e ZORDER. Permette di definire chiavi di clustering multi-dimensionali senza dover scegliere una singola colonna di partizione all\'atto della creazione della tabella.',
          },
          {
            type: 'card',
            title: 'Vantaggi del Liquid Clustering',
            items: [
              'Multi-dimensionale: supporta più colonne di clustering contemporaneamente',
              'Incrementale: OPTIMIZE riscrive solo i file necessari, non l\'intera tabella',
              'Nessuna decisione iniziale: non serve scegliere le colonne di partition all\'inizio',
              'Compatibile con schema evolution: nuove colonne possono essere aggiunte senza problemi',
              'Indipendenza dall\'ordine: l\'ordine delle colonne in CLUSTER BY non influisce sulle prestazioni',
            ]
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Creazione tabella con Liquid Clustering manuale',
            code: `-- Creazione tabella vuota con clustering su colonne specifiche
CREATE TABLE sales (
  id        INT,
  region    STRING,
  sale_date DATE,
  amount    DOUBLE
)
CLUSTER BY (region, sale_date);

-- Creazione tabella da SELECT con clustering
CREATE TABLE sales_agg CLUSTER BY (region)
AS SELECT region, SUM(amount) AS total
FROM sales
GROUP BY region;

-- Copia struttura (include configurazione clustering)
CREATE TABLE sales_backup LIKE sales;

-- Abilitare clustering su tabella esistente (solo unpartitioned)
ALTER TABLE sales CLUSTER BY (region, sale_date);

-- Rimuovere clustering
ALTER TABLE sales CLUSTER BY NONE;`,
          },
          {
            type: 'exam_tip',
            text: 'Liquid Clustering NON è compatibile con il partizionamento (PARTITIONED BY) o con ZORDER. Se una tabella ha già partizioni, devi prima rimuoverle o ricreare la tabella senza partizioni per usare Liquid Clustering.',
          },
          {
            type: 'paragraph',
            text: 'Per triggerare il clustering dopo aver abilitato le chiavi, esegui OPTIMIZE. Con Predictive Optimization abilitato, questo avviene automaticamente.',
          },

          // ── OPTIMIZE ──
          {
            type: 'heading',
            level: 3,
            text: 'OPTIMIZE — Trigger del clustering',
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Sintassi OPTIMIZE',
            code: `-- Ottimizzazione incrementale (solo dati nuovi o modificati)
OPTIMIZE sales;

-- Forza ricluster di TUTTI i dati (da usare quando si abilita
-- clustering per la prima volta o si cambiano le chiavi)
OPTIMIZE sales FULL;

-- Ottimizzazione con filtro su chiave di clustering (DBR 18.1+)
OPTIMIZE sales FULL WHERE sale_date >= '2025-01-01';

-- ZORDER: solo per tabelle legacy SENZA liquid clustering
OPTIMIZE events ZORDER BY (eventType);`,
          },
          {
            type: 'exam_tip',
            text: 'Usa OPTIMIZE FULL quando abiliti il clustering per la prima volta o quando cambi le chiavi di clustering. Dopo il primo OPTIMIZE FULL, usa semplicemente OPTIMIZE (incrementale).',
          },

          // ── AUTOMATIC LIQUID CLUSTERING ──
          {
            type: 'heading',
            level: 3,
            text: 'Automatic Liquid Clustering (CLUSTER BY AUTO)',
          },
          {
            type: 'paragraph',
            text: 'Automatic Liquid Clustering permette a Databricks di scegliere automaticamente le chiavi di clustering in base ai pattern di query storici. È alimentato da Predictive Optimization.',
          },
          {
            type: 'card',
            title: 'Requisiti',
            items: [
              'Databricks Runtime 15.4 LTS o superiore',
              'Tabella Unity Catalog managed (Delta Lake)',
              'Predictive Optimization abilitato',
              'Tabella unpartitioned o già Liquid',
            ]
          },
          {
            type: 'key_point',
            text: 'Automatic Liquid Clustering analizza continuamente: (1) la telemetria delle query per determinare se la tabella beneficia del clustering, (2) il carico di lavoro per identificare colonne candidate, (3) il rapporto costi-benefici prima di applicare nuove chiavi. Se i pattern di query cambiano, le chiavi vengono aggiornate automaticamente.',
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Sintassi Automatic Liquid Clustering',
            code: `-- Creazione tabella con clustering automatico (DBR 15.4+)
CREATE OR REPLACE TABLE sales (
  id       INT,
  region   STRING,
  amount   DOUBLE
)
CLUSTER BY AUTO;

-- Abilitare AUTO su tabella esistente
ALTER TABLE sales CLUSTER BY AUTO;

-- Disabilitare AUTO (torna a nessun clustering)
ALTER TABLE sales CLUSTER BY NONE;

-- Disabilitare AUTO impostando chiavi manuali
ALTER TABLE sales CLUSTER BY (region);

-- ⚠ ATTENZIONE: CREATE OR REPLACE SENZA CLUSTER BY AUTO
-- disabilita l'impostazione AUTO!
CREATE OR REPLACE TABLE sales CLUSTER BY AUTO
AS SELECT * FROM old_sales;`,
          },
          {
            type: 'exam_tip',
            text: 'Se fai CREATE OR REPLACE su una tabella che ha CLUSTER BY AUTO e NON specifichi CLUSTER BY AUTO nella nuova definizione, l\'impostazione AUTO viene persa. Per preservarla, includi sempre CLUSTER BY AUTO nel replace.',
          },

          // ── PREDICTIVE OPTIMIZATION ──
          {
            type: 'heading',
            level: 3,
            text: 'Predictive Optimization',
          },
          {
            type: 'paragraph',
            text: 'Predictive Optimization è un servizio Databricks che esegue automaticamente operazioni di manutenzione sulle Unity Catalog managed tables, eliminando la necessità di schedulare manualmente job di ottimizzazione.',
          },
          {
            type: 'key_point',
            text: 'Abilitato per default sugli account creati dopo l\'11 Novembre 2024. Per gli account esistenti, il rollout graduale è iniziato il 7 Maggio 2025 e dovrebbe completarsi entro Aprile 2026.',
          },
          {
            type: 'table',
            headers: ['Operazione', 'Descrizione', 'Frequenza'],
            rows: [
              ['OPTIMIZE', 'Clustering incrementale + compaction file (riduce file piccoli)', 'Automatica'],
              ['VACUUM', 'Elimina file dati non più referenziati (default retention: 7 giorni)', 'Automatica'],
              ['ANALYZE TABLE ... COMPUTE STATISTICS', 'Aggiorna statistiche per query optimization (sceglie automaticamente le migliori 32 colonne)', 'Automatica'],
            ]
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Abilitare / Disabilitare Predictive Optimization',
            code: `-- Livello CATALOG
ALTER CATALOG my_catalog ENABLE PREDICTIVE OPTIMIZATION;
ALTER CATALOG my_catalog DISABLE PREDICTIVE OPTIMIZATION;
ALTER CATALOG my_catalog INHERIT PREDICTIVE OPTIMIZATION;

-- Livello SCHEMA (DATABASE)
ALTER SCHEMA my_schema ENABLE PREDICTIVE OPTIMIZATION;
ALTER SCHEMA my_schema DISABLE PREDICTIVE OPTIMIZATION;
ALTER SCHEMA my_schema INHERIT PREDICTIVE OPTIMIZATION;

-- Livello TABELLA
ALTER TABLE my_table ENABLE PREDICTIVE OPTIMIZATION;
ALTER TABLE my_table DISABLE PREDICTIVE OPTIMIZATION;

-- Verificare lo stato
DESCRIBE CATALOG EXTENDED my_catalog;
DESCRIBE SCHEMA EXTENDED my_schema;
DESCRIBE TABLE EXTENDED my_table;
-- Il campo "Predictive Optimization" mostra: ENABLE | DISABLE | INHERIT`,
          },
          {
            type: 'table',
            headers: ['Livello', 'Privilegio richiesto'],
            rows: [
              ['Account', 'Account admin (da Account Console > Settings)'],
              ['Catalog', 'CREATE sul catalog'],
              ['Schema', 'CREATE sullo schema'],
              ['Tabella', 'MODIFY sulla tabella'],
            ]
          },
          {
            type: 'card',
            title: 'Modello di ereditarietà',
            items: [
              'Account → Catalog → Schema → Tabella (gerarchia)',
              'Ogni livello può sovrascrivere l\'ereditarietà',
              'INHERIT fa sì che la tabella/schema/catalog usi l\'impostazione del genitore',
              'Se il genitore è ENABLE e la tabella è INHERIT, la tabella è abilitata',
            ]
          },
          {
            type: 'card',
            title: 'Requisiti',
            items: [
              'Workspace su Premium plan o superiore',
              'SQL warehouses oppure Databricks Runtime 12.2 LTS+',
              'Solo Unity Catalog managed tables (NON external tables, NON Delta Sharing recipients)',
              'Le operazioni usano serverless compute for jobs (fatturato come serverless jobs SKU)',
            ]
          },
          {
            type: 'exam_tip',
            text: 'Se usi Predictive Optimization, Databricks raccomanda di DISABILITARE eventuali job OPTIMIZE schedulati manualmente per evitare conflitti. Per modificare la retention di VACUUM (default 7 giorni), usa: ALTER TABLE t SET TBLPROPERTIES (\'delta.deletedFileRetentionDuration\' = \'30 days\');',
          },

          // ── PHOTON ──
          {
            type: 'heading',
            level: 3,
            text: 'Photon Engine',
          },
          {
            type: 'paragraph',
            text: 'Photon è un motore di query vettorizzato nativo (scritto in C++) fornito da Databricks. È compatibile con le API Apache Spark e accelera SQL e DataFrame operations senza modifiche al codice.',
          },
          {
            type: 'table',
            headers: ['Feature', 'Supporto Photon'],
            rows: [
              ['SQL e DataFrame operations', '✅ Supportato e accelerato'],
              ['Join', '✅ Hash-join (sostituisce sort-merge join)'],
              ['Aggregazioni / Window Functions', '✅ 2-3x più veloce'],
              ['MERGE INTO / UPDATE / DELETE / CTAS', '✅ Supportato'],
              ['Structured Streaming (stateless)', '✅ Supportato (fino a 5x riduzione costi)'],
              ['UDF (User Defined Functions)', '❌ Non supportato (fallback a runtime standard)'],
              ['RDD APIs / Dataset APIs', '❌ Non supportato'],
              ['Query che girano in < 2 secondi', '❌ Non impattate (nessun beneficio)'],
            ]
          },
          {
            type: 'key_point',
            text: 'Se un\'operazione non è supportata da Photon, il compute passa automaticamente al runtime standard per la parte restante del workload. Photon è abilitato per default su tutti i tipi di SQL Warehouse e può essere abilitato sui cluster classici (DBR 9.1 LTS+).',
          },
          {
            type: 'exam_tip',
            text: 'Photon è più vantaggioso per: SQL workloads, join pesanti, aggregazioni su large table, operazioni su tabelle con molte colonne (wide tables), e workload con frequente accesso a disco. NON beneficia query semplici che girano in meno di 2 secondi o workload RDD/UDF.',
          },

          // ── ZORDER LEGACY ──
          {
            type: 'heading',
            level: 3,
            text: 'ZORDER (Legacy — solo per contesto esame)',
          },
          {
            type: 'paragraph',
            text: 'ZORDER era la tecnica precedente per organizzare i dati all\'interno delle partizioni. Databricks raccomanda di NON usare ZORDER per nuovi progetti: Liquid Clustering è il replacement ufficiale.',
          },
          {
            type: 'table',
            headers: ['Caratteristica', 'ZORDER (Legacy)', 'Liquid Clustering'],
            rows: [
              ['Dimensioni', 'Singola dimensione per OPTIMIZE', 'Multi-dimensionale'],
              ['Incrementalità', 'No — riscrive tutto', 'Sì — solo dati necessari'],
              ['Partizionamento', 'Richiede PARTITIONED BY', 'Nessuna partizione necessaria'],
              ['Manutenzione', 'Manuale (job schedulati)', 'Automatica con Predictive Optimization'],
              ['Evoluzione chiavi', 'Non supportata', 'Automatica con CLUSTER BY AUTO'],
              ['Compatibilità', 'Solo Delta', 'Delta e Iceberg (managed)'],
            ]
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Sintassi ZORDER (solo per contesto)',
            code: `-- ZORDER legacy: solo su tabelle partizionate, solo una colonna per OPTIMIZE
OPTIMIZE events WHERE date >= '2017-01-01' ZORDER BY (eventType);

-- Databricks raccomanda di usare Liquid Clustering invece
CREATE TABLE events (
  eventType STRING,
  date DATE
) CLUSTER BY (eventType, date);`,
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 1.2 — Value of the Data Intelligence Platform
      // ═══════════════════════════════════════════════════════════
      '1.2': {
        sectionId: '1',
        title: '1.2 — Explain the value of the Data Intelligence Platform',
        subtitle: 'Lakehouse Architecture, DatabricksIQ, Unity Catalog, Capacità chiave',
        parts: [
          // ── LAKEHOUSE ──
          {
            type: 'heading',
            level: 3,
            text: 'Architettura Lakehouse',
          },
          {
            type: 'paragraph',
            text: 'Il Data Lakehouse unisce i benefici del Data Lake (flessibilità, formati aperti, basso costo di storage) con quelli del Data Warehouse (ACID transactions, performance SQL, governance). Databricks ha creato questa architettura per eliminare i silos tra ingegneria dei dati, BI e machine learning.',
          },
          {
            type: 'table',
            headers: ['Caratteristica', 'Data Lake', 'Data Warehouse', 'Lakehouse (Databricks)'],
            rows: [
              ['Formati', 'Aperti (Parquet, JSON, CSV)', 'Proprietari', 'Aperti (Parquet, Delta, Iceberg)'],
              ['ACID Transactions', 'No', 'Sì', 'Sì (Delta Lake)'],
              ['Schema enforcement', 'No', 'Sì', 'Sì (Delta Lake)'],
              ['Performance SQL', 'Bassa', 'Alta', 'Alta (Photon)'],
              ['ML/AI Support', 'Sì', 'Limitato', 'Sì (nativo)'],
              ['Governance', 'Limitata', 'Sì', 'Sì (Unity Catalog)'],
              ['Costo storage', 'Basso', 'Alto', 'Basso (object storage)'],
            ]
          },
          {
            type: 'key_point',
            text: 'Il Lakehouse Databricks si basa su tre pilastri: (1) Delta Lake come storage layer ottimizzato con ACID transactions, schema enforcement e time travel; (2) Unity Catalog come governance layer unificato per dati e AI; (3) Photon come motore di query ad alte prestazioni.',
          },

          // ── DatabricksIQ ──
          {
            type: 'heading',
            level: 3,
            text: 'DatabricksIQ — Il Data Intelligence Engine',
          },
          {
            type: 'paragraph',
            text: 'DatabricksIQ è il motore AI che alimenta la piattaforma. Capisce la semantica unica dei tuoi dati analizzando query SQL, dashboard BI, pipeline e lineage. Questo permette alla piattaforma di auto-ottimizzarsi e di offrire un\'interfaccia in linguaggio naturale.',
          },
          {
            type: 'card',
            title: 'Capacità di DatabricksIQ',
            items: [
              'Natural Language Processing: interfaccia conversazionale (Genie) per interrogare i dati in linguaggio naturale, senza scrivere SQL',
              'Auto-optimizing: ottimizzazione automatica di data layout, partizionamento e indici basata sui pattern di utilizzo',
              'Self-tuning: la piattaforma impara dai pattern di query passati e si adatta automaticamente',
              'Chain-of-Thought reasoning: Genie scompone domande complesse in passaggi, genera SQL, esegue e restituisce risultati con spiegazioni',
              'AI/BI Dashboards: dashboard AI-powered con authoring low-code e assistente NLP',
              'Genie Code: creazione di dashboard tramite prompt in linguaggio naturale (Public Preview)',
            ]
          },
          {
            type: 'exam_tip',
            text: 'DatabricksIQ non è un singolo prodotto ma un motore AI trasversale che potenzia TUTTI gli aspetti della piattaforma: ottimizzazione delle query, generazione di codice, interfaccia naturale, governance, e rilevamento anomalie.',
          },

          // ── Unity Catalog ──
          {
            type: 'heading',
            level: 3,
            text: 'Unity Catalog — Governance Unificata',
          },
          {
            type: 'paragraph',
            text: 'Unity Catalog è la soluzione di governance unificata per dati e AI integrata nativamente nella piattaforma Databricks. Organizza i dati con un namespace a tre livelli: catalog.schema.table.',
          },
          {
            type: 'table',
            headers: ['Capacità', 'Descrizione'],
            rows: [
              ['Access Control granulare', 'Permessi da livello account fino a righe e colonne (row/column level security)'],
              ['Lineage tracking', 'Tracciamento automatico del flusso di dati dalla sorgente alle dashboard'],
              ['Auditing', 'Registrazione completa di tutti gli accessi e le attività (sistema table system.access.audit)'],
              ['Data Discovery', 'Interfaccia di ricerca (Catalog Explorer) con tag, descrizioni e metadati arricchiti'],
              ['Data Quality Monitoring', 'Monitoraggio proattivo della qualità con anomaly detection e profiling automatico'],
              ['Delta Sharing', 'Condivisione dati live cross-organizzazione e cross-cloud usando il protocollo aperto Delta Sharing'],
              ['Lakehouse Federation', 'Connessione a sorgenti esterne (Postgres, MySQL, Snowflake, ecc.) senza spostare i dati'],
            ]
          },
          {
            type: 'exam_tip',
            text: 'Unity Catalog è OPEN SOURCE. Il namespace a tre livelli (catalog.schema.table) è fondamentale per l\'esame. I cataloghi possono essere "bindati" a workspace specifici per isolare ambienti (produzione, sviluppo).',
          },

          // ── CAPACITÀ CHIAVE ──
          {
            type: 'heading',
            level: 3,
            text: 'Capacità Chiave della Piattaforma',
          },
          {
            type: 'table',
            headers: ['Capacità', 'Descrizione', 'Tipologia'],
            rows: [
              ['Lakeflow Connect', 'Connettori built-in per ingestion da enterprise apps e database (Salesforce, SAP, ecc.)', 'Ingestion'],
              ['Auto Loader', 'Incremental file ingestion da cloud storage con schema evolution e checkpointing exactly-once', 'Ingestion'],
              ['Lakeflow Declarative Pipelines', 'ETL dichiarativo con aspettative di data quality (expectations), materialized views e streaming tables', 'ETL'],
              ['Databricks SQL', 'Data warehousing con Photon, SQL warehouses serverless/pro/classic', 'Analytics'],
              ['Mosaic AI', 'Piattaforma ML/AI: model training, model serving, feature engineering, GenAI, agenti AI', 'AI/ML'],
              ['Lakeflow Jobs', 'Orchestrazione multi-task: notebook, SQL, DLT, dbt, ML model, pipeline', 'Orchestrazione'],
              ['Lakebase', 'Database OLTP basato su Postgres integrato con il lakehouse', 'OLTP'],
              ['Databricks Apps', 'App personalizzate che combinano analytics, AI e workflow', 'Applicazioni'],
              ['Genie Spaces', 'Interfacce conversationali per interrogare dati in linguaggio naturale', 'BI/AI'],
            ]
          },

          // ── MULTI-CLOUD ──
          {
            type: 'heading',
            level: 3,
            text: 'Multi-Cloud',
          },
          {
            type: 'paragraph',
            text: 'Databricks è disponibile su AWS, Microsoft Azure e Google Cloud Platform. La stessa piattaforma, le stesse API, la stessa esperienza su tutti e tre i cloud provider. Questo permette di evitare vendor lock-in a livello di cloud.',
          },

          // ── BENEFICI RIEPILOGO ──
          {
            type: 'heading',
            level: 3,
            text: 'Riepilogo — Perché scegliere Databricks',
          },
          {
            type: 'card',
            title: 'I 6 benefici chiave (per l\'esame)',
            items: [
              'Open: formati aperti (Parquet, Delta, Iceberg), nessun lock-in, Unity Catalog open source',
              'Unified: singola piattaforma per ETL, BI, ML e AI — elimina i silos',
              'AI-powered: DatabricksIQ guida ottimizzazioni automatiche, auto-tuning, interfaccia in linguaggio naturale',
              'Governed: Unity Catalog come punto di controllo unico per accessi, audit, lineage e qualità',
              'Multi-cloud: stessa esperienza su AWS, Azure e GCP',
              'Performance: Photon engine nativo C++ per query acceleration fino a 12x',
            ]
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 1.3 — Compute Selection
      // ═══════════════════════════════════════════════════════════
      '1.3': {
        sectionId: '1',
        title: '1.3 — Identify the applicable compute to use for a specific use case',
        subtitle: 'Serverless, Classic Compute, SQL Warehouses, Decision Matrix',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'Tipi di Compute in Databricks',
          },
          {
            type: 'paragraph',
            text: 'Databricks offre diverse tipologie di compute per diversi use case. La scelta del compute giusto è fondamentale per ottimizzare costi, performance e gestione operativa.',
          },
          {
            type: 'table',
            headers: ['Compute Type', 'Gestione', 'Avvio', 'Auto-scaling', 'Casi d\'uso principali'],
            rows: [
              ['Serverless compute', 'Databricks', '2-6 sec', 'Sì', 'Notebook, jobs, Lakeflow pipelines (scelta raccomandata per la maggior parte dei workload)'],
              ['Classic All-Purpose', 'User-managed', '3-5 min', 'Opzionale', 'Sviluppo interattivo, debug notebook, RDD APIs, R language'],
              ['Classic Jobs', 'User-managed', '3-5 min', 'Opzionale', 'Job schedulati che richiedono configurazioni custom (es. pool, librerie specifiche)'],
              ['SQL Warehouse (Serverless)', 'Databricks', '2-6 sec', 'Sì (IWM)', 'BI, ETL SQL, query analitiche, dashboard, esplorazione dati'],
              ['SQL Warehouse (Pro)', 'Ibrida', '~4 min', 'Limitato', 'Quando serverless non disponibile o networking custom (VPC, firewall, federation)'],
              ['SQL Warehouse (Classic)', 'User-managed', '~4 min', 'No', 'Esplorazione interattiva entry-level quando serverless/pro non sono opzioni'],
            ]
          },

          // ── CONFRONTO SQL WAREHOUSE ──
          {
            type: 'heading',
            level: 3,
            text: 'Confronto SQL Warehouse Types',
          },
          {
            type: 'table',
            headers: ['Feature', 'Serverless SQL WH', 'Pro SQL WH', 'Classic SQL WH'],
            rows: [
              ['Photon Engine', '✅', '✅', '✅'],
              ['Predictive IO', '✅', '✅', '❌'],
              ['Intelligent Workload Mgmt', '✅', '❌', '❌'],
              ['Avvio tipico', '2-6 secondi', '~4 minuti', '~4 minuti'],
              ['Networking', 'Databricks account', 'AWS/Azure account', 'AWS/Azure account'],
              ['Scalabilità', 'Rapida (IWM)', 'Graduale', 'Manuale'],
              ['Default UI', '✅ (dove disponibile)', '❌', '❌'],
            ]
          },

          // ── RACCOMANDAZIONI ──
          {
            type: 'heading',
            level: 3,
            text: 'Raccomandazioni Ufficiali Databricks',
          },
          {
            type: 'card',
            title: 'Per Notebook Interattivi',
            items: [
              'Serverless compute: generalmente raccomandato (fast startup, auto-scaling, costo inferiore)',
              'Serverless SQL warehouse: per analytics e reporting basati su SQL',
              'Classic all-purpose compute: solo quando servono RDD APIs o R language',
            ]
          },
          {
            type: 'card',
            title: 'Per Jobs',
            items: [
              'Serverless compute: scelta raccomandata per la maggior parte dei workload automatizzati',
              'SQL warehouse: per task SQL (usa il tipo che si adatta a latenza e costo)',
              'Classic jobs compute: per job non-SQL che richiedono configurazioni custom non disponibili in serverless',
              'Classic all-purpose compute: generalmente da EVITARE (non ottimizzato per workload automatizzati)',
            ]
          },
          {
            type: 'card',
            title: 'Per Pipeline',
            items: [
              'Serverless compute: scelta raccomandata per Lakeflow Spark Declarative Pipelines',
              'Classic pipeline compute: solo quando serve una feature non supportata in serverless o con Hive metastore legacy',
            ]
          },

          // ── DECISION TREE ──
          {
            type: 'heading',
            level: 3,
            text: 'Albero Decisionale (per l\'esame)',
          },
          {
            type: 'paragraph',
            text: 'Usa questo albero decisionale per identificare rapidamente il compute corretto in base allo scenario:',
          },
          {
            type: 'table',
            headers: ['Scenario', 'Compute Raccomandato', 'Perché'],
            rows: [
              ['Sviluppo interattivo in notebook (debug, esplorazione)', 'All-Purpose Compute (o Serverless)', 'La sessione è interattiva e guidata dall\'utente'],
              ['Job ETL schedulato ogni ora', 'Job Compute (o Serverless)', 'Esecuzione schedulata richiede run history e ripetibilità'],
              ['Dashboard BI e query analitiche per business users', 'SQL Warehouse', 'Il consumatore è query-serving, non notebook authoring'],
              ['Ridurre al minimo la gestione infrastrutturale', 'Serverless', 'Databricks gestisce sizing, scaling e runtime'],
              ['Custom networking (VPC, firewall, hybrid cloud)', 'Pro SQL Warehouse o Classic', 'Networking nel cloud account del cliente'],
              ['Hive metastore legacy', 'Classic (non serverless)', 'Serverless non supporta Hive metastore legacy'],
              ['Servono RDD APIs o R language', 'Classic All-Purpose (Dedicated)', 'Serverless e Standard mode non supportano RDD/R'],
              ['GPU per ML training', 'Classic All-Purpose (Dedicated)', 'GPU support solo su classic compute dedicato'],
              ['Pipeline Lakeflow dichiarativa', 'Serverless pipeline', 'Scelta raccomandata per pipeline automatizzate'],
              ['Single-node per ML sperimentale', 'Single-node All-Purpose (Personal policy)', 'Nodi grandi riducono shuffle per training iniziale'],
              ['Latenza minima (startup 2-6 sec)', 'Serverless SQL Warehouse', 'Startup rapidissimo e Intelligent Workload Management'],
            ]
          },

          // ── ESEMPI SCENARIO ──
          {
            type: 'heading',
            level: 3,
            text: 'Esempi di Scenario (tipici dell\'esame)',
          },
          {
            type: 'exam_tip',
            text: 'L\'esame presenta spesso scenari in cui devi scegliere il compute. Ricorda: lo sviluppo interattivo va su all-purpose, MA se lo stesso notebook viene messo in produzione come job schedulato, va spostato su job compute o serverless. Non confondere l\'ambiente di sviluppo con quello di produzione!',
          },
          {
            type: 'paragraph',
            text: '<strong>Scenario 1:</strong> Un team ha un notebook di trasformazione sviluppato in modo interattivo. Ora deve essere eseguito ogni 2 ore con run history e recovery in caso di fallimento. Qual è la scelta di compute più appropriata?',
          },
          {
            type: 'paragraph',
            text: '<strong>Risposta:</strong> Job Compute (o Serverless). Il requisito è cambiato da "convenienza di sviluppo" a "esecuzione schedulata e ripetibile". Tenere il cluster all-purpose acceso 24/7 per un job schedulato non è corretto.',
          },
          {
            type: 'paragraph',
            text: '<strong>Scenario 2:</strong> Un data analyst vuole eseguire query SQL interattive su un dataset per creare dashboard. Non vuole gestire cluster.',
          },
          {
            type: 'paragraph',
            text: '<strong>Risposta:</strong> Serverless SQL Warehouse. Startup rapido (2-6 sec), auto-scaling, nessuna gestione infrastrutturale, ottimizzato per workload SQL.',
          },

          // ── ERRORI COMUNI ──
          {
            type: 'heading',
            level: 3,
            text: 'Errori Comuni nell\'Esame',
          },
          {
            type: 'paragraph',
            text: 'Ecco gli errori più frequenti che i candidati commettono nella sezione compute:',
          },
          {
            type: 'card',
            title: '❌ Errori da evitare',
            items: [
              'Scegliere all-purpose compute per un job schedulato in produzione (perché il notebook è stato sviluppato lì)',
              'Scegliere SQL warehouse per ETL che usa Python/Scala (SQL warehouse è solo per SQL)',
              'Scegliere serverless solo perché "sembra più nuovo" senza che lo scenario premi la riduzione di gestione operativa',
              'Configurare il cluster (sizing, worker type) PRIMA di decidere se lo scenario richiede interactive, job o warehouse',
              'Usare classic all-purpose per workload automatizzati (non è ottimizzato per questo)',
            ]
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 2.1 — Databricks Connect
      // ═══════════════════════════════════════════════════════════
      '2.1': {
        sectionId: '2',
        title: '2.1 — Use Databricks Connect in a data engineering workflow',
        subtitle: 'Client library, IDE integration, Spark Connect, serverless support',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'Cos\'è Databricks Connect',
          },
          {
            type: 'paragraph',
            text: 'Databricks Connect è una libreria client per Databricks Runtime che permette di connettere IDE (Visual Studio Code, PyCharm, IntelliJ IDEA), notebook server e applicazioni custom al compute Databricks. Puoi scrivere codice usando le Spark APIs e farlo eseguire in remoto su Databricks invece che sulla sessione Spark locale.',
          },
          {
            type: 'key_point',
            text: 'Databricks Connect è basato su Spark Connect, protocollo open-source gRPC che permette esecuzione remota di workload Spark usando DataFrame API. Il protocollo sottostante usa unresolved logical plans di Spark e Apache Arrow su gRPC.',
          },
          {
            type: 'table',
            headers: ['Linguaggio', 'Supporto'],
            rows: [
              ['Python', '✅ Supporto completo (Databricks Connect for Python)'],
              ['Scala', '✅ Supporto completo (Databricks Connect for Scala)'],
              ['R', '✅ Supporto completo (Databricks Connect for R)'],
            ]
          },
          {
            type: 'card',
            title: 'Cosa puoi fare con Databricks Connect',
            items: [
              'Sviluppare e debuggare in modo interattivo da qualsiasi IDE (VS Code, PyCharm, IntelliJ)',
              'Costruire applicazioni dati interattive (come un JDBC driver, ma con tutta la potenza di PySpark)',
              'Eseguire trasformazioni Spark su compute Databricks serverless, senza gestire cluster locali',
              'Integrare con VS Code Extension per debugging built-in di codice utente su Databricks',
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'Configurazione della Connessione',
          },
          {
            type: 'paragraph',
            text: 'Databricks Connect cerca le proprietà di configurazione nel seguente ordine, usando la prima configurazione trovata:',
          },
          {
            type: 'code',
            lang: 'text',
            label: 'Ordine di risoluzione configurazione',
            code: `1. Metodo remote() della classe DatabricksSession
2. Un profilo di configurazione Databricks (es. ~/.databrickscfg)
3. Variabile d'ambiente DATABRICKS_CONFIG_PROFILE
4. Variabili d'ambiente per ogni proprietà di configurazione
5. Profilo di configurazione Databricks di DEFAULT`,
          },
          {
            type: 'code',
            lang: 'python',
            label: 'Connessione tramite DatabricksSession',
            code: `from databricks.connect import DatabricksSession

# Metodo 1: connessione tramite remote() con Spark Connect string
spark = DatabricksSession.builder.remote(
  "sc://<workspace-url>:443/;x-databricks-cluster-id=<cluster-id>"
).getOrCreate()

# Metodo 2: connessione tramite profilo config
spark = DatabricksSession.builder.profile("my_profile").getOrCreate()

# Metodo 3: connessione a serverless compute
# Imposta DATABRICKS_SERVERLESS_COMPUTE_ID=auto nell'ambiente
spark = DatabricksSession.builder.serverless(True).getOrCreate()

# Esegui codice Spark sul cluster remoto
df = spark.read.table("samples.nyctaxi.trips")
df.show()`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'Connessione a Serverless Compute',
          },
          {
            type: 'paragraph',
            text: 'Databricks Connect per Python e Scala supporta la connessione a serverless compute. Per abilitarlo:',
          },
          {
            type: 'card',
            items: [
              'Imposta la variabile d\'ambiente locale DATABRICKS_SERVERLESS_COMPUTE_ID = "auto"',
              'In un profilo di configurazione locale, imposta serverless_compute_id = auto',
              'Quando questa variabile è impostata, Databricks Connect ignora il cluster_id',
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'Validazione della Connessione',
          },
          {
            type: 'code',
            lang: 'bash',
            label: 'Comando di validazione',
            code: `# Validare ambiente, credenziali e connessione al compute
databricks-connect test

# Il comando fallisce con exit code non-zero in caso di incompatibilità
# (es. versione Databricks Connect incompatibile con serverless compute)

# In codice Python:
from databricks.connect import DatabricksSession
spark = DatabricksSession.builder.getOrCreate()
spark.validateSession()  # Lancia eccezione se c'è un problema`,
          },
          {
            type: 'table',
            headers: ['Metodo di autenticazione', 'Campi richiesti'],
            rows: [
              ['OAuth M2M (machine-to-machine)', 'cluster_id, client_id, client_secret'],
              ['OAuth U2M (user-to-machine)', 'cluster_id, client_id (flusso browser)'],
              ['Personal Access Token', 'cluster_id, token (solo per Spark Connect string)'],
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'Gestione Dipendenze',
          },
          {
            type: 'paragraph',
            text: 'Le dipendenze si dividono in due categorie:',
          },
          {
            type: 'card',
            title: 'Dipendenze locali vs cluster',
            items: [
              'Installa le dipendenze dell\'applicazione sulla tua macchina locale (es. nel tuo virtual environment Python)',
              'Installa le dipendenze UDF su Databricks (cluster libraries o notebook-scoped libraries)',
              'Il codice locale viene eseguito localmente, solo le operazioni DataFrame vengono spedite al cluster',
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'VS Code Extension Integration',
          },
          {
            type: 'paragraph',
            text: 'L\'estensione Databricks per Visual Studio Code usa Databricks Connect per fornire debugging integrato. Puoi eseguire e debuggare notebook cella per cella direttamente da VS Code, con variabili, call stack e debug console. Il codice Python gira localmente, mentre le operazioni DataFrame girano sul cluster remoto.',
          },
          {
            type: 'exam_tip',
            text: 'Per l\'esame: Databricks Connect NON è per eseguire codice localmente — è per connettere IDE e app al compute Databricks. Usa Spark Connect (protocollo gRPC) per la comunicazione remota. Supporta Python, Scala e R. La validazione si fa con databricks-connect test.',
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 2.2 — Notebooks Functionality
      // ═══════════════════════════════════════════════════════════
      '2.2': {
        sectionId: '2',
        title: '2.2 — Determine the capabilities of Notebooks functionality',
        subtitle: 'Cell types, magic commands, orchestration, widgets, collaboration',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'Panoramica dei Notebook Databricks',
          },
          {
            type: 'paragraph',
            text: 'I notebook sono lo strumento principale per creare workflow di data science e machine learning su Databricks. Supportano co-authoring in tempo reale, versioning automatico e visualizzazioni dati integrate.',
          },
          {
            type: 'card',
            title: 'Caratteristiche principali',
            items: [
              'Due tipi di cella: Code (codice eseguibile) e Markdown (documentazione con rendering rich text)',
              'Fino a 10.000 celle per notebook',
              'Cella: max 6 MB, output: max 20 MB',
              'Multi-linguaggio: Python, SQL, Scala, R nella stessa sessione',
              'Sintassi highlighting e IntelliSense/autocomplete',
              'Version history automatica',
              'Real-time coauthoring',
              'Dashboard interattive integrate',
              'Widgets per parametrizzazione',
              'Genie Code per assistenza AI integrata',
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'Magic Commands',
          },
          {
            type: 'paragraph',
            text: 'I magic commands estendono le funzionalità dei notebook oltre la sintassi standard. I line magics iniziano con % (singola riga), i cell magics con %% (intera cella).',
          },
          {
            type: 'table',
            headers: ['Magic Command', 'Descrizione'],
            rows: [
              ['%python', 'Esegue codice Python nella cella'],
              ['%sql', 'Esegue query SQL. I risultati sono disponibili come DataFrame implicito _sqldf'],
              ['%r', 'Esegue codice R nella cella'],
              ['%scala', 'Esegue codice Scala nella cella'],
              ['%md', 'Renderizza contenuto Markdown (testo, immagini, formule LaTeX)'],
              ['%pip', 'Installa pacchetti Python a livello di notebook (notebook-scoped libraries)'],
              ['%run /path/notebook', 'Esegue un altro notebook importandone funzioni e variabili'],
              ['%fs ls /path', 'Esegue comandi dbutils.fs per navigare file system'],
              ['%sh command', 'Esegue comandi shell sul driver node (usa -e per fallire su errore)'],
              ['%tensorboard --logdir /logs', 'Mostra TensorBoard inline (solo DBR ML)'],
              ['%%profile', 'Profila esecuzione codice Python con albero delle chiamate (DBR 17.2+)'],
              ['%%oprofile', 'Profila creazione oggetti durante esecuzione cella (DBR 17.2+)'],
              ['%skip', 'Salta l\'esecuzione della cella'],
              ['%set_cell_max_output_size_in_mb 10', 'Imposta dimensione massima output cella (1-20 MB)'],
            ]
          },
          {
            type: 'exam_tip',
            text: 'Il risultato di una cella %sql è automaticamente disponibile come DataFrame _sqldf nelle celle Python e SQL successive, indipendentemente dalla posizione nel notebook. IPython automagic è abilitato per default: puoi usare pip install senza il prefisso %.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Orchestrazione Notebook',
          },
          {
            type: 'paragraph',
            text: 'Esistono tre modi per orchestrare notebook e modularizzare il codice:',
          },
          {
            type: 'table',
            headers: ['Metodo', 'Caso d\'uso', 'Note'],
            rows: [
              ['Lakeflow Jobs', 'Orchestrazione notebook (raccomandato)', 'Workflow complessi con dipendenze task, scheduling e trigger. Robusto e scalabile per produzione.'],
              ['dbutils.notebook.run()', 'Orchestrazione notebook', 'Job effimero per ogni chiamata. Supporta parametri (stringhe) e valori di ritorno. Timeout configurabile.'],
              ['%run', 'Modularizzazione codice', 'Esegue inline un altro notebook. Importa funzioni e variabili. Non passa parametri.'],
              ['Workspace files', 'Modularizzazione (raccomandato)', 'File Python riutilizzabili con import standard. Supporta version control e IDE.'],
            ]
          },
          {
            type: 'code',
            lang: 'python',
            label: 'dbutils.notebook.run() — parametri e valori di ritorno',
            code: `# Eseguire un notebook passando parametri
dbutils.notebook.run(
  "./process_data",           # percorso notebook
  timeout_seconds=120,        # timeout (0 = nessun timeout)
  arguments={"date": "2025-01-01", "region": "EU"}  # parametri stringa
)

# Nel notebook chiamato, usa dbutils.widgets per leggere i parametri
# dbutils.widgets.get("date") restituirà "2025-01-01"

# Per restituire un valore dal notebook chiamato:
dbutils.notebook.exit("SUCCESS")

# IMPORTANTE: parametri e valori di ritorno DEVONO essere stringhe
# dbutils.notebook.run() deve completare entro 30 giorni`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'Widgets (Parametri Interattivi)',
          },
          {
            type: 'paragraph',
            text: 'I widgets permettono di aggiungere parametri interattivi a notebook e dashboard. Supportati da Python, Scala, R e SQL.',
          },
          {
            type: 'code',
            lang: 'python',
            label: 'Widgets API',
            code: `# Creare widgets
dbutils.widgets.text("date", "2025-01-01", "Data di inizio")
dbutils.widgets.dropdown("region", "EU", ["EU", "US", "APAC"])
dbutils.widgets.combobox("format", "json", ["json", "csv", "parquet"])

# Leggere valori
date = dbutils.widgets.get("date")
region = dbutils.widgets.get("region")

# Rimuovere widgets
dbutils.widgets.remove("date")     # rimuove uno specifico widget
dbutils.widgets.removeAll()         # rimuove tutti i widgets`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'Altre Funzionalità',
          },
          {
            type: 'card',
            title: 'Capacità aggiuntive dei notebook',
            items: [
              'Import/Export: formati .ipynb, .dbc, .py, .html, .scala, .r, .sql',
              'Collaborazione: commenti, co-authoring in tempo reale, sharing',
              'Dashboard: creazione dashboard interattive direttamente dai risultati delle celle',
              'Version history: versionamento automatico con possibilità di confronto e rollback',
              'Variable explorer: ispezione variabili Python (DBR 12.2 LTS+)',
              'Go to definition: navigazione alla definizione di funzioni e variabili',
              'Command palette: Cmd/Ctrl + Shift + P per azioni rapide',
              'Cell execution minimap: overview visuale dello stato di esecuzione delle celle',
              'Personalized autocomplete: suggerimenti basati su metadati Unity Catalog',
            ]
          },
          {
            type: 'exam_tip',
            text: 'Differenza chiave %run vs dbutils.notebook.run(): %run esegue il notebook inline (stesso processo, condivide variabili e funzioni). dbutils.notebook.run() avvia un job effimero separato (processo isolato, supporta parametri e valori di ritorno). Per produzione, Databricks raccomanda Lakeflow Jobs.',
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 2.3 — Auto Loader Sources & Use Cases
      // ═══════════════════════════════════════════════════════════
      '2.3': {
        sectionId: '2',
        title: '2.3 — Classify valid Auto Loader sources and use cases',
        subtitle: 'Cloud storage sources, file formats, file detection modes, COPY INTO comparison',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'Cos\'è Auto Loader',
          },
          {
            type: 'paragraph',
            text: 'Auto Loader processa incrementalmente i nuovi file non appena arrivano in cloud storage, senza configurazione aggiuntiva. Fornisce una sorgente Structured Streaming chiamata cloudFiles. Può processare miliardi di file per migrare o backfillare una tabella e supporta near real-time ingestion di milioni di file all\'ora.',
          },
          {
            type: 'key_point',
            text: 'Auto Loader usa una key-value store scalabile (RocksDB) nel checkpoint location per persistere i metadati dei file scoperti, garantendo elaborazione exactly-once. In caso di fallimento, riprende da dove era stato interrotto usando le informazioni nel checkpoint.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Sorgenti Cloud Storage Supportate',
          },
          {
            type: 'table',
            headers: ['Provider', 'Schema URI', 'Servizio'],
            rows: [
              ['Amazon S3', 's3://', 'Amazon Simple Storage Service'],
              ['Azure Data Lake Storage Gen2', 'abfss://', 'Azure Data Lake Storage'],
              ['Azure Blob Storage', 'wasbs://', 'Azure Blob Storage'],
              ['Google Cloud Storage', 'gs://', 'Google Cloud Storage'],
              ['Databricks File System', 'dbfs:/', 'DBFS Root'],
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'Formati File Supportati',
          },
          {
            type: 'card',
            items: [
              'JSON (.json)',
              'CSV (.csv)',
              'PARQUET (.parquet)',
              'AVRO (.avro)',
              'ORC (.orc)',
              'TEXT (.txt)',
              'BINARYFILE (qualsiasi file binario)',
              'XML (.xml)',
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'Modalità di Rilevamento File',
          },
          {
            type: 'paragraph',
            text: 'Auto Loader supporta due modalità di rilevamento dei file:',
          },
          {
            type: 'table',
            headers: ['Modalità', 'Descrizione', 'Quando usarla'],
            rows: [
              ['Directory Listing Mode', 'Identifica nuovi file listando la directory di input. Usata per default. Non richiede permessi aggiuntivi oltre all\'accesso allo storage.', 'Per iniziare rapidamente. Raccomandata per volumi di file piccoli/medi.'],
              ['File Notification Mode', 'Auto Loader configura automaticamente un servizio di notifica e coda che si sottoscrive agli eventi file della directory. Più veloce e scalabile.', 'Per milioni di file/ora. Migliore performance. Databricks raccomanda questa modalità per la maggior parte dei workload.'],
              ['File Events (su External Location)', 'NOVITÀ: usa il file events service sull\'external location. Performance migliori rispetto a directory listing. Basta impostare cloudFiles.useManagedFileEvents = true.', 'Scelta raccomandata per nuovi workload. Richiede Unity Catalog external location.'],
            ]
          },
          {
            type: 'exam_tip',
            text: 'Puoi passare da directory listing a file notification mode in qualsiasi momento, mantenendo le garanzie exactly-once. Per file notification mode usando file events, usa opzione cloudFiles.useManagedFileEvents = true invece di cloudFiles.useNotifications = true.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Auto Loader vs COPY INTO',
          },
          {
            type: 'paragraph',
            text: 'Sia Auto Loader che COPY INTO servono per caricare dati incrementalmente in modo idempotente, ma hanno casi d\'uso diversi:',
          },
          {
            type: 'table',
            headers: ['Caratteristica', 'Auto Loader', 'COPY INTO'],
            rows: [
              ['Tipo', 'Streaming Source (cloudFiles)', 'SQL Command (dichiarativo)'],
              ['Volume file', 'Milioni+ file/ora', 'Migliaia di file (massimo)'],
              ['Schema evolution', '✅ Eccellente (schema inference, evolution, rescue)', '✅ Buono (mergeSchema supportato)'],
              ['Schema inference', '✅ Automatica (inferColumnTypes)', '✅ Supportata (inferSchema per CSV)'],
              ['rescueDataColumn', '✅ Inclusa per default', '❌ Non supportata'],
              ['File notification', '✅ Supporta notifiche automatiche', '❌ Solo directory listing'],
              ['Formati supportati', 'JSON, CSV, PARQUET, AVRO, ORC, TEXT, BINARYFILE, XML', 'JSON, CSV, PARQUET, AVRO, ORC, TEXT, BINARYFILE, XML'],
              ['Linguaggi', 'Python, Scala, SQL (Lakeflow)', 'SQL'],
              ['Idempotenza', '✅ Exactly-once (checkpoint RocksDB)', '✅ Exactly-once (tracking automatico)'],
              ['Riprendere subset file', 'Più complesso', '✅ Più semplice (filtri WHERE)'],
            ]
          },
          {
            type: 'key_point',
            text: 'Databricks raccomanda Auto Loader per la maggior parte degli scenari di ingestion incrementale. Usa COPY INTO quando: (1) hai migliaia di file (non milioni), (2) vuoi SQL-only, (3) devi ricaricare facilmente un subset di file.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Casi d\'Uso Tipici',
          },
          {
            type: 'card',
            title: 'Quando usare Auto Loader',
            items: [
              'Incremental ingestion da cloud storage (S3, ADLS, GCS) in near real-time',
              'Backfill di miliardi di file esistenti in una tabella Delta',
              'Quando lo schema dei dati si evolve frequentemente (schema drift)',
              'Ingestion con schema inference automatica per dati semi-strutturati (JSON, XML)',
              'Pipeline ETL che richiedono esattamente-once semantics',
              'Come sorgente per Lakeflow Declarative Pipelines (streaming tables)',
              'File notification mode per workload con milioni di file/ora',
            ]
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 2.4 — Auto Loader Syntax
      // ═══════════════════════════════════════════════════════════
      '2.4': {
        sectionId: '2',
        title: '2.4 — Demonstrate knowledge of Auto Loader syntax',
        subtitle: 'cloudFiles source, Python API, SQL syntax, options, schema evolution',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'Sintassi Python (readStream + cloudFiles)',
          },
          {
            type: 'paragraph',
            text: 'Auto Loader si usa con spark.readStream.format("cloudFiles") e l\'opzione obbligatoria cloudFiles.format per specificare il formato del file.',
          },
          {
            type: 'code',
            lang: 'python',
            label: 'Pattern base — Python (Structured Streaming)',
            code: `from pyspark.sql.types import StructType, StructField, StringType, IntegerType

# Schema inference automatica
df = (spark.readStream
  .format("cloudFiles")
  .option("cloudFiles.format", "json")
  .option("cloudFiles.schemaLocation", "/path/to/schema/location")
  .load("s3://my-bucket/input-data/")
)

# Schema noto e rescued data column
schema = StructType([
  StructField("id", IntegerType()),
  StructField("name", StringType()),
])

df = (spark.readStream
  .format("cloudFiles")
  .schema(schema)
  .option("cloudFiles.format", "csv")
  .option("cloudFiles.schemaEvolutionMode", "rescue")
  .option("rescuedDataColumn", "_rescued_data")
  .load("s3://my-bucket/input-data/")
)

# Scrivere in Delta Lake
(df.writeStream
  .option("checkpointLocation", "/path/to/checkpoint")
  .option("mergeSchema", "true")
  .start("s3://my-bucket/output-table/")
)`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'Opzioni Principali di Auto Loader',
          },
          {
            type: 'table',
            headers: ['Opzione', 'Tipo', 'Descrizione'],
            rows: [
              ['cloudFiles.format', 'String', 'Formato file: json, csv, parquet, avro, orc, text, binaryFile, xml (OBBLIGATORIA)'],
              ['cloudFiles.schemaLocation', 'Path', 'Directory dove Auto Loader persiste lo schema inferito (consigliata)'],
              ['cloudFiles.schemaEvolutionMode', 'String', 'Come gestire nuovi campi: none, rescue, failOnNewColumns (default: none)'],
              ['cloudFiles.includeExistingFiles', 'Boolean', 'Se includere file già presenti nella directory all\'avvio (default: true)'],
              ['cloudFiles.inferColumnTypes', 'Boolean', 'Inferisce tipi di dato per JSON/CSV invece di usare solo StringType'],
              ['cloudFiles.maxFilesPerTrigger', 'Int', 'Max file da processare per trigger (default: 1000)'],
              ['cloudFiles.useStrictGlobber', 'Boolean', 'Usa globbing standard Spark per path pattern'],
              ['cloudFiles.cleanSource', 'String', 'Cosa fare con i file processati: archive, delete, never (default: never)'],
              ['cloudFiles.cleanSource.retentionDuration', 'Int', 'Giorni di retention prima di cancellare/archiviare (default: 7)'],
              ['cloudFiles.partitionColumns', 'String', 'Colonne di partizione per estrarre da path'],
              ['cloudFiles.validateOptions', 'Boolean', 'Valida tutte le opzioni all\'avvio (default: false)'],
              ['pathGlobFilter', 'String', 'Pattern glob per filtrare file (es. *.csv)'],
            ]
          },
          {
            type: 'code',
            lang: 'python',
            label: 'Opzioni avanzate — pathGlobFilter e file notification',
            code: `# Filtrare solo file .json
df = (spark.readStream
  .format("cloudFiles")
  .option("cloudFiles.format", "json")
  .option("pathGlobFilter", "*.json")
  .load("s3://my-bucket/input-data/")
)

# File notification mode (NUOVA raccomandazione: file events)
df = (spark.readStream
  .format("cloudFiles")
  .option("cloudFiles.format", "json")
  .option("cloudFiles.useManagedFileEvents", "true")
  .load("/Volumes/catalog/schema/volume/input-data/")
)

# File notification mode (classica, con configurazione manuale)
df = (spark.readStream
  .format("cloudFiles")
  .option("cloudFiles.format", "json")
  .option("cloudFiles.useNotifications", "true")
  .option("cloudFiles.queueUrl", "https://sqs.us-east-1.amazonaws.com/...")
  .load("s3://my-bucket/input-data/")
)`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'Sintassi SQL (Lakeflow Declarative Pipelines)',
          },
          {
            type: 'paragraph',
            text: 'In Lakeflow Declarative Pipelines puoi usare Auto Loader con la funzione read_files() in SQL, che supporta le stesse opzioni del cloudFiles source in Python.',
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'SQL — read_files() in streaming table',
            code: `-- Streaming table con Auto Loader (schema inference)
CREATE OR REFRESH STREAMING TABLE booking_updates
AS SELECT * FROM STREAM read_files(
  "/Volumes/my_catalog/my_schema/my_volume/data/*",
  format => "json",
  multiLine => true,
  inferColumnTypes => true
);

-- Con schema specificato manualmente
CREATE OR REFRESH STREAMING TABLE customers_raw
AS SELECT * FROM STREAM read_files(
  "/Volumes/my_catalog/my_schema/raw/customers/",
  format => "csv",
  header => true
);`,
          },
          {
            type: 'code',
            lang: 'python',
            label: 'Python — Auto Loader in Lakeflow Declarative Pipelines',
            code: `from pyspark import pipelines as dp

@dp.tabledef
def customers():
  return (spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "json")
    .load("/Volumes/my_catalog/retail/customers/")
  )

@dp.tabledef
def booking_updates():
  return (spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("multiLine", "true")
    .load("/Volumes/my_catalog/my_schema/my_volume/wanderbricks/booking_updates")
  )`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'Schema Inference & Evolution',
          },
          {
            type: 'code',
            lang: 'python',
            label: 'Schema evolution modes',
            code: `# 1. Rescue mode — cattura errori in colonna _rescued_data
df = (spark.readStream
  .format("cloudFiles")
  .schema(schema)
  .option("cloudFiles.format", "json")
  .option("cloudFiles.schemaEvolutionMode", "rescue")
  .option("rescuedDataColumn", "_rescued_data")
  .load(path)
)

# 2. FailOnNewColumns — fallisce se arrivano nuove colonne
df = (spark.readStream
  .format("cloudFiles")
  .schema(schema)
  .option("cloudFiles.format", "json")
  .option("cloudFiles.schemaEvolutionMode", "failOnNewColumns")
  .load(path)
)

# 3. None — ignora nuove colonne (default)
# 4. Schema hints: forzare tipo per colonne specifiche
df = (spark.readStream
  .format("cloudFiles")
  .option("cloudFiles.format", "json")
  .option("cloudFiles.schemaHints", "userId LONG, price DOUBLE")
  .load(path)
)`,
          },
          {
            type: 'exam_tip',
            text: 'Opzioni chiave da ricordare: (1) cloudFiles.format è l\'unica OBBLIGATORIA. (2) cloudFiles.schemaLocation è RACCOMANDATA per persistenza schema inferito. (3) cloudFiles.schemaEvolutionMode = "rescue" permette di catturare dati che non matchano lo schema senza fallire. (4) In Lakeflow Declarative Pipelines, schema e checkpoint sono gestiti AUTOMATICAMENTE.',
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 2.5 — Debugging Tools
      // ═══════════════════════════════════════════════════════════
      '2.5': {
        sectionId: '2',
        title: '2.5 — Use Databricks\' built-in debugging tools to troubleshoot a given issue',
        subtitle: 'Interactive debugger, Genie Code, Spark UI, dbutils, troubleshooting',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'Interactive Debugger (Python)',
          },
          {
            type: 'paragraph',
            text: 'Il debugger interattivo di Databricks permette di eseguire codice Python passo-passo con breakpoints, ispezione variabili e console di debug.',
          },
          {
            type: 'card',
            title: 'Come abilitare il debugger',
            items: [
              'Vai a Settings > Developer > Editor settings',
              'Attiva "Python Notebook Interactive Debugger"',
              'Il notebook deve essere connesso a: serverless compute, oppure compute Standard access mode (DBR 14.3 LTS+)',
            ]
          },
          {
            type: 'card',
            title: 'Azioni di debugging',
            items: [
              'Aggiungi breakpoint cliccando nel gutter (bordo sinistro) della cella',
              'Avvia debug: menu Run > Debug cell, o scorciatoia Option+Shift+D',
              'Step through: Step Over, Step Into, Step Out per navigare il codice',
              'Variable explorer: pannello destra per ispezionare valori variabili',
              'Debug console: esegui codice Python in tempo reale quando il debugger è in pausa su un breakpoint',
              'Step into workspace files: breakpoint in file Python importati (non librerie)',
              'Timeout automatico: 30 minuti di inattività',
            ]
          },
          {
            type: 'code',
            lang: 'text',
            label: 'Debug console — comandi utili',
            code: `# Quando il debugger è in pausa su un breakpoint:
df.show()           # Mostra dati DataFrame (invece di display())
df.head()           # Prime righe Pandas DataFrame
len(df.columns)     # Numero colonne
type(variable_name) # Tipo della variabile

# NOTA: display() non è supportato nella debug console
# Esecuzione limitata a 15 secondi nella console`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'Genie Code — Assistente AI per Debug',
          },
          {
            type: 'paragraph',
            text: 'Genie Code è un assistente AI context-aware che aiuta a generare, spiegare e debuggare codice. Usa i metadati di Unity Catalog per fornire risposte personalizzate.',
          },
          {
            type: 'table',
            headers: ['Funzionalità', 'Descrizione', 'Come si attiva'],
            rows: [
              ['Diagnose Error', 'Analizza errori nelle celle e propone fix automatici', 'Click "Diagnose Error" nel risultato cella in errore'],
              ['/fix', 'Corregge codice con errori', 'Automatico quando clicchi Diagnose Error'],
              ['/repairEnvironment', 'Diagnostica e fixa errori di ambiente (librerie, dipendenze)', 'Click "Diagnose Error" nel pannello ambiente o Genie Code pane'],
              ['Code generation', 'Genera codice Python/SQL da linguaggio naturale', 'Cmd/Ctrl+I nella cella, o pannello Genie Code'],
              ['Code explanation', 'Spiega codice complesso', 'Seleziona codice e chiedi spiegazione'],
              ['Code optimization', 'Ottimizza e refactorizza codice', 'Descrivi cosa vuoi ottimizzare'],
              ['Inline Genie Code', 'Assistenza direttamente nella cella', 'Click icona Genie Code nella cella, o shortcut'],
            ]
          },
          {
            type: 'key_point',
            text: 'Genie Code usa serverless compute per default. Se sei su una pagina che ha già un compute selezionato (notebook, SQL editor), Genie Code usa automaticamente quel compute. Si attiva con Cmd+I (Mac) o Ctrl+I (Windows) per assistenza inline nella cella.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Spark UI — Debug delle Performance',
          },
          {
            type: 'paragraph',
            text: 'La Spark UI fornisce informazioni dettagliate sull\'esecuzione dei job Spark, utile per identificare colli di bottiglia e problemi di performance.',
          },
          {
            type: 'table',
            headers: ['Tab Spark UI', 'Cosa mostra'],
            rows: [
              ['Jobs', 'Elenco dei job Spark, stato, durata, timeline'],
              ['Stages', 'Dettaglio degli stage: task, shuffle read/write, spill, durata'],
              ['Storage', 'Informazioni su RDD persistiti in memoria/disco'],
              ['Environment', 'Configurazione Spark, variabili d\'ambiente, librerie'],
              ['Executors', 'Utilizzo memoria, disco, CPU per executor; task attivi/completati/falliti'],
              ['SQL', 'Piano di esecuzione fisico delle query SQL con metriche dettagliate'],
              ['Streaming', 'Statistiche streaming: input rate, batch duration, scheduling delay'],
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'dbutils — Utility di Debug',
          },
          {
            type: 'paragraph',
            text: 'Il modulo dbutils offre utility per debugging e troubleshooting direttamente dai notebook.',
          },
          {
            type: 'code',
            lang: 'python',
            label: 'dbutils per debugging',
            code: `# Filesystem: esplorare e verificare file
dbutils.fs.ls("s3://my-bucket/data/")
dbutils.fs.head("s3://my-bucket/data/file.json", maxBytes=10000)
dbutils.fs.mounts()

# Notebook workflow
dbutils.notebook.exit("status:OK")
dbutils.notebook.run("./validate", timeout_seconds=60, arguments={"stage": "bronze"})

# Widgets per debug interattivo
dbutils.widgets.text("debug_mode", "false")
if dbutils.widgets.get("debug_mode") == "true":
    df.show(truncate=False)

# Secrets
dbutils.secrets.listScopes()
dbutils.secrets.get(scope="my-scope", key="db-password")`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'Altre Tecniche di Debug',
          },
          {
            type: 'card',
            title: 'Tecniche e strumenti aggiuntivi',
            items: [
              'Cell output: usa print() e display() per ispezionare dati intermedi',
              'Logging: spark.sparkContext.setLogLevel("INFO") per log più dettagliati',
              'Databricks Connect logging: imposta SPARK_CONNECT_LOG_LEVEL=debug per log gRPC',
              'Compute troubleshooting: verifica connettività di rete, permessi IAM, metastore',
              'Unit testing: testa le funzioni del notebook con framework come pytest (workspace files)',
              'Notebook version history: confronta versioni per trovare quando è stato introdotto un bug',
              'Genie Code debug: usa Diagnose Error per fix automatico di errori comuni di sintassi e ambiente',
            ]
          },
          {
            type: 'exam_tip',
            text: 'Per l\'esame, ricorda: (1) Il debugger interattivo funziona SOLO per Python. (2) Genie Code è l\'assistente AI multi-funzione (debug, fix, generate, explain). (3) Diagnose Error è il pulsante specifico per errori nelle celle. (4) Spark UI è il tool primario per debug di performance. (5) dbutils.fs.ls/head per ispezionare file nello storage.',
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 3.1 — Medallion Architecture
      // ═══════════════════════════════════════════════════════════
      '3.1': {
        sectionId: '3',
        title: '3.1 — Describe the three layers of the Medallion Architecture and explain the purpose of each layer',
        subtitle: 'Bronze, Silver, Gold — qualità progressiva dei dati',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'Medallion Architecture',
          },
          {
            type: 'paragraph',
            text: 'La Medallion Architecture è un pattern di organizzazione dei dati che divide il lakehouse in tre layer: <strong>Bronze</strong> (raw), <strong>Silver</strong> (validato/pulito) e <strong>Gold</strong> (business-ready). I dati fluiscono in modo incrementale da sinistra a destra, migliorando qualità e struttura a ogni passaggio.',
          },
          {
            type: 'key_point',
            text: 'La Medallion Architecture garantisce atomicità, consistenza, isolamento e durabilità (ACID) mentre i dati attraversano più livelli di validazione e trasformazione. Ogni layer ha una responsabilità singola e ben definita.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Layer Bronze — Raw Ingestion',
          },
          {
            type: 'paragraph',
            text: 'Il layer Bronze contiene i dati grezzi esattamente come arrivano dal sistema sorgente, senza trasformazioni. I dati sono append-only per preservare la storia completa.',
          },
          {
            type: 'card',
            title: 'Caratteristiche del Bronze Layer',
            items: [
              'Mantiene lo stato originale dei dati nei formati nativi (JSON, CSV, Parquet, ecc.)',
              'Append-only: i dati vengono aggiunti in modo incrementale e crescono nel tempo',
              'Aggiunge metadati di ingestione: ingestion_time, source_system, batch_id',
              'Schema-on-read: può accomodare schemi variabili',
              'Non è per accesso diretto di analisti — è consumato da workload che producono le tabelle Silver',
              'Abilita riprocessamento e audit — preserva la fedeltà dei dati originali',
            ]
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Scrittura tabella Bronze con Auto Loader',
            code: `CREATE OR REFRESH STREAMING TABLE bronze_orders
AS SELECT
  *,
  current_timestamp() AS ingestion_time,
  'source_kafka' AS source_system,
  uuid() AS batch_id
FROM cloud_files(
  "s3://my-bucket/landing/orders/",
  "json",
  map("cloudFiles.inferColumnTypes", "true")
);`,
          },
          {
            type: 'exam_tip',
            text: 'Il Bronze layer è <strong>append-only</strong> e <strong>non va mai sovrascritto</strong>. Non applicare trasformazioni, filtri o pulizie qui — quella è responsabilità del Silver layer. Il Bronze è la fonte di verità per riprocessamento e audit.',
          },

          // ── SILVER ──
          {
            type: 'heading',
            level: 3,
            text: 'Layer Silver — Validato e Pulito',
          },
          {
            type: 'paragraph',
            text: 'Il layer Silver rappresenta i dati validati, puliti e arricchiti. Qui si applicano deduplicazione, normalizzazione, type casting e regole di qualità.',
          },
          {
            type: 'card',
            title: 'Caratteristiche del Silver Layer',
            items: [
              'Include almeno una rappresentazione validata e non aggregata per ogni record',
              'Data cleansing: correzione errori, gestione valori nulli, standardizzazione formati',
              'Deduplicazione: rimozione record duplicati da CDC o ingestion multiple',
              'Enforcement dello schema: tipi definiti, vincoli NOT NULL, range validation',
              'Join tra sorgenti per creare entità conformate (es. master customers)',
              'Struttura dati in formato più consumabile per downstream (Silver → Gold)',
              'Modello dati tipo 3NF (Third Normal Form) o Data Vault-like',
            ]
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Trasformazione Bronze → Silver',
            code: `CREATE OR REFRESH STREAMING TABLE silver_orders
AS SELECT
  order_id,
  customer_id,
  CAST(order_date AS DATE) AS order_date,
  CAST(amount AS DOUBLE) AS amount,
  UPPER(TRIM(status)) AS status,
  COALESCE(region, 'UNKNOWN') AS region,
  ingestion_time
FROM STREAM(LIVE.bronze_orders)
WHERE order_id IS NOT NULL
  AND amount > 0;`,
          },
          {
            type: 'exam_tip',
            text: 'Il Silver layer è dove si applicano le regole di qualità. È il layer più "ingegnerizzato" — la maggior parte dello sforzo ETL è qui. Se il source manda dati sporchi, Silver li pulisce. Se c\'è un bug, Gold può essere ricostruito da Silver senza rileggere il source.',
          },

          // ── GOLD ──
          {
            type: 'heading',
            level: 3,
            text: 'Layer Gold — Business-Ready',
          },
          {
            type: 'paragraph',
            text: 'Il layer Gold contiene dati altamente raffinati, aggregati e modellati per il consumo diretto da dashboard, ML e applicazioni. È ottimizzato per performance di lettura.',
          },
          {
            type: 'card',
            title: 'Caratteristiche del Gold Layer',
            items: [
              'Dati aggregati e filtrati per specifici periodi o regioni geografiche',
              'Allineato con la logica di business e i requisiti dei consumatori',
              'Ottimizzato per performance di query e dashboard (star schema, dimensional modeling)',
              'Meno dataset rispetto a Silver — ogni tabella Gold risponde a una specifica domanda di business',
              'Modello dati denormalizzato, read-optimized, con pochi join',
              'Può includere Kimball star schema, Inmon data marts, o feature store per ML',
            ]
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Trasformazione Silver → Gold',
            code: `CREATE OR REFRESH MATERIALIZED VIEW gold_daily_revenue
AS SELECT
  DATE(order_date) AS day,
  region,
  COUNT(DISTINCT order_id) AS total_orders,
  COUNT(DISTINCT customer_id) AS unique_customers,
  ROUND(SUM(amount), 2) AS total_revenue,
  ROUND(AVG(amount), 2) AS avg_order_value
FROM silver_orders
WHERE status = 'COMPLETED'
GROUP BY ALL;`,
          },
          {
            type: 'exam_tip',
            text: 'Gold è il layer che gli analisti e i dashboard queryano. Usa <strong>materialized views</strong> (non streaming tables) per aggregazioni. Ottimizza con Liquid Clustering e OPTIMIZE. Ogni tabella Gold deve rispondere a uno specifico caso d\'uso — evita la proliferazione di tabelle Gold ridondanti.',
          },

          // ── BEST PRACTICES ──
          {
            type: 'heading',
            level: 3,
            text: 'Best Practice e Anti-Pattern',
          },
          {
            type: 'table',
            headers: ['Principio', 'Descrizione'],
            rows: [
              ['Trasformare in Bronze ❌', 'Bronze è raw storage. Filtrare o trasformare qui perde la capacità di riprocessare dal source.'],
              ['Saltare Silver ❌', 'Andare direttamente da source a Gold significa mescolare pulizia e aggregazione. Silver è il layer debuggabile intermedio.'],
              ['No schema enforcement in Silver ❌', 'Silver senza vincoli di schema è solo Bronze con passaggi extra. Applica regole di qualità.'],
              ['Controlli qualità tra layer ✅', 'Ogni transizione di layer è un\'opportunità per validare completezza e correttezza.'],
              ['Una tabella Gold per dominio ✅', 'Costruisci Gold per domini di business (ordini, clienti, prodotti) non per widget di dashboard.'],
            ]
          },
          {
            type: 'key_point',
            text: 'La Medallion Architecture è compatibile con il concetto di data mesh. Le tabelle Bronze e Silver possono essere usate in modalità "one-to-many": un singolo upstream può alimentare multiple tabelle downstream. La separazione in layer rende i pipeline più facili da debuggare e permette il replay dal dato grezzo quando le trasformazioni cambiano.',
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 3.2 — Cluster Configuration for Performance
      // ═══════════════════════════════════════════════════════════
      '3.2': {
        sectionId: '3',
        title: '3.2 — Classify the type of cluster and configuration for optimal performance based on the scenario',
        subtitle: 'Serverless, Classic Compute, Job Clusters, Configurazioni',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'Tipi di Compute in Databricks',
          },
          {
            type: 'paragraph',
            text: 'La scelta del compute giusto è fondamentale per bilanciare costi, performance e gestione operativa. Databricks offre diverse opzioni: <strong>serverless</strong> (raccomandato per la maggior parte dei workload), <strong>classic compute</strong> (per esigenze specifiche), e <strong>SQL warehouses</strong> (per workload SQL).',
          },
          {
            type: 'table',
            headers: ['Compute Type', 'Startup', 'Casi d\'uso principali'],
            rows: [
              ['Serverless compute', '< 10 secondi', 'Workload supportati: notebooks, jobs, pipelines. Raccomandato per default.'],
              ['Classic all-purpose', '3-5 minuti', 'Sviluppo interattivo, RDD APIs, linguaggio R, librerie custom.'],
              ['Classic job clusters', '2-5 minuti', 'Job ETL schedulati, workload prevedibili, configurazioni Spark custom.'],
              ['SQL Warehouse (Serverless)', '2-6 secondi', 'BI, query SQL, analisi esplorative. Performance optimized per SQL.'],
              ['SQL Warehouse (Pro/Classic)', '1-5 minuti', 'Custom networking, federation, hybrid, o quando serverless non disponibile.'],
            ]
          },
          {
            type: 'key_point',
            text: 'Databricks <strong>raccomanda serverless compute</strong> come opzione primaria per notebooks, jobs, e Lakeflow Spark Declarative Pipelines. Serverless richiede zero configurazione, è sempre disponibile, scala automaticamente in secondi, e non ha idle waste. Usa classic compute solo se serverless non supporta il tuo use case.',
          },

          // ── SERVERLESS ──
          {
            type: 'heading',
            level: 3,
            text: 'Serverless Compute — Modalità di Performance',
          },
          {
            type: 'paragraph',
            text: 'Databricks serverless compute offre due modalità di performance per bilanciare velocità e costo:',
          },
          {
            type: 'table',
            headers: ['Modalità', 'Startup', 'Costo', 'Caso d\'uso'],
            rows: [
              ['Performance-optimized (default)', 'Istantaneo (warm pool)', 'Standard', 'Workload interattivi, notebook, esplorazione dati.'],
              ['Standard mode', '4-6 minuti', 'Fino a 70% meno', 'Batch jobs schedulati, pipeline ETL automatizzate, jobs notturni.'],
            ]
          },
          {
            type: 'paragraph',
            text: 'Standard mode è disponibile per Lakeflow Jobs e Lakeflow Spark Declarative Pipelines, ma <strong>non per notebook</strong>. Per job schedulati dove la latenza di startup non è critica, Standard mode offre il miglior valore.',
          },
          {
            type: 'exam_tip',
            text: 'Serverless <strong>non supporta</strong>: init scripts, Spark UI (usa query profile), RDD APIs, R language, la maggior parte delle configurazioni Spark manuali. Usa <strong>environment versions</strong> invece di Databricks Runtime per gestire le librerie. Ogni environment version è supportata per 3 anni.',
          },

          // ── CLASSIC CLUSTER ──
          {
            type: 'heading',
            level: 3,
            text: 'Classic Cluster — Best Practice di Configurazione',
          },
          {
            type: 'paragraph',
            text: 'Quando devi configurare classic compute manualmente (perché serverless non supporta il workload), segui queste raccomandazioni:',
          },
          {
            type: 'table',
            headers: ['Scenario', 'Configurazione Raccomandata', 'Motivazione'],
            rows: [
              ['ETL batch semplice (no join/aggregazioni pesanti)', 'Worker piccoli (es. DS3_v2), pochi core, memoria ridotta', 'Workload leggeri non richiedono risorse elevate — costo minimo.'],
              ['ETL complesso (join, union, aggregazioni)', 'Pochi worker ma grandi (es. DS4_v2, E8s_v3)', 'Riduce shuffle: meno nodi = meno dati da trasferire tra nodi.'],
              ['Join pesanti / shuffle intensivi', 'Worker memory-optimized (es. E16s_v3)', 'Più memoria = meno spill su disco e OOM.'],
              ['Query analitiche (letture ripetute)', 'Storage-optimized con disk cache o storage locale', 'Caching dei dati accelera letture ripetute.'],
              ['Sviluppo interattivo', 'Single-node con nodo grande (es. DS4_v2)', 'Nessuno shuffle, caching locale dei dati.'],
              ['ML training (sperimentazione)', 'Single-node con GPU, nodo grande', 'Riduce shuffle; GPU per training.'],
            ]
          },
          {
            type: 'card',
            title: 'Parametri Chiave di Configurazione',
            items: [
              'Autoscaling: min_workers=1, max_workers=8-16 per ETL batch; min_workers=1, max_workers=4 per sviluppo',
              'Auto-termination: 10-15 minuti per sviluppo; 30-45 minuti per cluster condivisi; N/A per job clusters',
              'Photon: abilita per workload SQL e DataFrame con join/aggregazioni pesanti (dataset > 100GB)',
              'Spot instances: usa SPOT_WITH_FALLBACK per job clusters non-critical (risparmio 40-80%)',
              'Driver: sempre on-demand per affidabilità; workers in spot per risparmio',
              'Pool: usa pool per ridurre startup time in job pipelines',
              'Cluster policies: limita instance type, tag, e dimensioni per controllo costi',
            ]
          },
          {
            type: 'code',
            lang: 'python',
            label: 'Configurazione job cluster production ETL',
            code: `# Esempio configurazione via API/JSON
{
  "num_workers": 8,
  "node_type_id": "Standard_DS4_v2",
  "spark_version": "14.3.x-photon-scala2.12",
  "runtime_engine": "PHOTON",
  "autoscale": {
    "min_workers": 1,
    "max_workers": 8
  },
  "azure_attributes": {
    "first_on_demand": 1,
    "availability": "SPOT_WITH_FALLBACK_AZURE",
    "spot_bid_max_price": -1
  },
  "spark_conf": {
    "spark.sql.adaptive.enabled": "true",
    "spark.sql.shuffle.partitions": "200",
    "spark.databricks.delta.optimizeWrite.enabled": "true"
  }
}`,
          },
          {
            type: 'exam_tip',
            text: 'Per l\'esame: (1) Serverless è raccomandato per TUTTI i workload supportati — la risposta "giusta" è quasi sempre serverless. (2) Job clusters > all-purpose per produzione (zero idle waste). (3) Photon accelera join e aggregazioni ma NON aiuta UDF e RDD. (4) Spot instances = risparmio, ma usa fallback. (5) Streaming NON usa autoscaling — serve cluster size stabile.',
          },

          // ── DECISION MATRIX ──
          {
            type: 'heading',
            level: 3,
            text: 'Matrice di Decisione',
          },
          {
            type: 'table',
            headers: ['Scenario', 'Compute Raccomandato'],
            rows: [
              ['Pipeline ETL dichiarativa (LDP)', 'Serverless (Performance o Standard mode)'],
              ['Job batch schedulato con Photon', 'Serverless, oppure Classic job cluster con Photon'],
              ['Notebook sviluppo interattivo', 'Serverless (se supportato) o All-purpose classico'],
              ['BI Dashboard SQL query', 'SQL Warehouse Serverless'],
              ['Streaming continuo', 'Classic pipeline (serverless non supporta trigger continui)'],
              ['ML Training con GPU', 'Classic all-purpose con GPU, single-node, policy Personal'],
              ['RDD API o R language', 'Classic all-purpose (serverless non supporta)'],
              ['Init scripts o config Spark custom', 'Classic job cluster'],
              ['Burst workload (tanti job concorrenti)', 'Serverless (assorbe burst senza quota cluster)'],
              ['Long-running pipeline (>1 ora)', 'Classic job cluster (DBU rate più basso)'],
            ]
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 3.3 — LDP Advantages
      // ═══════════════════════════════════════════════════════════
      '3.3': {
        sectionId: '3',
        title: '3.3 — Emphasize the advantages of Lakeflow Spark Declarative Pipelines for ETL',
        subtitle: 'Declarativo vs Imperativo, Vantaggi chiave, Casi d\'uso',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'Lakeflow Spark Declarative Pipelines',
          },
          {
            type: 'paragraph',
            text: 'Lakeflow Spark Declarative Pipelines (ex Delta Live Tables / DLT) è un framework ETL dichiarativo che permette di definire pipeline di dati usando solo SQL o Python, senza scrivere codice di orchestrazione. Invece di specificare manualmente l\'ordine di esecuzione, dichiari <strong>cosa</strong> vuoi ottenere e Databricks si occupa di <strong>come</strong> eseguirlo.',
          },
          {
            type: 'key_point',
            text: 'Lakeflow Spark Declarative Pipelines estende il processing dichiarativo da singole query a intere pipeline. Apache Spark pianifica ed esegue l\'intero flusso end-to-end: inferisce le dipendenze tra dataset, costruisce un execution plan unico, e aggiorna i risultati nell\'ordine corretto.',
          },

          // ── VANTAGGI ──
          {
            type: 'heading',
            level: 3,
            text: 'Vantaggi Chiave',
          },
          {
            type: 'table',
            headers: ['Vantaggio', 'Descrizione', 'Impatto'],
            rows: [
              ['Produttività maggiore', 'Focus su logica di business invece che glue code e orchestrazione', 'Pipeline in 20 linee vs centinaia di codice manuale'],
              ['Costi ridotti', 'Processing incrementale automatico — solo dati nuovi o cambiati', 'Risparmio significativo su workload ripetitivi'],
              ['Qualità dati integrata', 'Expectations (aspettative) inline: drop, quarantine, o fail su violazioni', 'Niente codice separato per data quality'],
              ['Dependency tracking automatico', 'Il framework rileva che gold_daily_revenue dipende da silver_orders', 'Nessun orchestratore esterno necessario'],
              ['Retry e recovery integrati', 'Gestione automatica dei fallimenti con retry e ripartenza', 'Riduzione downtime operativo'],
              ['Batch e streaming unificati', 'Stessa API dichiarativa per batch e streaming — basta cambiare source', 'Single codebase per entrambi i pattern'],
              ['Incrementalità automatica', 'Traccia quali dati sono già stati processati, legge solo nuovi record', 'Niente MAX(query), checkpoint file, o logica condizionale'],
              ['Backfill e late data', 'Gestione automatica di dati in ritardo e ricalcoli', 'Niente intervento manuale per riparare dati'],
            ]
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Confronto: Approccio Imperativo vs Dichiarativo',
            code: `-- APPROCCIO IMPERATIVO (notebook + orchestratore)
-- Notebook 1: Leggi dati grezzi
df = spark.read.format("json").load(raw_path)
df.write.format("delta").saveAsTable("bronze_orders")

-- Notebook 2: Pulisci dati
bronze = spark.read.table("bronze_orders")
silver = bronze.filter(col("order_id").isNotNull())
silver.write.format("delta").saveAsTable("silver_orders")

-- Notebook 3: Aggrega
silver = spark.read.table("silver_orders")
gold = silver.groupBy("region").agg(sum("amount"))
gold.write.format("delta").saveAsTable("gold_revenue")

-- Orchestratore esterno: esegui N1, poi N2, poi N3

-- APPROCCIO DICHIARATIVO (Lakeflow LDP)
-- Un unico file SQL — Databricks gestisce tutto
CREATE OR REFRESH STREAMING TABLE bronze_orders
AS SELECT * FROM cloud_files(...);

CREATE OR REFRESH STREAMING TABLE silver_orders
AS SELECT * FROM STREAM(LIVE.bronze_orders)
WHERE order_id IS NOT NULL;

CREATE OR REFRESH MATERIALIZED VIEW gold_revenue
AS SELECT region, SUM(amount) AS total
FROM LIVE.silver_orders
GROUP BY ALL;`,
          },
          {
            type: 'exam_tip',
            text: 'Lakeflow LDP usa <strong>CREATE OR REFRESH STREAMING TABLE</strong> per ingestion incrementale e <strong>CREATE OR REFRESH MATERIALIZED VIEW</strong> per aggregazioni batch. Il prefisso <strong>LIVE.</strong> referenzia dataset dichiarati nella stessa pipeline. Questo è fondamentale per l\'esame.',
          },

          // ── QUANDO USARE ──
          {
            type: 'heading',
            level: 3,
            text: 'Quando Usare Lakeflow LDP',
          },
          {
            type: 'table',
            headers: ['Scenario', 'LDP è adatto?', 'Alternativa'],
            rows: [
              ['Pipeline Medallion (Bronze → Silver → Gold)', '✅ Ideale', 'Notebook + orchestratore manuale'],
              ['Pipeline con multiple tabelle interdipendenti', '✅ Ideale', 'Workflows con task sequenziali'],
              ['Necessità di data quality checks integrati', '✅ Ideale', 'Codice PySpark manuale per qualità'],
              ['Job semplice: read → write senza trasformazioni', '⚠️ Overkill', 'Auto Loader diretto o COPY INTO'],
              ['Workload RDD/UDF-heavy', '❌ Non supportato', 'Notebook PySpark classico'],
              ['Pipeline con init scripts o config Spark custom', '❌ Non supportato', 'Classic job cluster con notebook'],
            ]
          },
          {
            type: 'card',
            title: 'Cosa NON può fare Lakeflow LDP',
            items: [
              'RDD APIs e UDF Python non sono supportati',
              'Init scripts non possono essere usati',
              'Configurazioni Spark personalizzate non sono permesse',
              'Dataset API (Scala/Java) non supportati',
            ]
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 3.4 — LDP Implementation
      // ═══════════════════════════════════════════════════════════
      '3.4': {
        sectionId: '3',
        title: '3.4 — Implement data pipelines using Lakeflow Spark Declarative Pipelines',
        subtitle: 'Streaming Tables, Materialized Views, Expectations, Sintassi',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'Concetti Fondamentali di LDP',
          },
          {
            type: 'paragraph',
            text: 'Lakeflow Spark Declarative Pipelines si basa su tre concetti chiave: <strong>streaming tables</strong> per ingestion incrementale, <strong>materialized views</strong> per aggregazioni batch rinfrescabili, e <strong>expectations</strong> per data quality inline.',
          },
          {
            type: 'table',
            headers: ['Concetto', 'Tipo', 'Quando usarlo'],
            rows: [
              ['Streaming Table', 'Incrementale', 'Ingestion da sorgenti streaming/batch con checkpoint exactly-once. Si aggiorna solo con nuovi dati.'],
              ['Materialized View', 'Batch rinfrescabile', 'Aggregazioni, join, trasformazioni che devono essere ricalcolate. Supporta REFRESH.'],
              ['View', 'Virtuale (non materializzata)', 'Logica di trasformazione leggera, non persiste dati. Ricalcolata a ogni query.'],
              ['Expectation', 'Vincolo di qualità', 'Regole inline su dati: drop (scarta), quarantine (isola), fail (blocca pipeline).'],
            ]
          },

          // ── SINTAX ──
          {
            type: 'heading',
            level: 3,
            text: 'Sintassi SQL Dichiarativa',
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Streaming Table — Lettura incrementale',
            code: `-- Auto Loader come source (streaming)
CREATE OR REFRESH STREAMING TABLE bronze_events
AS SELECT
  *,
  current_timestamp() AS ingestion_ts
FROM cloud_files(
  "s3://data-lake/events/",
  "json",
  map(
    "cloudFiles.inferColumnTypes", "true",
    "cloudFiles.maxFilesPerTrigger", "1000",
    "cloudFiles.schemaLocation", "/checkpoints/bronze_events/schema"
  )
);

-- Stream from altra streaming table (LIVE. prefix)
CREATE OR REFRESH STREAMING TABLE silver_events
AS SELECT
  event_id,
  event_type,
  CAST(event_time AS TIMESTAMP) AS event_time,
  CAST(value AS DOUBLE) AS value
FROM STREAM(LIVE.bronze_events)
WHERE event_id IS NOT NULL;`,
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Materialized View — Aggregazione batch',
            code: `CREATE OR REFRESH MATERIALIZED VIEW gold_daily_metrics
AS SELECT
  DATE(event_time) AS day,
  event_type,
  COUNT(*) AS total_events,
  COUNT(DISTINCT event_id) AS unique_events,
  ROUND(SUM(value), 2) AS total_value,
  ROUND(AVG(value), 2) AS avg_value
FROM LIVE.silver_events
WHERE event_time >= CURRENT_DATE - INTERVAL '30' DAYS
GROUP BY ALL;`,
          },
          {
            type: 'exam_tip',
            text: 'Usa <strong>STREAM()</strong> per leggere da una streaming table dentro un\'altra streaming table. Usa <strong>LIVE.</strong> per referenziare qualsiasi dataset dichiarato nella stessa pipeline. Le materialized views NON usano STREAM() — vengono rinfrescate su trigger o schedule.',
          },

          // ── EXPECTATIONS ──
          {
            type: 'heading',
            level: 3,
            text: 'Expectations — Data Quality Integrata',
          },
          {
            type: 'paragraph',
            text: 'Le expectations permettono di dichiarare regole di qualità direttamente nella definizione del dataset. Ogni expectation ha un nome, una condizione e un\'azione su violazione.',
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Expectations con azioni diverse',
            code: `CREATE OR REFRESH STREAMING TABLE silver_orders (
  CONSTRAINT valid_order_id EXPECT (order_id IS NOT NULL) ON VIOLATION DROP ROW,
  CONSTRAINT valid_amount EXPECT (amount > 0) ON VIOLATION DROP ROW,
  CONSTRAINT valid_date EXPECT (order_date IS NOT NULL) ON VIOLATION DROP ROW,
  CONSTRAINT high_value_warn EXPECT (amount < 100000) ON VIOLATION WARN,
  CONSTRAINT critical_check EXPECT (status IN ('PENDING','COMPLETED','CANCELLED'))
    ON VIOLATION FAIL UPDATE
)
AS SELECT * FROM STREAM(LIVE.bronze_orders);`,
          },
          {
            type: 'table',
            headers: ['Azione', 'Comportamento'],
            rows: [
              ['DROP ROW', 'Scarta il record che viola la constraint — non viene scritto nella tabella'],
              ['WARN', 'Registra un warning ma il record viene comunque scritto'],
              ['FAIL UPDATE', 'Blocca l\'intero aggiornamento della pipeline se la violazione si verifica'],
            ]
          },
          {
            type: 'exam_tip',
            text: 'Le expectations sono <strong>inline</strong> nella definizione della tabella. La sintassi è: <strong>CONSTRAINT nome EXPECT (condizione) ON VIOLATION {DROP ROW | WARN | FAIL UPDATE}</strong>. Le metriche di data quality sono visibili nella UI della pipeline e pubblicate nelle system tables.',
          },

          // ── PYTHON API ──
          {
            type: 'heading',
            level: 3,
            text: 'API Python per LDP',
          },
          {
            type: 'code',
            lang: 'python',
            label: 'Pipeline LDP in Python (dlt module)',
            code: `import dlt
from pyspark.sql.functions import col, current_timestamp

@dlt.table
def bronze_orders():
    return (
        spark.readStream.format("cloudFiles")
        .option("cloudFiles.format", "json")
        .option("cloudFiles.inferColumnTypes", "true")
        .option("cloudFiles.schemaLocation", "/checkpoints/bronze_orders")
        .load("s3://data/orders/")
        .withColumn("ingestion_ts", current_timestamp())
    )

@dlt.table
@dlt.expect_or_drop("valid_id", "order_id IS NOT NULL")
@dlt.expect_or_drop("positive_amount", "amount > 0")
def silver_orders():
    return (
        dlt.read_stream("bronze_orders")
        .select(
            col("order_id"),
            col("customer_id"),
            col("amount").cast("double"),
            col("status"),
            col("ingestion_ts")
        )
    )

@dlt.table
def gold_daily_revenue():
    return (
        dlt.read("silver_orders")
        .groupBy("customer_id")
        .agg({"amount": "sum"})
        .withColumnRenamed("sum(amount)", "total_revenue")
    )`,
          },
          {
            type: 'card',
            title: 'Decorators Python dlt — Riepilogo',
            items: [
              '@dlt.table — Dichiara una streaming table o materialized view',
              '@dlt.expect("name", "condition") — Warn su violazione',
              '@dlt.expect_or_drop("name", "condition") — DROP ROW su violazione',
              '@dlt.expect_or_fail("name", "condition") — FAIL UPDATE su violazione',
              '@dlt.expect_all({"name": "condition", ...}) — Multipli expectations in unico decorator',
              '@dlt.expect_all_or_drop({"name": "condition", ...}) — Multipli con drop',
              '@dlt.expect_all_or_fail({"name": "condition", ...}) — Multipli con fail',
              'dlt.read_stream("table") — Legge da streaming table (solo in @dlt.table)',
              'dlt.read("table") — Legge l\'intera tabella (batch, per materialized views)',
            ]
          },

          // ── PIPELINE UI ──
          {
            type: 'heading',
            level: 3,
            text: 'IDE per Data Engineering e UI Pipeline',
          },
          {
            type: 'paragraph',
            text: 'Databricks fornisce un IDE dedicato per Lakeflow Spark Declarative Pipelines con: dependency graph interattivo, preview dati, errori contestuali, esecuzione selettiva (singola tabella, file, o intera pipeline), e integrazione Git per CI/CD.',
          },
          {
            type: 'card',
            title: 'Funzionalità dell\'IDE Pipeline',
            items: [
              'Dependency graph: visualizza le dipendenze tra dataset, navigazione rapida al codice',
              'Esecuzione selettiva: run singola tabella, file, o intera pipeline',
              'Data preview: ispeziona dati tabella senza uscire dall\'editor',
              'Errori contestuali: errori visualizzati accanto al codice con suggerimenti fix',
              'Genie Code: generazione AI di codice pipeline, debugging, e ottimizzazione',
              'Integrazione CI/CD: Databricks Asset Bundles per deploy e test automatizzati',
              'Git folders: version control, code review, pull request',
              'Pipeline filter: filtra per tag e identità',
            ]
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 3.5 — DDL/DML Features
      // ═══════════════════════════════════════════════════════════
      '3.5': {
        sectionId: '3',
        title: '3.5 — Identify DDL (Data Definition Language) / DML features',
        subtitle: 'CREATE, ALTER, DROP, INSERT, UPDATE, DELETE, MERGE INTO',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'DDL (Data Definition Language)',
          },
          {
            type: 'paragraph',
            text: 'I comandi DDL definiscono o modificano la struttura delle tabelle. In Databricks, tutte le tabelle sono Delta Lake per default.',
          },
          {
            type: 'table',
            headers: ['Comando', 'Descrizione', 'Esempio'],
            rows: [
              ['CREATE TABLE', 'Crea tabella Delta da definizione o da query', 'CREATE TABLE t (id INT, name STRING) USING DELTA;'],
              ['CREATE OR REPLACE TABLE', 'Crea o sostituisce tabella (atomico)', 'CREATE OR REPLACE TABLE t AS SELECT * FROM s;'],
              ['CREATE TABLE LIKE', 'Copia schema e proprietà (nessun dato)', 'CREATE TABLE t2 LIKE t1;'],
              ['CREATE VIEW', 'Crea vista virtuale', 'CREATE VIEW v AS SELECT * FROM t WHERE ...;'],
              ['CREATE DATABASE/SCHEMA', 'Crea schema/database', 'CREATE SCHEMA IF NOT EXISTS my_schema;'],
              ['ALTER TABLE', 'Modifica struttura tabella', 'ALTER TABLE t ADD COLUMNS (age INT);'],
              ['ALTER TABLE RENAME TO', 'Rinomina tabella', 'ALTER TABLE t RENAME TO t_new;'],
              ['ALTER TABLE CLUSTER BY', 'Abilita Liquid Clustering', 'ALTER TABLE t CLUSTER BY (col1, col2);'],
              ['ALTER TABLE SET TBLPROPERTIES', 'Imposta proprietà', 'ALTER TABLE t SET TBLPROPERTIES (key=\'val\');'],
              ['DROP TABLE', 'Elimina tabella e dati', 'DROP TABLE IF EXISTS t;'],
              ['TRUNCATE TABLE', 'Svuota tabella (mantiene struttura)', 'TRUNCATE TABLE t;'],
              ['DESCRIBE TABLE', 'Mostra schema e metadati', 'DESCRIBE TABLE EXTENDED t;'],
              ['SHOW TABLES', 'Elenca tabelle', 'SHOW TABLES IN my_schema;'],
            ]
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'ALTER TABLE — Operazioni su colonne',
            code: `-- Aggiungere colonne
ALTER TABLE customers ADD COLUMNS (age INT, email STRING);

-- Rinominare colonna
ALTER TABLE customers RENAME COLUMN email TO email_address;

-- Modificare tipo colonna (type widening: INT → LONG, FLOAT → DOUBLE)
ALTER TABLE customers ALTER COLUMN age TYPE BIGINT;

-- Eliminare colonna
ALTER TABLE customers DROP COLUMN email_address;

-- Modificare commento colonna
ALTER TABLE customers ALTER COLUMN age COMMENT 'Età del cliente';

-- Spostare ordine colonne
ALTER TABLE customers ALTER COLUMN age AFTER name;

-- Valore default per nuove righe
ALTER TABLE customers ALTER COLUMN status SET DEFAULT 'ACTIVE';`,
          },
          {
            type: 'exam_tip',
            text: 'CREATE OR REPLACE TABLE è <strong>atomico</strong> — sostituisce tabella e dati in una singola operazione. CREATE TABLE LIKE copia solo schema e properties (utile per promuovere tabelle tra ambienti). ALTER TABLE ADD COLUMNS non supporta DEFAULT per colonne nuove su tabelle esistenti (le righe esistenti avranno NULL).',
          },

          // ── DML ──
          {
            type: 'heading',
            level: 3,
            text: 'DML (Data Manipulation Language)',
          },
          {
            type: 'paragraph',
            text: 'I comandi DML modificano i dati all\'interno delle tabelle. Delta Lake supporta le operazioni DML standard con semantiche ACID.',
          },
          {
            type: 'table',
            headers: ['Comando', 'Descrizione', 'Note'],
            rows: [
              ['INSERT INTO', 'Inserisce nuove righe', 'Append mode — non controlla duplicati.'],
              ['INSERT OVERWRITE', 'Sostituisce righe (con partizioni o completo)', 'Operazione atomica — può essere partizionata.'],
              ['UPDATE', 'Modifica righe esistenti', 'WHERE condizione opzionale. Non supportato in streaming mode.'],
              ['DELETE', 'Elimina righe', 'WHERE condizione opzionale. Non supportato in streaming mode.'],
              ['MERGE INTO', 'Upsert (insert + update + delete) in unico comando', 'Supporta WHEN MATCHED, NOT MATCHED, NOT MATCHED BY SOURCE.'],
              ['MERGE WITH SCHEMA EVOLUTION', 'Come MERGE MA aggiorna anche lo schema target', 'Aggiunge colonne mancanti dal source al target automaticamente.'],
            ]
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'INSERT e INSERT OVERWRITE',
            code: `-- INSERT: append nuove righe
INSERT INTO customers VALUES (1, 'Mario', 30, 'mario@test.com');

-- INSERT FROM SELECT
INSERT INTO customers
SELECT id, name, age, email FROM new_customers;

-- INSERT OVERWRITE: sostituisce partizione specifica
INSERT OVERWRITE customers PARTITION (region = 'EU')
SELECT id, name, age FROM eu_customers;

-- INSERT OVERWRITE: sostituisce INTERA tabella
INSERT OVERWRITE customers
SELECT * FROM all_customers;`,
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'UPDATE e DELETE',
            code: `-- UPDATE: modifica righe condizionali
UPDATE customers
SET status = 'INACTIVE', updated_at = current_timestamp()
WHERE last_purchase < '2024-01-01';

-- DELETE: elimina righe condizionali
DELETE FROM customers
WHERE status = 'INACTIVE' AND last_purchase < '2020-01-01';`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'MERGE INTO — L\'operazione DML più Importante',
          },
          {
            type: 'paragraph',
            text: 'MERGE INTO (anche detto "upsert") è l\'operazione DML più potente e più testata all\'esame. Permette di sincronizzare una tabella target con una sorgente in un unico comando atomico con supporto ACID.',
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'MERGE INTO — Pattern Upsert Base',
            code: `-- UPSERT classico: se match → UPDATE, altrimenti → INSERT
MERGE INTO target AS t
USING source AS s
ON t.key = s.key
WHEN MATCHED THEN
  UPDATE SET *
WHEN NOT MATCHED THEN
  INSERT *;`,
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'MERGE INTO — Pattern Avanzati',
            code: `-- DEDUP: solo insert dei nuovi (nessun update)
MERGE INTO target AS t
USING source AS s
ON t.key = s.key
WHEN NOT MATCHED THEN INSERT *;

-- DELETE su match + insert su non match
MERGE INTO target AS t
USING source AS s
ON t.key = s.key
WHEN MATCHED THEN DELETE
WHEN NOT MATCHED THEN INSERT *;

-- SCHEMA EVOLUTION: aggiunge colonne automaticamente
MERGE WITH SCHEMA EVOLUTION INTO target AS t
USING source AS s
ON t.key = s.key
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;

-- WHEN NOT MATCHED BY SOURCE: elimina righe target senza match in source
MERGE INTO target AS t
USING (
  SELECT * FROM source WHERE created_at >= current_date() - INTERVAL '5' DAY
) AS s
ON t.key = s.key
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *
WHEN NOT MATCHED BY SOURCE AND t.created_at >= current_date() - INTERVAL '5' DAY
  THEN DELETE;

-- EXCEPT: esclude colonne specifiche dall'update/insert
MERGE INTO target AS t
USING source AS s
ON t.key = s.key
WHEN MATCHED THEN UPDATE SET * EXCEPT (created_at)
WHEN NOT MATCHED THEN INSERT * EXCEPT (created_at);`,
          },
          {
            type: 'table',
            headers: ['Clausola', 'Quando si attiva', 'Azioni possibili'],
            rows: [
              ['WHEN MATCHED', 'Source matcha target sulla ON condition', 'UPDATE SET / DELETE'],
              ['WHEN NOT MATCHED [BY TARGET]', 'Source NON matcha target', 'INSERT'],
              ['WHEN NOT MATCHED BY SOURCE', 'Target NON matcha source', 'UPDATE SET / DELETE'],
            ]
          },
          {
            type: 'exam_tip',
            text: 'MERGE INTO è il comando DML più IMPORTANTE per l\'esame. Ricorda: (1) UPDATE SET * aggiorna TUTTE le colonne. (2) WHEN NOT MATCHED BY SOURCE è disponibile da DBR 12.2 LTS+. (3) WITH SCHEMA EVOLUTION aggiunge colonne automaticamente al target. (4) EXCEPT esclude colonne specifiche. (5) Solo UNA riga source può matchare UNA riga target.',
          },

          // ── TIME TRAVEL ──
          {
            type: 'heading',
            level: 3,
            text: 'Time Travel — Versioning dei Dati',
          },
          {
            type: 'paragraph',
            text: 'Delta Lake mantiene uno storico completo delle modifiche. Puoi accedere a versioni precedenti dei dati usando il time travel.',
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Time Travel — Leggere versioni passate',
            code: `-- Leggere versione specifica (version number)
SELECT * FROM my_table VERSION AS OF 42;

-- Leggere dati a una data specifica
SELECT * FROM my_table TIMESTAMP AS OF '2025-12-01T00:00:00Z';

-- Leggere dati usando interval
SELECT * FROM my_table TIMESTAMP AS OF current_date() - INTERVAL '7' DAYS;

-- DESCRIBE HISTORY: mostra storico versioni
DESCRIBE HISTORY my_table;

-- RESTORE: ripristina a versione precedente
RESTORE TABLE my_table TO VERSION AS OF 42;`,
          },
          {
            type: 'key_point',
            text: 'DESCRIBE HISTORY mostra: version, timestamp, operation (WRITE, DELETE, MERGE, UPDATE), operationMetrics (numRows, numFiles), user. VACUUM elimina i file delle versioni più vecchie della retention period (default 7 giorni). Time travel funziona solo ENTRO il retention period.',
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 3.6 — PySpark Complex Aggregations
      // ═══════════════════════════════════════════════════════════
      '3.6': {
        sectionId: '3',
        title: '3.6 — Compute complex aggregations and metrics with PySpark DataFrames',
        subtitle: 'GroupBy, Aggregazioni, Window Functions, Best Practice',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'GroupBy + Aggregazioni',
          },
          {
            type: 'paragraph',
            text: 'Le aggregazioni in PySpark permettono di riassumere dati a diversi livelli di granularità. <strong>groupBy</strong> collassa le righe (una riga per gruppo), mentre le <strong>window functions</strong> preservano le righe originali aggiungendo colonne calcolate.',
          },
          {
            type: 'code',
            lang: 'python',
            label: 'GroupBy — Aggregazioni di Base',
            code: `from pyspark.sql import functions as F

# groupBy singola colonna — una riga per regione
df_grouped = (df
    .groupBy("region")
    .agg(
        F.count("*").alias("total_orders"),
        F.countDistinct("customer_id").alias("unique_customers"),
        F.sum("amount").alias("total_revenue"),
        F.avg("amount").alias("avg_order_value"),
        F.min("amount").alias("min_order"),
        F.max("amount").alias("max_order"),
        F.stddev("amount").alias("std_amount"),
        F.collect_set("status").alias("distinct_statuses")
    )
)

# Multipla groupBy — più colonne
df_multi = (df
    .groupBy("region", "status")
    .agg(
        F.sum("amount").alias("total"),
        F.count("*").alias("count")
    )
    .orderBy("region", "status")
)

# GROUP BY ALL — raggruppa per TUTTE le colonne non aggregate
df_all = (df
    .groupBy("region", "order_date")
    .agg(F.sum("amount").alias("daily_revenue"))
)

# GROUP BY con rollup (sottototali)
df_rollup = (df
    .rollup("region", "status")
    .agg(F.sum("amount").alias("total"), F.count("*").alias("count"))
    .orderBy("region", "status")
)

# GROUP BY con cube (tutte le combinazioni)
df_cube = (df
    .cube("region", "status")
    .agg(F.sum("amount").alias("total"), F.count("*").alias("count"))
    .orderBy("region", "status")
)`,
          },
          {
            type: 'exam_tip',
            text: 'Usa <strong>countDistinct</strong> per contare entità uniche (es. "quanti clienti hanno ordinato") non count(*) che conta le righe. <strong>GROUP BY ALL</strong> raggruppa per tutte le colonne non aggregate — utile quando non vuoi elencare ogni colonna. <strong>Rollup</strong> aggiunge subtotali gerarchici, <strong>cube</strong> aggiunge tutte le combinazioni.',
          },

          // ── PIVOT ──
          {
            type: 'heading',
            level: 3,
            text: 'Pivot — Trasformare Righe in Colonne',
          },
          {
            type: 'code',
            lang: 'python',
            label: 'Pivot per aggregazioni cross-tab',
            code: `# Pivot: trasformo i valori di "status" in colonne
df_pivot = (df
    .groupBy("region")
    .pivot("status", ["PENDING", "COMPLETED", "CANCELLED"])
    .agg(F.sum("amount").alias("total"), F.count("*").alias("count"))
    .orderBy("region")
)

# Approccio SQL equivalente
spark.sql("""
  SELECT *
  FROM (
    SELECT region, status, amount
    FROM orders
  )
  PIVOT (
    SUM(amount) AS total, COUNT(*) AS count
    FOR status IN ('PENDING', 'COMPLETED', 'CANCELLED')
  )
  ORDER BY region
""").show()`,
          },
          {
            type: 'key_point',
            text: 'Pivot è utile per creare tabelle cross-tab (crosstab). I valori della colonna pivot diventano nomi di colonna. Specifica esplicitamente i valori se possibili per performance. Senza la lista, Spark li deduce con un job aggiuntivo.',
          },

          // ── WINDOW FUNCTIONS ──
          {
            type: 'heading',
            level: 3,
            text: 'Window Functions — Aggregazioni che Preservano le Righe',
          },
          {
            type: 'paragraph',
            text: 'Le window functions calcolano valori su un insieme di righe correlate alla riga corrente, senza collassare il risultato. Ogni riga mantiene la sua identità originale mentre riceve un valore calcolato dal suo gruppo. Fondamentali per ranking, running totals, confronti period-over-period e deduplicazione.',
          },
          {
            type: 'code',
            lang: 'python',
            label: 'Window Functions — Pattern Fondamentali',
            code: `from pyspark.sql import Window
from pyspark.sql import functions as F

# WindowSpec: partitionBy + orderBy + frame
w_dept = Window.partitionBy("department").orderBy("salary")

# ── Ranking Functions ──
df_rank = df.withColumn("row_num", F.row_number().over(w_dept))
df_rank = df.withColumn("rank", F.rank().over(w_dept))
df_rank = df.withColumn("dense_rank", F.dense_rank().over(w_dept))
df_rank = df.withColumn("ntile_4", F.ntile(4).over(w_dept))

# ── Analytic Functions (offset) ──
w_ordered = Window.partitionBy("customer_id").orderBy("order_date")
df_analytic = (df
    .withColumn("prev_amount", F.lag("amount", 1).over(w_ordered))
    .withColumn("next_amount", F.lead("amount", 1).over(w_ordered))
    .withColumn("first_amount", F.first("amount").over(w_ordered))
    .withColumn("last_amount", F.last("amount").over(
        w_ordered.rowsBetween(Window.unboundedPreceding, Window.unboundedFollowing)))
)

# ── Window Aggregate Functions ──
w_partition = Window.partitionBy("department")
df_window_agg = (df
    .withColumn("dept_avg", F.avg("salary").over(w_partition))
    .withColumn("dept_sum", F.sum("salary").over(w_partition))
    .withColumn("dept_count", F.count("*").over(w_partition))
    .withColumn("dept_min", F.min("salary").over(w_partition))
    .withColumn("dept_max", F.max("salary").over(w_partition))
)

# ── Running Total (con frame esplicito) ──
w_running = Window.partitionBy("customer_id") \\
    .orderBy("order_date") \\
    .rowsBetween(Window.unboundedPreceding, Window.currentRow)
df_running = df.withColumn("running_total", F.sum("amount").over(w_running))

# ── Moving Average (3 periodi) ──
w_ma = Window.partitionBy("customer_id") \\
    .orderBy("order_date") \\
    .rowsBetween(-2, Window.currentRow)
df_ma = df.withColumn("moving_avg_3", F.avg("amount").over(w_ma))`,
          },
          {
            type: 'table',
            headers: ['Funzione', 'Cosa fa', 'Richiede ORDER BY?'],
            rows: [
              ['row_number()', 'Numero sequenziale univoco (nessun pareggio)', 'Sì'],
              ['rank()', 'Classifica con buchi in caso di pareggio', 'Sì'],
              ['dense_rank()', 'Classifica senza buchi', 'Sì'],
              ['ntile(n)', 'Divide in n bucket', 'Sì'],
              ['lag(col, n)', 'Valore n righe prima', 'Sì'],
              ['lead(col, n)', 'Valore n righe dopo', 'Sì'],
              ['first(col)', 'Primo valore del frame', 'Sì (per senso)'],
              ['last(col)', 'Ultimo valore del frame', 'Sì (per senso)'],
              ['sum/avg/count/min/max', 'Aggregazioni sul window', 'No (senza ORDER BY = intera partizione)'],
            ]
          },
          {
            type: 'exam_tip',
            text: 'ATTENZIONE: senza ORDER BY, sum() su window restituisce il totale della partizione. Con ORDER BY, sum() diventa un <strong>running total</strong> (frame default: RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW). Usa <strong>rowsBetween</strong> per frame esplicito. Window functions NON possono essere annidate.',
          },

          // ── GROUPBY VS WINDOW ──
          {
            type: 'heading',
            level: 3,
            text: 'groupBy vs Window — Quando Usare Cosa',
          },
          {
            type: 'table',
            headers: ['Scenario', 'groupBy + agg()', 'Window Function'],
            rows: [
              ['Output righe', 'Una riga per gruppo', 'Tutte le righe originali preservate'],
              ['Altre colonne', 'Solo colonne grouped/aggregate', 'Tutte le colonne accessibili'],
              ['Ranking', 'Non possibile', 'row_number, rank, dense_rank'],
              ['Running totals', 'Non possibile', 'sum().over() con frame cumulativo'],
              ['Period comparison', 'Non possibile', 'lag() / lead()'],
              ['Deduplication', 'join + groupBy', 'row_number() = 1 (più comune)'],
              ['Percentile per gruppo', 'Non possibile', 'percent_rank(), cume_dist()'],
              ['Performance', 'Singolo shuffle', 'Può richiedere shuffle + sort'],
            ]
          },
          {
            type: 'code',
            lang: 'python',
            label: 'Deduplicazione con Window + row_number()',
            code: `# Pattern più comune per dedup: mantieni il record più recente
from pyspark.sql import Window
from pyspark.sql import functions as F

w = Window.partitionBy("customer_id").orderBy(F.col("updated_at").desc())

df_deduped = (df
    .withColumn("rn", F.row_number().over(w))
    .filter(F.col("rn") == 1)
    .drop("rn")
)

# Pattern dedup alternativo (più performante per dataset enormi)
# Se vuoi solo l'ultimo timestamp, groupBy + join è più economico
max_ts = df.groupBy("customer_id").agg(F.max("updated_at").alias("max_ts"))
df_deduped_v2 = (df
    .join(max_ts, ["customer_id"])
    .filter(F.col("updated_at") == F.col("max_ts"))
    .drop("max_ts")
)`,
          },
          {
            type: 'key_point',
            text: 'La deduplicazione con row_number() = 1 è il pattern più comune e più testato all\'esame. Per dataset enormi, considera groupBy + join (più economico). Aggiungi sempre un tiebreaker nell\'orderBy se possono esistere righe con lo stesso timestamp.',
          },

          // ── AGG FUNCTIONS ──
          {
            type: 'heading',
            level: 3,
            text: 'Funzioni di Aggregazione Avanzate',
          },
          {
            type: 'code',
            lang: 'python',
            label: 'Aggregazioni Avanzate',
            code: `from pyspark.sql import functions as F

# approx_count_distinct: stima senza count esatto (HyperLogLog)
df_approx = df.agg(
    F.approx_count_distinct("customer_id").alias("approx_unique_customers"),
    F.countDistinct("customer_id").alias("exact_unique_customers")
)

# collect_list / collect_set: lista/set di valori per gruppo
df_agg_list = (df
    .groupBy("region")
    .agg(
        F.collect_list("customer_id").alias("all_customers_list"),
        F.collect_set("customer_id").alias("unique_customers_set")
    )
)

# skewness / kurtosis: distribuzione statistica
df_stats = df.agg(
    F.skewness("amount").alias("skewness"),
    F.kurtosis("amount").alias("kurtosis"),
    F.corr("age", "amount").alias("age_amount_correlation"),
    F.covar_samp("age", "amount").alias("covariance")
)

# first / last (con ignorenulls)
df_first_last = (df
    .groupBy("customer_id")
    .agg(
        F.first("order_date", ignorenulls=True).alias("first_order"),
        F.last("order_date", ignorenulls=True).alias("last_order")
    )
)`,
          },
          {
            type: 'exam_tip',
            text: 'approx_count_distinct è utile per dataset enormi dove il count esatto è troppo costoso. collect_set è utile per creare array di valori unici. La correlazione (corr) è tra due colonne numeriche. first/last con ignorenulls=True salta i valori null.',
          },

          // ── BEST PRACTICES ──
          {
            type: 'heading',
            level: 3,
            text: 'Best Practice per Performance',
          },
          {
            type: 'card',
            title: 'Consigli di Ottimizzazione',
            items: [
              'Filtra prima, aggrega dopo: riduci i dati prima dello shuffle',
              'Usa AQE (Adaptive Query Execution): spark.sql.adaptive.enabled = true (default)',
              'Reuse WindowSpec: riutilizza lo stesso oggetto Window per più calcoli',
              'partitionBy su colonne a bassa cardinalità: evita milioni di piccole partizioni',
              'Cache selettiva: non overcache — solo dataset usati multiple volte',
              'groupBy > window: se vuoi solo summary, usa groupBy (più economico)',
              'Evita UDF se possibile: preferisci funzioni native Spark e Photon',
              'Spill monitoring: se vedi spill su disco, aumenta memoria worker o ottimizza join',
              'Query profiling: usa query profile (non Spark UI in serverless) per diagnosticare',
            ]
          },
          {
            type: 'paragraph',
            text: 'Per l\'esame, ricorda che le window functions causano uno shuffle (repartizione) + un sort, mentre groupBy causa un solo shuffle. Scegli in base al bisogno: se devi preservare le righe, usa window; se vuoi solo summary, usa groupBy.',
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 4.1 — DAB vs Traditional Deployment
      // ═══════════════════════════════════════════════════════════
      '4.1': {
        sectionId: '4',
        title: '4.1 — Identify the difference between Databricks Asset Bundles and traditional deployment methods',
        subtitle: 'DAB vs manual deployment, CI/CD, Infrastucture as Code',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'Databricks Asset Bundles (DAB)',
          },
          {
            type: 'paragraph',
            text: 'I <strong>Databricks Asset Bundles</strong> (ora chiamati Declarative Automation Bundles) sono uno strumento di deployment dichiarativo che permette di definire, pacchettizzare e distribuire risorse Databricks (job, pipeline, notebook, dashboard, model serving, ecc.) usando file YAML. Seguono il paradigma <strong>Infrastructure as Code (IaC)</strong> e si integrano con CI/CD.',
          },
          {
            type: 'table',
            headers: ['Caratteristica', 'DAB (Declarative Automation Bundles)', 'Metodi Tradizionali'],
            rows: [
              ['Approccio', 'Dichiarativo (YAML): definisci COSA, non COME', 'Imperativo: script, UI manuale, REST API ad hoc'],
              ['Riproducibilità', 'Identico deployment in ogni ambiente', 'Differenze tra ambienti per configurazioni manuali'],
              ['Environment targeting', 'Targets nativi in databricks.yml (dev/staging/prod)', 'Script separati o configurazioni manuali per ambiente'],
              ['CI/CD Integration', 'Nativa: bundle validate, bundle deploy, bundle run', 'Script personalizzati, librerie esterne (Jenkins, Airflow)'],
              ['Version control', 'Tutte le risorse in YAML versionabili con Git', 'Notebook e codice versionati, ma configurazioni no'],
              ['Gestione errori', 'Validazione pre-deploy (bundle validate)', 'Errori runtime in produzione'],
              ['Multi-workspace', 'Nativo: deploy a workspace diversi da stesso bundle', 'Script ad hoc, configurazioni duplicati'],
              ['Curva di apprendimento', 'Richiede conoscenza YAML e CLI', 'Minima: UI o notebook direkt'],
            ]
          },
          {
            type: 'key_point',
            text: 'I DAB sono il metodo <strong>raccomandato</strong> da Databricks per deployment ripetibili e multi-ambiente. Integrano source control, code review, testing, e CI/CD. Usano il comando <strong>databricks bundle</strong> della Databricks CLI per validare, deployare ed eseguire.',
          },

          // ── TRADITIONAL ──
          {
            type: 'heading',
            level: 3,
            text: 'Metodi Tradizionali di Deployment',
          },
          {
            type: 'table',
            headers: ['Metodo', 'Descrizione', 'Quando usarlo'],
            rows: [
              ['Git folders', 'Sincronizza repository Git con workspace Databricks. Codice versionato ma configurazioni no.', 'Sviluppo collaborativo, source control semplice.'],
              ['Git with jobs', 'Job esegue codice direttamente da repository Git. Solo notebook/code versionati.', 'Job semplici senza bisogno di multi-ambiente.'],
              ['Manuale (UI)', 'Import/export notebook, creazione job a mano nella UI.', 'Prototipazione rapida, ambienti singoli.'],
              ['REST API / SDK', 'Script personalizzati che chiamano API Databricks per creare risorse.', 'Automation custom, integrazione con sistemi esistenti.'],
              ['Terraform', 'Provisioning infrastruttura Databricks (workspace, metastore, network).', 'Infrastruttura, NON deployment di job/pipeline.'],
            ]
          },
          {
            type: 'exam_tip',
            text: 'Per l\'esame: <strong>DAB</strong> è per application deployment (job, pipeline, notebook). <strong>Terraform</strong> è per infrastructure provisioning (workspace, cluster policies, networking). Sono complementari, NON intercambiabili. Se la domanda parla di "deploy di job in più ambienti" → DAB. Se parla di "creare workspace" → Terraform.',
          },

          // ── DAB vs TERRAFORM ──
          {
            type: 'heading',
            level: 3,
            text: 'DAB vs Terraform',
          },
          {
            type: 'table',
            headers: ['Area', 'DAB', 'Terraform'],
            rows: [
              ['Scopo primario', 'Application deployment (job, pipeline, codici)', 'Infrastructure provisioning (cluster, workspace, networking)'],
              ['CI/CD Integration', 'Built-in (bundle validate, bundle deploy)', 'Richiede scripting esterno'],
              ['Environment overrides', 'Nativo via targets: in databricks.yml', 'Variable files e logica condizionale'],
              ['Secrets/Mounts', 'Non gestito (deve essere separato)', 'Gestisce secrets, scopes, mounts'],
              ['Formato', 'YAML dichiarativo', 'HCL (HashiCorp Language)'],
            ]
          },
          {
            type: 'paragraph',
            text: 'Nella pratica, la maggior parte dei team usa entrambi: <strong>Terraform per l\'infrastruttura</strong> e <strong>DAB per il deployment delle applicazioni</strong>. I DAB sono ora il tool raccomandato per CI/CD su Databricks.',
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 4.2 — Structure of Asset Bundles
      // ═══════════════════════════════════════════════════════════
      '4.2': {
        sectionId: '4',
        title: '4.2 — Identify the structure of Databricks Asset Bundles',
        subtitle: 'databricks.yml, resources, targets, variables',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'Struttura di un Bundle',
          },
          {
            type: 'paragraph',
            text: 'Un bundle è una raccolta di file YAML e sorgenti che definiscono un progetto Databricks completo. La struttura del bundle segue una convenzione precisa con un file principale <strong>databricks.yml</strong> e file di risorse opzionali inclusi.',
          },
          {
            type: 'key_point',
            text: 'Ogni bundle deve contenere UN (e un solo) file <strong>databricks.yml</strong> nella root del progetto. È il file di configurazione principale che definisce il bundle, i target, le variabili e i riferimenti ad altri file di configurazione.',
          },
          {
            type: 'code',
            lang: 'yaml',
            label: 'Struttura tipica di un progetto bundle',
            code: `my_project/
├── databricks.yml              # File principale (obbligatorio, uno solo)
├── resources/
│   ├── job.yml                 # Definizione job
│   └── pipeline.yml            # Definizione pipeline LDP
├── src/
│   ├── notebook1.py            # Codice notebook
│   └── etl_script.py           # Python script
├── tests/
│   └── test_etl.py             # Test unitari
├── conf/
│   ├── dev.yml                 # Override per ambiente dev
│   └── prod.yml                # Override per ambiente prod
└── requirements.txt            # Dipendenze Python`,
          },
          {
            type: 'code',
            lang: 'yaml',
            label: 'Esempio databricks.yml completo',
            code: `# yaml-language-server: $schema=bundle_config_schema.json
bundle:
  name: my_etl_project

include:
  - resources/*.yml

variables:
  env:
    description: Environment name
    default: dev
  warehouse_id:
    description: SQL Warehouse ID

workspace:
  host: https://myworkspace.cloud.databricks.com
  root_path: /Workspace/Users/\${workspace.current_user.short_name}/.bundle/\${bundle.name}/\${bundle.target}

resources:
  jobs:
    bronze_to_silver_job:
      name: Bronze to Silver Pipeline
      job_clusters:
        - job_cluster_key: etl_cluster
          new_cluster:
            spark_version: 14.3.x-photon-scala2.12
            node_type_id: i3.xlarge
            num_workers: 4
            runtime_engine: PHOTON
      tasks:
        - task_key: ingest_bronze
          job_cluster_key: etl_cluster
          notebook_task:
            notebook_path: ./src/ingest_bronze.py
        - task_key: transform_silver
          depends_on:
            - task_key: ingest_bronze
          job_cluster_key: etl_cluster
          notebook_task:
            notebook_path: ./src/transform_silver.py

targets:
  dev:
    mode: development
    default: true
    workspace:
      host: https://dev-workspace.cloud.databricks.com
    variables:
      env: dev
  prod:
    mode: production
    workspace:
      host: https://prod-workspace.cloud.databricks.com
    variables:
      env: prod`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'Sezioni Principali di databricks.yml',
          },
          {
            type: 'table',
            headers: ['Sezione', 'Obbligatoria?', 'Descrizione'],
            rows: [
              ['bundle', 'Sì', 'Definisce il nome logico del bundle. Può contenere databricks_cli_version per vincolare versione CLI.'],
              ['include', 'No', 'Lista di path glob per includere file di risorse aggiuntivi. Senza include, puoi definire risorse direttamente in databricks.yml.'],
              ['variables', 'No', 'Dichiara variabili con descrizione e default. Sovrascrivibili nei target.'],
              ['workspace', 'No', 'Specifiche del workspace: host, root_path, artifact_path, file_path, profile.'],
              ['resources', 'No', 'Definisce le risorse Databricks: jobs, pipelines, dashboards, model serving, experiments, ecc.'],
              ['targets', 'No', 'Contesti di deployment: ogni target (dev, staging, prod) ha workspace e variabili specifici.'],
              ['artifacts', 'No', 'Definisce artefatti da costruire: wheel Python, JAR, ecc. con comandi build e path.'],
              ['sync', 'No', 'Specifica file locali da sincronizzare con il workspace. Include/exclude patterns.'],
              ['presets', 'No', 'Impostazioni predefinite per il bundle (tags, ecc.).'],
            ]
          },
          {
            type: 'card',
            title: 'Comandi CLI per Bundle (ciclo di vita)',
            items: [
              'databricks bundle init — Crea un nuovo bundle da template (default o custom)',
              'databricks bundle validate — Valida la configurazione YAML (controlla errori pre-deploy)',
              'databricks bundle deploy — Deploya il bundle al workspace target',
              'databricks bundle run — Esegue un job o risorsa definita nel bundle',
              'databricks bundle destroy — Rimuove risorse deployate dal workspace',
              'databricks bundle generate — Genera configurazione YAML da risorsa esistente nel workspace',
              'databricks bundle deployment bind — Collega configurazione bundle a risorsa workspace esistente',
              'databricks bundle schema — Genera JSON schema per validazione YAML in IDE',
            ]
          },
          {
            type: 'exam_tip',
            text: 'Per l\'esame: la struttura base del bundle è: <strong>databricks.yml</strong> (obbligatorio) + <strong>resources/*.yml</strong> (inclusi via include). I <strong>targets</strong> permettono configurazioni diverse per ambiente. Le <strong>variables</strong> sono sovrascrivibili per target. <strong>mode</strong> può essere development o production. La <strong>root_path</strong> definisce dove vengono deployate le risorse nel workspace.',
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 4.3 — Deploy, Repair & Rerun Workflows
      // ═══════════════════════════════════════════════════════════
      '4.3': {
        sectionId: '4',
        title: '4.3 — Deploy a workflow, repair, and rerun a task in case of failure',
        subtitle: 'Lakeflow Jobs, DAG, Repair Run, Run If, For Each',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'Lakeflow Jobs — Orchestrazione dei Workflow',
          },
          {
            type: 'paragraph',
            text: '<strong>Lakeflow Jobs</strong> (ex Databricks Workflows) è l\'orchestratore built-in di Databricks per pipeline di dati multi-task. Supporta DAG di task con dipendenze, esecuzione parallela, conditional branching e looping.',
          },
          {
            type: 'table',
            headers: ['Task Type', 'Cosa esegue'],
            rows: [
              ['Notebook', 'Esegue notebook Databricks (Python, SQL, Scala, R)'],
              ['Python script', 'Esegue file .py dal workspace'],
              ['Python wheel', 'Esegue pacchetto wheel Python'],
              ['SQL', 'Esegue query SQL su SQL warehouse'],
              ['dbt', 'Esegua comandi dbt'],
              ['Spark JAR', 'Esegue JAR Spark'],
              ['Spark Submit', 'Esegue comandi spark-submit'],
              ['Run job', 'Triggera un altro job nel workspace (annidamento)'],
              ['For each', 'Loop su array di parametri, esegue task per ogni iterazione'],
              ['If/else condition', 'Branching condizionale basato su espressione booleana'],
              ['Pipeline (LDP)', 'Esegue un update di Lakeflow Declarative Pipeline'],
              ['Lakeflow Connect', 'Esegue ingestion via Lakeflow Connect (Salesforce, Workday, ecc.)'],
            ]
          },
          {
            type: 'key_point',
            text: 'I task in un job formano un <strong>Directed Acyclic Graph (DAG)</strong>. Ogni task può dipendere da zero o più task upstream. Databricks esegue i task upstream prima dei downstream, parallelizzando quanto più possibile.',
          },

          // ── CONTROL FLOW ──
          {
            type: 'heading',
            level: 3,
            text: 'Control Flow — Run If Dependencies',
          },
          {
            type: 'paragraph',
            text: 'Ogni task può specificare una condizione <strong>Run if</strong> che determina se il task deve essere eseguito in base allo stato dei suoi upstream.',
          },
          {
            type: 'table',
            headers: ['Condizione', 'Comportamento'],
            rows: [
              ['All succeeded (default)', 'Esegue solo se TUTTI gli upstream sono riusciti'],
              ['At least one succeeded', 'Esegue se ALMENO UN upstream è riuscito'],
              ['None failed', 'Esegue se NESSUN upstream è fallito (almeno uno eseguito)'],
              ['All done', 'Esegue dopo che TUTTI upstream hanno finito (indipendentemente da success/failure)'],
              ['At least one failed', 'Esegue se ALMENO UN upstream è fallito'],
              ['All failed', 'Esegue se TUTTI gli upstream sono falliti'],
            ]
          },
          {
            type: 'code',
            lang: 'yaml',
            label: 'Esempio DAG con dipendenze e Run If',
            code: `# DAG: ingest → (clean_A | clean_B) → aggregate
# Se clean_A fallisce ma clean_B riesce, aggregate può comunque eseguire
# con "At least one succeeded"
tasks:
  - task_key: ingest_data
    notebook_task:
      notebook_path: ./ingest.py

  - task_key: clean_dataset_a
    depends_on:
      - task_key: ingest_data
    notebook_task:
      notebook_path: ./clean_a.py

  - task_key: clean_dataset_b
    depends_on:
      - task_key: ingest_data
    notebook_task:
      notebook_path: ./clean_b.py

  - task_key: aggregate
    depends_on:
      - task_key: clean_dataset_a
      - task_key: clean_dataset_b
    run_if: AT_LEAST_ONE_SUCCEEDED
    notebook_task:
      notebook_path: ./aggregate.py`,
          },
          {
            type: 'exam_tip',
            text: 'Run If è utile per: (1) cleanup task che deve girare ANCHE se upstream fallisce (All done), (2) notifica di errore (At least one failed), (3) pipeline che può produrre risultati parziali (At least one succeeded). Task saltati (excluded) sono trattati come successful per Run If.',
          },

          // ── REPAIR ──
          {
            type: 'heading',
            level: 3,
            text: 'Repair Run — Riparazione dopo Fallimento',
          },
          {
            type: 'paragraph',
            text: 'Quando un task fallisce in un job multi-task, puoi fare un <strong>repair run</strong> per rieseguire SOLO i task falliti e i loro downstream, senza rieseguire quelli già riusciti. Questo riduce tempo e costi di recupero.',
          },
          {
            type: 'card',
            title: 'Come funziona il Repair Run',
            items: [
              'Vai alla UI del job → tab Runs → clic sul run fallito',
              'Clicca "Repair run" — appare un dialog con la lista dei task da rieseguire',
              'Puoi modificare parametri dei task PRIMA del repair (override valori)',
              'Clicca "Repair run" — solo i task falliti e i loro downstream vengono rieseguiti',
              'Per task che condividono un job cluster, il repair crea un nuovo cluster separato (es. my_job_cluster_v1)',
              'Il repair è supportato SOLO per job con 2+ task',
              'La matrix view mostra una nuova colonna per il repair run',
            ]
          },
          {
            type: 'code',
            lang: 'text',
            label: 'Partial Repair — Esempio',
            code: `Scenario: Job con 4 task
  Ingest → Clean → Validate → Aggregate

Se Validate fallisce:
- Ingest ✅ (già riuscito, non ripetuto)
- Clean ✅ (già riuscito, non ripetuto)
- Validate ❌ (ripetuto nel repair)
- Aggregate ⏸️ (dipende da Validate, ripetuto)

Risultato: solo Validate e Aggregate vengono rieseguiti`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'For Each — Loop su Parametri Dinamici',
          },
          {
            type: 'paragraph',
            text: 'Il task <strong>For Each</strong> permette di eseguire un task in loop su un array di parametri, definiti staticamente o dinamicamente via taskValues. Supporta esecuzione concorrente fino a 100 iterazioni parallele.',
          },
          {
            type: 'exam_tip',
            text: 'Nel repair run, se solo alcune iterazioni del For Each falliscono, SOLO quelle iterazioni vengono rieseguite — non l\'intero loop. Puoi anche cambiare parametri o configurazioni PRIMA del repair. Per job continuous, Databricks applica exponential backoff sui fallimenti consecutivi.',
          },

          // ── DEPLOY ──
          {
            type: 'heading',
            level: 3,
            text: 'Deploy di un Workflow',
          },
          {
            type: 'paragraph',
            text: 'I workflow possono essere creati e deployati in diversi modi, dal più raccomandato al meno:',
          },
          {
            type: 'table',
            headers: ['Metodo', 'Raccomandato per', 'Vantaggi'],
            rows: [
              ['DAB (Declarative Automation Bundles)', 'Produzione, multi-ambiente, CI/CD', 'Versionato, ripetibile, target-aware, validate pre-deploy'],
              ['Jobs API / SDK', 'Automation custom, integrazione con orchestrazione esistente', 'Programmatico, flessibile'],
              ['UI Lakeflow Jobs', 'Sviluppo rapido, testing, job semplici', 'Nessuna curva di apprendimento, visuale'],
              ['Da notebook (scheduled)', 'Job notebook semplice, prototipazione', 'Creazione rapida dal notebook stesso'],
            ]
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 4.4 — Serverless for Production
      // ═══════════════════════════════════════════════════════════
      '4.4': {
        sectionId: '4',
        title: '4.4 — Use serverless for a hands-off, auto-optimized compute managed by Databricks',
        subtitle: 'Serverless Jobs, Performance Mode, Auto-optimization',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'Serverless Compute per Workflow',
          },
          {
            type: 'paragraph',
            text: 'Il <strong>serverless compute for workflows</strong> permette di eseguire job senza configurare e gestire infrastruttura. Databricks gestisce automaticamente risorse di calcolo, scaling, ottimizzazione e upgrade. È il metodo <strong>raccomandato</strong> per la maggior parte dei job.',
          },
          {
            type: 'key_point',
            text: 'Con serverless, Databricks gestisce automaticamente: provisioning, autoscaling, Photon, upgrade runtime, e ottimizzazione delle performance. Zero configurazione — focus solo sul codice. Autoscaling e Photon sono abilitati automaticamente.',
          },

          // ── VANTAGGI ──
          {
            type: 'card',
            title: 'Vantaggi del Serverless Compute',
            items: [
              'Zero infrastruttura da configurare: niente cluster, niente policy, niente instance type',
              'Startup in secondi (vs 3-7 minuti per classic job cluster)',
              'Autoscaling automatico: scala in base al workload, nessun idle waste',
              'Photon engine abilitato automaticamente per accelerazione query',
              'Upgrade runtime automatici: Databricks aggiorna la versione senza intervento',
              'Environment versions: API stabile per 3 anni, compatibilità garantita',
              'Performance optimized (default) o Standard mode (fino a 70% risparmio)',
              'Auto-optimization: retry automatici su fallimenti per garantire esecuzione',
              'Nessun cluster quota workspace: assorbe burst workload senza limiti',
              'Pagine solo per ciò che usi (per-second billing)',
            ]
          },
          {
            type: 'table',
            headers: ['Feature', 'Serverless Jobs', 'Classic Jobs'],
            rows: [
              ['Configurazione cluster', 'Nessuna (Databricks gestisce)', 'Manuale: spark_version, node_type, workers, policy'],
              ['Startup time', 'Secondi', '3-7 minuti'],
              ['Photon', 'Abilitato automaticamente', 'Opzionale (runtime_engine: PHOTON)'],
              ['Autoscaling', 'Automatico e gestito', 'Configurato manualmente (min/max workers)'],
              ['Upgrade Runtime', 'Automatico (Databricks)', 'Manuale (cambi spark_version)'],
              ['Init scripts', 'Non supportato', 'Supportato'],
              ['Spark config custom', 'Solo configurazioni supportate', 'Tutte le configurazioni Spark'],
              ['RDD API', 'Non supportato', 'Supportato'],
              ['Idle waste', 'Zero (paga solo esecuzione)', 'Dipende da auto-termination'],
              ['Cluster quotas', 'Nessun limite workspace', 'Soggetto a quota workspace'],
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'Performance Mode',
          },
          {
            type: 'paragraph',
            text: 'Serverless compute offre due modalità di performance che bilanciano velocità e costo:',
          },
          {
            type: 'table',
            headers: ['Modalità', 'Startup', 'Risparmio', 'Quando usarla'],
            rows: [
              ['Performance-optimized (default)', 'Istantaneo (warm pool)', '—', 'Workload interattivi, time-sensitive, notebook sviluppo.'],
              ['Standard mode', '4-6 minuti', 'Fino a 70%', 'Batch schedulati, job notturni, pipeline ETL dove la latenza non è critica.'],
            ]
          },
          {
            type: 'exam_tip',
            text: 'Standard mode è disponibile per <strong>Lakeflow Jobs</strong> e <strong>Lakeflow Pipelines</strong>, ma NON per notebook. Per job schedulati dove lo startup di 4-6 minuti è accettabile, Standard mode offre il miglior rapporto costo/performance. La modalità è configurabile dall\'apposito toggle "Performance optimized" nella pagina del job.',
          },

          // ── AUTO-OPTIMIZATION ──
          {
            type: 'heading',
            level: 3,
            text: 'Auto-Optimization e Retry Automatici',
          },
          {
            type: 'paragraph',
            text: 'Serverless compute per workflow include <strong>auto-optimization</strong>: Databricks ottimizza automaticamente le risorse di calcolo (instance type, memoria, motore) in base ai requisiti specifici del workload e ritenta automaticamente i task falliti.',
          },
          {
            type: 'card',
            title: 'Auto-Optimization: cosa fa Databricks',
            items: [
              'Seleziona automaticamente instance type ottimali per il workload',
              'Bilancia memoria e CPU per evitare OOM e spill',
              'Abilita Photon per workload che ne beneficiano',
              'Ritenta task falliti con ottimizzazione progressiva',
              'Garantisce che workload critici vengano eseguiti almeno una volta',
              'Si può disabilitare per workload at-most-once (non idempotenti)',
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'Prerequisiti e Limitazioni',
          },
          {
            type: 'table',
            headers: ['Prerequisito/Limitazione', 'Dettaglio'],
            rows: [
              ['Unity Catalog', 'Necessario: il workspace deve avere Unity Catalog abilitato'],
              ['Access mode', 'Standard access mode richiesto (non single user)'],
              ['Task supportati', 'Notebook, Python script, Python wheel, dbt, JAR'],
              ['Task NON supportati', 'Spark Submit, SQL (usa SQL warehouse invece)'],
              ['Continuous scheduling', 'Non supportato (solo schedule-based triggers)'],
              ['Structured Streaming', 'Solo Trigger.AvailableNow (no time-based intervals)'],
              ['Init scripts', 'Non supportati (usa environment per librerie)'],
              ['Spark UI', 'Non disponibile (usa query profile invece)'],
            ]
          },
          {
            type: 'exam_tip',
            text: 'Serverless è il default per tutti i task supportati quando crei un job. Databricks raccomanda serverless per TUTTI i job. Se serverless non supporta un task (es. Spark Submit), usa classic job cluster per quel task specifico — puoi mescolare compute diversi nello stesso job.',
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 4.5 — Spark UI Analysis
      // ═══════════════════════════════════════════════════════════
      '4.5': {
        sectionId: '4',
        title: '4.5 — Analyze the Spark UI to optimize query performance',
        subtitle: 'Jobs Timeline, Stages, Tasks, DAG, Query Profile',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'Spark UI — Overview',
          },
          {
            type: 'paragraph',
            text: 'La <strong>Spark UI</strong> fornisce informazioni dettagliate sull\'esecuzione dei job Spark. È il tool primario per diagnosticare colli di bottiglia di performance, problemi di memoria, skew dei dati e costi. Per serverless compute, usa il <strong>Query Profile</strong> invece della Spark UI.',
          },
          {
            type: 'table',
            headers: ['Tab Spark UI', 'Cosa mostra', 'Cosa cercare'],
            rows: [
              ['Jobs', 'Elenco job Spark, stato, durata, event timeline', 'Job più lungo, gap temporali, job falliti'],
              ['Stages', 'Dettaglio stage: task, shuffle read/write, durata', 'Stage più lungo, numero task, I/O vs CPU'],
              ['Storage', 'Informazioni RDD/DataFrame persistiti', 'Cache hit ratio, dati spillati su disco'],
              ['Environment', 'Configurazione Spark, variabili d\'ambiente, librerie', 'Config errate, versioni runtime'],
              ['Executors', 'Utilizzo memoria/disco/CPU per executor', 'Executor rimossi, memoria insufficiente, skew'],
              ['SQL', 'Piano di esecuzione fisico delle query SQL', 'Scan full table, join esplosivi, shuffle eccessivi'],
              ['Streaming', 'Statistiche streaming: input rate, batch duration', 'Batch duration > batch interval (processing lag)'],
            ]
          },
          {
            type: 'key_point',
            text: 'La Spark UI è accessibile dal tab "Spark UI" nella pagina del compute (classic). Per serverless compute, la Spark UI NON è disponibile — usa invece <strong>Query Profile</strong> (accessibile da Query History, Jobs UI, Notebook cells, e Pipeline UI).',
          },

          // ── JOBS TIMELINE ──
          {
            type: 'heading',
            level: 3,
            text: 'Jobs Timeline — Primo Step Diagnostico',
          },
          {
            type: 'paragraph',
            text: 'La <strong>event timeline</strong> nella tab Jobs è il punto di partenza per capire il tuo workload. Mostra una visualizzazione temporale di driver, executor, job e stage.',
          },
          {
            type: 'card',
            title: 'Cosa cercare nella Event Timeline',
            items: [
              'Job falliti o executor rimossi (indicati in rosso) — problema di stabilità o risorse',
              'Gap di 1+ minuto tra job — possibile coordinazione driver o attesa risorse',
              'Timeline dominata da UN lungo job — investiga quello (possibile skew o join),',
              'Tanti piccoli job (tante barre blu sottili) — overhead di scheduling, batch troppo piccoli',
              'Nessun pattern evidente — passa all\'analisi dello stage più lungo',
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'Analisi degli Stage',
          },
          {
            type: 'paragraph',
            text: 'Identifica lo <strong>stage più lungo</strong> ordinando per durata nella tab Stages. Poi analizza:',
          },
          {
            type: 'table',
            headers: ['Metrica', 'Cosa indica', 'Cosa fare'],
            rows: [
              ['Input', 'Dati letti da storage (Delta, Parquet, CSV)', 'Troppi dati? Filtra prima, pushdown predicates, pruning.'],
              ['Output', 'Dati scritti su storage', 'Scritture ottimizzate? Usa optimizeWrite.'],
              ['Shuffle Read', 'Dati letti durante shuffle', 'Troppo shuffle? Riduci join o partiziona meglio.'],
              ['Shuffle Write', 'Dati scritti durante shuffle', 'Idem. Shuffle è costoso — cerca di ridurlo.'],
              ['Numero task', 'Quanti task per questo stage', '1 solo task = nessun parallelismo (partizione unica). Troppi task = overhead.'],
              ['Durata task', 'Min/Max/Avg/Median', 'Skew se Max >> Avg: dati non distribuiti uniformemente.'],
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'Skew e Spill',
          },
          {
            type: 'paragraph',
            text: '<strong>Skew</strong> significa che alcuni task processano molto più dati di altri. <strong>Spill</strong> significa che i dati non entrano in memoria e vengono scritti su disco (lento).',
          },
          {
            type: 'code',
            lang: 'text',
            label: 'Diagnosticare Skew e Spill',
            code: `SEGNALE: Durata task
  - Max task duration >> Avg → SKEW
  - Un task impiega 10 minuti mentre gli altri 10 secondi

COSA FARE:
  - Salting: aggiungi colonna di salt per distribuire meglio
  - AQE (Adaptive Query Execution): coalesce partizioni piccole
  - PartitionBy a bassa cardinalità: evita skew naturale

SEGNALE: Spill
  - Metriche stage: Spill (Memory) e Spill (Disk) > 0
  - Indica che la memoria worker è insufficiente

COSA FARE:
  - Aumenta memoria worker (instance type più grande)
  - Ottimizza join: broadcast join se una tabella è piccola
  - Riduci shuffle partitions: spark.sql.shuffle.partitions`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'SQL DAG — Piano di Esecuzione',
          },
          {
            type: 'paragraph',
            text: 'La tab <strong>SQL</strong> mostra il DAG (Directed Acyclic Graph) del piano di esecuzione fisico della query. Ogni nodo è un operatore (scan, filter, join, aggregate, shuffle, ecc.).',
          },
          {
            type: 'card',
            title: 'Pattern da riconoscere nel DAG SQL',
            items: [
              'Scan con "number of files" molto alto → troppi file piccoli, serve OPTIMIZE/compaction',
              'Full table scan (nessun filter pushdown) → mancano filtri o partizionamento',
              'BroadcastHashJoin vs SortMergeJoin → broadcast join se una tabella è < 10MB è più veloce',
              'Exchange (Shuffle) → operazione costosa, cerca di minimizzare',
              'WholeStageCodegen → buon segno: Spark compila tutto in un unico stage ottimizzato',
              'Scan con alta percentuale di data skipping → buono: sta leggendo solo dati necessari',
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'Query Profile — Alternativa a Spark UI per Serverless',
          },
          {
            type: 'paragraph',
            text: 'Per workload su serverless compute (dove Spark UI non è disponibile), usa <strong>Query Profile</strong>. Offre funzionalità simili ottimizzate per l\'analisi delle performance.',
          },
          {
            type: 'table',
            headers: ['Feature Query Profile', 'Descrizione'],
            rows: [
              ['Top Operators', 'Elenco operatori più costosi della query (tempo, memoria, righe)'],
              ['DAG visuale', 'Grafico interattivo del piano di esecuzione con metriche per nodo'],
              ['Time spent', 'Tempo aggregato per operatore (in parallelo su tutti i core)'],
              ['Memory peak', 'Picco di memoria per operatore'],
              ['Rows processed', 'Numero righe processate per operatore'],
              ['Filter effectiveness', 'Percentuale data pruning (filtri efficaci = meno dati letti)'],
              ['Query wall-clock', 'Durata totale query con breakdown: scheduling, optimization, execution'],
              ['Aggregated task time', 'Tempo combinato su tutti i core (può essere > wall-clock per parallelismo)'],
            ]
          },
          {
            type: 'code',
            lang: 'text',
            label: 'Query Profile — Dove accedervi',
            code: `SQL Editor:  Dopo esecuzione query → link durata → "See query profile"
Notebook:     Cella SQL → "See performance" → run history → statement → query profile
Jobs UI:      Run del job → task → query details → query profile
Pipeline UI:  Update pipeline → Query History tab → select query → profile
Query History: Query History page → click query → "See query profile"`,
          },
          {
            type: 'exam_tip',
            text: 'Per l\'esame: (1) Spark UI disponibile SOLO per classic compute. (2) Query Profile è l\'alternativa per serverless. (3) I principali indicatori di problema sono: <strong>skew</strong> (max task >> avg), <strong>spill</strong> (memoria insufficiente), <strong>shuffle eccessivo</strong>, e <strong>full table scan</strong>. (4) AQE (Adaptive Query Execution) è abilitato per default e aiuta a mitigare skew e partizioni sbilanciate. (5) Usa EXPLAIN per vedere il piano di esecuzione prima di eseguire.',
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 5.1 — Unity Catalog Overview
      // ═══════════════════════════════════════════════════════════
      '5.1': {
        sectionId: '5',
        title: '5.1 — Describe the Unity Catalog object hierarchy and its integration with the Databricks platform',
        subtitle: 'Metastore, Catalog, Schema, Tables, Three-Level Namespace',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'Unity Catalog — Overview',
          },
          {
            type: 'paragraph',
            text: 'Unity Catalog è il sistema di governance unificato di Databricks. Centralizza la gestione di dati, AI, identità e audit su workspace, cloud e regioni. Ogni risorsa dati è registrata in Unity Catalog e protetta da un sistema di privilegi granulari.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Gerarchia degli Oggetti',
          },
          {
            type: 'paragraph',
            text: 'Unity Catalog organizza i dati in una gerarchia a più livelli. Il livello più alto è il <strong>metastore</strong>, seguito da <strong>catalog</strong>, <strong>schema</strong>, e infine <strong>table/view/volume/model</strong>:',
          },
          {
            type: 'code',
            lang: 'text',
            label: 'Gerarchia Unity Catalog (metastore → catalog → schema → oggetto)',
            code: `<livello account>
  Metastore (1 per regione, associato a workspace)

  ┌─ Catalog (es. "my_catalog")
  │   ├── Schema (es. "my_schema")
  │   │   ├── Table / View
  │   │   ├── Volume (directory dati non tabellari)
  │   │   └── Model (modello ML registrato)
  │   └── ...
  └─ ...`,
          },
          {
            type: 'table',
            headers: ['Oggetto', 'Descrizione', 'Ruolo'],
            rows: [
              ['Metastore', 'Container di livello account (top-level)', 'Definisce il perimetro di governance. 1 per regione.'],
              ['Catalog', 'Primo livello del namespace (catalog.schema.table)', 'Raggruppa schemi. Usato per separare ambienti (dev/prod).'],
              ['Schema', 'Secondo livello (catalog.schema.table)', 'Raggruppa tabelle, viste, volumi e modelli correlati.'],
              ['Table', 'Dati strutturati in formato Delta', 'Tabelle managed (possedute da UC) o external (puntano a storage esterno).'],
              ['View', 'Query SQL salvata come oggetto', 'Usata per astrazione, sicurezza, dynamic views.'],
              ['Volume', 'Directory per file non tabellari', 'Usata per dati non strutturati (CSV, JSON, immagini, librerie).'],
              ['Model', 'Modello ML registrato', 'Registrato con Unity Catalog per governance dei modelli.'],
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'Three-Level Namespace',
          },
          {
            type: 'paragraph',
            text: 'Unity Catalog introduce il <strong>three-level namespace</strong>: <code>catalog.schema.table</code>. Rispetto al vecchio two-level namespace (database.table), il catalogo permette di separare logicamente ambienti, team e progetti senza duplicare metastore.',
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Three-Level Namespace — Esempi',
            code: `-- Query su tabella con three-level namespace
SELECT * FROM analytics_prod.sales.orders
WHERE order_date >= '2025-01-01'

-- CREATE TABLE esplicito
CREATE TABLE IF NOT EXISTS bronze.ingestion.events (
  event_id STRING,
  event_type STRING,
  event_ts TIMESTAMP
) USING DELTA

-- USAGE su catalogo e schema (necessario per accedere)
GRANT USAGE ON CATALOG bronze TO developers
GRANT USAGE ON SCHEMA bronze.ingestion TO developers`,
          },
          {
            type: 'card',
            title: 'Convenzioni Ambienti con Three-Level Namespace',
            items: [
              'Un catalogo per ambiente: bronze (raw), silver (cleaned), gold (aggregated) oppure dev, staging, prod',
              'Gli schemi organizzano per dominio/squadra: sales, finance, marketing',
              'Questo evita la proliferazione di metastore separati e semplifica la governance',
              'Esempio: dev.sales.orders vs prod.sales.orders — stessi schemi, dati diversi',
            ]
          },
          {
            type: 'key_point',
            text: 'Ogni workspace è associato a UN metastore (per regione). Un metastore può servire MULTIPLI workspace. I cataloghi sono visibili a tutti i workspace associati allo stesso metastore, con privilegi che controllano l\'accesso.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Managed vs External Tables',
          },
          {
            type: 'table',
            headers: ['Tipo', 'Posizione dati', 'Ciclo di vita', 'DROP TABLE'],
            rows: [
              ['Managed Table', 'Directory gestita da UC sotto <root storage location>', 'Viene creata e gestita automaticamente', 'Cancella sia i metadati che i dati fisici'],
              ['External Table', 'Posizione esterna specificata dall\'utente (es. s3://bucket/path)', 'L\'utente gestisce lo storage separatamente', 'Cancella SOLO i metadati (i dati permangono)'],
            ]
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Managed vs External Table',
            code: `-- Managed table (dati sotto root storage location di UC)
CREATE TABLE sales.orders (
  order_id INT, amount DECIMAL(10,2)
) USING DELTA;

-- External table (dati in posizione specificata)
CREATE EXTERNAL TABLE sales.archived_orders
USING DELTA
LOCATION 's3://my-bucket/archived/orders'

-- DROP su managed = cancella dati
-- DROP su external = solo metadati, dati preservati`,
          },
          {
            type: 'exam_tip',
            text: 'Per l\'esame: (1) Three-level namespace = catalog.schema.table. (2) Metastore è a livello account, NON workspace. (3) Managed table: dati sotto root storage location di UC, DROP cancella tutto. External table: dati in posizione specificata dall\'utente, DROP cancella solo metadati. (4) Volume è per dati non tabellari (file, librerie). (5) Catalog usati per separare ambienti (dev/staging/prod).',
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 5.2 — Identity & Access Management
      // ═══════════════════════════════════════════════════════════
      '5.2': {
        sectionId: '5',
        title: '5.2 — Explain how Databricks manages identities for authentication and authorization',
        subtitle: 'Users, Groups, Service Principals, SCIM',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'Identity Types in Databricks',
          },
          {
            type: 'paragraph',
            text: 'Databricks riconosce tre tipi di identità: <strong>users</strong> (persone fisiche), <strong>service principals</strong> (applicazioni/automazione), e <strong>groups</strong> (raggruppamenti di users e SP). La gestione delle identità avviene a livello di <strong>account console</strong> e si propaga ai workspace associati.',
          },
          {
            type: 'table',
            headers: ['Identità', 'Uso', 'Autenticazione', 'Tipica per'],
            rows: [
              ['User', 'Accesso umano a workspace, notebook, jobs', 'SSO (SAML/OIDC), username/password', 'Data engineer, data scientist, admin'],
              ['Service Principal', 'Automazione, CI/CD, API', 'OAuth client credential (client_id + secret)', 'DABs, Terraform, pipeline automatizzate'],
              ['Group', 'Raggruppa users e SP per gestione privilegi', 'N/A (contenitore logico)', 'Assegnazione privilegi collettiva'],
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'SCIM Provisioning',
          },
          {
            type: 'paragraph',
            text: '<strong>SCIM</strong> (System for Cross-domain Identity Management) è il protocollo standard per sincronizzare identità tra un IdP (Identity Provider) e Databricks. Supporta provisioning automatico di utenti, gruppi e service principals dall\'IdP al databricks account.',
          },
          {
            type: 'card',
            title: 'Vantaggi SCIM',
            items: [
              'Provisioning automatico: nuovi utenti vengono creati automaticamente in Databricks quando aggiunti all\'IdP',
              'Sincronizzazione gruppi: i gruppi IdP (es. AD, Okta, Azure AD) vengono mappati a gruppi Databricks',
              'Revoca automatica: quando un utente viene rimosso dall\'IdP, viene disabilitato in Databricks',
              'Single source of truth: l\'IdP è l\'autorità per le identità, non Databricks',
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'Best Practices — Identità',
          },
          {
            type: 'code',
            lang: 'text',
            label: 'Raccomandazioni Identità',
            code: `GRUPPI:
  - Usa gruppi per assegnare privilegi, NON utenti singoli
  - Mappa gruppi IdP → gruppi Databricks via SCIM
  - Crea gruppi per ruolo: data_engineers, analysts, admins
  - Crea gruppi per ambiente: dev_access, prod_access

SERVICE PRINCIPAL:
  - Usa SP per job automatizzati e DABs
  - Non usare utenti umani per automation
  - Ogni SP ha OAuth client_id + secret
  - Assegna privilegi al SP, non alla persona che lo usa

LEAST PRIVILEGE:
  - Concedi solo i privilegi necessari
  - Usa catalog/schema per isolamento ambienti
  - Revue periodicamente i privilegi con SHOW GRANTS`,
          },
          {
            type: 'key_point',
            text: 'Le identità sono gestite a livello ACCOUNT e sincronizzate ai workspace. I workspace NON hanno identity store proprio (salvo workspace admin locali per retrocompatibilità). La raccomandazione è di usare sempre identità di account gestite via SCIM.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Account vs Workspace Identities — Legacy',
          },
          {
            type: 'paragraph',
            text: 'Prima di Unity Catalog, ogni workspace aveva il proprio identity store locale (workspace-level users/groups). Con Unity Catalog, le identità sono migrate a livello account. In workspace con Unity Catalog abilitato, si usano <strong>account-level identities</strong>. I workspace admin locali esistono ancora per compatibilità ma non sono raccomandati per nuovi deployments.',
          },
          {
            type: 'exam_tip',
            text: 'Per l\'esame: (1) Tre tipi di identità: User, Service Principal, Group. (2) SCIM sincronizza identità dall\'IdP a Databricks automaticamente. (3) Usa gruppi per assegnare privilegi — mai utenti singoli. (4) Service Principal per automazione e CI/CD. (5) Con Unity Catalog, le identità sono a livello ACCOUNT, non workspace.',
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 5.3 — Privileges & RBAC
      // ═══════════════════════════════════════════════════════════
      '5.3': {
        sectionId: '5',
        title: '5.3 — Apply and manage privileges in Unity Catalog using SQL and Catalog Explorer',
        subtitle: 'Securable Objects, Privilege Types, Inheritance, GRANT/REVOKE',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'Unity Catalog — Security Model',
          },
          {
            type: 'paragraph',
            text: 'Unity Catalog usa un modello RBAC (Role-Based Access Control) basato su privilegi. I <strong>securable objects</strong> sono organizzati in una gerarchia (metastore → catalog → schema → table/view/volume). I privilegi concessi a un livello vengono ereditati dai livelli inferiori, salvo revoca esplicita.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Gerarchia dei Securable Objects',
          },
          {
            type: 'code',
            lang: 'text',
            label: 'Gerarchia con ereditarietà privilegi',
            code: `Metastore (concedi a un gruppo admin)
  └── Catalog (concedi USAGE a data_engineers)
      └── Schema (concedi USAGE + CREATE a data_engineers)
          ├── Table (concedi SELECT + MODIFY)
          ├── View
          ├── Volume (concedi READ_VOLUME)
          └── Model

NOTA: I privilegi sul catalog/schema sono prerequisiti
  - Per leggere una tabella servono:
    USAGE ON CATALOG + USAGE ON SCHEMA + SELECT ON TABLE`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'Privilegi Principali',
          },
          {
            type: 'table',
            headers: ['Privilegio', 'Livello', 'Cosa permette'],
            rows: [
              ['USAGE', 'Catalog, Schema', 'Permette di vedere/enumerare l\'oggetto e usare il namespace. NON dà accesso ai dati.'],
              ['SELECT', 'Table, View', 'Leggere dati dalla tabella/view.'],
              ['MODIFY', 'Table', 'Inserire, aggiornare, eliminare righe; caricare dati (INSERT, UPDATE, DELETE, MERGE, COPY INTO).'],
              ['CREATE', 'Catalog, Schema', 'Creare oggetti dentro catalog/schema (tabelle, viste, volumi).'],
              ['READ_VOLUME', 'Volume', 'Leggere il contenuto di un volume.'],
              ['WRITE_VOLUME', 'Volume', 'Scrivere file in un volume.'],
              ['EXECUTE', 'Model', 'Invocare un modello ML.'],
              ['OWNER', 'Tutti i livelli', 'Controllo completo sull\'oggetto (DROP, ALTER, GRANT/REVOKE su di esso).'],
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'OWNER Privilege',
          },
          {
            type: 'paragraph',
            text: 'Ogni securable object ha un <strong>OWNER</strong>. L\'owner ha automaticamente tutti i privilegi sull\'oggetto e può concederli ad altri. A differenza di altri privilegi, l\'OWNER non si eredita — deve essere esplicitamente trasferito con ALTER ... SET OWNER TO. L\'OWNER è l\'unico che può DROP o ALTER l\'oggetto, oltre a gestire i privilegi su di esso.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Privilege Inheritance',
          },
          {
            type: 'paragraph',
            text: 'I privilegi vengono ereditati dalla gerarchia: un privilegio concesso su un catalogo si applica a tutti gli schemi/tabelle/volumi dentro quel catalogo (salvo eccezioni). L\'ereditarietà si può limitare negando esplicitamente il privilegio su un oggetto figlio o semplicemente non concedendo il privilegio necessario al livello intermedio.',
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'GRANT e REVOKE — Esempi',
            code: `-- Concedere USAGE su catalog a un gruppo
GRANT USAGE ON CATALOG analytics TO data_engineers

-- Concedere privilegi su schema
GRANT USAGE, CREATE ON SCHEMA analytics.sales TO data_engineers

-- Concedere accesso dati su tabella specifica
GRANT SELECT ON TABLE analytics.sales.orders TO analysts

-- Concedere MODIFY (scrittura)
GRANT MODIFY ON TABLE analytics.sales.orders TO etl_service

-- Revocare privilegio
REVOKE MODIFY ON TABLE analytics.sales.orders FROM etl_service

-- Vedere privilegi correnti
SHOW GRANTS ON TABLE analytics.sales.orders
SHOW GRANTS ON SCHEMA analytics.sales
SHOW GRANTS ON CATALOG analytics

-- Trasferire ownership
ALTER TABLE analytics.sales.orders SET OWNER TO data_engineers`,
          },
          {
            type: 'card',
            title: 'Regole di Ereditarietà — Esempi',
            items: [
              'GRANT USAGE ON CATALOG bronze TO team_a → team_a può vedere tutti gli schemi in bronze',
              'GRANT SELECT ON SCHEMA bronze.ingestion TO team_a → team_a può leggere TUTTE le tabelle in bronze.ingestion',
              'GRANT SELECT ON TABLE bronze.ingestion.events TO team_a → solo events, NON altre tabelle',
              'Se team_a ha USAGE su catalogo MA NON su schema → non può vedere le tabelle dentro quello schema',
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'Catalog Explorer',
          },
          {
            type: 'paragraph',
            text: 'Il <strong>Catalog Explorer</strong> è l\'interfaccia grafica per esplorare e gestire tutti gli oggetti in Unity Catalog. Permette di: navigare la gerarchia catalog/schema/table, visualizzare schemi, dati, proprietà, privilegi e lineage, gestire permessi tramite UI, creare cataloghi e schemi, e cercare oggetti per nome.',
          },
          {
            type: 'exam_tip',
            text: 'Per l\'esame: (1) USAGE è necessario su catalog E schema per accedere ai dati — non basta SELECT sulla tabella. (2) OWNER è l\'unico privilegio che non si eredita; va trasferito con SET OWNER TO. (3) Privilegi si ereditano in cascata ma si possono restringere. (4) Catalog Explorer è l\'interfaccia GUI per gestire permessi. (5) GRANT/REVOKE usano sintassi SQL standard. (6) CREATE su catalog/schema permette di creare oggetti figli.',
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 5.4 — Data Masking & Filtering
      // ═══════════════════════════════════════════════════════════
      '5.4': {
        sectionId: '5',
        title: '5.4 — Apply column masking and row filters to govern sensitive data',
        subtitle: 'Column Masking, Row Filters, Dynamic Views',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'Data Governance a Livello di Dati',
          },
          {
            type: 'paragraph',
            text: 'Oltre ai privilegi su tabelle/schemi, Unity Catalog offre meccanismi per proteggere i dati <strong>dentro</strong> le tabelle: <strong>column masking</strong> (mascheramento colonne sensibili) e <strong>row filters</strong> (filtro righe visibili all\'utente). Questi si applicano a livello di definizione della tabella e sono trasparenti alle query.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Column Masking',
          },
          {
            type: 'paragraph',
            text: 'Una <strong>column mask</strong> è una funzione SQL che determina il valore mostrato agli utenti per una colonna. La funzione riceve il valore originale e lo trasforma in base all\'utente che esegue la query. Si applica usando <code>ALTER TABLE ... ALTER COLUMN ... SET MASK</code>.',
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Column Masking — Esempio',
            code: `-- 1. Creare una funzione di masking
CREATE OR REPLACE FUNCTION sales.mask_email(email STRING)
  RETURN IF(IS_MEMBER('data_engineers'), email, '***@***.***')

-- 2. Applicare la mask alla colonna
ALTER TABLE sales.customers
ALTER COLUMN email SET MASK sales.mask_email

-- Effetto:
--   data_engineer → 'mario.rossi@example.com'
--   analyst      → '***@***.***'

-- Rimuovere la mask
ALTER TABLE sales.customers
ALTER COLUMN email DROP MASK`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'Row Filters',
          },
          {
            type: 'paragraph',
            text: 'Un <strong>row filter</strong> è una funzione SQL che limita quali righe sono visibili. La funzione riceve le colonne della tabella e restituisce TRUE/FALSE per ogni riga. Le righe per cui la funzione restituisce FALSE vengono nascoste.',
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Row Filter — Esempio',
            code: `-- 1. Creare funzione filtro
CREATE OR REPLACE FUNCTION sales.region_filter(region STRING)
  RETURN IF(IS_MEMBER('eu_team'), region = 'EU', TRUE)

-- 2. Applicare il filtro
ALTER TABLE sales.orders
SET ROW FILTER sales.region_filter ON (region)

-- Effetto:
--   eu_team → vede solo righe con region = 'EU'
--   altri   → vede tutte le righe

-- Rimuovere il filtro
ALTER TABLE sales.orders DROP ROW FILTER`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'Dynamic Views',
          },
          {
            type: 'paragraph',
            text: 'Prima dell\'introduzione di column masking e row filters native, la tecnica comune era usare <strong>dynamic views</strong>. Una dynamic view usa funzioni come <code>CURRENT_USER</code> o <code>IS_MEMBER()</code> dentro una vista SQL per filtrare/mascherare dati in base all\'utente che interroga la vista.',
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Dynamic View — Esempio',
            code: `-- Creare una view che maschera dati sensibili per ruolo
CREATE VIEW sales.safe_customers AS
SELECT
  customer_id,
  name,
  CASE
    WHEN IS_MEMBER('support_team') THEN email
    ELSE '***@***.***'
  END AS email,
  CASE
    WHEN IS_MEMBER('support_team') THEN phone
    ELSE '***'
  END AS phone
FROM sales.customers

-- Privilegi: GRANT SELECT a tutti sulla view
-- I dati raw nella tabella base sono protetti dall'accesso diretto`,
          },
          {
            type: 'table',
            headers: ['Tecnica', 'Livello', 'Vantaggio', 'Svantaggio'],
            rows: [
              ['Column Masking', 'Colonna', 'In-place, trasparente, singola colonna', 'Richiede funzione per colonna'],
              ['Row Filter', 'Tabella', 'Controllo per riga, flessibile', 'Può impattare performance su tabelle grandi'],
              ['Dynamic View', 'Vista', 'Massima flessibilità', 'Richiede gestione viste separate; duplicazione logica'],
            ]
          },
          {
            type: 'exam_tip',
            text: 'Per l\'esame: (1) Column Masking maschera colonne specifiche con una funzione che dipende dall\'utente. (2) Row Filter nasconde righe intere basandosi su condizioni. (3) IS_MEMBER(<group>) controlla se l\'utente corrente appartiene a un gruppo. (4) Dynamic Views sono l\'approccio legacy, sostituito da masking/filtri nativi. (5) Masking e filtri sono trasparenti: la query non cambia, il risultato sì.',
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 5.5 — Data Lineage
      // ═══════════════════════════════════════════════════════════
      '5.5': {
        sectionId: '5',
        title: '5.5 — Use data lineage to track data origins, transformations and downstream dependencies',
        subtitle: 'Column-Level Lineage, Catalog Explorer, Impact Analysis',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'Data Lineage in Unity Catalog',
          },
          {
            type: 'paragraph',
            text: 'Unity Catalog cattura automaticamente <strong>column-level lineage</strong> per tutte le operazioni su dati gestiti da UC: query SQL, notebook, DLT pipelines, jobs. Il lineage mostra la provenienza dei dati (da quali tabelle/colonne provengono), come sono stati trasformati (query, operazioni), e dove vengono usati (downstream tables, dashboards, models).',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Catalog Explorer — Lineage Tab',
          },
          {
            type: 'paragraph',
            text: 'Nel Catalog Explorer, ogni tabella/view ha un tab <strong>Lineage</strong> che mostra un grafo interattivo delle relazioni upstream (sorgenti dati) e downstream (target/consumatori). Puoi navigare il grafo per colonna specifica, vedere la profondità del lineage (fino a 5 livelli), e cliccare su qualsiasi nodo per dettagli.',
          },
          {
            type: 'card',
            title: 'Cosa Mostra il Lineage',
            items: [
              'Upstream: tabelle, viste, file usati come input per creare questa tabella',
              'Downstream: tabelle, viste, dashboard, notebook, jobs, modelli che usano questa tabella come input',
              'Trasformazioni: operazioni applicate (SELECT, JOIN, FILTER, AGGREGATE)',
              'Column-level: per ogni colonna di output, quali colonne upstream l\'hanno generata',
              'Notebook e job: mostra l\'ultima esecuzione che ha letto/scritto la tabella',
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'Column-Level Lineage',
          },
          {
            type: 'paragraph',
            text: 'Il <strong>column-level lineage</strong> traccia il percorso di ogni singola colonna attraverso le trasformazioni. Per esempio, se una colonna <code>total_amount</code> in una tabella aggregata deriva da <code>quantity * unit_price</code> di due tabelle upstream, il lineage mostra esattamente questa relazione. È fondamentale per:',
          },
          {
            type: 'table',
            headers: ['Scenario', 'Come il lineage aiuta'],
            rows: [
              ['Audit/Compliance', 'Verificare che dati sensibili (PII) siano gestiti correttamente attraverso le trasformazioni'],
              ['Debug data quality', 'Trovare la sorgente di valori anomali in una colonna downstream'],
              ['Impact analysis', 'Prima di cambiare uno schema, vedere tutte le tabelle/dashboard/notebook impattati'],
              ['Onboarding', 'Nuovi membri del team capiscono rapidamente il flusso dei dati'],
              ['Cost optimization', 'Identificare tabelle/colonne non più usate da eliminare'],
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'Impact Analysis',
          },
          {
            type: 'paragraph',
            text: 'L\'<strong>impact analysis</strong> (disponibile in Catalog Explorer) permette di selezionare una tabella o colonna e vedere TUTTI i downstream che ne dipendono. Prima di modificare uno schema o rimuovere una tabella, usa l\'impact analysis per identificare: notebook che leggono la tabella, jobs che la usano come input, dashboard collegate, viste che dipendono dalla tabella, e DLT pipelines che la consumano.',
          },
          {
            type: 'code',
            lang: 'text',
            label: 'Lineage — Query System Table',
            code: `-- Il lineage è disponibile anche via system table
-- (topic 5.6 per dettagli su system tables)
SELECT * FROM system.lineage.lineage_by_table
WHERE table_name = 'analytics.sales.orders'
  AND column_name = 'amount'

-- Output: upstream_sources, downstream_targets,
--          transformation_type, last_updated`,
          },
          {
            type: 'exam_tip',
            text: 'Per l\'esame: (1) Column-level lineage è automatico per tabelle Unity Catalog. (2) Accessibile via Catalog Explorer (tab Lineage) e via system tables. (3) Impact analysis mostra downstream prima di modifiche distruttive. (4) Il lineage traccia fino a 5 livelli di profondità. (5) È fondamentale per audit, compliance, data quality e onboarding.',
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 5.6 — System Tables & Audit
      // ═══════════════════════════════════════════════════════════
      '5.6': {
        sectionId: '5',
        title: '5.6 — Query system tables to monitor usage, audit, billing and lineage',
        subtitle: 'system.access, system.billing, system.lineage, Audit Logs',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'System Tables — Overview',
          },
          {
            type: 'paragraph',
            text: 'Le <strong>system tables</strong> sono schemi speciali nel catalogo <code>system</code> che espongono metadati operativi di Databricks: audit logs, billing, query history, lineage e altro. Sono accessibili via SQL standard tramite Unity Catalog e permettono di analizzare l\'utilizzo della piattaforma senza strumenti esterni.',
          },
          {
            type: 'paragraph',
            text: 'Per abilitare le system tables, un workspace admin deve attivarle nel Catalog Explorer o via API. Una volta abilitate, i dati vengono popolati con latenza tipica di 1-2 ore. L\'accesso richiede privilegi specifici (es. SELECT su <code>system.billing</code> richiede il ruolo <code>workspace admin</code> o grant esplicito).',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Schemi System Tables Principali',
          },
          {
            type: 'table',
            headers: ['Schema', 'Tabella', 'Contenuto'],
            rows: [
              ['system.access', 'audit', 'Eventi di audit: login, query, job esecuzioni, permessi, operazioni DDL/DML'],
              ['system.billing', 'usage', 'Costi per compute, storage, serverless, DBU consumate'],
              ['system.billing', 'list_prices', 'Prezzi listino per SKU e tipo risorsa'],
              ['system.compute', 'clusters', 'Storia cluster: stato, dimensioni, runtime, durata, costo'],
              ['system.compute', 'warehouses', 'Storia SQL warehouses: utilizzo, query, stato'],
              ['system.jobs', 'job_runs', 'Esecuzioni job: durata, stato, scheduling, parametri'],
              ['system.lineage', 'lineage_by_table', 'Lineage column-level per tabella'],
              ['system.schema', 'tables', 'Catalogo tabelle UC: proprietario, formato, posizione, dettagli'],
              ['system.storage', 'storage_usage', 'Utilizzo storage: dimensioni tabelle, crescita nel tempo'],
              ['system.query', 'history', 'Storico query eseguite: testo, durata, utente, risorse'],
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'Query di Esempio — Audit',
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Audit Logs — Esempi',
            code: `-- Query eseguite da un utente specifico
SELECT
  query_text,
  execution_time_ms,
  user_email,
  error_message
FROM system.access.audit
WHERE user_email = 'mario.rossi@example.com'
  AND action_name = 'executeQuery'
  AND timestamp >= CURRENT_DATE - INTERVAL 7 DAYS
ORDER BY timestamp DESC

-- Accessi negati (permission errors)
SELECT
  timestamp,
  user_email,
  action_name,
  request_params
FROM system.access.audit
WHERE response.status_code = 403
  AND timestamp >= CURRENT_DATE - INTERVAL 1 DAY

-- Modifiche ai privilegi
SELECT
  timestamp,
  user_email,
  action_name,
  request_params
FROM system.access.audit
WHERE action_name IN ('GRANT', 'REVOKE')
ORDER BY timestamp DESC`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'Query di Esempio — Billing e Usage',
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Billing — Esempi',
            code: `-- DBU consumate per workspace
SELECT
  workspace_id,
  sku,
  SUM(usage_quantity) AS total_dbu
FROM system.billing.usage
WHERE usage_date >= CURRENT_DATE - INTERVAL 30 DAYS
GROUP BY workspace_id, sku
ORDER BY total_dbu DESC

-- Costi per tipo di compute
SELECT
  sku,
  usage_unit,
  SUM(usage_quantity * list_price) AS estimated_cost
FROM system.billing.usage u
JOIN system.billing.list_prices p
  ON u.sku = p.sku
WHERE usage_date >= CURRENT_DATE - INTERVAL 30 DAYS
GROUP BY sku, usage_unit
ORDER BY estimated_cost DESC`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'Query di Esempio — Query History',
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Query History — Esempi',
            code: `-- Query lente (top 10 per durata)
SELECT
  query_text,
  execution_time_ms,
  user_email,
  warehouse_name,
  error_message
FROM system.query.history
WHERE status = 'FINISHED'
  AND execution_time_ms > 0
ORDER BY execution_time_ms DESC
LIMIT 10

-- Query con errori frequenti
SELECT
  error_message,
  COUNT(*) AS error_count
FROM system.query.history
WHERE status = 'FAILED'
GROUP BY error_message
ORDER BY error_count DESC`,
          },
          {
            type: 'card',
            title: 'Note Importanti sulle System Tables',
            items: [
              'I dati hanno latenza di 1-2 ore (non real-time)',
              'L\'accesso richiede privilegi specifici — non tutte le tabelle sono accessibili a tutti',
              'system.access.audit richiede il ruolo workspace admin o grant esplicito',
              'I dati vengono mantenuti per 30-90 giorni a seconda della tabella',
              'Le system tables NON contengono dati utente, solo metadati operativi',
            ]
          },
          {
            type: 'exam_tip',
            text: 'Per l\'esame: (1) System tables sono nel catalogo <code>system</code> (es. <code>system.access.audit</code>). (2) Richiedono abilitazione esplicita da admin. (3) Latenza 1-2 ore. (4) Principali: access.audit (log accessi), billing.usage (costi), query.history (storico query), lineage.lineage_by_table (lineage). (5) Utili per audit di sicurezza, ottimizzazione costi e troubleshooting.',
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 5.7 — External Data Access
      // ═══════════════════════════════════════════════════════════
      '5.7': {
        sectionId: '5',
        title: '5.7 — Configure external data access using storage credentials and external locations',
        subtitle: 'External Locations, Storage Credentials, Cloud Storage Access',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'External Data Access — Concetti Base',
          },
          {
            type: 'paragraph',
            text: 'Unity Catalog permette di leggere e scrivere dati in posizioni esterne (es. AWS S3, Azure ADLS, GCS) tramite <strong>external locations</strong> e <strong>storage credentials</strong>. Questi oggetti di Unity Catalog gestiscono in modo centralizzato e sicuro l\'accesso a storage cloud esterni.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Storage Credential',
          },
          {
            type: 'paragraph',
            text: 'Uno <strong>storage credential</strong> è un oggetto che rappresenta un\'identità cloud autorizzata ad accedere a un provider di storage (AWS IAM role, Azure managed identity, GCP service account). Contiene le credenziali cloud e può essere assegnato a external locations per controllare l\'accesso.',
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Storage Credential — Esempi SQL',
            code: `-- Creare storage credential
CREATE STORAGE CREDENTIAL IF NOT EXISTS my_s3_credential
  USING (AWS_IAM_ROLE 'arn:aws:iam::123456789012:role/my-databricks-role')
  COMMENT 'Accesso a bucket S3 analytics'

-- Assegnare privilegio per uso
GRANT READ_FILES, WRITE_FILES ON STORAGE CREDENTIAL my_s3_credential TO data_engineers`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'External Location',
          },
          {
            type: 'paragraph',
            text: 'Una <strong>external location</strong> è un oggetto Unity Catalog che connette un percorso di storage cloud a uno storage credential. Funge da punto di accesso autorizzato per leggere/scrivere dati in quella posizione. Ogni CREATE EXTERNAL TABLE o lettura dati da una posizione esterna richiede un external location corrispondente.',
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'External Location — Esempi SQL',
            code: `-- Creare external location
CREATE EXTERNAL LOCATION IF NOT EXISTS my_bucket_loc
  URL 's3://my-bucket/analytics/'
  WITH (STORAGE CREDENTIAL my_s3_credential)
  COMMENT 'External location per dati analytics'

-- Privilegi sull'external location
GRANT READ_FILES ON EXTERNAL LOCATION my_bucket_loc TO data_engineers
GRANT WRITE_FILES ON EXTERNAL LOCATION my_bucket_loc TO etl_jobs`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'Usare External Locations in Query',
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Leggere e Scrivere da External Location',
            code: `-- Leggere file Parquet direttamente (richiede READ_FILES)
SELECT * FROM read_files(
  's3://my-bucket/analytics/events/*.parquet',
  format => 'parquet'
)

-- Creare external table puntando a un percorso
CREATE EXTERNAL TABLE analytics.raw_events
USING DELTA
LOCATION 's3://my-bucket/analytics/events/'
COMMENT 'Tabella external su posizione S3 esterna'

-- COPY INTO da external location
COPY INTO analytics.raw_events
FROM (
  SELECT * FROM read_files('s3://my-bucket/ingest/events/', 'csv')
)
FILEFORMAT = CSV
FORMAT_OPTIONS ('header' = 'true', 'inferSchema' = 'true')
COPY_OPTIONS ('mergeSchema' = 'true')`,
          },
          {
            type: 'table',
            headers: ['Oggetto', 'Cosa definisce', 'Esempio'],
            rows: [
              ['Storage Credential', 'L\'identità cloud (IAM role, managed identity)', 'CREATE STORAGE CREDENTIAL ... AWS_IAM_ROLE ...'],
              ['External Location', 'Un URL + storage credential per accedervi', 'CREATE EXTERNAL LOCATION ... URL \'s3://bucket\' ...'],
              ['Privilegi su Storage Credential', 'Chi può usare quel credential per creare location', 'GRANT READ_FILES, WRITE_FILES ON STORAGE CREDENTIAL'],
              ['Privilegi su External Location', 'Chi può leggere/scrivere da quella posizione', 'GRANT READ_FILES ON EXTERNAL LOCATION'],
            ]
          },
          {
            type: 'key_point',
            text: 'Per creare un external location, devi avere USAGE su un metastore e READ_FILES + WRITE_FILES (o CREATE EXTERNAL LOCATION) sullo storage credential. Per usare un external location in query (read_files, CREATE EXTERNAL TABLE, COPY INTO), devi avere READ_FILES sull\'external location.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Credential Passthrough (Legacy)',
          },
          {
            type: 'paragraph',
            text: 'Prima degli external location, Databricks supportava <strong>credential passthrough</strong>, dove le credenziali AWS/Azure dell\'utente venivano propagate al cluster. Questa modalità è ancora disponibile per cluster classic ma NON è raccomandata per nuovi progetti. Si preferisce l\'uso di storage credential + external location per una gestione centralizzata e sicura.',
          },
          {
            type: 'exam_tip',
            text: 'Per l\'esame: (1) Storage Credential = identità cloud. External Location = URL + storage credential. (2) Per leggere file esterni serve READ_FILES sull\'external location. (3) CREATE EXTERNAL TABLE punta a una posizione già esistente nello storage. (4) CREATE MANAGED TABLE usa il root storage location di UC, non richiede external location. (5) Credential passthrough è legacy — preferisci storage credential + external location.',
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 5.8 — Secrets Management
      // ═══════════════════════════════════════════════════════════
      '5.8': {
        sectionId: '5',
        title: '5.8 — Securely manage credentials and sensitive information using Databricks secrets',
        subtitle: 'Secret Scopes, Secret ACLs, dbutils.secrets',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'Databricks Secrets — Overview',
          },
          {
            type: 'paragraph',
            text: 'I <strong>Databricks Secrets</strong> permettono di memorizzare e accedere a credenziali sensibili (API key, password, token) in modo sicuro. I secrets sono archiviati in <strong>secret scopes</strong> e accessibili tramite <code>dbutils.secrets</code> in notebook e job. I secrets non appaiono mai in chiaro nei log, nel codice o nelle UI.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Secret Scopes',
          },
          {
            type: 'paragraph',
            text: 'Un <strong>secret scope</strong> è un contenitore di secrets. Può essere di due tipi: <strong>Databricks-backed</strong> (gestito da Databricks, cifrato con chiave gestita da Databricks o propria chiave CMK) o <strong>Azure Key Vault-backed</strong> (solo Azure — i secrets risiedono in Key Vault, Databricks ci accede on-demand).',
          },
          {
            type: 'table',
            headers: ['Tipo Scope', 'Dove risiedono i secrets', 'Vantaggio', 'Disponibile su'],
            rows: [
              ['Databricks-backed', 'In Databricks (cifrati)', 'Setup semplice, multi-cloud', 'AWS, Azure, GCP'],
              ['Azure Key Vault-backed', 'In Azure Key Vault', 'Single source of truth per Azure', 'Solo Azure'],
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'Gestione Secrets — CLI e API',
          },
          {
            type: 'code',
            lang: 'bash',
            label: 'Databricks CLI — Secrets',
            code: `# Creare secret scope (Databricks-backed)
databricks secrets create-scope --scope my-app-secrets

# Inserire secret
databricks secrets put --scope my-app-secrets --key db_password
# (prompt: inserisci il valore, oppure --string-value "...")

# Lista secrets in uno scope
databricks secrets list --scope my-app-secrets

# Eliminare secret
databricks secrets delete --scope my-app-secrets --key db_password

# Eliminare scope (NON recuperabile)
databricks secrets delete-scope --scope my-app-secrets`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'Secret ACLs',
          },
          {
            type: 'paragraph',
            text: 'I permessi sui secret scopes sono gestiti tramite <strong>ACLs</strong> (Access Control Lists). Ogni scope ha ACL che definiscono chi può leggerne i secrets, gestirli, o amministrare lo scope.',
          },
          {
            type: 'table',
            headers: ['Permission Level', 'Cosa permette'],
            rows: [
              ['READ', 'Leggere i secrets nello scope (dbutils.secrets.get())'],
              ['WRITE', 'Creare, aggiornare, eliminare secrets nello scope'],
              ['MANAGE', 'Gestire ACLs oltre a READ + WRITE sullo scope'],
            ]
          },
          {
            type: 'code',
            lang: 'bash',
            label: 'Secret ACLs — CLI',
            code: `# Assegnare accesso READ a un gruppo
databricks secrets put-acl \
  --scope my-app-secrets \
  --principal data_engineers \
  --permission READ

# Assegnare accesso MANAGE (per admin)
databricks secrets put-acl \
  --scope my-app-secrets \
  --principal devops_team \
  --permission MANAGE

# Lista ACLs
databricks secrets list-acls --scope my-app-secrets`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'Accesso ai Secrets in Notebook',
          },
          {
            type: 'code',
            lang: 'python',
            label: 'dbutils.secrets — Esempi',
            code: `# Leggere un secret
password = dbutils.secrets.get(
  scope='my-app-secrets',
  key='db_password'
)

# Connessione a database esterno
jdbc_url = "jdbc:postgresql://host:5432/mydb"
df = spark.read.format("jdbc") \\
  .option("url", jdbc_url) \\
  .option("user", "app_user") \\
  .option("password", dbutils.secrets.get("my-app-secrets", "db_password")) \\
  .load()

# Importante: il valore del secret NON viene mai mostrato
# dbutils.secrets.get() restituisce il valore come stringa`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'Secrets in DABs e Workflows',
          },
          {
            type: 'code',
            lang: 'text',
            label: 'Usare Secrets in Databricks Asset Bundles',
            code: `# databricks.yml — riferimento a secret
resources:
  jobs:
    etl_job:
      name: "ETL Pipeline"
      tasks:
        - task_key: ingest
          notebook_task:
            notebook_path: notebooks/ingest.py
            base_parameters:
              db_password: "{{secrets/my-app-secrets/db_password}}"
              
# Il reference {{secrets/scope/key}} viene risolto
# a runtime da Databricks — il valore non è in chiaro nel bundle YAML`,
          },
          {
            type: 'exam_tip',
            text: 'Per l\'esame: (1) Secrets accessibili con dbutils.secrets.get(scope, key). (2) Secret scope può essere Databricks-backed o AKV-backed (solo Azure). (3) ACLs controllano chi può leggere (READ), scrivere (WRITE) o gestire (MANAGE) uno scope. (4) I secrets non appaiono mai in chiaro in log o output. (5) In DABs, riferisci secrets con sintassi {{secrets/scope/key}}.',
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 5.9 — Delta Sharing
      // ═══════════════════════════════════════════════════════════
      '5.9': {
        sectionId: '5',
        title: '5.9 — Share data securely across organizations using Delta Sharing',
        subtitle: 'Provider, Recipient, Share, Open Protocol',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'Delta Sharing — Overview',
          },
          {
            type: 'paragraph',
            text: '<strong>Delta Sharing</strong> è il protocollo aperto per la condivisione sicura di dati tra piattaforme, indipendentemente dal fornitore cloud. Permette a un <strong>provider</strong> di condividere parti del proprio catalogo (tabelle, viste) con <strong>recipient</strong> esterni, che possono essere altri workspace Databricks, altre piattaforme (Spark, Pandas, Power BI), o anche applicazioni personalizzate.',
          },
          {
            type: 'key_point',
            text: 'Delta Sharing è un protocollo APERTO (open-source). Non richiede che il recipient abbia Databricks — può consumare i dati con qualsiasi tool che supporti il protocollo Delta Sharing (Apache Spark, pandas, Power BI, Tableau, qualsiasi client Python).',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Concetti Principali',
          },
          {
            type: 'table',
            headers: ['Ruolo', 'Descrizione', 'Azione'],
            rows: [
              ['Provider', 'Chi possiede i dati e vuole condividerli', 'Crea share, aggiunge tabelle, crea recipient'],
              ['Recipient', 'Chi riceve l\'accesso ai dati', 'Usa la activation URL per attivare la connessione e leggere i dati'],
              ['Share', 'Contenitore logico di tabelle/viste condivise', 'Raggruppa una o più tabelle da condividere'],
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'Flusso di Condivisione',
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Delta Sharing — Provider Side',
            code: `-- 1. Creare un recipient
CREATE RECIPIENT IF NOT EXISTS partner_analytics
  COMMENT 'Team analytics del partner'

-- Output: activation_link (da condividere col recipient)
-- Esempio: https://.../delta-sharing/...token...

-- 2. Creare uno share
CREATE SHARE IF NOT EXISTS sales_share
  COMMENT 'Dati vendite condivisi con partner'

-- 3. Aggiungere tabelle allo share
ALTER SHARE sales_share ADD TABLE analytics.sales.orders
ALTER SHARE sales_share ADD TABLE analytics.sales.customers

-- 4. Concedere accesso al recipient
GRANT SELECT ON SHARE sales_share TO RECIPIENT partner_analytics`,
          },
          {
            type: 'code',
            lang: 'text',
            label: 'Delta Sharing — Recipient Side',
            code: `# Il recipient riceve l'activation URL e la usa per attivare

# Opzione 1 — In Databricks
# Attivare dal Catalog Explorer → Delta Sharing → Recipient
# Dopo attivazione, i dati condivisi appaiono come cataloghi
# nel formato: <share_name>

# Opzione 2 — Con spark esterno (open-source)
# Usando il pacchetto delta-sharing-spark

# Opzione 3 — Con pandas
import delta_sharing
client = delta_sharing.SharingClient(profile_file)
tables = client.list_tables_in_share("sales_share")

# Leggere una tabella condivisa in pandas
df = delta_sharing.load_as_pandas(
  f"{profile_file}#sales_share.analytics.sales.orders"
)`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'Caratteristiche Delta Sharing',
          },
          {
            type: 'card',
            title: 'Vantaggi e Limitazioni',
            items: [
              'Aperto: protocollo open-source, non vendor lock-in',
              'Sicuro: usa token di accesso, crittografia in-transit, audit logging',
              'Incrementale: i recipient ricevono solo i delta (dati nuovi/modificati), non copie full',
              'Read-only: i recipient possono solo leggere, non modificare i dati',
              'Multi-cloud: un provider AWS può condividere con recipient su Azure o GCP',
              'Governance: i privilegi UC si applicano allo share (dynamic views, row filter, column mask)',
              'No data movement: i dati rimangono nello storage del provider, il recipient li legge direttamente',
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'Gestire Recipient e Shares',
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Comandi Gestione — Provider',
            code: `-- Elencare shares
SHOW SHARES

-- Elencare recipient
SHOW RECIPIENTS

-- Modificare share
ALTER SHARE sales_share ADD TABLE analytics.sales.regions
ALTER SHARE sales_share REMOVE TABLE analytics.sales.regions

-- Rimuovere recipient (revoca accesso)
DROP RECIPIENT partner_analytics

-- Eliminare share
DROP SHARE sales_share

-- Vedere privilegi su share
SHOW GRANTS ON SHARE sales_share`,
          },
          {
            type: 'exam_tip',
            text: 'Per l\'esame: (1) Delta Sharing è un protocollo APERTO (non proprietario). (2) Tre concetti: Provider (chi condivide), Recipient (chi riceve), Share (contenitore logico). (3) I dati non si muovono — il recipient li legge direttamente dallo storage del provider. (4) Il recipient attiva usando una activation URL ricevuta dal provider. (5) READ-ONLY: il recipient non può modificare i dati. (6) Le dynamic views/row filter/column mask di UC funzionano anche negli share.',
          },
        ]
      },

      // ═══════════════════════════════════════════════════════════
      // 5.10 — Lakehouse Monitoring
      // ═══════════════════════════════════════════════════════════
      '5.10': {
        sectionId: '5',
        title: '5.10 — Monitor data quality and detect drift using Lakehouse Monitoring',
        subtitle: 'Monitor Tables, Profiling, Drift Detection, Alerts',
        parts: [
          {
            type: 'heading',
            level: 3,
            text: 'Lakehouse Monitoring — Overview',
          },
          {
            type: 'paragraph',
            text: '<strong>Lakehouse Monitoring</strong> è una funzionalità di Unity Catalog per monitorare la qualità dei dati nel tempo. Crea automaticamente <strong>monitor tables</strong> (tabelle di monitoraggio) che contengono metriche di profiling, statistiche, e indicatori di drift per le tabelle sorvegliate.',
          },
          {
            type: 'paragraph',
            text: 'È integrato con il catalogo Unity: i monitor sono associati a tabelle UC specifiche. Le metriche vengono calcolate automaticamente a ogni aggiornamento della tabella o su schedule. I risultati sono accessibili via dashboard pre-costruite e via SQL.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Come Funziona',
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Creare un Monitor — SQL',
            code: `-- Creare un monitor su una tabella
ALTER TABLE analytics.sales.orders
SET TBLPROPERTIES (
  'monitor.creator' = 'current_user()',
  'monitor.schedule.interval' = '1 HOUR'
)

-- Oppure via API Python
# monitor.create_monitor(
#   table_name="analytics.sales.orders",
#   profile_type="snapshot",     # snapshot | time_series
#   schedule="1 hour",
#   inference_log=None,
#   slicing_exprs=None
# )`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'Profile Types',
          },
          {
            type: 'table',
            headers: ['Profile Type', 'Descrizione', 'Quando usarlo'],
            rows: [
              ['snapshot', 'Calcola metriche sullo stato attuale dei dati', 'Per dataset senza dimensione temporale, o per controlli puntuali'],
              ['time_series', 'Calcola metriche per intervalli temporali, con rilevamento trend/drift', 'Per dataset con colonna temporale, per monitorare evoluzione nel tempo'],
            ]
          },
          {
            type: 'heading',
            level: 3,
            text: 'Metriche di Profiling',
          },
          {
            type: 'code',
            lang: 'text',
            label: 'Metriche automatiche per colonna',
            code: `METRICHE NUMERICHE (int, float, double):
  - count, null_count, null_percentage
  - min, max, mean, stddev
  - quantiles (p25, p50, p75)
  - unique_count, distinct_count

METRICHE CATEGORICHE (string, boolean):
  - count, null_count, null_percentage
  - unique_count, distinct_count
  - top_k values (frequenza valori più comuni)
  - cardinality_estimate

METRICHE TEMPORALI (date, timestamp):
  - count, null_count
  - min, max (intervallo temporale)
  - freshness (tempo dall'ultimo aggiornamento)

DRIFT:
  - Distribution_distance: JS divergence tra baseline e recente
  - Null_fraction_drift: variazione percentuale nulli
  - Mean_drift: variazione media (per numeriche)`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'Monitor Tables — Output',
          },
          {
            type: 'paragraph',
            text: 'Quando crei un monitor, Unity Catalog genera automaticamente diverse <strong>monitor tables</strong> nel catalogo <code>system.monitoring</code>. Queste tabelle contengono le metriche calcolate e possono essere interrogate con SQL standard.',
          },
          {
            type: 'table',
            headers: ['Tabella Monitor', 'Contenuto'],
            rows: [
              ['profile_metrics', 'Metriche di profiling per colonna: count, null, min, max, mean, stddev, quantili'],
              ['drift_metrics', 'Metriche di drift: distribuzione, null_fraction, mean drift'],
              ['schema_changes', 'Cambiamenti dello schema della tabella monitorata'],
              ['inference_log', 'Log di inferenza (se model monitoring abilitato)'],
            ]
          },
          {
            type: 'code',
            lang: 'sql',
            label: 'Interrogare le Monitor Tables',
            code: `-- Vedere metriche profiling per colonna
SELECT
  column_name,
  data_type,
  count,
  null_count,
  CAST(null_count AS DOUBLE) / count AS null_pct,
  mean,
  stddev,
  min_value,
  max_value
FROM system.monitoring.profile_metrics
WHERE table_name = 'analytics.sales.orders'
ORDER BY column_name

-- Rilevare drift nelle colonne
SELECT
  column_name,
  distribution_distance,
  null_fraction_drift,
  mean_drift,
  drift_detected
FROM system.monitoring.drift_metrics
WHERE table_name = 'analytics.sales.orders'
  AND drift_detected = TRUE
ORDER BY distribution_distance DESC`,
          },
          {
            type: 'heading',
            level: 3,
            text: 'Dashboard e Alert',
          },
          {
            type: 'paragraph',
            text: 'Lakehouse Monitoring genera automaticamente <strong>dashboard pre-costruite</strong> nel Catalog Explorer per ogni monitor. Le dashboard mostrano: trend delle metriche nel tempo, heatmap di distribuzione, rilevamento anomalie, e alert configurabili. È anche possibile:',
          },
          {
            type: 'card',
            title: 'Cosa puoi fare con Lakehouse Monitoring',
            items: [
              'Configurare soglie di alert per metriche (es. null_count > 5%)',
              'Inviare notifiche via email, webhook, o Slack quando una soglia viene superata',
              'Visualizzare dashboard pre-costruite con trend temporali',
              'Usare le metriche per data quality SLAs e report di conformità',
              'Combinare con DLT expectations per un framework completo di data quality (pre- e post-load)',
            ]
          },
          {
            type: 'exam_tip',
            text: 'Per l\'esame: (1) Lakehouse Monitoring crea automaticamente tabelle di monitoring in system.monitoring. (2) Due profile type: snapshot (singola foto) e time_series (trend + drift). (3) Metriche automatiche per colonna: count, null, min/max, mean, stddev, quantili. (4) Drift detection: distribution_distance, null_fraction_drift, mean_drift. (5) Dashboard pre-costruite in Catalog Explorer. (6) Integrabile con alerting per notifiche su soglie.',
          },
        ]
      },
    }
  }

  // ─── STATE ───
  let currentTopic = '1.1'
  let progress = loadProgress()

  // ─── INIT ───
  document.addEventListener('DOMContentLoaded', () => {
    renderNav()
    renderTopic(currentTopic)
    updateProgress()

    // Clic su topic o sezione
    document.querySelector('#nav').addEventListener('click', (e) => {
      const link = e.target.closest('[data-topic]')
      const sectionTitle = e.target.closest('.nav-section-title')
      if (link) {
        e.preventDefault()
        const topic = link.dataset.topic
        if (topic !== currentTopic) {
          currentTopic = topic
          document.querySelectorAll('.nav-subtopics a').forEach(a => a.classList.remove('active'))
          link.classList.add('active')
          // Ensure parent section is active
          document.querySelectorAll('.nav-section-title').forEach(t => t.classList.remove('active'))
          const parentSec = link.closest('.nav-section').querySelector('.nav-section-title')
          if (parentSec) parentSec.classList.add('active')
          renderTopic(currentTopic)
        }
      } else if (sectionTitle) {
        const section = sectionTitle.closest('.nav-section')
        const isActive = sectionTitle.classList.contains('active')
        if (!isActive) {
          document.querySelectorAll('.nav-section-title').forEach(t => t.classList.remove('active'))
          sectionTitle.classList.add('active')
          const firstTopic = section.querySelector('[data-topic]')
          if (firstTopic) {
            document.querySelectorAll('.nav-subtopics a').forEach(a => a.classList.remove('active'))
            firstTopic.classList.add('active')
            currentTopic = firstTopic.dataset.topic
            renderTopic(currentTopic)
          }
        }
      }
    })

    // Copy button
    document.querySelector('#content').addEventListener('click', (e) => {
      const btn = e.target.closest('.copy-btn')
      if (!btn) return
      const code = btn.closest('.code-block').querySelector('code')
      if (!code) return
      const text = code.textContent
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = 'Copiato!'
        setTimeout(() => { btn.textContent = 'Copia' }, 1500)
      }).catch(() => {
        btn.textContent = 'Errore'
      })
    })

    // Checkbox studiato
    document.querySelector('#content').addEventListener('change', (e) => {
      if (e.target.classList.contains('studied-check')) {
        const topicId = e.target.dataset.topic
        if (e.target.checked) {
          markStudied(topicId)
        } else {
          unmarkStudied(topicId)
        }
        updateProgress()
      }
    })
  })

  // ─── RENDER NAV ───
  function renderNav () {
    const nav = document.querySelector('#nav')
    nav.innerHTML = ''
    data.sections.forEach(sec => {
      const active = sec.id === '1'
      const div = document.createElement('div')
      div.className = 'nav-section'
      div.dataset.section = sec.id
      div.innerHTML = `
        <div class="nav-section-title ${active ? 'active' : ''}">
          <span class="section-num">${sec.id.padStart(2, '0')}</span>
          <span>${sec.title}</span>
          <span class="weight">${sec.weight}</span>
        </div>
        <div class="nav-subtopics">
          ${sec.topics.map(t => `
            <a href="#"
               data-topic="${t.id}"
               class="${t.id === currentTopic ? 'active' : ''}">
              ${t.id} ${t.title}
            </a>
          `).join('')}
        </div>
      `
      nav.appendChild(div)
    })
  }

  // ─── RENDER TOPIC ───
  function renderTopic (topicId) {
    const topic = data.topics[topicId]
    if (!topic) return
    const container = document.querySelector('#contentInner')
    const studied = isStudied(topicId)
    let html = ''

    // Header
    html += `<h2>${topic.title}</h2>`
    if (topic.subtitle) {
      html += `<p class="section-subtitle">${topic.subtitle}</p>`
    }
    html += `<div class="section-meta">
      <span class="meta-badge">Sezione ${topic.sectionId} · Peso ${data.sections.find(s => s.id === topic.sectionId).weight}</span>
      <label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;color:var(--text-muted)">
        <input type="checkbox" class="studied-check" data-topic="${topicId}" ${studied ? 'checked' : ''} style="accent-color:var(--accent)">
        Studiato
      </label>
    </div>`

    // Parts
    topic.parts.forEach(part => {
      html += renderPart(part)
    })

    container.innerHTML = html
    container.scrollTop = 0
    document.querySelector('#content').scrollTop = 0
  }

  // ─── RENDER PART ───
  function renderPart (part) {
    switch (part.type) {
      case 'heading':
        return `<h${part.level}>${esc(part.text)}</h${part.level}>`

      case 'paragraph':
        return `<p>${part.text}</p>`

      case 'card':
        return `
          <div class="card">
            <h4>${esc(part.title)}</h4>
            <ul>
              ${part.items.map(i => `<li>${i}</li>`).join('')}
            </ul>
          </div>`

      case 'key_point':
        return `
          <div class="key-point">
            <div class="kp-label">Punto Chiave</div>
            <p>${part.text}</p>
          </div>`

      case 'exam_tip':
        return `
          <div class="exam-tip">
            <div class="tip-label">⚠ Exam Tip</div>
            <p>${part.text}</p>
          </div>`

      case 'table':
        return `
          <div class="table-wrap">
            <table>
              <thead><tr>${part.headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>
              <tbody>
                ${part.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
              </tbody>
            </table>
          </div>`

      case 'code':
        return `
          <div class="code-block">
            <div class="code-header">
              <span class="lang-label">${esc(part.lang)}</span>
              <span>${esc(part.label || '')}</span>
              <button class="copy-btn">Copia</button>
            </div>
            <pre><code>${esc(part.code)}</code></pre>
          </div>`

      default:
        return ''
    }
  }

  // ─── ESCAPE HTML ───
  function esc (s) {
    const d = document.createElement('div')
    d.textContent = s
    return d.innerHTML
  }

  // ─── PROGRESS ───
  function loadProgress () {
    try {
      const p = JSON.parse(localStorage.getItem(STORAGE_KEY))
      return Array.isArray(p) ? p : []
    } catch { return [] }
  }

  function saveProgress () {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }

  function isStudied (topicId) {
    return progress.includes(topicId)
  }

  function markStudied (topicId) {
    if (!progress.includes(topicId)) {
      progress.push(topicId)
      saveProgress()
    }
  }

  function unmarkStudied (topicId) {
    progress = progress.filter(p => p !== topicId)
    saveProgress()
  }

  function updateProgress () {
    const total = Object.keys(data.topics).length
    const done = progress.filter(p => data.topics[p]).length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0
    document.querySelector('#progressFill').style.width = pct + '%'
    document.querySelector('#progressText').textContent = `${done}/${total} argomenti completati (${pct}%)`
  }

})()
