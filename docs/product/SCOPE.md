# DaysNotWeeks — Product Scope 2.0

- **Versión:** Product Scope 2.0
- **Estado:** APPROVED / CANONICAL
- **Producto:** DaysNotWeeks
- **Naturaleza:** feature-closed SaaS foundation
- **Principio:** minimum essential infrastructure, maximum adaptability
- **Autoridad:** este documento es el único contrato de producto vigente.
- **Base de decisión:** Product Scope 1.1 + decisiones explícitas de producto + Technology & Architecture Research 2026-09-28

---

# 1. Product definition

DaysNotWeeks es una foundation SaaS premium para founders técnicos y pequeños equipos que construyen productos de **cuenta individual con suscripción recurrente**.

El stack soportado es deliberadamente único:

- Next.js App Router
- React
- TypeScript strict
- Node.js LTS
- Supabase Auth
- Supabase Postgres
- Row Level Security
- Stripe
- Tailwind CSS
- Vercel

La foundation debe resolver correctamente las partes fundacionales difíciles de un SaaS para que el comprador pueda empezar directamente por su producto.

No intenta proporcionar el mayor número de funcionalidades.

Optimiza para:

1. fast shipping;
2. bajo overhead conceptual;
3. seguridad;
4. mantenibilidad;
5. adaptación;
6. claridad de arquitectura;
7. comportamiento verificable;
8. buena experiencia para humanos y coding agents;
9. escalabilidad razonable sin infraestructura prematura.

La métrica principal no es cuántas features incluye.

La métrica principal es:

> cuánto trabajo fundacional correcto deja de tener que reconstruir el comprador antes de empezar su producto.

---

# 2. ICP

DaysNotWeeks está diseñado para:

- technical founders;
- equipos pequeños de aproximadamente 1–5 developers;
- productos SaaS de cuenta individual;
- un modelo Free + un único nivel Pro;
- suscripción mensual o anual;
- productos cuya feature principal todavía debe construirse;
- equipos que prefieren una foundation pequeña, explícita y profundamente integrada.

El modelo soportado es:

```text
user
└── owns data
    └── may have Pro access
```

No existe dentro del producto soportado:

```text
organization
workspace
team
membership
seat
role
```

El equipo que desarrolla el SaaS puede tener varias personas.

Los clientes del SaaS no comparten una organización dentro del modelo DaysNotWeeks.

---

# 3. Product promise

Un comprador debe poder:

1. clonar el repositorio;
2. instalarlo de forma reproducible;
3. configurar marca y contenido;
4. configurar Supabase;
5. configurar Google OAuth;
6. configurar SMTP Auth;
7. configurar Stripe;
8. aplicar migrations;
9. desplegar en Vercel;
10. registrar y autenticar usuarios;
11. recuperar una cuenta;
12. almacenar datos privados aislados mediante RLS;
13. cobrar Pro mensual o anual;
14. obtener acceso Pro desde hechos financieros confiables;
15. gestionar billing mediante Stripe Customer Portal;
16. diagnosticar y reparar una discrepancia de billing;
17. sustituir el Example Resource por el dominio real sin reconstruir Auth, Billing o la foundation.

---

# 4. Product principles

## P1 — One supported path per important job

Cada frontera core tiene una solución soportada.

No se mantienen alternativas equivalentes por defecto.

---

## P2 — Permanent complexity must earn its place

Una pieza de infraestructura sólo entra cuando su ausencia:

- rompe un journey fundamental; o
- obligaría habitualmente al comprador a reconstruir una frontera delicada.

No se incluye infraestructura porque “pueda ser útil más adelante”.

---

## P3 — No speculative abstraction

No existen interfaces, adapters, plugin systems o frameworks genéricos para proveedores que el producto no soporta.

Una abstracción debe resolver una repetición real del producto actual.

---

## P4 — Trust boundaries are explicit

La UI no constituye autorización.

Identidad, ownership, autorización, entitlement y estado financiero utilizan límites server/database adecuados.

---

## P5 — Example proves the foundation

El dominio de ejemplo existe para demostrar que:

```text
Auth
→ ownership
→ RLS
→ entitlement
→ CRUD
```

funcionan conjuntamente.

No existe para convertirse en un producto de demostración complejo.

---

## P6 — Feature-closed, actively maintained

DaysNotWeeks está cerrado respecto a funcionalidades.

Mantenimiento sí incluye:

- security patches;
- compatibility fixes;
- dependency updates necesarios;
- cambios requeridos por Next.js, Supabase, Stripe o Vercel;
- bug fixes;
- regression fixes;
- corrección de documentación.

Mantenimiento no autoriza automáticamente nuevas features.

---

## P7 — OUT means OUT

No existe P1, P2 ni POST-V1 como roadmap implícito.

Una capacidad marcada OUT no forma parte del producto ni constituye deuda pendiente.

Añadirla requiere una nueva decisión explícita de producto.

---

# 5. Foundation — IN

## F1 — Runtime and application

DaysNotWeeks entrega una única aplicación Next.js App Router.

Baseline arquitectónico:

- Node.js LTS soportado;
- React compatible con la release elegida de Next.js;
- TypeScript strict;
- RSC para composición/lecturas cuando sean apropiados;
- Server Actions para mutaciones de UI cuando simplifiquen el flujo;
- Route Handlers cuando se necesite semántica HTTP explícita;
- Turbopack/default tooling de la familia Next soportada;
- un único package manager y lockfile.

Las versiones concretas se fijan y verifican en cada release.

El Product Scope no obliga a perseguir automáticamente la última versión publicada.

---

## F2 — Configuration

La configuración debe estar centralizada y ser fácil de localizar.

Conceptualmente:

```text
config/
  product.ts
  site.ts
  billing.ts
```

La estructura literal puede variar si existe una opción más simple.

### Código versionado

Contiene información como:

- nombre;
- branding;
- navegación;
- contenido;
- capacidades;
- Free + Pro;
- monthly + annual;
- moneda soportada;
- comportamiento de producto.

### Environment

Contiene únicamente información que sea:

- secreta; o
- específica del entorno/proveedor.

Ejemplos:

- Supabase URLs/keys;
- Stripe secret key;
- Stripe webhook secret;
- Stripe Price IDs;
- identificadores de proveedor;
- URLs externas específicas del entorno.

Cada dato debe tener una autoridad clara.

---

## F3 — Catalog authority

El producto soporta un catálogo lógico:

```text
free
pro_monthly
pro_annual
```

El código decide qué opciones pueden venderse.

Los Price IDs correspondientes se configuran por entorno.

Stripe Price es la autoridad de:

- amount;
- currency;
- recurrence interval.

La aplicación no mantiene manualmente esos importes en múltiples lugares.

La UI pública puede utilizar una representación derivada/cacheada del catálogo validado.

Un Price archivado para nuevas ventas no invalida automáticamente una suscripción histórica que ya utilizaba ese Price.

---

# 6. Identity — IN

Supabase Auth es la única autoridad de identidad.

DaysNotWeeks soporta exactamente dos caminos de autenticación.

## Google OAuth

Incluye:

- alta;
- login;
- callback;
- cancelación/error;
- sesión compartida;
- retorno interno seguro.

Los secretos Google se configuran mediante el proveedor correspondiente y Supabase.

No se exponen al browser.

---

## Email/password

Incluye:

- signup;
- email verification;
- resend verification;
- login;
- forgot password;
- reset password;
- session;
- logout.

---

## Session rules

La identidad sensible se valida mediante los mecanismos server-side recomendados por Supabase para la versión soportada.

No se confía en estado de UI como prueba de identidad.

Las mutaciones vuelven a comprobar identidad/autorización.

Los redirects de Auth aceptan únicamente destinos internos válidos.

Fallback recomendado:

```text
/app
```

---

## Account

El usuario puede:

- ver email/identidad;
- editar display name;
- recuperar/resetear password;
- logout;
- acceder a ayuda.

No se realiza linking manual de cuentas basándose únicamente en igualdad de email.

---

# 7. Auth email — IN

Password verification y recovery requieren un SMTP real en entornos alojados.

El único camino soportado de referencia es:

```text
Supabase Auth
→ Resend SMTP
```

DaysNotWeeks documenta:

- dominio/remitente;
- SPF/DKIM cuando corresponda;
- configuración SMTP;
- callbacks;
- diferencias local/staging/production;
- prueba de entrega.

Local utiliza el mecanismo de captura de correo del entorno Supabase.

No se instala Resend SDK en la aplicación sólo para este job.

No existe framework de email de aplicación.

---

# 8. Database and private data — IN

Supabase Postgres es la única base de datos soportada.

El contrato utiliza:

- SQL migrations versionadas;
- RLS;
- grants explícitos;
- constraints;
- índices necesarios;
- tipos TypeScript generados desde el schema;
- seed local mínimo cuando sea necesario.

La autoridad del schema es:

```text
SQL migrations
```

Los tipos generados son derivados.

No existe un schema paralelo editable manualmente en TypeScript.

No existe ORM por defecto.

---

## Ownership

Los recursos privados pertenecen a una identidad concreta.

El cliente no puede:

- escoger arbitrariamente otro owner;
- transferir ownership;
- modificar estado financiero;
- modificar entitlement.

RLS protege los datos incluso cuando se accede mediante la Data API.

Autorización en UI o Server Action no sustituye RLS.

---

# 9. App shell — IN

## Dashboard

`/app` es una dashboard CORE.

Debe ser:

- genérica;
- limpia;
- neutral;
- fácil de rebrandear;
- útil como punto de entrada;
- libre de métricas ficticias.

Puede presentar información real como:

- saludo;
- plan;
- estado de cuenta;
- billing;
- acceso al Example Resource;
- indicación de dónde comienza el producto del comprador.

No se construye una dashboard universal.

---

## Example Resource

DaysNotWeeks entrega un único recurso EXAMPLE deliberadamente simple.

Conceptualmente:

```text
id
user_id
title
content
created_at
updated_at
```

Debe demostrar:

- creación;
- lectura;
- edición;
- eliminación;
- ownership;
- RLS;
- entitlement.

### Free

Puede:

- leer sus recursos existentes;
- eliminar sus recursos existentes.

No puede:

- crear;
- editar.

### Pro

Puede:

- crear;
- leer;
- editar;
- eliminar sus propios recursos.

### Revoked Pro

Pierde create/edit.

Conserva read/delete sobre sus propios datos retenidos.

---

## Replaceability requirement

El Example Resource no puede convertirse en dependencia de:

- Auth;
- Billing;
- Account;
- configuration;
- global app shell.

El comprador debe poder sustituirlo por otro dominio sin modificar las fronteras anteriores.

---

# 10. Billing — IN

DaysNotWeeks soporta:

```text
Free

Pro
├── Monthly
└── Annual
```

Monthly y Annual conceden el mismo entitlement:

```text
pro
```

Existe una sola moneda configurada por release/producto.

No existe otro nivel pagado.

---

# 11. Stripe responsibilities

Stripe proporciona:

- Checkout;
- Customer;
- subscription;
- invoices;
- payment methods;
- Customer Portal;
- receipts;
- cancelación;
- estado financiero.

La aplicación decide server-side qué opción comercial puede comprarse.

El cliente no envía como autoridad:

- arbitrary Price ID;
- customer ID;
- subscription ID;
- entitlement.

---

# 12. Financial truth and local projection

Stripe es la fuente financiera de verdad.

DaysNotWeeks mantiene una **proyección local mínima y reconstruible** para poder autorizar sin consultar Stripe en cada request.

La proyección debe contener suficiente información para responder correctamente:

> ¿tiene este usuario acceso Pro ahora?

No se utiliza un simple booleano `is_pro` editable como modelo financiero.

---

## Minimum semantic state

La implementación debe poder representar conceptualmente:

### Billing identity

- application user;
- Stripe customer;
- subscription reference.

### Subscription state

- supported Price;
- interval;
- relevant Stripe state.

### Paid access

- evidencia del último periodo reconocido;
- `paid-through`;
- origen financiero correspondiente;
- fecha de sincronización.

### Projection version

Una versión/control equivalente debe impedir que un cálculo antiguo sobrescriba un estado más reciente.

La estructura exacta de tablas es decisión de Engineering.

---

# 13. Pro entitlement

Existe un único entitlement funcional:

```text
pro
```

La DB proporciona una única frontera canónica para consultar ese permiso.

Conceptualmente:

```text
has_pro()
```

El cliente no proporciona un `user_id` arbitrario a esta función para consultar o modificar acceso ajeno.

El Example Resource consume este contrato.

No existe:

- entitlement engine;
- feature registry;
- RBAC;
- ACL framework;
- grants genéricos.

---

# 14. Paid-through policy

Acceso Pro se basa en **periodo confirmado como pagado**, no únicamente en:

- `subscription.status = active`;
- `current_period_end`;
- Checkout success;
- redirect del browser.

Un pago válido para una suscripción soportada concede acceso hasta el final del periodo reconocido.

No se suman arbitrariamente 30 o 365 días.

La semántica debe derivarse del periodo financiero realmente confirmado.

---

## Default lifecycle

### Checkout creado / payment pending

No concede Pro nuevo.

### Factura soportada confirmada como satisfecha/pagada

Puede establecer o extender `paid-through`.

### Renewal paid

Extiende `paid-through` al nuevo periodo reconocido.

### Renewal failure / past_due

No concede un nuevo periodo.

El usuario conserva únicamente el acceso previamente confirmado hasta su `paid-through`.

### Cancellation at period end

Mantiene acceso únicamente hasta el periodo ya confirmado.

No se crea un periodo adicional.

### Immediate/terminal cancellation confirmed

La proyección debe reflejar el estado terminal de acuerdo con los hechos actuales recuperados de Stripe y no conceder acceso nuevo.

### Unsupported state / unsupported Price / inconsistent mapping

Nunca concede nuevo acceso por inferencia.

La discrepancia debe quedar diagnosticable y reconciliable.

---

# 15. Refunds and disputes

Refunds y disputes nunca conceden acceso nuevo.

DaysNotWeeks no pretende imponer una política comercial universal sobre todos los negocios.

El comportamiento default es:

1. registrar/representar el hecho financiero relevante;
2. no ampliar `paid-through`;
3. no revocar automáticamente un periodo ya concedido únicamente por recibir el evento;
4. dejar la situación disponible para revisión operativa.

Si el operador necesita revocar acceso según su política comercial:

```text
ajusta/cancela el estado correspondiente en Stripe
→ ejecuta reconciliación
→ la proyección local converge
```

No se publicita que DaysNotWeeks automatiza todas las políticas posibles de refund/dispute.

---

# 16. Checkout concurrency — IN

El flujo soportado debe impedir razonablemente dobles compras originadas por la aplicación.

Debe existir conceptualmente un **Checkout attempt durable**.

Como mínimo debe permitir:

- identificar el intento;
- asociarlo al usuario;
- asociarlo a la Checkout Session;
- conocer su estado;
- conocer expiración cuando corresponda;
- recuperar un crash entre Stripe y DB;
- reutilizar o rechazar un intento aún válido.

El browser nunca decide si puede abrir una segunda suscripción.

---

## Idempotency

Creación de operaciones financieras relevantes utiliza idempotency keys apropiadas.

Un retry no debe crear silenciosamente una segunda compra equivalente.

---

# 17. Stripe webhooks — IN

El endpoint webhook debe:

1. leer el body requerido para verificación;
2. verificar firma;
3. identificar el entorno correcto;
4. rechazar eventos no auténticos;
5. resolver mappings únicamente server-side;
6. recuperar hechos Stripe adicionales cuando sean necesarios;
7. calcular la nueva proyección;
8. persistir efecto y recibo de procesamiento de forma durable;
9. devolver éxito únicamente después de un resultado durable o un rechazo permanente deliberado.

No se responde éxito y después se confía en trabajo no durable.

---

## Processed event receipt

Los eventos procesados mantienen al menos un identificador único suficiente para deduplicación y diagnóstico.

No se necesita almacenar payload completo indefinidamente por defecto.

---

# 18. Billing concurrency — IN

Deduplicar `event.id` no resuelve carreras entre eventos diferentes.

La actualización de una misma billing account debe protegerse mediante un mecanismo equivalente a:

```text
read projection version
→ obtain current Stripe facts
→ calculate
→ compare-and-swap
→ retry if version changed
```

La implementación exacta puede utilizar:

- transaction;
- RPC;
- lock acotado;
- optimistic concurrency;

siempre que conserve el comportamiento.

No se mantiene una transacción DB abierta durante llamadas HTTP a Stripe.

---

# 19. Reconciliation — IN

DaysNotWeeks entrega un mecanismo simple de reconciliación.

Debe reutilizar la misma lógica de cálculo que el webhook.

Debe soportar como mínimo:

```text
billing:reconcile <user>
```

o una interfaz equivalente.

Semántica deseada:

- dry-run por defecto;
- apply explícito;
- output sin secretos;
- consulta los hechos actuales necesarios de Stripe;
- compara con proyección local;
- informa discrepancias;
- puede aplicar la proyección correcta.

Puede admitir lote paginado si resulta simple y necesario para operación.

No se construye una plataforma genérica de workflows.

---

## No automatic recovery SLA

DaysNotWeeks no incluye cron/scheduler de reconciliación por defecto.

Por tanto:

> si Stripe agota sus retries y un evento no converge, la recuperación puede requerir intervención operativa.

Esto es una limitación explícita del producto.

No se promete autocuración dentro de un tiempo fijo.

---

# 20. Product surfaces — IN

## Public

Una única composición pública:

- Header
- Hero
- Features
- Pricing
- FAQ
- CTA
- Footer
- Terms
- Privacy
- Help

No es una marketing component library.

---

## Application

Incluye:

- Dashboard
- Example
- Billing
- Account
- Help

---

## Billing UI

Debe poder mostrar:

- Free / Pro;
- monthly / annual cuando corresponda;
- estado relevante;
- `paid-through` o fecha equivalente útil;
- pending;
- error/recovery;
- acceso a Customer Portal;
- CTA de compra cuando proceda.

No representa un redirect como pago confirmado.

---

# 21. UI foundation — IN

Se entrega:

- Tailwind CSS;
- un único tema;
- tokens semánticos;
- HTML semántico;
- primitives únicamente donde el comportamiento complejo las justifique.

Baseline recomendado:

```text
shadcn-style owned components
+
Base UI primitives selectively
```

No se instala una galería completa.

Elementos simples como:

- button;
- input;
- textarea;
- label;

pueden seguir siendo HTML/componentes propios simples.

No se mezclan varias librerías headless sin necesidad.

---

# 22. Forms and validation — IN

Default:

- HTML forms;
- Server Actions cuando correspondan;
- React/useActionState cuando aporte UX;
- Zod server-side;
- DB constraints para invariantes persistentes.

No existe por defecto:

- React Hook Form;
- segundo validador;
- form framework genérico.

---

# 23. Client state — IN

No se instala por defecto una state/server-state library.

Default:

- React local state;
- URL;
- RSC;
- DB;
- revalidation.

No existe autoridad de entitlement en:

- localStorage;
- Zustand;
- Query cache;
- cookies controladas por cliente.

---

# 24. SEO — IN

Las rutas públicas reales implementan:

- metadata;
- title;
- description;
- canonical;
- Open Graph;
- robots;
- sitemap cuando corresponda.

Las superficies privadas no son indexables.

No existe página `/example` pública artificial.

Terms y Privacy son plantillas editables, no asesoramiento jurídico.

---

# 25. Help and operations — IN

DaysNotWeeks incluye:

- `/help`;
- support email configurable;
- mensajes de error accionables;
- reference/correlation ID cuando aporte valor;
- logs operativos seguros;
- runbook Auth;
- runbook Billing;
- runbook recovery;
- procedimiento de restore documentado al nivel que corresponda al proveedor.

Los logs deben evitar:

- tokens;
- secrets;
- bodies sensibles;
- PII innecesaria.

No existe helpdesk propio.

---

# 26. Abuse protection — IN

No se incluye Redis/Upstash ni limiter genérico por defecto.

DaysNotWeeks sí protege las superficies que pueden producir impacto real.

Incluye:

- límites nativos de Supabase Auth;
- límites de payload;
- paginación;
- Checkout attempt atómico;
- cooldown acotado para operaciones financieras que puedan generar coste;
- autorización/RLS.

No se afirma que estas protecciones constituyan una plataforma universal antiabuso.

La Data API directa de Supabase queda protegida por RLS/permissions, no por un WAF Vercel.

---

# 27. Security — IN

Como mínimo:

- server-side identity verification;
- server-side authorization;
- RLS;
- owner inmutable desde cliente;
- financial tables no editables por authenticated users;
- Stripe signature verification;
- redirect validation;
- payload limits;
- environment secrets server-only;
- security headers apropiados;
- XSS-safe rendering;
- CSRF/origin protections adecuadas al mecanismo de mutación;
- dependency/security patch policy.

Security headers y CSP deben ser compatibles con los journeys reales.

No se añade complejidad de CSP que rompa caching/rendering únicamente para presumir de una política más estricta.

---

# 28. Accessibility — IN

Los journeys propios deben ser utilizables con:

- teclado;
- focus visible;
- labels;
- mensajes de error;
- contraste suficiente;
- responsive layouts;
- zoom razonable;
- dialogs/menus accesibles.

Se ejecutan automated accessibility checks sobre rutas representativas.

No se vende certificación WCAG universal.

---

# 29. Testing — IN

El principio es:

> few high-value tests protecting critical invariants.

---

## Unit

Para lógica pequeña como:

- redirect validation;
- env parsing;
- financial state calculation;
- catalog validation.

---

## HTTP / integration

Para:

- webhook verification;
- Checkout;
- Portal;
- server authorization;
- provider errors.

---

## Real database

Con identidades reales de test:

- A;
- B;
- anonymous;
- Free;
- Pro;
- revoked Pro.

Debe comprobar:

- RLS;
- ownership;
- immutable owner;
- financial writes denied;
- premium writes;
- retained read/delete.

---

## Billing concurrency

Debe cubrir:

- duplicate event;
- concurrent distinct events;
- stale projection version;
- transaction failure;
- competing Checkout attempts.

---

## Stripe sandbox

Debe cubrir:

- monthly;
- annual;
- browser closed;
- payment;
- renewal;
- failure;
- cancellation;
- reconciliation.

---

## Browser E2E

Debe cubrir journeys esenciales, no cada combinación posible.

---

# 30. CI — IN

DaysNotWeeks incluye una GitHub Actions CI pequeña.

Debe ejecutar como mínimo:

```text
frozen install
lint
typecheck
unit/integration tests
Supabase local + DB/RLS tests
production build
critical browser tests
```

Puede dividirse en pocos jobs para mantener feedback razonable.

No se construye una plataforma CI propia.

---

## CI security

Workflows utilizan:

- permisos mínimos;
- actions fijadas de manera segura;
- ausencia de secretos production en código PR no confiable.

No se utiliza una configuración que ejecute código no confiable con secretos privilegiados.

---

# 31. Hosted release verification — IN

No todos los providers externos necesitan ejecutarse en cada PR.

Antes de release se verifica en un entorno alojado apropiado:

- Google OAuth;
- SMTP real;
- email verification;
- password recovery;
- callbacks;
- Stripe sandbox;
- webhook remoto;
- Vercel deploy;
- Supabase hosted.

La evidencia debe corresponder al SHA candidato.

---

# 32. Deployment — IN

Vercel es el único deployment target soportado.

Entornos:

```text
local
staging
production
```

Staging debe utilizar recursos/credenciales aislados apropiados.

Production no comparte secretos con testing.

---

## Database deployment

Migrations no se ejecutan desde cada preview deploy.

Cambios relevantes siguen una secuencia segura:

```text
test migration from empty DB
→ validate compatibility
→ apply controlled migration
→ deploy compatible application
→ smoke
```

Cuando sea necesario, se utiliza expand/contract.

Rollback de aplicación no implica rollback automático de Postgres.

---

# 33. Documentation — IN

El repositorio mantiene pocas fuentes canónicas:

```text
README.md
AGENTS.md
docs/product/SCOPE.md
docs/ARCHITECTURE.md
docs/SETUP.md
docs/runbooks/BILLING.md
```

Otros runbooks pueden existir sólo si protegen un journey real.

---

## Responsibilities

### README

Primer arranque y orientación.

### SCOPE

Qué es y qué no es DaysNotWeeks.

### ARCHITECTURE

Cómo está construido el sistema actual y dónde están sus trust boundaries.

### SETUP

Configuración de entornos y proveedores.

### AGENTS

Reglas para humanos/coding agents que modifican el repo.

### Billing runbook

Diagnóstico y reconciliación financiera.

No se duplican reglas de producto completas entre documentos.

---

# 34. Agent adaptability — IN

DaysNotWeeks no mantiene adapters específicos para herramientas de IA.

Sí mantiene propiedades estructurales útiles para cualquier agente:

- estructura predecible;
- pocos documentos;
- una única autoridad;
- tipos generados;
- schemas explícitos;
- tests ejecutables;
- fronteras pequeñas;
- bajo nivel de magic;
- configuración centralizada.

No se afirma una mejora porcentual de productividad sin medirla.

---

# 35. Adaptability acceptance test

Antes de una release, un developer o coding agent debe poder, siguiendo únicamente la documentación distribuida:

1. rebrandear el producto;
2. sustituir Example Resource por un dominio como `Projects`;
3. añadir al menos un campo;
4. aplicar migration;
5. regenerar tipos;
6. conservar ownership;
7. conservar RLS;
8. conservar Pro gating;
9. pasar tests relevantes;
10. no modificar Auth ni Billing para conseguirlo.

Si sustituir el ejemplo obliga a reescribir Billing/Auth, la arquitectura falla el contrato.

---

# 36. OUT

Las siguientes capacidades no forman parte de DaysNotWeeks.

El comprador puede implementarlas bajo su responsabilidad, pero DaysNotWeeks no las integra, prueba ni mantiene como configuración soportada.

## Identity

- magic link;
- OAuth providers adicionales;
- MFA;
- SSO;
- alternative auth frameworks;
- manual account linking;
- advanced self-service email change;
- automated account deletion.

## Organizations

- organizations;
- teams;
- workspaces;
- memberships;
- invitations;
- roles;
- RBAC;
- seats.

## Monetization

- one-time;
- lifetime;
- multiple paid tiers;
- trials;
- coupons;
- promotions;
- usage billing;
- credits;
- seat billing;
- active interval switching;
- generic entitlement engine;
- Stripe Entitlements as required architecture.

## Data/platform

- Storage;
- uploads;
- Realtime;
- CMS;
- alternative DB;
- ORM by default;
- generic repository layer.

## API

- public generic API;
- GraphQL;
- tRPC by default;
- RPC framework;
- external SDK.

## Background infrastructure

- generic queues;
- workers;
- event bus;
- scheduler;
- cron reconciler by default.

## Marketing

- blog;
- CMS content system;
- lead capture;
- waitlist backend;
- testimonials library;
- component gallery;
- multiple landing variants.

## UI

- dark mode;
- theme selector;
- multiple skins;
- unused component catalog;
- fake dashboard metrics;
- generic charts.

## Email

- application email SDK;
- welcome email framework;
- notifications platform;
- campaigns.

## Analytics

- product analytics;
- marketing analytics;
- conversion tracking;
- analytics dashboard.

## Operations

- custom admin dashboard;
- impersonation;
- helpdesk;
- complex doctor;
- Management API readers;
- auto-provisioning;
- auto-repair platform;
- generic observability stack.

## Developer architecture

- provider abstraction layers;
- plugins framework;
- monorepo by default;
- alternate runtimes as supported paths;
- multiple deployment targets.

## Internationalization

- locale routing;
- translation framework;
- language selector;
- multilingual SEO infrastructure.

## AI

- Codex-specific layer;
- Claude-specific layer;
- Cursor-specific layer;
- prompt packs;
- multi-agent certification.

---

# 37. Distribution

El artefacto canónico es el repositorio Git versionado.

Una release se identifica mediante commit/tag.

Un ZIP, marketplace download u otro formato comercial es únicamente una copia derivada de ese release.

No constituye una segunda superficie técnica que deba mantenerse independientemente.

---

# 38. Release gates

Una release DaysNotWeeks sólo está lista cuando todos los gates aplicables pasan.

## R1 — Foundation

- clean frozen install;
- lint PASS;
- typecheck PASS;
- tests PASS;
- build PASS;
- invalid configuration fails safely;
- no secret leakage.

## R2 — Identity

- Google signup/login;
- password signup;
- verification;
- resend;
- login;
- recovery/reset;
- logout;
- invalid callback;
- unsafe redirect denied;
- SMTP hosted delivery verified.

## R3 — Database

- migrations from clean DB;
- generated types aligned;
- A cannot access B;
- anonymous denied;
- owner immutable;
- Free premium writes denied;
- Pro premium writes allowed;
- revoked Pro denied premium writes;
- retained own read/delete works.

## R4 — Billing

- Monthly Checkout;
- Annual Checkout;
- browser may close before confirmation;
- access derives from financial truth;
- invalid webhook signature denied;
- duplicate event safe;
- concurrent events converge;
- competing Checkout attempts safe;
- renewal;
- failure;
- cancellation;
- Portal own customer;
- historical valid Price handled correctly;
- reconciliation repairs a known inconsistent fixture.

## R5 — Product

- landing;
- signup;
- app;
- Dashboard;
- Example;
- Billing;
- Account;
- Help;
- SEO;
- private noindex;
- responsive;
- keyboard/focus/errors;
- no false financial success.

## R6 — Adaptability

A developer/agent successfully replaces the Example Resource while preserving Auth, Billing, RLS and build integrity.

---

# 39. Scalability contract

DaysNotWeeks optimiza primero para:

### S1

0–1k users / early SaaS.

### S2

1k–100k users / successful SaaS with real billing.

El número exacto de usuarios no constituye una capacidad garantizada.

La arquitectura debe permitir evolución incremental mediante:

- better indexing;
- query optimization;
- larger provider plans;
- targeted caching;
- external observability;
- targeted async processing;

cuando exista evidencia de necesidad.

S3 no se construye anticipadamente.

Si alta carga exige:

- worker;
- queue;
- scheduled reconciliation;
- richer state management;
- direct SQL;
- additional observability;

esas piezas se añaden al producto comprador a partir de métricas reales.

No forman parte preventiva de DaysNotWeeks.

---

# 40. Maintenance policy

DaysNotWeeks es un producto cerrado en features pero no abandonado.

Maintenance incluye:

- security updates;
- framework compatibility;
- Supabase compatibility;
- Stripe compatibility;
- Vercel compatibility;
- supported dependency updates;
- regression fixes.

Las actualizaciones deben privilegiar:

1. seguridad;
2. estabilidad;
3. compatibilidad;
4. simplicidad.

No se adopta una tecnología nueva únicamente por ser más reciente.

---

# 41. Product claims

DaysNotWeeks puede afirmar únicamente propiedades demostradas por su release.

Puede aspirar a demostrar:

- integrated Auth/Data/Billing;
- RLS-backed isolation;
- browser-independent billing provisioning;
- recoverable billing drift;
- small replaceable example;
- reproducible verification;
- predictable agent-friendly structure.

No debe afirmar sin evidencia:

- ahorrar una cantidad concreta de horas;
- ser más rápido que todos los competidores;
- soportar una cifra concreta de usuarios;
- eliminar todos los billing edge cases;
- ser maintenance-free;
- mejorar productividad IA en un porcentaje concreto;
- ofrecer universal production readiness.

---

# 42. Scope governance

Tras aprobación, este documento pasa a ser la única autoridad de producto.

Los documentos históricos:

- V1 Scope 1.0;
- V1 Scope 1.1;
- BUILD_SPEC histórico;
- prompts ejecutados;

no añaden requisitos.

Pueden conservarse únicamente como historia, claramente marcados como no autoritativos.

---

## Engineering authority

Engineering puede decidir:

- estructura concreta de tablas;
- helpers;
- nombres internos;
- división de módulos;
- mechanism exacto de optimistic concurrency;
- organización de tests;
- implementación UI;
- scripts concretos;

siempre que respete este contrato.

Engineering no puede introducir mediante ADR:

- un nuevo provider;
- un nuevo modelo comercial;
- organizations;
- un nuevo método Auth;
- otro deployment target;
- una feature OUT.

---

# 43. Final definition

DaysNotWeeks es:

> Una foundation SaaS focalizada para productos Next.js de cuenta individual con suscripción recurrente, donde identidad, datos privados, RLS, billing, entitlement, app shell y recuperación operativa ya están correctamente conectados y verificados para que el comprador pueda empezar directamente por su producto.

DaysNotWeeks no es:

> Un framework SaaS universal, una plataforma de organizations, una colección de integraciones, una biblioteca de componentes, un CMS, un sistema de analytics, un admin framework o una capa de abstracción sobre múltiples proveedores.

La filosofía final es:

> Build the difficult foundation once. Keep everything else out of the way.
