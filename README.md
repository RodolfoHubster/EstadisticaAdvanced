# Sistema de Apoyo Digital para Estadística Avanzada

Aplicación web de apoyo académico para la unidad de aprendizaje **Estadística Avanzada** (PUA plan 2021-2, Ingeniería en Software y Tecnologías Emergentes) de la Universidad Autónoma de Baja California. Integra glosario, formulario, calculadoras de inferencia y tablas estadísticas para las cuatro unidades del temario.

Todo el cálculo estadístico se ejecuta en el navegador. Firestore se utiliza únicamente para el glosario y el historial anónimo de cálculos, y la aplicación funciona sin él mediante un catálogo local.

## Tecnologías

| Área | Herramienta |
| --- | --- |
| Interfaz | React 19, TypeScript, Vite 8 |
| Estilos | Tailwind CSS 3 (PostCSS y Autoprefixer) |
| Enrutamiento | React Router DOM (HashRouter, compatible con alojamiento estático) |
| Motor matemático | TypeScript nativo; math.js para álgebra lineal (Unidad III) |
| Datos | Firebase Firestore (SDK modular) |
| Pruebas | Vitest |

## Requisitos

- Node.js 22.18 o superior (necesario para `npm run tablas`, que ejecuta TypeScript de forma nativa).

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm install` | Instala las dependencias. |
| `npm run dev` | Servidor de desarrollo en `http://localhost:5173`. |
| `npm test` | Ejecuta la validación del motor matemático y de las calculadoras. |
| `npm run build` | Verificación de tipos y compilación de producción en `dist/`. |
| `npm run preview` | Sirve la compilación de producción localmente. |
| `npm run lint` | Análisis estático con oxlint. |
| `npm run tablas` | Regenera `src/utils/math/tablasCriticas.json` a partir del motor. |

## Estructura

```
src/
  components/
    Cards/          Tarjeta base, tarjetas de unidad e historial
    Header/         Encabezado verde UABC con línea dorada y navegación superior
    Iconos/         Conjunto de íconos lineales
    Inputs/         Campos numéricos, selectores, áreas de datos y filtros
    Layout/         Layout principal, encabezado de página y límite de errores
    MathResults/    Panel de resultados, notación matemática y gráficas SVG
  data/             Temario oficial, glosario local y formulario
  hooks/            Historial de la sesión y filtro por unidad
  pages/
    Dashboard/      Panel académico y selector de unidades
    Glosario/       Glosario con buscador
    Formulario/     Formulario de referencia
    Calculadoras/   Catálogo, CalculadoraView y definiciones por unidad
    Tablas/         Tablas estadísticas y consulta de valores críticos
  services/         firebaseConfig.ts y firestoreService.ts
  utils/math/       Motor matemático
scripts/            Generador de tablas críticas
```

## Motor matemático

| Archivo | Contenido |
| --- | --- |
| `distribuciones.ts` | Densidad, distribución acumulada y cuantiles de las distribuciones normal, t, ji-cuadrada, F y del rango estudentizado. Sin dependencias. |
| `unidad1_inferencia.ts` | Intervalos de confianza y pruebas de hipótesis de los temas 1.3 a 1.9. |
| `unidad2_regresion.ts` | Mínimos cuadrados, correlación de Pearson, inferencia sobre la pendiente, predicción y normalidad del error. |
| `unidad3_multivariable.ts` | Regresión múltiple en notación matricial, β̂ = (XᵀX)⁻¹Xᵀy, con math.js. |
| `unidad4_anova.ts` | Tablas de contingencia, bondad de ajuste, normalidad, Kruskal-Wallis, ANOVA de uno y dos factores, bloques y comparaciones múltiples. |
| `tablasCriticas.json` | Base de datos local de valores críticos z, t, χ², F y q de Tukey. |
| `consultaTablas.ts` | Consulta tipada de la tabla con cálculo de respaldo para combinaciones no tabuladas. |

La validación automatizada (`npm test`) compara el motor con valores publicados en Walpole et al. (2012) y Montgomery (2017), y verifica que cada ejemplo precargado de las calculadoras produzca un resultado completo.

Técnicas planificadas para una fase posterior: prueba de Shapiro-Wilk (4.2.5) y comparaciones de Dunnett (4.3.5). Ambas están declaradas en el motor y la interfaz las identifica como pendientes.

## Configuración de Firebase

1. Cree un proyecto en la consola de Firebase y habilite Cloud Firestore.
2. Registre una aplicación web y copie el objeto de configuración.
3. Sustituya los valores de `firebaseConfig` en `src/services/firebaseConfig.ts`. Mientras conserven el prefijo `TU_`, la aplicación usa el catálogo local.
4. Publique las reglas de `firestore.rules` y el índice de `firestore.indexes.json`.
5. Para poblar la colección `glosario`, importe los términos de `src/data/glosario.ts` desde la consola, o habilite temporalmente la escritura y ejecute `publicarGlosarioLocal()` de `firestoreService.ts`.

Colecciones:

- `glosario`: `termino`, `definicion`, `unidad` (1 a 4), `seccion` y `simbolo` opcional.
- `historial`: `sesion` (identificador anónimo), `calculadora`, `unidad`, `resumen`, `creado`. No contiene datos personales.

## Despliegue en GitHub Pages

El flujo `.github/workflows/deploy.yml` ejecuta las pruebas, compila y publica `dist/` en cada envío a la rama `main`. En el repositorio, seleccione **Settings > Pages > Source: GitHub Actions**. La configuración `base: './'` y el uso de HashRouter permiten publicar el sitio en cualquier subruta sin cambios adicionales.

## Referencias

- Walpole, R. E., Myers, R. H., Myers, S. L. y Ye, K. E. (2012). *Probabilidad y Estadística para Ingeniería y Ciencias*. Pearson.
- Montgomery, D. C. (2017). *Design and Analysis of Experiments* (9th ed.). Wiley.
- Press, W. H., Teukolsky, S. A., Vetterling, W. T. y Flannery, B. P. (2007). *Numerical Recipes* (3rd ed.). Cambridge University Press.
