/* =============================================================================
   resume.data.js — single source of truth for the site.
   Loaded as a classic script (not a module) so the page also works over file://

   SYNC NOTE: content is derived from the LaTeX résumé at
   github.com/weiweikee/wchi_resume — `sections/*.tex` on `main` plus the
   role-variant branches (data-analyst, analytics-engineer, data-scientist,
   data-engineer). When that résumé changes, update this file.

   Every bullet carries `weight` per role. The default "unified" view sorts by
   weight.unified; picking a role re-sorts the same pool by weight[role].
   Nothing is ever hidden — low-relevance bullets simply sink and dim.
   ============================================================================= */

window.RESUME = {
  meta: {
    name: 'Wei-Wei Chi',
    title: 'Senior Data Analyst',
    employer: 'Capital One',
    location: 'Tysons, VA',
    // Assembled at runtime to avoid a plain-text address in the markup.
    emailUser: 'weiweikee',
    emailDomain: 'gmail.com',
    github: 'https://github.com/weiweikee',
    linkedin: 'https://www.linkedin.com/in/weisq',
    site: 'https://weiweikee.github.io/',
    updated: 'September 2026'
  },

  /* --------------------------------------------------------------------- */
  // `label` completes the sentence "Wei-Wei as ___" in the switcher.
  // `hero`  sits directly under the name, so it reads "Wei-Wei Chi / as a Data Analyst".
  // `as`    is the standalone phrase used in the page title and the toolbar note.
  roles: [
    {
      id: 'unified',
      label: 'Everything',
      as: 'Full-Stack Data Professional',
      hero: 'Full-Stack Data Professional',
      summary: 'Full-stack data professional with 7+ years spanning the entire data lifecycle — pipelines, transformation, BI, and statistics/ML — currently building executive technology-risk metrics at Capital One on Snowflake, Databricks, and QuickSight. Expert in SQL and Python, embedding self-service automated evaluation into developer pipelines. Published researcher, comfortable moving between statistical rigour, production data engineering, and senior-leadership storytelling.'
    },
    {
      id: 'data-analyst',
      label: 'a Data Analyst',
      as: 'a Data Analyst',
      hero: 'as a Data Analyst',
      summary: 'Senior data analyst with 7+ years turning complex technical and cyber-risk data into decisions leadership can act on. Two years specialising in Tech Risk &amp; Controls Analysis at Capital One, building certified executive dashboards that reach the CTO. Expert in SQL and Python, with deep AWS QuickSight and Tableau practice and a record of retiring manual reporting entirely.'
    },
    {
      id: 'analytics-engineer',
      label: 'an Analytics Engineer',
      as: 'an Analytics Engineer',
      hero: 'as an Analytics Engineer',
      summary: 'Analytics engineer who owns the layer between raw source systems and the dashboards executives trust. At Capital One I architect Snowflake and Databricks transformation pipelines, register governed datasets with AVRO schemas, and certify the semantic layers that executive reporting depends on. Expert SQL, with a habit of replacing expensive patterns with windowed ones.'
    },
    {
      id: 'data-scientist',
      label: 'a Data Scientist',
      as: 'a Data Scientist',
      hero: 'as a Data Scientist',
      summary: 'Data scientist with a published research background and 7+ years applying statistics and machine learning to messy operational data. I run non-parametric hypothesis testing for platform-migration decisions, scale NLP classification to millions of records on PySpark, and built CNN and computer-vision pipelines at CMU. Three peer-reviewed papers in ACM, Springer, and ASIS&amp;T venues.'
    },
    {
      id: 'data-engineer',
      label: 'a Data Engineer',
      as: 'a Data Engineer',
      hero: 'as a Data Engineer',
      summary: 'Data engineer focused on making pipelines fast, cheap, and hard to break. At Capital One I re-engineered a Spark pipeline to 18× throughput at 75% lower cost, refactored a monolith into an 8-module package with pytest and CI, and migrated authentication off legacy passwords to Unity Catalog OAuth. Expert SQL, distributed processing on Databricks, and Snowflake ELT.'
    }
  ],

  /* --------------------------------------------------------------------- */
  stats: {
    unified: [
      { value: 18, suffix: '×', label: 'pipeline throughput' },
      { value: 75, suffix: '%', label: 'runtime &amp; cost reduction' },
      { value: 7, suffix: '', label: 'teams adopted my dashboards' },
      { value: 3, suffix: '', label: 'peer-reviewed publications' }
    ],
    'data-analyst': [
      { value: 20, suffix: '+ hrs', label: 'saved per week' },
      { value: 7, suffix: '', label: 'teams adopted my dashboards' },
      { value: 5, suffix: '', label: 'control metrics to the CTO' },
      { value: 4, suffix: ' tabs', label: 'migrated ahead of deadline' }
    ],
    'analytics-engineer': [
      { value: 8, suffix: '', label: 'source systems unified' },
      { value: 95, suffix: '%', label: 'fewer rows after rewrite' },
      { value: 7, suffix: '', label: 'automated daily metrics' },
      { value: 26, suffix: '', label: 'metric tracker standardised' }
    ],
    'data-scientist': [
      { value: 4.5, suffix: 'M', label: 'records classified' },
      { value: 95, suffix: '%+', label: 'CNN defect accuracy' },
      { value: 50, suffix: 'K+', label: 'graph nodes analysed' },
      { value: 3, suffix: '', label: 'peer-reviewed publications' }
    ],
    'data-engineer': [
      { value: 18, suffix: '×', label: 'pipeline throughput' },
      { value: 75, suffix: '%', label: 'compute cost reduction' },
      { value: 63, suffix: '', label: 'repositories migrated' },
      { value: 8, suffix: '', label: 'module package with CI' }
    ]
  },

  /* --------------------------------------------------------------------- */
  experience: [
    {
      id: 'capitalone',
      org: 'Capital One',
      title: 'Senior Data Analyst',
      location: 'McLean, VA',
      start: '2024-06',
      end: null,
      dates: '06/2024 — Present',
      note: 'Technology Risk &amp; Controls Analysis',
      bullets: [
        {
          id: 'co-rte-spark',
          text: 'Re-engineered an enterprise Release Train Engineer keyword classification pipeline with distributed PySpark on Databricks, scaling capacity <strong>18×</strong> from 250K to 4.5M rows while cutting batch runtime <strong>75%</strong> (16 hrs → 4 hrs) and cloud compute cost by the same margin.',
          variants: {
            'data-scientist': 'Scaled a Release Train Engineer text classification model <strong>18×</strong> (250K → 4.5M records) via distributed PySpark on Databricks, cutting inference runtime and compute cost <strong>75%</strong>; ran exploratory agglomerative clustering with sentence-transformer embeddings alongside it.'
          },
          skills: ['PySpark', 'Databricks', 'Apache Spark', 'Python', 'Distributed Processing', 'Cost Optimization'],
          weight: { unified: 98, 'data-analyst': 55, 'analytics-engineer': 85, 'data-scientist': 88, 'data-engineer': 96 }
        },
        {
          id: 'co-nsm-pipeline',
          text: 'Scaled the Tech Transformation North Star Metrics pipeline from <strong>1 to 7</strong> automated daily metrics across 3 CEO-level imperatives, engineering a 10-step CTE Snowflake view that joins 8 source systems and 6 point-in-time snapshot tables with <code>MERGE INTO</code> and <code>QUALIFY ROW_NUMBER()</code> deduplication to power biweekly executive dashboards.',
          variants: {
            'data-analyst': 'Scaled the Tech Transformation North Star Metrics pipeline from <strong>1 to 7</strong> automated daily metrics on Databricks and Snowflake, delivering biweekly executive QuickSight dashboards across 3 strategic imperatives directly to senior leadership.',
            'data-engineer': 'Scaled automated ingestion from <strong>1 to 7</strong> daily metric snapshots by architecting an end-to-end Databricks and Snowflake ELT pipeline, with a 10-step CTE joining 8 source systems and 6 snapshot tables using <code>MERGE INTO</code> + <code>QUALIFY ROW_NUMBER()</code> upsert logic.'
          },
          skills: ['Snowflake', 'Databricks', 'SQL (Expert)', 'ETL/ELT Pipelines', 'Dimensional Modeling', 'AWS QuickSight'],
          weight: { unified: 96, 'data-analyst': 88, 'analytics-engineer': 95, 'data-scientist': 45, 'data-engineer': 97 }
        },
        {
          id: 'co-mbr-cto',
          text: 'Built and certified the Tech Risk MBR dashboard in AWS QuickSight, translating 5 core control-effectiveness metrics out of Snowflake SQL to replace manual monthly builds with production-certified data serving leadership up to the <strong>CTO</strong>.',
          variants: {
            'data-analyst': 'Automated the CTO-facing Technology Control Portfolio Effectiveness review in AWS QuickSight, translating <strong>5 core control metrics</strong> from Snowflake SQL to replace hand-built monthly decks with verified, production-certified data.'
          },
          skills: ['AWS QuickSight', 'Snowflake', 'SQL (Expert)', 'Executive MBR Dashboards', 'KPI Governance'],
          weight: { unified: 90, 'data-analyst': 96, 'analytics-engineer': 78, 'data-scientist': 40, 'data-engineer': 50 }
        },
        {
          id: 'co-dcio-migration',
          text: 'Led the full 4-tab Tableau-to-QuickSight migration of the DCIO Ineffective Controls dashboard ahead of the enterprise deadline, root-causing a Snowflake/QuickSight UTC driver timezone defect across 5 production views that had produced a <strong>2.6% data discrepancy</strong>, and saving 6+ hours per reporting cycle.',
          skills: ['AWS QuickSight', 'Tableau', 'Snowflake', 'Data Quality Controls'],
          weight: { unified: 85, 'data-analyst': 92, 'analytics-engineer': 74, 'data-scientist': 35, 'data-engineer': 55 }
        },
        {
          id: 'co-stats-search',
          text: 'Led experimental statistical evaluation for an enterprise search-platform migration, executing non-parametric hypothesis tests — Shapiro-Wilk normality, Hartigan’s dip, and Mann-Whitney U via <code>pingouin</code> — across latency tiers to give leadership a rigorous basis for the decision.',
          skills: ['Hypothesis Testing', 'Statistical Modeling', 'Python', 'R'],
          weight: { unified: 80, 'data-analyst': 60, 'analytics-engineer': 40, 'data-scientist': 97, 'data-engineer': 25 }
        },
        {
          id: 'co-spark-package',
          text: 'Refactored a monolithic Spark pipeline into an <strong>8-module</strong> Python package with comprehensive <code>pytest</code> suites and GitHub Actions CI/CD workflows compliant with enterprise security allowlists.',
          skills: ['Python', 'pytest', 'CI/CD', 'GitHub Actions', 'Apache Spark'],
          weight: { unified: 79, 'data-analyst': 25, 'analytics-engineer': 76, 'data-scientist': 55, 'data-engineer': 95 }
        },
        {
          id: 'co-qualify-rewrite',
          text: 'Optimised high-volume SQL transformation layers by replacing <code>SELECT DISTINCT</code> with windowed <code>QUALIFY ROW_NUMBER()</code>, cutting query result rows <strong>95%</strong> (20.9M → 1.0M) and eliminating redundant compute in capitalisation analytics.',
          skills: ['SQL (Expert)', 'Window Functions', 'Snowflake', 'Cost Optimization'],
          weight: { unified: 82, 'data-analyst': 45, 'analytics-engineer': 92, 'data-scientist': 40, 'data-engineer': 93 }
        },
        {
          id: 'co-sir-etb',
          text: 'Engineered the Strategic Initiative Register &amp; ETB Inventory Dashboard V2.0 with stagnation alerts and health tiers — adopted by <strong>7 teams</strong> and cutting weekly status reporting time <strong>50%</strong> — and built the Locking Controls Hub, retiring 4 hours/week of manual data pulls for the Business Controls team.',
          skills: ['AWS QuickSight', 'Executive MBR Dashboards', 'Automation', 'KPI Governance'],
          weight: { unified: 76, 'data-analyst': 90, 'analytics-engineer': 62, 'data-scientist': 30, 'data-engineer': 35 }
        },
        {
          id: 'co-jira-sotu',
          text: 'Engineered the Jira State of the Union and Roadmap dashboards, transitioning reporting to story-point velocity and scaling adoption across <strong>7 teams</strong>, eliminating 4–6 hours/week of manual slide-deck creation.',
          skills: ['AWS QuickSight', 'Jira', 'KPI Governance', 'Automation'],
          weight: { unified: 74, 'data-analyst': 94, 'analytics-engineer': 58, 'data-scientist': 30, 'data-engineer': 30 }
        },
        {
          id: 'co-ai-adoption',
          text: 'Engineered an enterprise AI-adoption analytics pipeline with cost modelling and token-consumption tracking, replacing arbitrary percentile thresholds with statistical clustering and catching 2 data-quality defects before deployment.',
          skills: ['Machine Learning', 'LLMs', 'Model Evaluation', 'Python', 'Data Quality Controls'],
          weight: { unified: 72, 'data-analyst': 50, 'analytics-engineer': 55, 'data-scientist': 90, 'data-engineer': 45 }
        },
        {
          id: 'co-ghec',
          text: 'Led migration of <strong>63 repositories</strong> to GitHub Enterprise Cloud with two-tier Microsoft Entra ID role-based entitlements, delivered 5+ weeks ahead of schedule.',
          skills: ['Git/GitHub', 'GHEC', 'Microsoft Entra ID (RBAC)', 'CI/CD'],
          weight: { unified: 71, 'data-analyst': 45, 'analytics-engineer': 70, 'data-scientist': 25, 'data-engineer': 82 }
        },
        {
          id: 'co-avro-mdat',
          text: 'Authored AVRO schemas registering metric metadata as governed Exchange (MDAT) datasets, and standardised data models and schema documentation across a <strong>26-metric</strong> tracker — resolving core data-quality defects and setting the standards that seeded the team’s OneDQ initiative.',
          skills: ['Data Governance (MDAT/Exchange)', 'Schema Design', 'Data Lineage', 'Data Quality Controls'],
          weight: { unified: 70, 'data-analyst': 40, 'analytics-engineer': 90, 'data-scientist': 30, 'data-engineer': 78 }
        },
        {
          id: 'co-unity-catalog',
          text: 'Hardened pipeline reliability and authentication by migrating off legacy passwords to Unity Catalog OAuth secrets, engineering a multi-threaded parallel runner with per-file error isolation, and implementing table-rename refresh routines that prevent 60-day Snowflake data loss.',
          skills: ['Unity Catalog', 'Databricks', 'Snowflake', 'AWS (Secrets Manager, S3, IAM)'],
          weight: { unified: 68, 'data-analyst': 20, 'analytics-engineer': 72, 'data-scientist': 25, 'data-engineer': 91 }
        },
        {
          id: 'co-dora',
          text: 'Conducted multi-dimensional statistical analysis and regression modelling on engineering lead times and developer productivity across complexity tiers, integrating DORA-style before-and-after inference with commit-level code-share metrics.',
          skills: ['Regression Analysis', 'Statistical Modeling', 'Causal Inference', 'Python'],
          weight: { unified: 66, 'data-analyst': 55, 'analytics-engineer': 45, 'data-scientist': 92, 'data-engineer': 30 }
        },
        {
          id: 'co-lna',
          text: 'Delivered predictive onboarding insights through a Learning Needs Assessment statistical analysis for Tech College, optimising scheduling and curriculum sequencing for ~1,000 associates annually across 3 executive imperatives.',
          skills: ['Statistical Modeling', 'Python', 'Regression Analysis'],
          weight: { unified: 58, 'data-analyst': 62, 'analytics-engineer': 30, 'data-scientist': 80, 'data-engineer': 20 }
        }
      ]
    },

    {
      id: 'jhu',
      org: 'Bloomberg Center for Public Innovation, Johns Hopkins University',
      title: 'Data Analyst',
      location: 'Baltimore, MD',
      start: '2023-02',
      end: '2024-06',
      dates: '02/2023 — 06/2024',
      bullets: [
        {
          id: 'jhu-geospatial',
          text: 'Cut weekly ad-hoc reporting requests <strong>35%</strong> — saving <strong>20+ hours/week</strong> — by designing interactive geospatial dashboards in Dash Plotly wired to Salesforce REST APIs that automated recurring cross-functional reporting.',
          variants: {
            'data-engineer': 'Cut ad-hoc data requests <strong>35%</strong> (20+ hrs/week) by architecting a scalable GIS data pipeline with Dash Plotly and Salesforce REST API integration for automated spatial data delivery.'
          },
          skills: ['Dash', 'Plotly', 'Python', 'Automation', 'ETL/ELT Pipelines'],
          weight: { unified: 92, 'data-analyst': 95, 'analytics-engineer': 82, 'data-scientist': 78, 'data-engineer': 84 }
        },
        {
          id: 'jhu-census-etl',
          text: 'Eliminated <strong>120+ hours</strong> of manual data entry annually by engineering end-to-end Python and SQL ETL pipelines integrating Salesforce and US Census REST APIs into a centralised warehouse.',
          skills: ['Python', 'SQL (Expert)', 'ETL/ELT Pipelines', 'Automation'],
          weight: { unified: 88, 'data-analyst': 88, 'analytics-engineer': 90, 'data-scientist': 70, 'data-engineer': 92 }
        },
        {
          id: 'jhu-sparql',
          text: 'Automated extraction of public municipal data with SPARQL and Python, consolidating disparate sources into a unified relational schema with data-quality controls and establishing governance standards for ingestion.',
          skills: ['Python', 'SQL (Expert)', 'Schema Design', 'Data Governance (MDAT/Exchange)', 'Data Quality Controls'],
          weight: { unified: 78, 'data-analyst': 76, 'analytics-engineer': 86, 'data-scientist': 72, 'data-engineer': 88 }
        },
        {
          id: 'jhu-apex',
          text: 'Reduced database write latency <strong>40%</strong> by streamlining Salesforce data-entry workflows with custom Apex Triggers, automating backend validation and eliminating manual errors at the write layer.',
          skills: ['Automation', 'Data Quality Controls', 'Schema Design'],
          weight: { unified: 70, 'data-analyst': 72, 'analytics-engineer': 78, 'data-scientist': 55, 'data-engineer': 84 }
        },
        {
          id: 'jhu-nlp',
          text: 'Developed and scaled an NLP text-clustering pipeline using embedding models to classify <strong>5,000+</strong> job titles, sharpening the granularity of organisational talent data for downstream analytics.',
          skills: ['NLP', 'Machine Learning', 'Python', 'Scikit-learn'],
          weight: { unified: 74, 'data-analyst': 68, 'analytics-engineer': 62, 'data-scientist': 94, 'data-engineer': 66 }
        }
      ]
    },

    {
      id: 'umd',
      org: 'Open and Sustainable Innovation Systems (OASIS) Lab, University of Maryland',
      title: 'Ph.D. Candidate (Information Science) &amp; Graduate Research Assistant',
      location: 'College Park, MD',
      start: '2019-08',
      end: '2022-08',
      dates: '08/2019 — 08/2022',
      bullets: [
        {
          id: 'umd-sna',
          text: 'Published <strong>2 peer-reviewed articles</strong> in top-tier information science venues, conducting advanced quantitative research and social network analysis on <strong>50K+ node</strong> graph structures with Python and Gephi.',
          skills: ['Python', 'Statistical Modeling', 'Gephi', 'Machine Learning'],
          weight: { unified: 88, 'data-analyst': 74, 'analytics-engineer': 66, 'data-scientist': 95, 'data-engineer': 62 }
        },
        {
          id: 'umd-database',
          text: 'Architected and populated a <strong>5,000+ record</strong> relational research database in SQL with strict schema validation and data-quality controls, optimising downstream statistical analysis and research reproducibility.',
          skills: ['SQL (Expert)', 'Schema Design', 'Data Quality Controls', 'Dimensional Modeling'],
          weight: { unified: 80, 'data-analyst': 72, 'analytics-engineer': 90, 'data-scientist': 76, 'data-engineer': 92 }
        },
        {
          id: 'umd-selenium',
          text: 'Accelerated data-collection throughput <strong>5×</strong> by building a Python Selenium web-scraping pipeline that automated harvesting from <strong>10,000+</strong> public web pages, reducing research cycle times <strong>80%</strong>.',
          skills: ['Python', 'Selenium', 'Automation', 'ETL/ELT Pipelines'],
          weight: { unified: 82, 'data-analyst': 70, 'analytics-engineer': 78, 'data-scientist': 80, 'data-engineer': 88 }
        },
        {
          id: 'umd-asist',
          text: 'Synthesised literature on digital information infrastructures to co-author a peer-reviewed paper in the <em>Proceedings of the Association for Information Science and Technology</em> (ASIS&amp;T).',
          skills: ['Statistical Modeling'],
          weight: { unified: 64, 'data-analyst': 50, 'analytics-engineer': 40, 'data-scientist': 84, 'data-engineer': 35 }
        }
      ]
    },

    {
      id: 'cmu',
      org: 'Human-Computer Interaction Institute, Carnegie Mellon University',
      title: 'Graduate Research Assistant',
      location: 'Pittsburgh, PA',
      start: '2018-01',
      end: '2019-05',
      dates: '01/2018 — 05/2019',
      bullets: [
        {
          id: 'cmu-cnn',
          text: 'Achieved <strong>95%+ accuracy</strong> in robotic manufacturing defect identification by building a real-time convolutional neural network pipeline with OpenCV and TensorFlow for surface inspection.',
          skills: ['TensorFlow', 'OpenCV', 'Machine Learning', 'Python'],
          weight: { unified: 86, 'data-analyst': 55, 'analytics-engineer': 48, 'data-scientist': 96, 'data-engineer': 60 }
        },
        {
          id: 'cmu-fiber',
          text: 'Achieved <strong>90%+ classification accuracy</strong> in urban pedestrian-flow analysis by engineering signal-processing algorithms for a fiber-optic concrete sensor system, applying machine learning to classify and visualise flow patterns.',
          skills: ['Machine Learning', 'Python', 'MATLAB', 'Statistical Modeling'],
          weight: { unified: 76, 'data-analyst': 50, 'analytics-engineer': 40, 'data-scientist': 90, 'data-engineer': 52 }
        },
        {
          id: 'cmu-ocr',
          text: 'Reduced manual data-entry cycles <strong>60%</strong> by prototyping a computer-vision (OpenCV) image-processing pipeline that automated structured data extraction from handwritten notebooks.',
          skills: ['OpenCV', 'Python', 'Automation'],
          weight: { unified: 68, 'data-analyst': 48, 'analytics-engineer': 44, 'data-scientist': 82, 'data-engineer': 58 }
        }
      ]
    }
  ],

  /* --------------------------------------------------------------------- */
  skills: {
    unified: [
      { group: 'Languages &amp; Core', items: ['Python', 'SQL (Expert)', 'PySpark', 'Apache Spark', 'R', 'Bash/Shell', 'YAML', 'Jinja', 'HTML/CSS', 'C/C++'] },
      { group: 'Data Platforms &amp; Engineering', items: ['Snowflake', 'Databricks', 'Unity Catalog', 'dbt', 'ETL/ELT Pipelines', 'Dimensional Modeling', 'Semantic Layer', 'Distributed Processing', 'Window Functions', 'Airflow'] },
      { group: 'BI &amp; Visualization', items: ['AWS QuickSight', 'Tableau', 'Power BI', 'Dash', 'Plotly', 'D3.js', 'Matplotlib', 'Gephi', 'Executive MBR Dashboards'] },
      { group: 'Statistics &amp; Machine Learning', items: ['Statistical Modeling', 'Hypothesis Testing', 'Regression Analysis', 'A/B Testing', 'Causal Inference', 'NLP', 'LLMs', 'Model Evaluation', 'Scikit-learn', 'TensorFlow', 'OpenCV'] },
      { group: 'DevOps &amp; Governance', items: ['Git/GitHub', 'GHEC', 'CI/CD', 'GitHub Actions', 'pytest', 'SQLFluff', 'Docker', 'Microsoft Entra ID (RBAC)', 'Data Governance (MDAT/Exchange)', 'Data Lineage', 'Data Quality Controls', 'Selenium'] }
    ],
    'data-analyst': [
      { group: 'Data Visualization &amp; BI', items: ['AWS QuickSight', 'Tableau', 'Power BI', 'Dash', 'Plotly', 'D3.js', 'Executive MBR Dashboards', 'KPI Governance', 'A/B Testing'] },
      { group: 'Programming &amp; Analysis', items: ['SQL (Expert)', 'Python', 'PySpark', 'R', 'Statistical Modeling', 'Regression Analysis', 'Hypothesis Testing', 'Bash/Shell', 'Automation'] },
      { group: 'Platforms &amp; Governance', items: ['Snowflake', 'Databricks', 'Data Governance (MDAT/Exchange)', 'Microsoft Entra ID (RBAC)', 'Git/GitHub', 'GHEC', 'Jira', 'SQLFluff', 'Docker', 'Selenium'] }
    ],
    'analytics-engineer': [
      { group: 'Languages &amp; Core', items: ['SQL (Expert)', 'Python', 'PySpark', 'Jinja', 'YAML', 'Bash/Shell', 'HTML/CSS'] },
      { group: 'Data &amp; Analytics Engineering', items: ['Snowflake', 'Databricks', 'dbt', 'Unity Catalog', 'Dimensional Modeling', 'Semantic Layer', 'ETL/ELT Pipelines', 'Data Governance (MDAT/Exchange)', 'Data Lineage', 'Automated Testing', 'Airflow'] },
      { group: 'DevOps &amp; Governance', items: ['Git/GitHub', 'GHEC', 'CI/CD', 'Microsoft Entra ID (RBAC)', 'SQLFluff', 'pytest', 'Version Control', 'Technical Mentorship'] },
      { group: 'BI &amp; Visualization', items: ['AWS QuickSight', 'Tableau', 'Power BI', 'Dash', 'Plotly', 'D3.js', 'Matplotlib', 'Gephi'] }
    ],
    'data-scientist': [
      { group: 'Data Science &amp; ML', items: ['Machine Learning', 'LLMs', 'Prompt Engineering', 'Model Evaluation', 'NLP', 'Statistical Modeling', 'Regression Analysis', 'A/B Testing', 'Hypothesis Testing', 'Causal Inference'] },
      { group: 'Languages &amp; Frameworks', items: ['Python', 'SQL (Expert)', 'PySpark', 'Apache Spark', 'R', 'TensorFlow', 'Scikit-learn', 'OpenCV', 'MATLAB', 'Bash/Shell', 'LaTeX'] },
      { group: 'Platforms &amp; Analytics', items: ['Snowflake', 'Databricks', 'AWS QuickSight', 'Tableau', 'Power BI', 'Docker', 'Git/GitHub', 'GHEC', 'Selenium', 'Gephi'] }
    ],
    'data-engineer': [
      { group: 'Languages &amp; Core', items: ['Python', 'SQL (Expert)', 'PySpark', 'Apache Spark', 'Bash/Shell', 'Java', 'Scala', 'C/C++'] },
      { group: 'Data Engineering', items: ['Snowflake', 'Databricks', 'Unity Catalog', 'ETL/ELT Pipelines', 'Distributed Processing', 'Schema Design', 'Upsert/MERGE INTO', 'Window Functions', 'Cost Optimization', 'Data Lineage'] },
      { group: 'Cloud, DevOps &amp; Security', items: ['AWS (Secrets Manager, S3, IAM)', 'Git/GitHub', 'GHEC', 'CI/CD', 'Microsoft Entra ID (RBAC)', 'SQLFluff', 'pytest', 'Docker', 'Kubernetes', 'LaTeX'] }
    ]
  },

  /* --------------------------------------------------------------------- */
  publications: [
    {
      authors: 'Chi, W.-W. &amp; Byrne, D.',
      year: 2020,
      title: 'Cultivating Material Knowledge: Experiments with a Low Cost Interface for 3D Texture Scanning',
      venue: 'Proceedings of the 2020 ACM Designing Interactive Systems Conference (DIS ’20), pp. 1089–1102',
      doi: '10.1145/3357236.3395579'
    },
    {
      authors: 'Chan, J., Brier, J., Farhadi, Z., Lee, M., Janzen, S., Chi, W.-W., Fellows, A. &amp; Winter, S.',
      year: 2020,
      title: 'A theoretical analysis of independent business owners’ preferences for informal information sources',
      venue: 'Proceedings of the Association for Information Science and Technology, 57(1): e352',
      doi: '10.1002/pra2.352'
    },
    {
      authors: 'Bard, J., Bidgoli, A. &amp; Chi, W.-W.',
      year: 2019,
      title: 'Image Classification for Robotic Plastering with Convolutional Neural Network',
      venue: 'Robotic Fabrication in Architecture, Art and Design 2018, Springer, pp. 3–15',
      isbn: '978-3-319-92294-2'
    }
  ],

  /* --------------------------------------------------------------------- */
  education: [
    {
      school: 'Carnegie Mellon University',
      degree: 'M.S. in Computational Design (Computer Science and Design)',
      location: 'Pittsburgh, PA',
      dates: '08/2017 — 06/2019',
      detail: 'Coursework: Machine Learning, Computer Vision, Physics-based Methods in Vision, Sensor &amp; Sensing',
      thesis: '3D Microscopic Texture Interface in Computer-Aided Design',
      gpa: 'GPA 3.68 / 4.00',
      hidden: false
    },
    {
      school: 'University of Denver',
      degree: 'B.S. in Business Administration',
      location: 'Denver, CO',
      dates: '03/2015 — 06/2017',
      detail: '',
      gpa: 'GPA 3.91 / 4.00 · Magna Cum Laude',
      hidden: false
    },
    // Commented out on `main` in sections/regular/education.tex.
    // Flip `hidden` to false to surface it under Education; the 2019-2022 window
    // already appears under Experience via the OASIS Lab role.
    {
      school: 'University of Maryland, College Park',
      degree: 'Ph.D. Program in Information Science — Coursework Completed',
      location: 'College Park, MD',
      dates: '08/2019 — 08/2022',
      detail: 'Coursework: Statistical Modeling, Information Visualization, Research Methods',
      gpa: 'GPA 3.83 / 4.00',
      hidden: true
    }
  ],

  /* --------------------------------------------------------------------- */
  certifications: [
    { name: 'AWS Certified Cloud Practitioner (CLF-C01)', issuer: 'AWS Training and Certification', date: '01/2023', hidden: false },
    // Present in sections/certification.tex but commented out on `main`.
    // Flip `hidden` to false on any of these to show a "Continuing education" list.
    { name: 'Data Engineering, Big Data, and Machine Learning on GCP', issuer: 'Google Cloud (Coursera)', date: '01/2023', hidden: true },
    { name: 'Accelerated Computer Science Fundamentals Specialization', issuer: 'University of Illinois at Urbana-Champaign (Coursera)', date: '01/2022', hidden: true },
    { name: 'Data Science Foundations: Data Structures and Algorithms', issuer: 'University of Colorado Boulder (Coursera)', date: '01/2022', hidden: true },
    { name: 'Build a Modern Computer from First Principles: Nand to Tetris', issuer: 'The Hebrew University of Jerusalem (Coursera)', date: '11/2021', hidden: true },
    { name: 'Discrete Mathematics for Computer Science Specialization', issuer: 'University of California, San Diego (Coursera)', date: '08/2021', hidden: true },
    { name: 'Mathematics for Machine Learning Specialization', issuer: 'Imperial College London (Coursera)', date: '07/2019', hidden: true }
  ],

  /* --------------------------------------------------------------------- */
  timeline: [
    { label: 'University of Denver', short: 'Denver', kind: 'edu', start: '2015-03', end: '2017-06' },
    { label: 'Carnegie Mellon University', short: 'CMU', kind: 'edu', start: '2017-08', end: '2019-06' },
    { label: 'CMU — HCII Research', short: 'HCII', kind: 'work', start: '2018-01', end: '2019-05' },
    { label: 'UMD — OASIS Lab', short: 'OASIS Lab', kind: 'work', start: '2019-08', end: '2022-08' },
    { label: 'Johns Hopkins — Bloomberg Center', short: 'Johns Hopkins', kind: 'work', start: '2023-02', end: '2024-06' },
    { label: 'Capital One', short: 'Capital One', kind: 'work', start: '2024-06', end: null }
  ]
};
