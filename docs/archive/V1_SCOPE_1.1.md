# DaysNotWeeks — V1_SCOPE

- **Versión:** V1 Scope 1.1
- **Fecha de aprobación:** 2026-09-14
- **Estado:** APPROVED / IMPLEMENTATION NOT STARTED
- **Ruta canónica:** `docs/product/V1_SCOPE.md`
- **Aprobación:** decisión explícita de producto de Pablo en esta conversación.
- **Base aprobada:** V1 Scope 1.0 + decisión explícita de producto del 2026-09-14 que incorpora Google OAuth y magic-link login a C02/PC02/AC02 para reducir fricción de autenticación. El resto del alcance permanece sin cambios.

## Gobierno del scope

Este documento es la definición definitiva y canónica de DaysNotWeeks V1. Formaliza la aprobación de v0.2; no añade, elimina ni modifica sus contratos o fronteras. Conserva seis sistemas de entrega P0, cero P1 y las obligaciones transversales de seguridad/evidencia.

**Regla de cambio:** cualquier modificación de PC/AC/AR requiere una decisión explícita de producto y una actualización versionada del scope. Ningún ADR, plan de implementación, backlog o instrucción de Engineering puede modificar implícitamente estos contratos, sus fronteras P2/REJECTED, el posicionamiento o sus criterios/gates de aceptación. Los cambios aprobados deben quedar registrados con versión, fecha, decisión e IDs afectados.

**Regla de precedencia:** V1 Scope 1.1 es la autoridad vigente. No existe ningún requisito implícito heredado de v0.1. v0.1 y v0.2 permanecen como artefactos históricos; no se suman al alcance canónico. PC01–PC13, AC01–AC10 y AR01–AR12, junto con las fronteras, el posicionamiento y los gates aquí preservados, definen el contrato aprobado.

**Separación de Engineering:** los IMPLEMENTATION_CANDIDATES IC01–IC26 de §8 son inputs no vinculantes para futuros ADRs. Se preservan como ideas, no como requisitos V1 ni autorización para implementar funciones P2. Aprobar un mecanismo técnico no autoriza cambios de producto.

**Estado de ejecución:** aprobación de scope no equivale a implementación, despliegue o superación de gates. La deuda de evidencia continúa abierta según §15. El documento está listo para handoff a Control Tower, Product Design y Engineering; no se ha iniciado trabajo de código de V1.1.

### Amendment V1.1 — autenticación de mínima fricción

Decisión aprobada el 2026-09-14: **Google OAuth y magic-link login pasan de POST-V1 a V1 P0 dentro de C02**. Email/password con verificación y reset se mantiene como fallback soportado. Supabase Auth continúa siendo la única autoridad de identidad; no se añade un segundo framework de autenticación.

Objetivo de producto: reducir al mínimo razonable la fricción tanto de registro como de acceso. La V1 entrega tres caminos soportados —Google OAuth, magic link y email/password— con una sesión común, retorno interno seguro, manejo coherente de errores y pruebas reales de callbacks/links. El cambio amplía únicamente C02/PC02/AC02, sus journeys, documentación y gates asociados; no reabre billing, organizations, blog, leads ni otros P2.

### Historial y referencias

| Artefacto / versión | Papel | Estado |
| --- | --- | --- |
| [DaysNotWeeks-V1-scope-proposal-v0.1.md](sandbox:/workspace/scratch/8ffc827dad6a/output/DaysNotWeeks-V1-scope-proposal-v0.1.md) | Propuesta amplia y análisis de fase 3 | Histórico; no añade requisitos |
| [DaysNotWeeks-V1-scope-candidate-v0.2.md](sandbox:/workspace/scratch/8ffc827dad6a/output/DaysNotWeeks-V1-scope-candidate-v0.2.md) | Candidata reducida aprobada por producto | Fuente íntegra del alcance ratificado |
| V1 Scope 1.0 — 2026-09-13 | Canonización de v0.2 y regla de gobierno | Histórico aprobado; sustituido por V1 Scope 1.1 |
| V1 Scope 1.1 — 2026-09-14 | Amendment de autenticación de baja fricción | APPROVED / IMPLEMENTATION NOT STARTED; Google OAuth + magic link pasan de P2 a V1 |

SHA-256 del artefacto histórico v0.2 aprobado: `3b3abd32d03edc0eba53369f8fc7bdc822ca72cdd13f6347abb750ed5f90ea89`.

Evidencia de referencia: [auditoría ShipFast](sandbox:/workspace/scratch/8ffc827dad6a/output/ShipFast-auditoria-y-parity-ledger.md) y [baseline DNW](sandbox:/workspace/scratch/8ffc827dad6a/output/DaysNotWeeks-baseline-vs-ShipFast-v0.1.md). Snapshot Vercel auditado: `6e33e58b1e553a41fe22e6b941a7229a002de361`. Baseline DNW: `14f12fc59a774927e752b33dcc4b073c14be124a`.

Las secciones de red-team y comparación conservan el razonamiento de v0.2 como trazabilidad. Las menciones a «candidata» dentro de ese razonamiento describen su origen histórico; el estado vigente es APPROVED. Las observaciones del baseline y los claims pendientes de evidencia no pasan a ser funcionalidades implementadas por esta aprobación.

## 1. Cambios frente a v0.1 y red-team individual — actualizado por V1.1

### 1.1 Recortes reales

| Área | v0.1 | V1.1 vigente |
| --- | --- | --- |
| Monetización | Recurrente y one-time/lifetime, dos perfiles probados | Sólo Free + Pro mensual/anual, un perfil recurrente |
| Cambios comerciales | Cambio de intervalo y promociones opcionales | Elegir intervalo al contratar; cambio durante suscripción y promociones P2 |
| Auth | Password, magic link y Google | Google OAuth + magic link + email/password con verificación/reset; tres caminos bajo Supabase Auth |
| Cuenta | Edición email y borrado self-service coordinado | Perfil mínimo, reset, logout; cambios sensibles/borrado mediante procedimiento de soporte autenticado; UI de autoservicio avanzada P2 |
| Marketing/UI | Colección de bloques, variantes y claro/oscuro/sistema | Una oferta pública completa y una UI de app; un tema accesible editable; galería y dark mode P2 |
| Contenido | Blog local, índice, detalle, taxonomía | SEO de las rutas incluidas + una página de contenido reemplazable; blog P2 |
| Email | SMTP Auth y SDK/plantilla transaccional de app | SMTP Auth integrado; mensajes financieros del proveedor; correo de app P2 |
| Leads | Formulario, tabla, endpoint, límites | C11 P2; enlace a servicio externo si el comprador lo necesita, sin integración entregada |
| Support/analytics | Soporte, recuperación y analytics | Soporte público y recuperación preservados; analytics P2 |
| Doctor | Local + múltiples lectores API remotos + perfil release | Diagnóstico local + informes de verificación; pruebas remotas funcionales y checklist, sin suite de conectores de diagnóstico |
| Agentes | Contrato canónico y smoke por Codex/Claude/Cursor | Contrato canónico, mapa/comandos y ejercicio de modificación; adaptadores específicos y matriz multiagente P2 |
| Operación | Scheduler/estados de ledger/objetivos p95 prescritos | Recuperación durable y comprobable obligatoria; mecanismo y rendimiento detallado al ADR |

**Lo que no se recorta:** acceso pagado independiente del navegador, aislamiento en DB, renovación/impago/cancelación/refund/disputa del modelo vendido, recuperación de cuenta, ayuda accesible, pruebas de comportamiento y entrega reproducible repo/ZIP. No se usa “puede hacerlo un agente” como excusa para dejar esos trabajos incompletos.

### 1.2 Cómo se atacó cada IN

Las diez preguntas se responden para cada capacidad original. “Gratis suficiente” se refiere al job reducido, no a certificar el starter gratuito. Mantenimiento significa carga recurrente, no coste inicial. Los resultados KEEP/REDUCE/MOVE_TO_P2/MERGE/SPLIT son decisiones de revisión; la prioridad definitiva está en §4.

### C01 — Foundation tipada y configuración

**Resultado: REDUCE.**

1. **Promesa rota al eliminar:** Eliminarla rompe el arranque reproducible y la configuración coherente del stack elegido.
2. **Alternativa externa razonable:** Next, npm y las guías de proveedores cubren herramientas base; no comprueban por sí solas su configuración conjunta.
3. **¿Gratuito suficiente?:** Vercel ya ofrece estructura, scripts y setup suficientes para empezar. La estructura sola no justifica cobrar.
4. **Relevancia real en ShipFast:** Sí: arranque, config y organización son jobs relevantes, sin obligar a duplicar variantes JS/routers.
5. **Dependencias:** C02–C05 y C07 dependen de una base, catálogo y configuración coherentes.
6. **¿Sólo documentación?:** Documentar cuentas/credenciales externas sí; validación de entradas/env necesarias y arranque real no.
7. **¿P2?:** El núcleo no. Automatización de provisionamiento y abstracciones de plugins sí pueden quedar fuera.
8. **Mantenimiento permanente:** Matriz de Next/Node, lockfile, SDK y ejemplos env; riesgo de convertir setup en un instalador universal.
9. **Starter vs producto comprador:** Starter: contratos de configuración y módulos. Comprador: marca, precios y lógica de su servicio.
10. **Mínimo que conserva el job:** Un stack/versionado, TS estricto, env validada, catálogo único y comandos estándar; sin generador propio ni validación remota universal.

### C02 — Identidad y recuperación

**Resultado: REDUCE.**

1. **Promesa rota al eliminar:** Sin identidad recuperable no puede entregarse un SaaS de pago de forma honesta.
2. **Alternativa externa razonable:** Supabase Auth es la alternativa adoptada; el comprador aún necesita callbacks, pantallas y pruebas conectadas.
3. **¿Gratuito suficiente?:** El gratuito cubre password/sesión y ajustes; no cierra forgot/reset/verificación observados como ausentes en el snapshot.
4. **Relevancia real en ShipFast:** Sí al job de acceso; Google y email sin password son oferta relevante. V1.1 decide incluirlos por reducción de fricción, manteniendo un único proveedor de identidad y sin ampliar a más social providers.
5. **Dependencias:** C03/C04 necesitan identidad fiable; C05 la presenta y C07 documenta SMTP/URLs.
6. **¿Sólo documentación?:** Consolas, SMTP y recuperación operativa pueden documentarse. Signup/reset/logout y sus errores deben funcionar.
7. **¿P2?:** Google y magic link ya no: son V1 P0 dentro de C02. Cambios sensibles self-service, MFA/SSO y proveedores sociales adicionales sí pueden esperar con procedimiento seguro de soporte.
8. **Mantenimiento permanente:** SSR/cookies y flujos de links cambian con Next/Supabase; cada proveedor de login añade configuración y casos combinados.
9. **Starter vs producto comprador:** Starter: identidad/recuperación y perfil mínimo. Comprador: onboarding comercial y atributos de negocio.
10. **Mínimo que conserva el job:** Google OAuth + magic link + email/password con verificación/reenvío/reset, callback seguro compartido, sesión/logout y nombre visible editable. Email/borrado por soporte autenticado documentado y probado; sin panel admin nuevo.

### C03 — Datos, autorización y reference feature

**Resultado: KEEP.**

1. **Promesa rota al eliminar:** Eliminarla rompe el aislamiento y deja sin prueba que se entrega una prestación premium real.
2. **Alternativa externa razonable:** Supabase/SQL proporcionan las piezas; nadie puede configurar las policies de nuestro recurso simplemente contratando una herramienta.
3. **¿Gratuito suficiente?:** El gratuito resuelve datos y mutaciones de cuenta/equipo, pero no el contrato elegido de RLS + operación premium directa.
4. **Relevancia real en ShipFast:** Sí: persistencia, perfiles, aislamiento y acceso son jobs centrales, aunque Notes sea el ejemplo propio de DNW.
5. **Dependencias:** Depende de C02 para identidad y del estado de C04; C05 expone el ejemplo y C07 permite sustituirlo.
6. **¿Sólo documentación?:** La guía de adaptación sí; ownership, paid writes y migrations/tipos no pueden ser sólo tutorial.
7. **¿P2?:** No el núcleo. Storage, realtime, sharing y funciones ampliadas de Notes sí permanecen P2.
8. **Mantenimiento permanente:** Policies/funciones, migraciones, SDK y tests con DB real; es carga estructural que compra el cliente.
9. **Starter vs producto comprador:** Starter: patrón seguro y prueba. Comprador: recurso de negocio. Notes es EXAMPLE, no un producto que DNW evolucione por sí mismo.
10. **Mínimo que conserva el job:** Notes título/body, CRUD propio, crear/editar sólo Pro, leer/borrar propios sin Pro, migrations/local/types y A/B/anon. Sin organización, tags o archivos.

### C04 — Stripe billing lifecycle

**Resultado: REDUCE.**

1. **Promesa rota al eliminar:** Sin cobro recurrente y acceso coherente se incumple la promesa explícita de foundation SaaS por suscripción.
2. **Alternativa externa razonable:** Checkout/Portal resuelven tarjeta y autoservicio; no mantienen por sí solos la autorización de la base del comprador.
3. **¿Gratuito suficiente?:** El gratuito ya ofrece suscripciones y Portal. La ventaja exigible es entrega durable, recuperación y aislamiento probados.
4. **Relevancia real en ShipFast:** Sí: Checkout, ciclo y pago único son relevantes. Renunciar a pago único pierde amplitud comercial, no el job de suscripción elegido.
5. **Dependencias:** C02 identifica propietario; C03 consume acceso; C05 presenta estado; C07 entrega pruebas/runbooks.
6. **¿Sólo documentación?:** Configurar Stripe/Portal/recibos sí. Concesión, revocación y recuperación de eventos no.
7. **¿P2?:** One-time, lifetime, trials, descuentos y cambios de intervalo activos sí. El ciclo básico de suscripción no.
8. **Mantenimiento permanente:** Payloads/versiones Stripe, facturas, tiempos, concurrencia y fixtures; múltiples modelos multiplican estados de soporte.
9. **Starter vs producto comprador:** Starter: una suscripción individual y su autorización. Comprador: importe/oferta, políticas comerciales y gestión de su cuenta Stripe.
10. **Mínimo que conserva el job:** Free + un Pro con mensual/anual al contratar; Checkout/Portal, renovación/impago/baja y tratamiento defensivo de refund/disputa; replay/reconcile probado. Sin segunda monetización.

### C05 — UI y aplicación

**Resultado: REDUCE.**

1. **Promesa rota al eliminar:** Sin superficies conectadas el comprador recibe infraestructura y debe reconstruir el recorrido que se vende.
2. **Alternativa externa razonable:** Primitives y plantillas externas ayudan; no conectan automáticamente errores, identidad y estado de billing.
3. **¿Gratuito suficiente?:** El gratuito cubre bastante shell/ajustes; DNW no puede cobrar sólo por tener sidebar.
4. **Relevancia real en ShipFast:** Sí: UI prediseñada es relevante. No se necesita copiar cada variante ni su número de componentes.
5. **Dependencias:** Presenta C02/C03/C04 y absorbe el mínimo público de C08/C09 y contacto de C12.
6. **¿Sólo documentación?:** Personalización sí; navegación, loading/error/pending y feedback financiero requieren implementación.
7. **¿P2?:** Variantes decorativas, dark mode y primitives sin uso sí. La superficie mínima no.
8. **Mantenimiento permanente:** Next/React, primitives, estilos y regresiones a11y; doble tema y galerías amplían pruebas continuamente.
9. **Starter vs producto comprador:** Starter: patrones y recorrido base. Comprador: identidad visual, copy, estética y pantallas de su negocio.
10. **Mínimo que conserva el job:** Una landing con oferta/precio/FAQ breve/CTA/footer, auth, shell/Notes/cuenta/billing/ayuda; tema único editable; componentes sólo donde los usan esos recorridos.

### C06 — Verificación y seguridad transversal

**Resultado: MERGE.**

1. **Promesa rota al eliminar:** Eliminar controles o evidencia rompe las promesas de aislamiento, dinero e integridad. Eliminar su etiqueta como producto independiente no rompe nada.
2. **Alternativa externa razonable:** Frameworks/CI/scanners ayudan, pero no conocen nuestros invariantes ni demuestran aislamiento entre clientes.
3. **¿Gratuito suficiente?:** El snapshot gratuito no incluye suite que pruebe el contrato elegido; no afirmar que carece de todas las protecciones.
4. **Relevancia real en ShipFast:** ShipFast incluye guías de seguridad y pruebas. La diferencia propuesta es evidencia de comportamiento, no más tutoriales.
5. **Dependencias:** Cruza C01–C05; C07 distribuye comandos y reportes.
6. **¿Sólo documentación?:** Riesgos y configuración externa sí; controles activos y tests negativos no.
7. **¿P2?:** Carga extensiva/pentest externo/fuzzing amplio sí. Los gates críticos no.
8. **Mantenimiento permanente:** Tests frágiles, ambientes externos y falsos positivos pueden costar tanto como producto; limitar matriz a lo vendido.
9. **Starter vs producto comprador:** Starter: suites de su perímetro. Comprador: tests de features añadidas y nuevas amenazas.
10. **Mínimo que conserva el job:** Integrar obligaciones AR/AC en cada sistema y entrega C07. No framework propio de seguridad ni equipo de tests tratado como feature opcional.

### C07 — Entrega, setup y doctor

**Resultado: REDUCE.**

1. **Promesa rota al eliminar:** Sin entrega completa y verificación reproducible no se puede sostener el claim premium de foundation comprobable.
2. **Alternativa externa razonable:** npm/CI y paneles de proveedores cubren ejecución y configuración; deben venir conectados y documentados.
3. **¿Gratuito suficiente?:** El gratuito aporta repo y guía suficiente para comenzar. El diferencial no es otro README, sino reproducir el contrato desde el paquete comprado.
4. **Relevancia real en ShipFast:** Sí: setup/docs/deploy son parte del valor; un doctor remoto extenso no es requisito heredado.
5. **Dependencias:** Empaqueta todos los sistemas y absorbe documentación canónica C13; valida gates de C06.
6. **¿Sólo documentación?:** Configuración remota inevitable sí; scripts/comandos y equivalencia tag/ZIP no.
7. **¿P2?:** Lectores de Management APIs, auto-provisionamiento, reparación automática y adapters multiagente sí.
8. **Mantenimiento permanente:** Diagnóstico remoto añade tokens, permisos, cambios de APIs y tickets de entornos ajenos. Limitar ese coste es un recorte importante.
9. **Starter vs producto comprador:** Starter: comandos, docs y reportes del perímetro. Comprador: cuentas, secretos, dominio y configuración live.
10. **Mínimo que conserva el job:** Repo/ZIP completos, guía y comandos, doctor local acotado, reportes y pruebas remotas funcionales separadas; contrato AGENTS único y receta de sustitución del ejemplo.

### C08 — Marketing y oferta

**Resultado: MERGE.**

1. **Promesa rota al eliminar:** Quitar toda oferta pública rompe visitante→entiende→compra. Quitar una biblioteca de bloques no.
2. **Alternativa externa razonable:** Una landing externa es razonable, pero DNW debe entregar una muestra conectada de oferta/precio/registro que pueda reemplazarse.
3. **¿Gratuito suficiente?:** Vercel ya cubre buena parte del mínimo. Es requisito de completitud, no diferenciador aislado.
4. **Relevancia real en ShipFast:** Sí, UI de venta es muy relevante; no obliga a entregar todas las familias de testimonios y comparaciones.
5. **Dependencias:** C04 define el precio; C05 renderiza; C09 aporta SEO mínimo.
6. **¿Sólo documentación?:** Copy, testimonios y adaptación legal pertenecen a guía/comprador; CTA/pricing conectado requiere código.
7. **¿P2?:** Galería de bloques, ratings y variantes de social proof sí. Oferta mínima se absorbe en C05.
8. **Mantenimiento permanente:** Variantes visuales crean CSS/tests y expectativas de soporte ajenas al núcleo SaaS.
9. **Starter vs producto comprador:** Starter: composición utilizable y campos de personalización. Comprador: propuesta de valor, pruebas sociales y textos finales.
10. **Mínimo que conserva el job:** MERGE en C05: una oferta/CTA/pricing/FAQ/footer/legal/contacto coherentes, sin biblioteca comercial separada.

### C09 — SEO y contenido

**Resultado: SPLIT.**

1. **Promesa rota al eliminar:** Eliminar metadata/canonical/robots rompe la publicabilidad de lo entregado; eliminar motor editorial no rompe el SaaS.
2. **Alternativa externa razonable:** Una plataforma de contenido externa resuelve el blog de forma razonable sin tocar identidad/billing.
3. **¿Gratuito suficiente?:** El gratuito ofrece metadata básica. No entrega blog, pero eso no obliga a incluirlo para competir.
4. **Relevancia real en ShipFast:** Sí: blog y SEO son relevantes en ShipFast. Elegimos conscientemente menos amplitud editorial.
5. **Dependencias:** SEO depende de dominio/rutas C01/C05. El blog no es dependencia de auth ni billing.
6. **¿Sólo documentación?:** Guía de nueva página/Search Console sí; metadata/rutas públicas correctas deben salir implementadas.
7. **¿P2?:** Blog, taxonomía y helpers editoriales sí. SEO de las rutas IN se absorbe en C05.
8. **Mantenimiento permanente:** Formato contenido, parsing, índices/etiquetas, links, metadata y dependencias editoriales; carga prescindible para el ICP inicial.
9. **Starter vs producto comprador:** Starter: contrato de publicación y ejemplo de página. Comprador: estrategia editorial, artículos, SEO comercial.
10. **Mínimo que conserva el job:** Opción B: SEO completo del perímetro IN + una página estática de contenido EXAMPLE; blog P2. Sin colección, índice, etiquetas o parser editorial.

### C10 — Email transaccional

**Resultado: SPLIT.**

1. **Promesa rota al eliminar:** Quitar correo Auth rompe verificar/recuperar cuenta; quitar una bienvenida de app no rompe ningún job core.
2. **Alternativa externa razonable:** SMTP configurado y recibos Stripe resuelven lo necesario. Un SDK de app puede añadirse cuando exista un mensaje de negocio real.
3. **¿Gratuito suficiente?:** El gratuito deja envío de invitación pendiente; ese job no existe en nuestro ICP sin organizaciones.
4. **Relevancia real en ShipFast:** Sí: correo y DNS son relevantes, pero parte es configuración externa y no requiere un subsistema de mensajes de app.
5. **Dependencias:** SMTP entra en C02; recibos/configuración en C04/C07. Ningún gate de cobro depende de un email de bienvenida.
6. **¿Sólo documentación?:** DNS/remitente/recibos sí, con prueba real. No reemplazar reset funcional por una receta.
7. **¿P2?:** SDK/plantillas de email de aplicación sí. El camino Auth permanece obligatorio.
8. **Mantenimiento permanente:** Entrega, DNS, errores, límites y cambios de SDK; mantener dos caminos de email sin necesidad duplica soporte.
9. **Starter vs producto comprador:** Starter: Auth conectada y guía de proveedor. Comprador: mensajes transaccionales propios y campañas.
10. **Mínimo que conserva el job:** MERGE SMTP/links en C02 y docs de recibos en C07; correo de app P2, sin SDK/cola/plantilla residual obligatoria.

### C11 — Lead capture

**Resultado: MOVE_TO_P2.**

1. **Promesa rota al eliminar:** No rompe ninguna promesa del SaaS operativo; sí se renuncia a vender una lista de espera nativa incluida.
2. **Alternativa externa razonable:** Sí: formulario/lista de espera externos o enlace a una página gestionada; no toca grants ni DB core.
3. **¿Gratuito suficiente?:** El gratuito no lo incluye, pero ausencia en ambos no rompe el recorrido de cuenta y pago.
4. **Relevancia real en ShipFast:** ShipFast lo ofrece, aunque su presencia no prueba necesidad para este ICP.
5. **Dependencias:** En v0.1 arrastra DB pública, antiabuso y UI. Ningún sistema core depende de leads.
6. **¿Sólo documentación?:** Una nota de integración externa basta; no una receta de código no probada vendida como soporte nativo.
7. **¿P2?:** Sí, completo, sin dependencias o endpoint dormido en V1.
8. **Mantenimiento permanente:** Antiabuso, datos personales, duplicados, retención y tickets de entrega/campañas externos.
9. **Starter vs producto comprador:** Pertenece al go-to-market del comprador, no a la autorización de su servicio.
10. **Mínimo que conserva el job:** No implementación V1. El comprador puede cambiar un CTA a herramienta externa; no se garantiza ni mantiene ese proveedor.

### C12 — Soporte, operaciones y analytics

**Resultado: SPLIT.**

1. **Promesa rota al eliminar:** Quitar recuperación o contacto deja usuarios pagados bloqueados. Quitar analytics no impide que paguen ni se autoricen correctamente.
2. **Alternativa externa razonable:** Inbox externo es suficiente para atención; paneles Stripe y logs ayudan. No sustituyen mapping/reconcile de acceso.
3. **¿Gratuito suficiente?:** El gratuito tiene actividad propia, que no equivale a reparar provisioning. Analytics no es una ventaja necesaria.
4. **Relevancia real en ShipFast:** ShipFast ofrece soporte/chat y medición como jobs distintos; no justifican agruparlos para proteger analytics del recorte.
5. **Dependencias:** Recuperación depende de C02/C04, contacto de C05 y runbooks de C07. Analytics no es dependencia inversa.
6. **¿Sólo documentación?:** Contacto/configuración y runbooks sí; estado recuperable y correlación segura necesitan soporte del código.
7. **¿P2?:** Analytics/tracking/conversion dashboard sí. Contacto y reparación core no.
8. **Mantenimiento permanente:** Analytics añade proveedor, eventos, duplicados, cambios de consentimiento y tickets; recuperación ya forma parte del coste de billing.
9. **Starter vs producto comprador:** Starter: error seguro/diagnóstico/recuperación. Comprador: equipo de soporte, SLA y estrategia de medición.
10. **Mínimo que conserva el job:** MERGE recuperación en C04/C02, contacto en C05 y runbooks en C07. Analytics P2 sin SDK por defecto, chat sigue P2.

### C13 — Contratos para compradores y agentes

**Resultado: MERGE.**

1. **Promesa rota al eliminar:** Sin mapa/invariantes/comandos el comprador no puede modificar con seguridad lo vendido como editable; quitar adapters específicos no rompe eso.
2. **Alternativa externa razonable:** Un README propio o instrucciones del agente ayudan, pero no conocen nuestros límites de billing/RLS.
3. **¿Gratuito suficiente?:** El gratuito tiene README; no contratos de modificación observados. No hay evidencia para prometer mejora cuantificada con IA.
4. **Relevancia real en ShipFast:** Docs y compatibilidad con asistentes forman parte del valor. No obliga a certificar tres herramientas en cada release.
5. **Dependencias:** C07 entrega docs; C03 da ejercicio de reemplazo; C06 verifica el resultado.
6. **¿Sólo documentación?:** Sí: esta capacidad es principalmente documentación versionada, con ejercicio ejecutado; no necesita runtime ni nueva CLI.
7. **¿P2?:** Adaptadores Codex/Claude/Cursor y comparativa multiagente sí. Invariantes y comandos del producto no.
8. **Mantenimiento permanente:** Drift entre docs/código y wrappers por herramienta; reducir a una verdad canónica elimina parte de esa matriz.
9. **Starter vs producto comprador:** Starter: contrato de sus módulos. Comprador: reglas del equipo, prompts y configuración de agentes.
10. **Mínimo que conserva el job:** AGENTS canónico + mapa/invariantes/comandos/DoD y receta de adaptar Notes en C07; sin prompt pack ni promise de autodetección universal.

## 2. Decisiones obligatorias D-A a D-E

### D-A — One-time: POST-V1, sin recipe implementada prometida

V1 implementa y prueba **sólo subscriptions monthly/yearly**. One-time/lifetime pasa a C15/P2. No queda un flag, price ID, rama de webhook o guía “cambia mode y listo”. Una recipe ejecutable también requeriría validación y soporte: no se utiliza para esconder una segunda implementación.

Se pierde la venta inmediata a founders de herramientas lifetime/productos digitales. Es un coste comercial real, especialmente frente a ShipFast; no se disfraza como DIFFERENT. Se gana una sola semántica de periodos pagados, renovación, impago y cancelación. One-time añade grants sin fecha, devolución/recompra, documentación, configuración y pruebas separadas incluso sin híbridos. El tamaño exacto del ahorro no está medido y no se asume que dividir perfiles reduce a la mitad el trabajo.

El baseline ya contiene pago único; código existente no obliga a mantenerlo en el producto vendido. Su eventual retirada/adaptación se hará en Engineering después de aprobación, conservando historial y sin cambiar despliegues de clientes automáticamente. V1 no promete migración de negocios live one-time a suscripción; el upgrade desde baseline exige identificar datos previos y no revocar derechos silenciosamente.

### D-B — Lead capture: C11 → P2

Un formulario externo es una alternativa razonable y aislable. La V1 puede venderse honestamente sin lista de espera propia: su recorrido comienza en signup de una oferta operativa. No se entrega tabla, endpoint público, antiabuso de leads ni integración con un proveedor concreto. Una nota explica dónde sustituir el CTA por un enlace externo. No se mantiene C11 por paridad nominal.

### D-C — Blog: opción B

**SEO completo para todas las rutas IN + un ejemplo de contenido estático. Blog P2.** Completo significa metadata/canonical/OG/robots/sitemap, datos estructurados mínimos pertinentes y semántica correctas para la superficie que sí existe; no significa un motor de SEO universal. No quedan índice editorial, taxonomía, feed, autoría, parser MDX o helpers de blog obligatorios.

El ejemplo demuestra añadir una página sin romper canonical, navegación o sitemap. Puede eliminarse; el SEO general no importa su contenido ni necesita un directorio de artículos para compilar. La ausencia de blog no puede eliminar la metadata de pricing o permitir indexar cuenta/billing.

### D-D — Organizations: C14 sigue P2; frontera comercial explícita

**Sí, V1 se limita conscientemente a productos de cuenta individual.** Puede anunciarse para herramientas personales de productividad/utilidad, contenido de acceso individual y servicios profesionales usados por una sola persona por cuenta. No se anunciará como foundation de SaaS de equipos, workspaces compartidos, asientos, roles empresariales o enterprise/SSO. Una venta a una empresa no implica que su aplicación tenga organizaciones; la frontera es el modelo de cuenta.

Vercel gratuito tiene teams y es más apropiado para quien los necesita desde el primer día. Esa objeción comercial se acepta; no se intenta ganar todos los segmentos.

Añadir organizations ahora cambia propietario de datos, pertenencia, invitaciones, autorización, billing customer, eliminación y matriz de tests: coste arquitectónico **HIGH**. Añadirlas después también será **HIGH**, mayor si el comprador ya tiene datos personalizados: habrá que migrar ownership y asignaciones de billing y revisar políticas. No se promete un upgrade plug-and-play ni una migración universal. Mantener límites claros entre identidad, recurso y billing reduce acoplamiento accidental, pero no elimina ese coste. No se diseñan organizaciones latentes, `team_id` ficticio ni abstracción multitenant en V1. Decisión cerrada para este scope; nueva demanda sería otra versión, no una pregunta abierta de Engineering.

### D-E — C12 se divide por responsabilidad; analytics P2

Recuperación de auth/billing permanece core en C02/C04; contacto accesible en C05; runbooks y diagnóstico en C07. Analytics comercial, tracking de conversiones y SDK de medición pasan a P2, no a módulo entregado “opcional” que igualmente exigiría soporte. Logs/correlación mínimos para reparar fallos siguen IN y no se cuentan como analytics.

Inbox y atención humana son externos; el producto entrega un contacto configurado y un procedimiento seguro. No se prometen tiempos de respuesta del founder. No se añade chat, formulario de tickets, panel admin ni proveedor de observabilidad.

### D-F — Authentication friction: Google OAuth + magic link pasan a V1

V1.1 soporta **Google OAuth, magic-link login y email/password** mediante Supabase Auth. Google y magic link sirven como caminos de baja fricción para alta/entrada; password sigue disponible como fallback y conserva verificación/reset. La UI puede unificar alta y login cuando el proveedor lo permita, pero no debe ocultar la identidad de la sesión ni crear linking manual inseguro.

Se acepta el aumento permanente de configuración y tests: callbacks Google, SMTP/links, expiración/reutilización, cancelación OAuth, cooldown/antiabuso y comportamiento de cuentas que ya existen. La V1 no añade Apple/GitHub ni otros proveedores, MFA/SSO o un segundo framework auth. El comportamiento de identidad con el mismo email entre métodos debe seguir las garantías/configuración soportadas por Supabase y quedar probado/documentado; DNW no fusiona cuentas arbitrariamente por email.

## 3. Capabilities finales propuestas

| ID conservado | Sistema final de entrega | Resultado de revisión / absorciones | Contratos |
| --- | --- | --- | --- |
| C01 | Foundation tipada y configuración | REDUCE | PC01, AC01, AR01–AR03 |
| C02 | Identidad de baja fricción y recuperación | V1.1: Google OAuth + magic link + password; SMTP de C10 y recuperación auth de C12 | PC02–PC03, AC02, AR02–AR05 |
| C03 | Datos aislados y ejemplo premium sustituible | KEEP | PC04, AC03, AR04–AR06 |
| C04 | Suscripción individual y recuperación de billing | REDUCE; operación financiera de C12 | PC05–PC08, AC04–AC05, AR05–AR09 |
| C05 | Recorrido UI, oferta pública y SEO del perímetro | REDUCE; mínimo C08/C09 y contacto C12 | PC09–PC11, AC06–AC07, AR02/AR10 |
| C07 | Entrega, verificación y documentación de modificación | REDUCE; contratos C13 y distribución de evidencia C06 | PC12–PC13, AC08–AC10, AR11–AR12 |

C06 se conserva como **obligación transversal de seguridad/evidencia**, no sistema runtime separado. C08 deja de ser biblioteca marketing independiente; C09 divide SEO IN y blog P2; C10 divide Auth IN y app email P2; C11 sale completa; C12 se divide; C13 se absorbe. Las capacidades absorbidas no siguen generando requisitos por su nombre antiguo.

## 4. P0/P1/P2/rejected revisados

### P0: prueba de imposibilidad de vender honestamente sin él

| Sistema P0 | ¿Qué ausencia concreta impide vender esta V1 honestamente? | Lo muy importante que se quitó de su P0 |
| --- | --- | --- |
| C01 | No poder arrancar/configurar el stack de manera reproducible | Provisionador universal, múltiple matriz tecnológica |
| C02 | No poder crear/entrar/verificar/recuperar una cuenta con los caminos de baja fricción vendidos | Self-service avanzado, MFA/SSO y proveedores sociales adicionales |
| C03 | No demostrar recurso propio y prestación premium aislada | Storage, realtime, funciones extra de Notes |
| C04 | Cobrar sin mantener/revocar/recuperar acceso recurrente correctamente | One-time, trials, promos, cambios activos de intervalo |
| C05 | No existir recorrido utilizable desde oferta hasta ayuda | Galería de componentes, social proof, temas múltiples |
| C07 | No entregar al comprador medios para repetir verificación y modificar con límites claros | Lectores remotos doctor, adapters multiagente |

Los controles y pruebas críticos de C06 son P0 dentro de esos sistemas. No son “importantes” de forma abstracta: su ausencia invalida los claims de dinero/integridad/aislamiento.

**P1: ninguno.** Se pudo construir una V1 premium coherente sin los extras candidatos: pasan a P2. Lo imprescindible de C08–C13 se integra en un contrato core reducido, no se eleva la capacidad original completa a P0. Cero P1 evita usar esa categoría como wishlist obligatoria; V1.1 amplía C02 dentro de su P0 existente y no crea un P1 nuevo.

### P2: exclusiones completas, sin código dormido requerido

| Procedencia | POST-V1 |
| --- | --- |
| C02 | Cambios sensibles/borrado self-service avanzado, MFA/SSO y proveedores OAuth adicionales a Google |
| C04/C15 | One-time/lifetime, recipe ejecutable de ese modelo, trials, promociones, cambio de intervalo de una suscripción vigente, múltiples tiers/asientos/uso/créditos, guest checkout e híbridos |
| C05/C08 | Dark mode y selector, variantes decorativas, galería de bloques/testimonios/ratings, componentes sin uso |
| C09 | Blog completo, categorías/tags/autores/feed, buscador y tooling editorial |
| C10 | SDK y plantillas de email de aplicación, colas de mensajes/campañas |
| C11 | Captación de leads nativa e integraciones mantenidas de lista de espera |
| C12/C16 | Analytics comercial, chat, contextualización de chat, panel de soporte/observabilidad |
| C07/C13 | Doctor con lectores de APIs administrativas, auto-reparación/provisionamiento, adapters específicos y certificación multiagente |
| C14 | Organizations, teams, roles, invitaciones y su migración universal |
| C17/C18 | Storage/realtime/CMS y recuperación comercial de checkout |
| C06 | Carga extensiva, fuzzing amplio y pentest externo como entregables incluidos |

**REJECTED, C19/C20:** variantes JS/Pages/multiproveedor, frameworks auth alternativos, despliegues múltiples, correo entrante propio, prompt packs, directorio creativo como feature, integración IA sin job, motores propios fiscal/antifraude, demos gigantes y claims de conformidad universal. Ningún P2 se convierte por ello en compromiso de roadmap o fecha.

## 5. Product contract — PRODUCT_CONTRACT

Estos PC definen lo que recibe y puede hacer el comprador. No obligan a nombres de tablas, colas, paquetes o estados internos. Las políticas comerciales por defecto se fijan aquí para que Engineering no deba inventarlas.

| ID | Contrato de producto obligatorio | Frontera |
| --- | --- | --- |
| PC01 | Una foundation ejecutable y editable de Next.js App Router + TypeScript + Supabase + Stripe + Vercel, con configuración coherente de identidad, dominio y catálogo | Un stack y una configuración soportada; sin variantes legacy |
| PC02 | Crear cuenta o entrar mediante Google OAuth, magic link o email/password; en password, verificar/reenviar y recuperar contraseña; compartir sesión/callback seguro, conservar destino interno permitido, salir y presentar errores útiles | Tres caminos soportados bajo Supabase Auth. Google/magic link minimizan pasos; password es fallback. Sin otros social providers, MFA/SSO ni linking manual inseguro por email |
| PC03 | Ver/editar nombre, ver identidad y pedir ayuda para cambios sensibles o eliminación; procedimiento seguro de soporte que coordine identidad, datos y billing | Sin obligación de pantalla propia de cambio de email o borrado automatizado. No borrar billing mapping antes de resolver cargos/acceso |
| PC04 | Un ejemplo real de datos privados demuestra ownership y una operación premium; al perder Pro se conserva lectura/borrado de datos propios | Notes título/body, crear/editar requieren Pro; sin funciones de negocio adicionales |
| PC05 | Elegir y contratar Pro mensual o anual; una cuenta, un nivel pagado, una moneda configurada y como máximo una suscripción vigente | Free permite cuenta/recuperación/datos conservados; no trials ni lifetime. Intervalo elegido al contratar, no switch activo |
| PC06 | Pago y renovación válidos producen acceso aunque el comprador cierre el navegador; estado visible distingue pendiente, confirmado, fallido y expirado | Sin permiso obtenido por query string, email declarado o pantalla de éxito |
| PC07 | Cliente gestiona tarjeta/recibos y cancelación con Portal propio; la app refleja impago/baja y revoca según política temporal definida | UI financiera alojada en Stripe; ninguna consola de facturación propia |
| PC08 | Eventos repetidos/desordenados y fallos temporales no producen compras o grants duplicados ni pérdida silenciosa; operador puede detectar y recuperar una discrepancia | Recuperación verificable con procedimiento/herramienta acotada; sin plataforma genérica de workflows |
| PC09 | Visitante entiende la oferta, ve precio/periodo coherentes y llega a signup; usuario navega app/cuenta/billing/ayuda con estados utilizables y accesibles | Una composición pública y un shell, un tema editable; no biblioteca de marketing |
| PC10 | Todas las rutas públicas entregadas tienen SEO/social metadata y datos estructurados pertinentes al contenido real, y las privadas no son indexables; una página de ejemplo enseña a extender ese contrato | Sin blog, CMS, búsqueda, ranking garantizado ni esquema editorial |
| PC11 | Usuario bloqueado puede localizar contacto de soporte sin sesión; errores ofrecen correlación segura sin revelar datos sensibles | Inbox, equipo de soporte y respuesta pertenecen al comprador; no chat ni analytics |
| PC12 | Repo y ZIP del mismo release incluyen código y todos los tests, comandos, configuración de ejemplo y docs necesarios para repetir la evidencia | Secrets/datos reales excluidos; no herramientas esenciales reservadas al vendedor |
| PC13 | Comprador puede configurar, desplegar, verificar y adaptar el ejemplo mediante mapa, invariantes y comandos canónicos; diagnóstico distingue fallo de falta de evidencia | AGENTS/docs versionados; no garantía de comportamiento de una marca de agente ni setup universal |

### Política cerrada de suscripción y acceso

| Caso | Resultado exigido |
| --- | --- |
| Pago inicial pendiente/fallido | No crear permiso Pro; mostrar estado recuperable y no anunciar cobro confirmado |
| Factura válida pagada | Acreditar únicamente el periodo/servicio que paga; acceso atribuible al usuario correcto |
| Renovación pagada | Extender periodo acreditado una sola vez; no duplicar efecto por reenvío |
| Impago / past_due | No acreditar un periodo nuevo; conservar sólo el ya pagado, sin gracia extra por defecto; después denegar create/update premium |
| Cancelación solicitada por cliente | Default al fin del periodo pagado; mostrar fecha de fin, mantener hasta entonces y revocar después |
| Cancelación inmediata por operador/proveedor | Terminar acceso de esa suscripción y reflejar la baja, sin esperar una visita del usuario |
| Recontratación | Permitida cuando ya no existe suscripción vigente; nuevo periodo válido puede restaurar acceso. Suscripción cancelada para final de periodo sigue vigente hasta su fin |
| Intento de cambiar intervalo vigente | No ofrecido por UI/Portal configurado. Cambio externo inesperado se detecta y requiere reconciliación; no prometer proration soportado |
| Refund completo de factura del periodo vigente | Revocar el acceso financiado por esa factura; no cancelar automáticamente futuras renovaciones ni afectar a periodos distintos pagados |
| Refund parcial o de factura antigua | Registrar/mostrar al operador; no revocar automáticamente un periodo vigente distinto. Política de concesión comercial adicional pertenece al comprador |
| Disputa del pago relevante | Suspender acceso financiado por ese pago mientras abierta; perdida revoca; ganada restaura sólo si periodo aún válido y no reembolsado |
| Estado/precio/modelo no soportado | No conceder un permiso nuevo por inferencia. Conservar hechos válidos ya acreditados salvo revocación explícita; hacer visible la discrepancia para operador |
| Servicio externo/DB temporalmente caído | No anunciar confirmación inexistente; respuesta recuperable y procedimiento de convergencia. Sin extender periodo arbitrariamente para ocultar el fallo |

El CRUD prueba integridad de acceso, no un nivel gratuito de negocio completo. Leer/borrar datos conservados es una política de salida, no un trial. Promociones y proration permanecen desactivados en la configuración soportada. Recibos y capacidades fiscales se delegan a Stripe: documentar configuración necesaria y sus límites, sin motor propio. No se entrega un perfil adicional de Stripe Tax probado como feature V1; una personalización fiscal exige validación del comprador. La política concreta de impuestos/contratos de cada negocio queda fuera de esta decisión de producto.

## 6. Acceptance contract — ACCEPTANCE_CONTRACT

Estas AC son obligaciones de evidencia, no declaraciones de pruebas ejecutadas. Pueden cambiar las herramientas y los nombres de test, no el comportamiento exigido. Cada prueba usa versión, SHA/paquete, esquema y entorno identificados.

| ID | Resultado mínimo para PASS | Contratos cubiertos |
| --- | --- | --- |
| AC01 | Desde entorno limpio, instalar con lockfile, validar tipos y compilar. Env requerida ausente/incorrecta produce diagnóstico accionable sin imprimir secretos; catálogo incoherente no permite nueva compra | PC01, AR01–AR03 |
| AC02 | Contra Supabase alojado, buzón controlado y credenciales Google de test/staging: password signup→verificación→login y forgot/reset→login; magic-link alta/entrada; Google OAuth alta/entrada. Link caducado/reutilizado, reenvío/cooldown, OAuth cancelado/fallido, callback inválido, retorno externo, sesión expirada y fallo de logout tienen resultado seguro. El mismo email entre métodos no crea acceso cruzado ni linking manual inseguro; el comportamiento soportado por Supabase queda probado/documentado. Editar nombre funciona. Procedimiento de cambio sensible/borrado ensayado con cuenta test y verificación de identidad | PC02–PC03, AR02–AR05 |
| AC03 | En DB real y Data API, A/B/anon: A no lee/edita/borra B; usuario no escribe grants, no cambia owner ni serializa campos secretos. Free no crea/edita; Pro sí; revocado no crea/edita, conserva lectura/borrado propios. Migrations desde vacío y tipos sin drift; restauración de muestra y política de actualización documentadas | PC04, AR04–AR06 |
| AC04 | En Stripe test mode real: alta mensual y anual, cierre de navegador, confirmación, renovación, fallo, cancelación al periodo/inmediata, recontratación, refund y disputa según matriz; Portal sólo customer propio. Precio ajeno/inactivo y doble intento no producen cobro no previsto ni segunda suscripción | PC05–PC07, AR05–AR09 |
| AC05 | Firma inválida no aplica cambios; duplicados/concurrencia/orden invertido convergen al mismo estado correcto. Fallo DB/API/worker deja evento reintentable o discrepancia durable visible. Restauradas dependencias, un procedimiento de recuperación repetible alcanza estado correcto en ≤5 minutos desde su inicio en fixture pequeño; retorno del navegador no es necesario | PC06–PC08, AR07–AR09 |
| AC06 | Recorrido de §10 completo en deploy real a 360/768/1280 px; sin overflow accidental ni controles inaccesibles. Teclado/foco/labels/errores/zoom 200% y contraste comprobados; cero serious/critical automated en rutas propias; revisión manual muestreada con lector de pantalla. No falsos éxitos financieros | PC09/PC11, AR02/AR10 |
| AC07 | Precio público e intervalo coinciden con Checkout configurado; CTA termina en alta/pago. Metadata/canonical/OG/robots/sitemap y datos estructurados pertinentes válidos, zona privada no indexable. Eliminar página EXAMPLE conserva SEO y build; no existen links a blog/leads retirados | PC09–PC10 |
| AC08 | Tag y ZIP tienen el mismo contenido de comprador, incluidos tests/doctor/docs. Desde ambos se ejecutan instalación, build y suite de checks locales. Artefactos/bundle/logs de prueba no contienen secretos; ninguna exclusión genérica elimina scripts esenciales | PC12, AR11 |
| AC09 | Diagnóstico local detecta versiones/env/archivos/reportes inválidos y diferencia PASS/FAIL/UNKNOWN/NOT_APPLICABLE. No da PASS de producción por comprobar .env. Guía remota lleva a pruebas reales de URLs/Auth/webhook/Portal/SMTP; sin evidencia aplicable el release no pasa | PC13, AR11–AR12 |
| AC10 | Comprador o agente siguiendo sólo contrato canónico añade un campo a Notes y cambia marca/contenido sin romper aislamiento, tipos, billing o build. Contacto público usable y un incidente de auth/billing resuelto con runbook/correlación sin enviar secretos | PC11–PC13 |

**Cobertura negativa transversal obligatoria:** autenticación/autorización por operación, validación server y límites de payload, origen/CSRF en mutaciones con cookie, límites antiabuso en superficies expuestas, firma webhook, grants/DTO y secretos, cabeceras compatibles con los journeys. Los tests deben fallar al introducir la violación de un invariante crítico; no basta buscar una cadena en el código. Pruebas de identidad/dinero no se sustituyen por snapshots visuales.

No se conservan como gates los dos perfiles de billing, blog, leads, analytics, email de bienvenida ni adapters de tres herramientas. Google OAuth y magic link sí forman parte de AC02/G2 en V1.1. La prueba de quitar blog se sustituye por quitar la página estática EXAMPLE. Los umbrales p95/<60 s de v0.1 pasan a candidatos de Engineering; el contrato de convergencia anterior permanece y no es SLA de producción.

## 7. Architectural constraints — ARCHITECTURAL_CONSTRAINT

| ID | Restricción obligatoria | Libertad de Engineering |
| --- | --- | --- |
| AR01 | Stack único Next App Router/TypeScript estricto/Supabase/Stripe/Vercel; versiones y lockfile reproducibles; ningún framework paralelo para el mismo job | Elegir versiones estables verificadas y organización del repo; no fijar hoy una versión de memoria |
| AR02 | Autenticar/autorizar en servidor operaciones sensibles; retorno permitido; datos/errores públicos minimizados; secretos sólo servidor | Server Actions o handlers adecuados, formato DTO y helpers |
| AR03 | Una fuente de catálogo/configuración; precio y customer no confiados desde cliente; fallos de configuración visibles | Schema/lib de validación, cache y forma de config |
| AR04 | Supabase es autoridad de identidad; Postgres/RLS limita acceso directo además de UI; ownership no transferible por cliente | Tablas, policies/funciones y estructura SQL, sin auth propia |
| AR05 | El usuario no escribe estados financieros/grants; privilegios de worker/operador aislados del cliente y de acciones normales | Proyección, roles y mecanismo de lectura mínima |
| AR06 | Schema versionado, tipos coherentes, migraciones repetibles y seeds seguros test/local; no sembrar usuarios demo en producción | CLI/comandos concretos, diseño de backfill y migración correctiva |
| AR07 | Acceso pagado no depende de success URL ni del navegador; autenticidad del webhook verificada sobre payload válido; recibo y aplicación no se confunden | Procesamiento síncrono o asíncrono si cumple fiabilidad y límites del host |
| AR08 | Efectos idempotentes y estado convergente pese a reenvío/orden/concurrencia; no perder trabajo reconocido ni esconder discrepancias relevantes | Ledger durable, cola, transacción, claves de dedupe, consulta actual a Stripe; modelo concreto al ADR |
| AR09 | Identidad/customer/suscripción propios ligados en servidor; sin doble suscripción vigente; reparación privilegiada explícita, repetible y auditable | Forma de intento, bloqueo/transacción, comandos y política de reintento |
| AR10 | UI editable con tokens semánticos y patrones accesibles; sólo límites client que los journeys necesiten; security headers/antiabuso efectivos compatibles con servicios | Tailwind/primitives concretos, composición, CSP exacta y backend del limitador al ADR |
| AR11 | Repo y ZIP equivalentes para el comprador; docs/comandos/invariantes canónicos versionados; sin secretos/datos reales | Herramienta de empaquetado, directorios, formato de reporte y CI |
| AR12 | Diagnóstico no muta recursos remotos por defecto ni convierte permisos ausentes/prueba no ejecutada en PASS; tests con efectos aislados del live | CLI/flags/nombres de estados y permisos usados por pruebas, respetando su semántica |

La especialización del stack sí es una restricción arquitectónica de posicionamiento. La elección de Tailwind/shadcn/Base UI/Radix no se eleva a contrato de producto: UI coherente/editable/accesible es lo obligatorio; Engineering puede elegir una sola solución compatible y justificarla. No hay permiso para ampliar targets o proveedores bajo el rótulo ADR.

## 8. Engineering candidates / ADR backlog — IMPLEMENTATION_CANDIDATE

Se preservan buenas ideas de v0.1 sin exigirlas por adelantado. **IC no es backlog autorizado de implementación.** Los candidatos de funciones P2 se conservan como referencia, no deben implementarse para completar V1. Un ADR sólo selecciona cómo satisfacer PC/AC/AR; si añade un modelo de negocio, proveedor o journey, requiere otra decisión de producto.

| ID | Idea preservada de v0.1 | Decisión de Engineering o motivo de aplazamiento |
| --- | --- | --- |
| IC01 | Node/npm/Next/Supabase SDK/Stripe API y matriz exacta, comandos con nombres propuestos | Fijar versiones probadas y matriz pequeña; PC01/AC01, no “latest” automático |
| IC02 | Schema env/config central, módulos/helpers y contrato de errores | Elegir librería y forma de config; mantener validación/coherencia |
| IC03 | Tablas profiles/notes/customer mapping/facts/grants/ledger separadas, DTO de acceso | Modelo candidato, no número/nombre obligatorio de tablas |
| IC04 | Perfil por trigger, backfill idempotente, evitar email duplicado, funciones con search_path restringido | Resolver lifecycle de perfil y límites privilegiados; conservar resultados AR04–AR06 |
| IC05 | Ledger received/processing/applied/failed/ignored, event.id y transiciones por objeto | Nombres/estados/índices son candidatos; trazabilidad/idempotencia/recovery sí obligatorias |
| IC06 | Dedupe transaccional, idempotency key por intento, un intento activo, lock por customer | Elegir mecanismo que pase concurrencia; no prescribir cada pieza simultáneamente |
| IC07 | Worker Postgres + tick Vercel, replay/reconcile dry-run/apply, paginación/exclusión | Comparar con procesamiento directo y reintentos del proveedor; no exigir scheduler propio si cumple AC05 sin pérdida |
| IC08 | ACK <2 s p95, proyección <60 s, cron <5 min y presupuesto de bundle +10% | Objetivos técnicos a medir y justificar; no claims/gates heredados sin carga y entorno definidos |
| IC09 | Consulta de estado actualizado Stripe, matriz de tipos exactos/versiones y payloads | Ingeniería fija eventos para política PC05–PC08; no timestamps como sustituto de convergencia |
| IC10 | Borrado reanudable con deletion_pending, cancelación idempotente, pseudonimización financiera | Automatización self-service P2; V1 conserva procedimiento operador seguro probado, sin imponer tabla/worker nuevo |
| IC11 | Tailwind + wrappers shadcn con Base UI o Radix, componentes concretos y tokens | Elegir una familia sólo para UI usada; ADR con foco/SSR/edición y evidencia, sin catálogo extra |
| IC12 | Claro/oscuro/sistema, persistencia y variantes de marca/animaciones | P2 salvo tokens/tema único; no selector ni matriz dark obligatorios |
| IC13 | Rate limiting atómico compartido en Postgres con TTL/limpieza, límites nativos Auth | Backend concreto no es scope. Antiabuso efectivo y no confiar en memoria por instancia siguen obligatorios donde aplique; retirar workload de leads |
| IC14 | CSP/headers exactos, límites de payload y lista de orígenes | Decidir por rutas reales, demostrar compatibilidad/negativos; no copiar una lista genérica y llamarla seguridad |
| IC15 | Doctor Management API Supabase, Stripe endpoint inspection, DNS/email/API domain readers | P2: no suite de credenciales administrativas en V1. Mantener guía/checks funcionales remotos y UNKNOWN |
| IC16 | Doctor local JSON/humano, exit codes 0/1/2, manifest SHA/version/ambiente y `dnw:verify` | Candidato preferido para C07; semántica de evidencia obligatoria, formato/nombres negociables |
| IC17 | SDK Resend y plantilla HTML/texto, email preview, presupuesto/env de app | P2; SMTP Auth sigue configurado/documentado. No instalar SDK de app sin mensaje de negocio IN |
| IC18 | Blog MDX local/taxonomía/helpers/Search Console, JSON-LD de artículos | Blog/parser/taxonomía P2. Ejemplo estático + SEO de rutas reales IN; JSON-LD sólo si corresponde al contenido |
| IC19 | Leads endpoint privado en servidor, inserción limitada, dedupe y no enumeración | P2 íntegro; mantener nota de posible CTA externo sin código del proveedor |
| IC20 | Vercel Analytics, conversión deduplicada, chat contextual y panel de actividad | P2 para medición/chat/panel; correlación mínima operativa IN sin reutilizarla como tracking comercial |
| IC21 | AGENTS + docs separadas por arquitectura/invariantes/comandos, adapters Claude/Cursor y smoke de tres herramientas | Contrato único IN; estructura de archivos candidata; adapters y matriz de herramientas P2 |
| IC22 | Repo/tag/ZIP con manifest/hash, scanner, CI, scripts de tests, build y release | Engineering decide herramientas; todo lo necesario para AC08 se entrega, sin excluir scripts en bloque |
| IC23 | Snapshots E2E/a11y, DB tests SQL/Data API y tests Stripe/fixtures de proveedores | Elegir runners/fixtures robustos; no usar regex de implementación como evidencia de comportamiento |
| IC24 | Backups/PITR del proveedor, restauración de muestra, runbooks y alertas de pendientes | Documentar opción externa y ensayar recuperación; no servicio backup o plataforma alerts propios como requisito |
| IC25 | One-time como perfil excluyente, grants permanentes, promociones y switch mensual/anual con proration | P2; preservado para evaluación futura, no recipe soportada escondida en V1 |
| IC26 | Adaptación del baseline con posibles grants one-time ya existentes | Antes de migrar identificar entorno/datos; procedimiento seguro de no conversión silenciosa. No construir migrador universal de negocios fuera del ICP |

### Auditoría de clasificación de todo v0.1

Cada grupo de requisitos se descompone por su naturaleza; no se asigna una etiqueta única a un párrafo que mezclaba resultado, test y mecanismo. Las afirmaciones de evidencia/hipótesis no son requisitos y no necesitan esas cuatro etiquetas. Todo requisito de v0.1 queda sustituido por los PC/AC/AR siguientes, preservado como IC o excluido P2/REJECTED. **No existen requisitos implícitos heredados por omisión.**

| Sección v0.1 | PRODUCT_CONTRACT | ACCEPTANCE_CONTRACT | ARCHITECTURAL_CONSTRAINT | IMPLEMENTATION_CANDIDATE / exclusión |
| --- | --- | --- | --- | --- |
| 1 Thesis | PC01/PC04–PC13 | AC01–AC10 | AR01 | Claims sin medir no se heredan |
| 2 ICP/jobs | PC02/PC05/PC09 | AC02/AC04/AC06 | AR01/AR04 | Cuenta individual; leads/one-time P2 |
| 3 Free comparison | Evidencia, no obligación de copiar teams | Evidencia, no test ejecutado | Ninguna nueva | No prescripciones del competidor |
| 4 Ledger 118 | Apéndice B ajusta alcance | Checks AC sustituyen M anteriores | AR aplicables a job IN | Recortes explícitos; no herencia de variantes |
| 5 Capacidades/coste | §3–4 de esta candidata | AC por sistema | AR transversales | Horas previas no son presupuesto |
| 6 Modernization | Cinco claims de §11 | AC correspondientes | AR02–AR12 | IC05–IC25; claims retirados no subsisten |
| 7 P0 | PC01–PC13 reducidos | §6 | §7 | Extras originales P2 |
| 8 P1 | No P1 independientes | Gates sólo del scope reducido | Sin obligaciones residuales | Extras P2; mínimos fusionados |
| 9 P2 | Exclusiones §4 | No gates de esas funciones | Sin arquitectura latente | P2 conservado/ampliado por recortes |
| 10 Rejected | Exclusiones §4 | No gates de esas funciones | AR01 | Rechazos conservados |
| 11 Journeys | PC02–PC11 / §10 | AC02–AC07/AC10 | AR02–AR10 | Se eliminan J9/leads y ramas P2 |
| 12 UI | PC09–PC10 | AC06–AC07 | AR10 | IC11–IC12; biblioteca exacta libre |
| 13 Billing | PC05–PC08 y matriz | AC04–AC05 | AR03/AR05/AR07–AR09 | IC05–IC09/IC25; sólo recurrente |
| 14 Auth | PC02–PC03 | AC02 | AR02/AR04–AR05 | Google OAuth + magic link + password IN; IC04/IC10; MFA/SSO y otros OAuth P2 |
| 15 DB/reference | PC04 | AC03 | AR04–AR06 | IC03–IC04/IC23/IC26 |
| 16 Email | PC02/PC07 | AC02/AC04 | AR02/AR12 | IC17; app email P2 |
| 17 SEO | PC10 | AC07 | AR10 | IC18; blog P2 |
| 18 Security | PC04/PC06/PC08/PC13 | Negativos §6 | AR02–AR12 | IC13–IC14; backend limitador libre |
| 19 DX/doctor | PC12–PC13 | AC08–AC09 | AR11–AR12 | IC15–IC16/IC22; remote doctor P2 |
| 20 Agent DX | PC13 | AC10 | AR11 | IC21; adapters P2 |
| 21 Testing | Claims bajo PC | AC01–AC10 | Integridad de evidencia AR11–AR12 | IC23; matriz reducida |
| 22 Deploy/ops | PC08/PC11–PC13 | AC05/AC08–AC10 | AR01/AR09/AR12 | IC07/IC24; analytics P2 |
| 23 Dependencies | §3/§13 de v0.2 | Gates con dependencias §15 | AR01–AR12 | No fechas/orden técnico prescrito |
| 24 Risks | Límites de claims | §13/§15 | Sin contrato nuevo | Riesgos no convierten extras en IN |
| 25 Evidence debt | No afirma operación actual | §15 conserva cuatro deudas | AR11–AR12 | Evidencia pendiente, no implementación |
| 26 Acceptance | PC bajo prueba | AC01–AC10 sustituyen T01–T13 | AR vinculadas | Tests de extras retirados |
| 27 Gates | Claims condicionados | G1–G6 §15 sustituyen G1–G7 | AR11–AR12 | Mecánica CI IC22–IC23 |
| 28 Challenge | §1–4/§10 | Completitud reducida | Ninguna nueva | Revisión explícita de recortes anteriores |
| 29 Summary | Apéndice B conserva los 118 IDs | No suma de features | Ninguna nueva | Decisiones previas sustituidas |
| 30 Premium | Cinco ventajas §11 | Evidencia de cada ventaja | AR correspondientes | Sin claim de amplitud/paridad total |

## 9. Module classification y buyer modification test

CORE significa que quitar el contrato cambia el producto soportado; no que todos sus archivos sean intocables. EXAMPLE significa que el comprador debe poder reemplazar el dominio/presentación conservando los invariantes. OPTIONAL_MODULE sólo se usaría para código opcional que realmente se entregue: **no hay módulos funcionales opcionales extra en V1**. PROFILE es una configuración alternativa soportada: **no hay segundo perfil funcional V1**; mensual/anual son opciones del mismo modelo, no dos arquitecturas.

| Sistema o parte | Clasificación | ¿Puede eliminarse/adaptarse sin romper lo no relacionado? | Prueba o frontera |
| --- | --- | --- | --- |
| C01 configuración/base | CORE | Adaptar marca/precios sí; quitar validación/stack rompe contrato | AC01/AC10; evitar constantes dispersas |
| C02 password/verify/reset/SMTP | CORE | Ajustar copy/config; no quitar recuperación conservando claim | AC02; email de bienvenida no es dependencia |
| C03 policies/grants/tipos | CORE | Cambiar recurso conservando aislamiento; no quitar RLS como receta soportada | AC03; nuevo recurso debe tener mismas pruebas relevantes |
| C03 Notes | EXAMPLE | Sustituir tabla/campos/UI/tests del ejemplo sin reescribir identidad ni cobro | AC10; borrar Notes sin prestación sustituta pierde demostración premium, no debe romper billing |
| C04 suscripción | CORE | Adaptar precio y branding; quitarla crea otra categoría de producto | AC04–AC05; un solo modelo |
| C05 shell/auth/cuenta/billing | CORE | Cambiar layout/tokens sin alterar autorizaciones ni estados | AC06/AC10; no acoplar permisos a visibilidad del botón |
| C05 composición de landing | EXAMPLE | Reemplazar por oferta propia, incluso externa, manteniendo entrada/catálogo coherentes | AC07; ninguna dependencia auth/billing de bloques comerciales |
| C09 página estática de muestra | EXAMPLE | Eliminar ruta y enlace sin romper sitemap, metadata global o app | AC07: eliminación completa pasa build/navigation |
| C05 SEO base y contacto | CORE | Adaptar dominio/copy/inbox; sustituir implementación manteniendo job | No dejar canonical demo ni usuario sin ayuda |
| C07 entrega/docs/doctor local | CORE | Cambiar herramienta interna manteniendo comandos/evidencia equivalentes | AC08–AC10; tests no ocultos en tooling del vendedor |
| Blog / leads | Fuera V1; P2 | No instalados, sin tablas/SDK/endpoints dormidos; añadir externamente no condiciona core | No recipe que simule soporte nativo |
| Google OAuth / magic link | CORE de C02 | Pueden deshabilitarse por configuración del comprador, pero la release DNW los soporta, documenta y prueba; comparten Supabase Auth/session con password | AC02/G2; no otros OAuth providers ni linking manual por email |
| One-time billing | Fuera V1; P2, futuro PROFILE candidato | No flag para convertir recurring a payment; cambiar modelo requiere desarrollo/revalidación | No debe seguir apareciendo en documentación V1 como soportado |
| Analytics | Fuera V1; P2, futuro OPTIONAL_MODULE candidato | No SDK requerido; bloquear tracking añadido por comprador no debe afectar acceso | Logs operativos core permanecen separados |
| Email transaccional de aplicación | Fuera V1; P2, futuro OPTIONAL_MODULE candidato | No plantilla/SDK obligatorio; añadir bienvenida no interviene en grants | SMTP de Auth permanece CORE |

No se invierte la dependencia: billing no importa Notes para conceder un permiso, Auth no importa marketing, sitemap no exige un blog, soporte no necesita analytics. Los tests de ejemplo sí ejercitan todo el recorrido; sus dependencias son evidencia, no acoplamiento de los servicios core al dominio Notes.

## 10. Complete journeys después de los recortes

| Paso exigido | Pieza que permanece | Fallo/estado que debe resolver | PASS |
| --- | --- | --- | --- |
| Visitante entiende producto | Landing propia mínima, oferta y FAQ, precio mensual/anual, CTA | Catálogo incompleto bloquea compra; no precio ficticio de fallback | AC07 |
| Crea cuenta / entra | Google OAuth, magic link o password + verificación de email | OAuth cancelado/fallido, envío pendiente, correo no recibido/reenvío, link expirado/reusado, credenciales inválidas y límites/cooldown | AC02 |
| Recupera cuenta | Forgot/reset, link seguro y soporte público | Link expirado/reutilizado y sesión inválida no conceden acceso | AC02 |
| Paga | Checkout autenticado, price/cuenta propios | Doble intento, precio retirado, abandono y error proveedor | AC04 |
| Pago se procesa sin navegador | Procesamiento fiable independiente de success URL | Evento retrasado/fallido: “confirmando”, recuperación durable | AC04–AC05 |
| Accede a prestación premium | Notes create/update tras periodo acreditado | Bloqueo Free/expirado y retry sin falso éxito | AC03–AC06 |
| Sus datos están aislados | Ownership + RLS + autorización server | B/anon y acceso directo a API no evitan controles | AC03 |
| Gestiona billing | Estado/periodo y Portal propio | Portal ajeno denegado; regreso no se trata como confirmación | AC04 |
| Cancela/pierde acceso | Baja al periodo, impago, refund/disputa según política | Revoca writes correctamente y conserva lectura/borrado propios | AC04–AC05 |
| Solicita ayuda | Contacto público, ID seguro y runbook | Puede contactar sin sesión; datos sensibles no viajan en error | AC10 |
| Founder despliega/verifica | Repo/ZIP + comandos + doctor local + pruebas/checklist remotos | Sin credenciales/evidencia no se anuncia PASS de producción | AC08–AC09 |

**Resultado:** no hay corte del recorrido core. La ausencia de blog, leads, one-time, bienvenida o analytics no elimina ningún paso. Google OAuth y magic link ya forman parte del recorrido core de autenticación en V1.1. Se conserva reset frente a la tentación de recortarlo; se conserva recuperación financiera frente a dejar sólo Checkout; se conserva SMTP real frente a confundir quitar app email con quitar correo de Auth.

La reducción del autoservicio sensible cambia comodidad, no posibilidad de pedir y procesar ayuda. El runbook exige verificación de titularidad adecuada al cambio, reautenticación o procedimiento del proveedor, nunca compartir password ni confiar sólo en un email recibido. La eliminación primero resuelve estado de Stripe/acceso y sólo después datos/identidad; se registra progreso para reanudar una interrupción. Si no puede ejecutarse de forma segura y repetible en ensayo, AC02/AC10 no pasan: no se tolera una nota genérica “bórralo en el panel”. No se construye un backend admin nuevo para esa receta.

## 11. Premium differentiation — cinco ventajas como máximo

Las ventajas son **claims futuros condicionados a pruebas**, no funciones ya implementadas ni comparaciones de rendimiento ejecutadas. Frente a ShipFast se compara contrato/evidencia pública auditada, sin afirmar ausencia en su repo privado. Si sólo se cumplen instalando una librería, no cuentan.

| # | Ventaja concreta | Frente a empezar desde cero | Frente a Vercel gratuito | Frente a ShipFast | Prueba exigida |
| --- | --- | --- | --- | --- | --- |
| 1 | Una suscripción mantiene y revoca una prestación real, recuperándose de fallos y sin depender del navegador | Evita construir y depurar las transiciones delicadas de acceso | El snapshot ya cobra; DNW debe demostrar convergencia/recovery y prestación premium que no quedan demostradas allí | Foco recurrente con política explícita y evidencia entregada; menor amplitud de monetización, no más features | AC04–AC05, prueba navegador cerrado/dup/refund/recovery |
| 2 | Aislamiento Supabase comprobado también contra acceso directo a datos, con ejemplo reemplazable | Evita inventar policies, grants y frontera privilegiada | Añade profundidad DB/RLS al modelo app/Drizzle observado | Profundiza la opción Supabase del benchmark mediante contrato/tipos/migrations y pruebas A/B distribuidas | AC03 y adaptación de Notes AC10 |
| 3 | Recorrido de cuenta y recuperación conectado con estados financieros y UI verificables | Evita ensamblar login/reset/errores/acceso desde snippets | Completa recuperación/verificación y valida comportamiento; no cobra por la sidebar | Promesa más estrecha de recorrido probado; no reclamar catálogo UI más amplio | AC02/AC06/AC07 y journey §10 |
| 4 | El comprador recibe el mismo código, pruebas y diagnóstico local que sustentan la release | Evita construir proceso de validación y empaquetado desde cero | Añade evidencia/paquete reproducible a repo y README gratuitos | Contrato explícito de evidencia distribuida y límites del diagnóstico; no presumir que ShipFast excluye tooling privado | AC01/AC08–AC09 |
| 5 | Modificar el recurso de negocio conserva invariantes mediante un contrato canónico y ejercicio reproducido | Evita descubrir fronteras de auth/billing/DB por ensayo y error | Va más allá del README observado sin introducir framework de agentes | Especialización y prueba de modificación sobre el stack único; sin promesa de superioridad de una marca de agente | AC10 con diff, comandos y resultados |

Ninguna ventaja aislada es monopolio de DNW. El motivo de pago propuesto es recibir esas cinco propiedades **integradas y mantenidas en un paquete**. Quien sabe y quiere integrarlas por su cuenta puede preferir empezar desde cero; quien necesita equipos puede preferir Vercel; quien prioriza amplitud de componentes/modelos puede preferir ShipFast. No hay base para afirmar ahorro de X horas, menos errores porcentuales o mejor conversión hasta medirlos.

## 12. ICP y positioning boundary

**Frase exacta — lo que V1 ES:**

> DaysNotWeeks V1 es una foundation SaaS verificable para productos de cuenta individual con suscripción mensual o anual, construida con Next.js, TypeScript, Supabase, Stripe y Vercel.

**Frase exacta — lo que V1 NO ES:**

> DaysNotWeeks V1 no es una plataforma para SaaS de equipos u organizaciones ni un kit universal de monetización, marketing o funciones de negocio.

“Verificable” es más preciso que un sello genérico production-grade: los claims dependen de gates y de configurar el deployment concreto. ICP: founder/equipo pequeño que desarrolla un servicio de acceso individual por suscripción y prefiere profundidad de integración a variantes. El equipo desarrollador puede tener varias personas; los clientes del producto no comparten una organización dentro de la app.

La frontera excluye anuncios de teams/workspaces/RBAC empresarial/asientos, lifetime/one-time y “todo para lanzar cualquier SaaS”. Un producto individual puede venderse a profesionales o empresas por persona, sin convertirse por ello en SaaS multi-organización. La validación comercial y el precio quedan pendientes de investigación futura, pero **no condicionan una feature indecisa dentro de esta candidata**: cambiar el ICP supondría reabrir explícitamente el producto.

## 13. Maintenance risks y presupuesto de mantenimiento

Evaluación cualitativa de exposición recurrente al cambio, **no predicción de horas ni diagnóstico de vulnerabilidades actuales**. LOW significa seguimiento reducido; MEDIUM implica adaptación/regresión regular; HIGH exige seguimiento y pruebas de comportamiento sensibles en cada actualización relacionada. No sumar etiquetas como puntuación.

| Sistema IN | Next.js | Supabase | Stripe | UI deps | Tests | Documentación | Soporte comprador |
| --- | --- | --- | --- | --- | --- | --- | --- |
| C01 Foundation/config | HIGH | MEDIUM | MEDIUM | LOW | MEDIUM | MEDIUM | MEDIUM |
| C02 Identidad/recuperación | HIGH | HIGH | LOW | MEDIUM | HIGH | MEDIUM | HIGH |
| C03 DB/RLS/ejemplo | MEDIUM | HIGH | MEDIUM | LOW | HIGH | MEDIUM | HIGH |
| C04 Billing/recovery | MEDIUM | MEDIUM | HIGH | LOW | HIGH | HIGH | HIGH |
| C05 UI/oferta/SEO | HIGH | LOW | LOW | HIGH | HIGH | MEDIUM | MEDIUM |
| C07 Entrega/docs/diagnóstico | HIGH | MEDIUM | MEDIUM | LOW | HIGH | HIGH | HIGH |

C06 no desaparece del coste: las columnas Tests y los gates de cada sistema contienen esa obligación. C03 tiene exposición indirecta a Stripe por el significado de acceso; no debe depender del shape de objetos Stripe en sus componentes de negocio. C07 no tiene lectores administrativos pero sí debe mantener instrucciones y ensayos de proveedores.

### Combinaciones que dañaban la mantenibilidad

| Combinación v0.1 | Carga desproporcionada | Reducción aplicada |
| --- | --- | --- |
| Recurrente + one-time + cambio de intervalo + promociones | Semánticas, eventos, docs y reembolsos combinados | Un Pro recurrente, dos intervalos al alta; resto P2 |
| Password + magic link + Google OAuth + varios entornos | Callbacks/cookies/links/proveedores y tickets de configuración | V1.1 acepta esta matriz por el objetivo de mínima fricción; se limita a estos tres caminos bajo Supabase Auth y no añade más OAuth/MFA/SSO |
| RLS + organizations + billing owner | Propiedad/membresía/roles y migraciones atraviesan todo | Cuenta individual explícita; no organizaciones latentes |
| Primitives + galería marketing + dark mode + blog | Matriz visual/accesibilidad y dependencias editoriales | Sólo UI usada, tema único y ejemplo estático |
| Auth SMTP + app email + leads + campañas | DNS, límites, privacidad, mensajes y expectativas de entrega | Sólo Auth necesario y recibos proveedor |
| Doctor remoto + tokens Management/API + variantes comprador | DNW termina soportando paneles/planes/permisos ajenos | Diagnóstico local honesto y pruebas/checklists por entorno |
| Contrato agente duplicado en tres herramientas | Drift de reglas y cambios de mecanismos ajenos | Una verdad canónica; adapters P2 |

**Regla de presupuesto:** una actualización del stack se valida sobre un método de auth, un modelo recurrente, una moneda configurada, dos intervalos, un tema y un dominio de ejemplo. No se añade un eje de variantes sin retirar otro alcance o aprobar una nueva versión. Dos intervalos comparten política pero ambos se prueban; reducir no significa probar sólo el mensual.

Dependencias: C01 permite C02; C02/C03 definen identidad/ownership; C03/C04 acuerdan acceso sin acoplarse a Notes; C05 consume contratos; C07 empaqueta y prueba todos. Seguridad y documentación se mantienen junto al cambio, no al final. La carga restante de C02/C04/C07 sigue HIGH: es el trabajo premium que se elige mantener, no evidencia de que el scope sea barato.

Señales de riesgo operativo: tests que sólo pasan con service-role, prueba Stripe dependiente de una visita, docs que piden activar P2 para completar setup, claves administrativas exigidas por doctor local o tests de un módulo retirado. Cualquiera bloquea cierre hasta eliminar la contradicción. Incidentes de compradores sobre features añadidas fuera del perímetro se separan de defectos del contrato DNW, sin prometer soporte ilimitado de cualquier personalización.

## 14. Scope budget para Engineering

### MUST BUILD

- C01: arranque reproducible, configuración/catálogo y límites tipados del stack.
- C02: Google OAuth + magic link + email/password con verificación/reset, sesión/logout/perfil mínimo y SMTP Auth integrado.
- C03: ownership/RLS, migrations/tipos/local seguro y Notes premium reemplazable.
- C04: suscripción mensual/anual, acceso por periodo, Portal/cancelación, fiabilidad y recuperación del ciclo elegido.
- C05: oferta/pricing/CTA, auth/app/cuenta/billing/ayuda, SEO del perímetro y un ejemplo estático; estados y accesibilidad.
- C07: entrega completa, comandos y diagnóstico local, documentación canónica y herramientas mínimas para repetir pruebas/recuperación.

Los controles AR se construyen dentro de estos sistemas. No se añade subsistema de leads, blog, email de bienvenida, analytics o admin para completar esta lista.

### MUST PROVE

AC01–AC10: instalación/build; Google OAuth, magic link, password y recuperación reales; A/B/anon en DB/Data API; periodo pagado y revocado; Stripe con navegador cerrado y eventos problemáticos; replay/recovery; UI responsive/a11y; SEO/pricing correcto; equivalencia repo/ZIP y secretos; modificación por comprador/contrato canónico. No sustituir evidencia real por la disponibilidad de un paquete npm.

### MUST DOCUMENT

- Recursos y variables por local/staging/live; credenciales sin valores reales; dominio/HTTPS y URLs de callback.
- Google OAuth (proyecto/consentimiento/callbacks por entorno) y SMTP Auth/remitente/DNS/entrega de links para verificación, reset y magic link; recibos/Portal/price IDs/webhook y separación de Stripe test/live. Mantener un único camino recomendado de SMTP del stack previo, sin afirmar soporte de múltiples SDKs de correo.
- Políticas de acceso/cancelación/refund/disputa; limitaciones de intervalo/modelos; recuperación y reconciliación con permisos mínimos.
- Verificación de titularidad, cambio sensible y eliminación por soporte, con orden seguro de billing/datos/identidad y reanudación.
- Migraciones, tipos, seeds, backups/restauración del proveedor y actualización/rollback; advertencia explícita para datos one-time existentes sin migración universal.
- Configuración de hosting/proveedores y sus costes/planes; no declarar que un plan gratuito cubre todos los ritmos o usos.
- Personalización de marca/contenido/legal/privacidad y responsable de soporte; adaptaciones de negocio fuera del contrato, incluidas fiscales.
- Mapa/invariantes/DoD/comandos, cambio de Notes y retirada del ejemplo estático; qué invalida los checks anteriores.

Documentar es suficiente sólo para configurar servicios externos o procedimientos deliberadamente operados por personas; no para reemplazar RLS, reset o provisioning que deben funcionar.

### OPTIONAL / REMOVABLE entregado

- Notes: **EXAMPLE reemplazable**, sin lógica de billing que importe su dominio; conservar una prestación y pruebas equivalentes al sustituirlo.
- Página estática de contenido: **EXAMPLE eliminable**, con receta que mantiene SEO/base.
- Composición de landing y copy: **EXAMPLE reemplazable** por oferta propia, manteniendo navegación y catálogo coherentes.

No hay OPTIONAL_MODULE funcional extra ni PROFILE alternativo empaquetado. El comprador puede añadir proveedores, pero no se publicitan como configuraciones soportadas. Las funcionalidades P2 no se entregan con el argumento “puedes borrarlas”.

### POST-V1

Todo lo enumerado en §4: one-time/lifetime, leads, blog, analytics, app email, teams, monetización avanzada, galería/dark mode, lectores remotos doctor, adapters de agentes, storage/realtime/CMS/chat/remarketing, MFA/SSO, proveedores OAuth adicionales a Google y pruebas extensivas fuera del perímetro. C19/C20 siguen rechazados, no se convierten en P2 implícito.

## 15. Release gates revisados y deuda de evidencia

Estos gates **no han pasado en esta fase**. Auditar/redactar scope no es ejecutar la V1. La evidencia del baseline sigue limitada y no se transfiere al futuro código por tener los mismos nombres de sistemas.

| Gate revisado | PASS mínimo y entorno | Cobertura |
| --- | --- | --- |
| G1 Paquete reproducible | Tag/ZIP del mismo candidato, lock/matriz probada, instalación/typecheck/build, comandos y secretos verificados desde entorno limpio | AC01/AC08 |
| G2 Cuenta y datos | Supabase local para DB/migrations + Supabase alojado staging, buzón real controlado y Google OAuth de test/staging; usuarios A/B/anon; password verify/reset, magic link, Google callback y paid writes reales; procedimiento sensible de soporte ensayado | AC02/AC03 |
| G3 Dinero y recuperación | Stripe test mode + webhook HTTPS + DB real, mensual/anual, ciclo/matriz, navegador cerrado, firma/dup/orden/error y recuperación repetible; Portal propio | AC04/AC05 |
| G4 Producto y publicación | Mismo deploy/SHA: recorrido §10, 360/768/1280, teclado/zoom/lector muestreado, errores, pricing/SEO y página eliminable | AC06/AC07 |
| G5 Operabilidad y modificación | Doctor local honesto + checklist funcional remoto; contactos/runbook, incidente recuperado, actualización/restauración de muestra y ejercicio de adaptación; todos los comandos accesibles al comprador | AC09/AC10 y restauración AC03 |
| G6 Revisión de seguridad y claims | Negativos de AR y evidencia G1–G5 completos; ninguna feature P2 necesaria para pasar; documentación/marketing coincide con perímetro | Negativos §6, AR01–AR12 |

Todos son obligatorios para esta V1; no hay gates P1 ni suites residuales de features retiradas. Fallos o evidencia aplicable UNKNOWN bloquean el cierre. No se exige que doctor consiga permisos administrativos para automatizar un paso que puede demostrarse funcionalmente; sí se exige conservar evidencia manual identificada si el gate la usa. Atestación de “lo configuré” no sustituye un recorrido financiero o de auth que se puede ejecutar.

### Cuatro deudas heredadas, conservadas explícitamente

| Deuda de Fase 2 | Sigue abierta | Cómo se cierra |
| --- | --- | --- |
| Auth/Supabase/Stripe live validation | Sí | G2/G3 contra servicios alojados reales en staging/test mode, incluyendo Google OAuth y magic links. La palabra live no convierte una prueba Stripe test en cobro real; deployment live requiere comprobación propia |
| A/B RLS en DB real | Sí | G2: usuarios A/B/anon contra DB/Data API del esquema desplegado, no sólo service-role ni lectura de SQL |
| Browser responsive | Sí | G4: flujo real en los tres viewports, no sólo lectura de CSS |
| Accessibility | Sí | G4: automated + revisión manual indicada, sin promesa de certificación universal |

La release del starter puede probarse con servicios reales en modo test sin realizar cargos live. La activación de un negocio comprador exige sus propios callbacks/keys/SMTP/webhook/Portal y verificación live autorizada que corresponda. Ningún gate de DNW configura automáticamente esos recursos. Informes conservan SHA, hash de paquete/esquema, fecha, versiones, entorno y resultado redactado. Un cambio de permisos/schema/código relevante invalida la evidencia que dependía de él.

No se ejecutan pagos, despliegues, migraciones ni borrados en esta fase. La deuda de evidencia no es una pregunta abierta de tamaño: los tests y su perímetro ya están decididos.

## 16. Cierre de aprobación y handoff

**0 UNRESOLVED materiales.** Las decisiones D-A–D-E, los contratos PC/AC/AR, las exclusiones y los gates están cerrados y aprobados. No quedan preguntas de producto que permitan variar materialmente el tamaño de V1 sin aplicar la regla de cambio versionada.

La aprobación que estaba pendiente en v0.2 queda resuelta con esta versión. La validación comercial y el precio no añaden funciones al scope. Las decisiones técnicas acotadas permanecen en §8: versiones, primitives, esquema/proyección, procesamiento/reintentos, antiabuso, runners y formato de diagnóstico. Deben satisfacer el contrato aprobado sin ampliarlo. Si Engineering identifica una contradicción o inviabilidad, debe elevarla para decisión explícita de producto; no resolverla cambiando el scope silenciosamente.

- [x] Scope final versionado: V1 Scope 1.1, aprobado el 2026-09-14; único cambio material desde 1.0: Google OAuth + magic-link login pasan a C02 V1.
- [x] Ningún requisito implícito heredado de v0.1.
- [x] 0 UNRESOLVED materiales.
- [x] PC01–PC13, AC01–AC10 y AR01–AR12 completos y preservados exactamente.
- [x] P2/REJECTED explícitos y preservados.
- [x] Gates G1–G6 presentes y preservados; aprobación no significa PASS de ejecución.
- [x] Implementation Candidates no vinculantes, separados como inputs para futuros ADRs.
- [x] Listo para handoff a Control Tower y Engineering.

**APPROVED / IMPLEMENTATION NOT STARTED.** V1 Scope 1.1 es el contrato canónico vigente; no declara ni inicia implementación de código.

## Apéndice A. Cambios de obligaciones que podrían pasar inadvertidos

| Obligación anterior | Resolución explícita |
| --- | --- |
| “Google opcional pero probado” | V1.1 revierte la exclusión de 1.0: Google OAuth es camino CORE soportado de C02 y se prueba en AC02/G2 |
| “Magic link ya existe en baseline” | V1.1 lo incorpora expresamente a C02; no se conserva por inercia del baseline sino por la decisión de mínima fricción y se prueba en AC02/G2 |
| “Pago único ya implementado” | No basta para conservar su coste de soporte; P2 y tratamiento seguro de datos previos documentado |
| “P1 se entrega todo” | Sigue siendo la definición de P1, por eso no dejamos ninguno como wishlist |
| “Doctor release comprueba todo” | Local sólo diagnostica lo observable; evidencias remotas están en gates y checklist, sin lectores administrativos obligatorios |
| “Perfil de Tax, promociones y cambios de intervalo” | No segundo perfil; configuración externa fiscal documentada, extras comerciales P2 |
| “Email provider y app template” | SMTP Auth necesario, app email P2. No se rompe reset para ahorrar un SDK |
| “Backups/PITR incluidos” | Configuración externa y restauración de muestra, sin prometer servicio propio o disponibilidad de plan |
| “Borrado automatizado” | Procedimiento operador seguro y verificable; autoservicio avanzado P2, no pérdida de posibilidad de asistencia |
| “Rate limit Postgres” | Protección efectiva obligatoria en superficies IN; almacenamiento concreto candidato, sin endpoint de leads que proteger |
| “Sistema UI = primitives de librería concreta” | Contrato de edición/a11y/recorrido; elección exacta al ADR |
| “Superior a ShipFast en todo” | Claim retirado; cinco ventajas especializadas condicionadas a evidencia; se acepta menos amplitud |

## Apéndice B. Trazabilidad revisada de los 118 PRODUCT records

Se conservan los 118 IDs de v0.1. La tabla sustituye sus decisiones de paridad sólo para este scope, no sus observaciones del baseline. BETTER sigue siendo **objetivo condicionado** a AC, nunca evidencia actual ni comparación ejecutada contra código privado de ShipFast. DIFFERENT sólo se usa cuando el job sí se conserva; no para encubrir una función retirada. No se cuentan los 33 COMMERCIAL records.

| SF-ID | Job conservado | Decisión v0.2 | Destino | CHECK | Frontera vigente |
| --- | --- | --- | --- | --- | --- |
| SF-001 | Arranque y estructura — Obtener una base ejecutable. | BETTER | C01 | AC01/AC09 | Instalación/tag/ZIP reproducibles; sin provisionador remoto. |
| SF-002 | JavaScript y TypeScript — Elegir lenguaje sin convertir el starter. | DIFFERENT | C01 | AC01/AC09 | Sólo TypeScript strict; no duplicar versión JavaScript. |
| SF-003 | App Router y Pages histórico — Orientarse entre generaciones. | DIFFERENT | C01 | AC01/AC09 | Sólo App Router estable validado; no mantener Pages. |
| SF-004 | Configuración central y secretos — Conectar proveedores y marca. | BETTER | C01 | AC01/AC09 | Config/env y catálogo coherentes, con errores tempranos. |
| SF-005 | Organización modular — Cambiar o retirar integraciones. | MATCH | C01 | AC01/AC09 | Módulos localizables; retirada documentada, sin framework de plugins. |
| SF-006 | Landing en cinco minutos — Publicar una primera oferta. | MATCH | C05 (C08) | AC06/AC07 | Una oferta pública completa; sin promesa de cinco minutos ni biblioteca. |
| SF-007 | Página estática — Publicar contenido adicional. | MATCH | C05 (C09) | AC07 | Ejemplo estático reemplazable y metadata propia; no blog. |
| SF-008 | Tutorial de autenticación — Incorporar usuarios. | BETTER | C02 | AC02 | Google OAuth, magic link y password/verificación/reset integrados bajo Supabase Auth y probados de extremo a extremo. |
| SF-009 | Tutorial de llamada API — Conectar interfaz y operaciones privadas. | BETTER | C03 | AC03 | CRUD real con contrato de errores y autorización por operación. |
| SF-010 | Tutorial de página privada — Reservar páginas a usuarios. | BETTER | C03 | AC03 | Página privada y recurso aislado demostrados con dos identidades. |
| SF-011 | Tutorial de suscripción — Vender acceso recurrente. | BETTER | C04 | AC04/AC05 | Suscripción operativa y casos de fallo reproducibles, no sólo tutorial. |
| SF-012 | Prompts para textos legales — Preparar borradores adaptados al negocio. | DIFFERENT | C05 (C08) | AC06/AC07 | Rutas legales y guía de personalización, no contenido jurídicamente validado. |
| SF-013 | Inicio con Google — Entrar con identidad existente. | MATCH | C02 | AC02 | Google OAuth soportado para alta/entrada bajo Supabase Auth; callback, cancelación y errores se prueban. |
| SF-014 | Login por enlace de email — Entrar sin gestionar contraseña. | MATCH | C02 | AC02 | Magic-link login soportado para alta/entrada, con expiración/reutilización/reenvío y cooldown probados. |
| SF-015 | Persistencia de identidad — Mantener identidad entre sesiones. | MATCH | C02 | AC02 | Sesión Supabase y perfil persistente; no auth paralela. |
| SF-016 | Cierre de sesión y retorno — Salir y volver al destino útil. | BETTER | C02 | AC02 | Logout con fallo explícito y retorno local validado. |
| SF-017 | Protección de páginas — Bloquear acceso anónimo. | BETTER | C03 | AC03 | Servidor y DB protegen; middleware no es autoridad única. |
| SF-018 | Autorización API — Restringir operaciones de datos. | BETTER | C03 | AC03 | Ownership y entitlement comprobados también en llamadas directas. |
| SF-019 | Cliente API compartido — Reducir manejo repetitivo de peticiones. | DIFFERENT | C05 | AC06 | Estados/errores compartidos en acciones; no cliente HTTP universal. |
| SF-020 | MongoDB y modelos — Persistir datos del negocio. | DIFFERENT | C03 | AC03 | El job de persistencia se resuelve en Postgres, no MongoDB. |
| SF-021 | Supabase Postgres y perfiles — Persistir identidad y entitlement. | BETTER | C03 | AC03 | Migrations, tipos, grants y tests de DB entregados. |
| SF-022 | Triggers de perfiles — Sincronizar perfil con autenticación. | BETTER | C03 | AC03 | Perfil consistente y reparación; trigger/backfill concreto al ADR. |
| SF-023 | RLS de perfiles — Aislar filas entre usuarios. | BETTER | C03 | AC03 | Aislamiento probado en DB real con A/B/anon. |
| SF-024 | Campos de entitlement en perfiles — Separar edición personal de concesión de acceso. | BETTER | C03 | AC03 | Datos privados de billing y proyección pública mínima; cliente no escribe grants. |
| SF-025 | Serialización de modelos — Evitar exponer detalles internos. | DIFFERENT | C03 | AC03 | DTO y selección explícita de columnas, sin serializadores Mongoose. |
| SF-026 | Configurar conectividad de DB — Conectar el starter a almacenamiento. | BETTER | C01 | AC01/AC09 | Conexión requerida por integración/pruebas; no lectores Management API en doctor. |
| SF-027 | Captura de leads — Construir lista de espera. | POST-V1 | C11 → P2 | — | Captación propia P2; alternativa externa no se vende como implementación DNW. |
| SF-028 | Inserción pública de leads — Permitir captación sin login. | POST-V1 | C11 → P2 | — | Endpoint público de leads P2; no deuda de antiabuso de un endpoint ausente. |
| SF-029 | Checkout alojado — Cobrar sin construir formulario de tarjeta. | MATCH | C04 | AC04/AC05 | Checkout alojado autenticado, precio decidido en servidor. |
| SF-030 | Pago único — Vender una vez. | POST-V1 | C04 → P2 | — | One-time/lifetime P2, incluso recipe ejecutable; sólo recurrente soportado. |
| SF-031 | Suscripción inicial — Vender acceso recurrente. | BETTER | C04 | AC04/AC05 | Alta recurrente independiente del retorno del navegador. |
| SF-032 | Webhook de pagos — Recibir cambios del proveedor. | BETTER | C04 | AC04/AC05 | Autenticidad/idempotencia/convergencia y recuperación; schema/worker al ADR. |
| SF-033 | Conceder acceso — Entregar el producto comprado. | BETTER | C04 | AC04/AC05 | Entitlement consumido por una acción premium real y por RLS. |
| SF-034 | Renovación — Mantener servicio tras renovar. | BETTER | C04 | AC04/AC05 | Periodos pagados y renovación verificables ante eventos desordenados. |
| SF-035 | Impago — Gestionar cobro fallido. | BETTER | C04 | AC04/AC05 | No nuevo periodo sin pago; recuperación y revocación conforme PC07–PC08. |
| SF-036 | Baja de suscripción — Cerrar entitlement al terminar servicio. | BETTER | C04 | AC04/AC05 | Baja inmediata o al cierre distingue billing y acceso. |
| SF-037 | Portal del cliente — Autogestionar facturación. | MATCH | C04 | AC04/AC05 | Portal Stripe autenticado y vinculado a customer propio. |
| SF-038 | Actualizar tarjeta — Recuperar un cobro o cambiar medio de pago. | MATCH | C04 | AC04/AC05 | Actualización de tarjeta delegada a Portal. |
| SF-039 | Cancelar desde portal — Dejar de renovar sin contactar soporte. | MATCH | C04 | AC04/AC05 | Cancelación en Portal y sincronización probada en app. |
| SF-040 | Catálogo de precios — Publicar una oferta cobrable. | BETTER | C04 | AC04/AC05 | Un Pro, precios mensual/anual al alta; sin cambio activo de intervalo. |
| SF-041 | Pruebas de pago — Validar integración antes de cobrar. | BETTER | C06 transversal | AC01–AC10 | Pruebas del único perfil recurrente en ambos intervalos; no suite one-time. |
| SF-042 | Producción de pagos — Activar cobros reales. | BETTER | C07 | AC08/AC09 | Gates y checklist live del deployment; doctor local no certifica producción. |
| SF-043 | Prevención de fraude — Reducir pagos fraudulentos. | MATCH | C04 | AC04/AC05 | Radar y configuración Stripe; sin motor propio ni garantía antifraude. |
| SF-044 | Recibos y reembolsos por email — Comunicar movimientos de dinero. | DIFFERENT | C02/C07 (C10) | AC02/AC09 | Recibos/avisos financieros del proveedor configurados; no app email propia. |
| SF-045 | Checkout abandonado — Recuperar compra incompleta. | POST-V1 | C18 → P2 | — | Recuperación comercial automatizada diferida; reintento manual de compra sí entra. |
| SF-046 | Créditos o entrega digital — Entregar valor distinto de acceso binario. | POST-V1 | C15 → P2 | — | Créditos, consumo y entrega de archivos quedan fuera del acceso binario. |
| SF-047 | Alternativa Lemon Squeezy — Cobrar mediante otro proveedor. | DIFFERENT | C04 | AC04/AC05 | Job de cobro vía Stripe recurrente; no implementación de otro proveedor. |
| SF-048 | Firma webhook Lemon Squeezy — Rechazar eventos falsificados. | DIFFERENT | C04 | AC04/AC05 | Autenticidad de eventos mediante firma Stripe, no segunda integración. |
| SF-049 | Entitlement Lemon Squeezy — Conceder y retirar acceso. | DIFFERENT | C04 | AC04/AC05 | Concesión y revocación en el único lifecycle Stripe. |
| SF-050 | Email transaccional Resend — Enviar correos de aplicación. | POST-V1 | C10 → P2 | — | Correo transaccional de aplicación P2; SMTP Auth no reemplaza este job. |
| SF-051 | DNS y dominio de email — Mejorar autenticidad y entrega. | MATCH | C02/C07 (C10) | AC02/AC09 | DNS/remitente del SMTP Auth documentados y entrega probada. |
| SF-052 | SMTP para login — Entregar email de autenticación. | MATCH | C02 | AC02 | SMTP Auth configurado y probado con verificación/reset. |
| SF-053 | Alternativa Mailgun — Usar otro proveedor de correo. | POST-V1 | C10 → P2 | — | Correo saliente de aplicación P2, sin alternativa de SDK entregada. |
| SF-054 | Recepción y reenvío de email — Responder desde dirección del dominio. | DIFFERENT | C02/C04/C05/C07 (C12) | AC05/AC10 | Inbox externo y contacto del dominio; no reenvío de correo propio. |
| SF-055 | Firma de correo entrante — Evitar reenvío no autorizado. | REJECTED | C19 | — | No existe endpoint de correo entrante que requiera su propia firma. |
| SF-056 | Consejos de entregabilidad — Preparar correos legítimos y claros. | MATCH | C02/C07 (C10) | AC02/AC09 | Guía de entrega Auth y mensajes legítimos, sin garantía de inbox. |
| SF-057 | Chat de soporte — Atender preguntas en la aplicación. | POST-V1 | C16 → P2 | — | Chat embebido diferido; contacto y diagnóstico sí forman V1. |
| SF-058 | Control contextual del chat — Adaptar chat al contexto del usuario. | POST-V1 | C16 → P2 | — | Contexto de chat diferido con el propio chat. |
| SF-059 | Contacto alternativo — Dar salida a un usuario bloqueado. | MATCH | C02/C04/C05/C07 (C12) | AC05/AC10 | Contacto accesible incluso sin sesión y código de incidencia seguro. |
| SF-060 | Errores y 404 — Recuperarse de rutas inexistentes o fallos. | MATCH | C05 | AC06 | 404/errores/pending de superficies IN y recuperación segura. |
| SF-061 | Feedback de carga y avisos — Entender qué ocurre durante una acción. | BETTER | C05 | AC06 | Estados comunes accesibles y mensajes que no confunden retorno con pago confirmado. |
| SF-062 | Analytics DataFast — Medir tráfico y conversiones. | POST-V1 | C12 → P2 | — | Analytics comercial P2; logs operativos no se presentan como su sustituto. |
| SF-063 | Analytics histórico Plausible — Medir uso en variante histórica. | POST-V1 | C12 → P2 | — | Analytics comercial P2, incluida esta variante histórica. |
| SF-064 | SEO global y por página — Publicar páginas identificables en buscadores. | MATCH | C05 (C09) | AC07 | Metadata global y override por ruta. |
| SF-065 | Social cards y canonical — Controlar previews y URL preferida. | MATCH | C05 (C09) | AC07 | Canonical y social cards personalizables. |
| SF-066 | Datos estructurados — Describir contenido a buscadores. | MATCH | C05 (C09) | AC07 | Datos estructurados mínimos sólo si describen página real; sin ratings/artículos inventados. |
| SF-067 | Sitemap y robots — Facilitar descubrimiento e indexación. | MATCH | C05 (C09) | AC07 | Sitemap y robots que excluyen zonas privadas. |
| SF-068 | Search Console — Observar indexación. | MATCH | C05 (C09) | AC07 | Guía Search Console; cuenta y verificación pertenecen al comprador. |
| SF-069 | Blog y taxonomía — Publicar contenido orgánico organizado. | POST-V1 | C09 → P2 | — | Blog/taxonomía P2; ejemplo estático no es un blog. |
| SF-070 | SEO y rendimiento del blog — Lanzar contenido con base optimizada. | POST-V1 | C09 → P2 | — | SEO/performance editorial de blog P2; SEO de otras rutas sí permanece. |
| SF-071 | Helpers del blog — Reutilizar elementos editoriales. | POST-V1 | C09 → P2 | — | Helpers editoriales P2; sin parser/colección residual. |
| SF-072 | Temas, fuentes y animación — Aplicar una identidad consistente. | DIFFERENT | C05 | AC06 | Un tema editable con tokens y movimiento reducido; dark/selector/skins P2. |
| SF-073 | Despliegue web — Poner la aplicación online. | BETTER | C07 | AC08/AC09 | Deploy Vercel desde entrega completa con pruebas y guía reproducibles. |
| SF-074 | Dominio y callbacks live — Pasar de localhost a producción. | BETTER | C07 | AC08/AC09 | Callback real/checklist y evidencia; sin automatizar lectura de paneles. |
| SF-075 | Identidad y assets — Personalizar la app antes de lanzar. | MATCH | C05 (C08) | AC06/AC07 | Marca, assets, tipografía y contenido con mapa de personalización. |
| SF-076 | Recursos creativos externos — Encontrar gráficos e inspiración. | REJECTED | C20 | — | Directorio de inspiración no es una capacidad mantenida del producto. |
| SF-077 | Copywriting y estructura de venta — Explicar una oferta que pueda convertirse en ventas. | MATCH | C05 (C08) | AC06/AC07 | Estructura y guía de copy propio, sin garantizar conversión. |
| SF-078 | Tope Mailgun — Limitar exposición por envíos. | DIFFERENT | C02/C07 (C10) | AC02/AC09 | Guía de cuotas del camino SMTP elegido; no límites Mailgun ni SDK app. |
| SF-079 | Presupuesto OpenAI — Controlar gasto de una integración de IA. | REJECTED | C20 | — | No se entrega integración OpenAI ni presupuesto para una función inexistente. |
| SF-080 | Rate limit de magic links — Reducir abuso de solicitudes de acceso. | BETTER | C02 | AC02 | Magic link V1 con límites/cooldown del proveedor y UX segura sometidos a pruebas negativas; sin contador en memoria como única defensa. |
| SF-081 | Rate limit de API — Restringir ráfagas de llamadas. | BETTER | C06 transversal | AC01–AC10 | Límites efectivos de superficies IN; mecanismo compartido concreto al ADR. |
| SF-082 | Cabeceras de seguridad — Establecer protecciones HTTP básicas. | BETTER | C06 transversal | AC01–AC10 | Cabeceras aplicadas y verificadas con compatibilidad de auth/pagos. |
| SF-083 | Validación de entrada — Rechazar datos inválidos en servidor. | BETTER | C06 transversal | AC01–AC10 | Schemas de servidor y casos negativos por endpoint con límites de payload. |
| SF-084 | Guías visuales — Comprender integración sin recorrer todo el código. | MATCH | C07 (C13) | AC10 | Mapa de arquitectura y recorridos en docs, sin plataforma de tutoriales. |
| SF-085 | Documentación externa y búsqueda — Encontrar instrucciones durante la construcción. | DIFFERENT | C07 (C13) | AC10 | Índice/docs canónicos distribuidos, no buscador externo mantenido. |
| SF-086 | Eliminación de contenido opcional — Mantener una base ajustada al negocio. | BETTER | C07 (C13) | AC10 | Retirar/reemplazar ejemplo estático y adaptar Notes sin dependencias ajenas. |
| SF-087 | Compatibilidad con asistentes IA — Construir con asistencia de IA. | BETTER | C07 (C13) | AC10 | Contrato canónico y ejercicio de cambio; adapters/matriz multiagente P2. |
| SF-088 | Helpers históricos Pages Router — Resolver auth, metadata y errores en Pages. | REJECTED | C19 | — | No mantener helpers Pages Router; equivalentes App Router ya incluidos. |
| SF-089 | Header — Orientar y permitir navegar. | MATCH | C05 (C08) | AC06/AC07 | Navegación pública responsive con estado de sesión. |
| SF-090 | Hero — Explicar el valor al aterrizar. | MATCH | C05 (C08) | AC06/AC07 | Hero editable con CTA real. |
| SF-091 | Problem — Reconocer el dolor que se resuelve. | POST-V1 | C08 → P2 | — | Bloque Problem separado P2; copy mínimo de oferta sí. |
| SF-092 | WithWithout — Entender el cambio propuesto. | POST-V1 | C08 → P2 | — | Componente WithWithout/comparaciones específicas P2. |
| SF-093 | FeaturesListicle — Explorar varias capacidades. | DIFFERENT | C05 (C08) | AC06/AC07 | Lista de features básica dentro de la oferta; sin familia listicle independiente. |
| SF-094 | FeaturesAccordion — Explorar detalles sin alargar la página. | POST-V1 | C08 → P2 | — | Variante FeaturesAccordion P2; FAQ breve no equivale a esa familia. |
| SF-095 | FeaturesGrid — Comparar varias capacidades visualmente. | MATCH | C05 (C08) | AC06/AC07 | Presentación básica de prestaciones en la landing; sin galería de layouts. |
| SF-096 | CTA — Dar el siguiente paso tras evaluar la oferta. | MATCH | C05 (C08) | AC06/AC07 | CTA conectado con pricing, signup o espera según configuración. |
| SF-097 | Pricing — Elegir una opción de compra. | BETTER | C05 (C08) | AC06/AC07 | Oferta mensual/anual ligada al catálogo que cobra Checkout. |
| SF-098 | Blog — Descubrir y leer contenido. | POST-V1 | C09 → P2 | — | Blog público P2; la página de ejemplo no cubre índice/artículos. |
| SF-099 | FAQ — Resolver objeciones antes de comprar. | MATCH | C05 (C08) | AC06/AC07 | FAQ breve editable, sin obligación de componente acordeón. |
| SF-100 | Testimonial1Small — Ver prueba social junto a una decisión. | POST-V1 | C08 → P2 | — | Prueba social compacta mantenida P2; comprador puede añadir contenido propio. |
| SF-101 | Testimonials1 — Leer una referencia destacada. | POST-V1 | C08 → P2 | — | Testimonio destacado prediseñado P2. |
| SF-102 | Testimonials3 — Contrastar varias referencias. | POST-V1 | C08 → P2 | — | Colección de testimonios P2. |
| SF-103 | Testimonials11 — Explorar evidencia de varios clientes. | POST-V1 | C08 → P2 | — | Rejilla de múltiples testimonios P2. |
| SF-104 | TestimonialsAvatars — Percibir adopción rápidamente. | POST-V1 | C08 → P2 | — | Grupo de avatares de adopción P2. |
| SF-105 | Footer — Encontrar información secundaria. | MATCH | C05 (C08) | AC06/AC07 | Footer con soporte, legal y contenido. |
| SF-106 | ButtonLead — Apuntarse a una lista de espera. | POST-V1 | C11 → P2 | — | CTA conectado a lead backend P2; el CTA V1 conduce a signup. |
| SF-107 | ButtonCheckout — Iniciar compra. | MATCH | C04 | AC04/AC05 | Acción de compra con pending, error y prevención de doble envío. |
| SF-108 | ButtonSignin — Entrar o reconocer la sesión. | MATCH | C02 | AC02 | Entrada que reconoce sesión y conserva destino permitido. |
| SF-109 | ButtonAccount — Administrar cuenta y facturación. | MATCH | C05 | AC06 | Navegación cuenta/billing/logout y ayuda; ajustes sensibles avanzados P2. |
| SF-110 | ButtonGradient — Destacar una acción. | DIFFERENT | C05 | AC06 | Énfasis de acción mediante tokens, no componente gradiente obligatorio. |
| SF-111 | ButtonPopover — Acceder a acciones secundarias. | MATCH | C05 | AC06 | Acciones secundarias accesibles de cuenta donde requiere el recorrido. |
| SF-112 | BetterIcon — Comunicar significado visual. | MATCH | C05 | AC06 | Iconos coherentes; decorativos ocultos y controles etiquetados. |
| SF-113 | Tabs — Alternar contenido relacionado. | POST-V1 | C05 → P2 | — | Tabs como componente entregado independiente P2; no necesario para flujo reducido. |
| SF-114 | TestimonialRating — Leer una valoración resumida. | POST-V1 | C08 → P2 | — | Rating/testimonial P2, sin datos sociales ficticios. |
| SF-115 | Modal — Resolver una tarea contextual. | BETTER | C05 | AC06 | Confirmación contextual accesible del CRUD, comprobada con foco/errores. |
| SF-149 | Compra sin sesión en ejemplo alternativo — Vincular una compra anónima a una identidad. | POST-V1 | C15 → P2 | — | No compra anónima ni reclamación posterior: identidad antes de Checkout. |
| SF-150 | Código de descuento en Checkout alternativo — Aplicar una promoción al comprar. | POST-V1 | C04 → P2 | — | Promociones P2; no cupón activo en configuración soportada. |
| SF-151 | Configurar Google para producción — Permitir login a clientes reales. | MATCH | C02 | AC02/AC09 | Configuración Google por entorno, callback/consentimiento y checklist live documentados; staging se prueba de extremo a extremo. |

**Resumen V1.1 de los 118 PRODUCT records:** 36 MATCH, 34 BETTER, 16 DIFFERENT, 28 POST-V1, 4 REJECTED; 0 UNRESOLVED. Los checks de BETTER remiten sólo al contrato reducido, no al Mxx completo de v0.1.