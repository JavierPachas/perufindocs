# PeruFinDocs

> Agente de inteligencia documental open-source para regulación financiera peruana, publicaciones del banco central y memorias de empresas listadas en bolsa — con citas verificables y evaluación multi-modelo.

🚧 **En desarrollo activo.** Lanzamiento v1 estimado en ~10 semanas. [Leer el PRD →](./PRD.md)

🇬🇧 **[English →](./README.md)**

---

## Qué hace

PeruFinDocs responde preguntas regulatorias y analíticas sobre finanzas peruanas con citas listas para auditoría:

> **P:** *¿Qué obligaciones de reporte aplica SBS a una EEDE que procesa remesas por montos menores a USD 10,000?*
>
> **R:** Las EEDE están sujetas a las obligaciones de reporte establecidas en [SBS Res. N° 6285-2013, art. 14, p. 7] y, para operaciones transfronterizas, en [SBS Circular G-184-2015, num. 3.2, p. 4]…

Tres corpus:
- **SBS** — circulares, resoluciones, reglamentos
- **BCRP** — reportes de inflación, notas de estudios, reporte de estabilidad financiera
- **BVL** — memorias anuales y hechos de importancia de las 20 principales empresas listadas

## Para quién es

- **Equipos de compliance de fintechs** que enfrentan complejidad regulatoria con equipos pequeños
- **Analistas de riesgo y compliance bancarios** comparando versiones de regulaciones
- **Analistas de equity research** haciendo benchmark de empresas listadas en BVL
- **Periodistas financieros** que necesitan fuentes primarias citadas con rapidez

## Qué lo diferencia

- **Citas hasta artículo/párrafo**, con resaltado al pasar el cursor sobre el PDF fuente
- **Rechaza responder antes que alucinar** — con verificador de citas explícito
- **Leaderboard multi-modelo** — Claude, GPT y modelos open-source evaluados sobre el mismo conjunto
- **Evals auditables** — 200+ preguntas-respuesta de referencia (factuales, multi-paso y adversariales)
- **Construido en español** — diseñado para el español legal peruano, no traducido del inglés

## Aviso legal

PeruFinDocs es una herramienta de apoyo a la decisión, **no asesoría legal**. Las citas se proveen para verificación, pero el usuario es responsable de confirmar la autoridad y aplicabilidad de cada fuente. Los mantenedores no son abogados licenciados en Perú ni en ninguna jurisdicción.

## Licencia

MIT — ver [LICENSE](./LICENSE).

## Autor

Construido por [Javier Pachas](https://linkedin.com/in/javierpachas) — Senior AI/Data Scientist, Lima.
