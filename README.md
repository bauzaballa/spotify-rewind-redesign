<div align="center">

# REWIND

**Tu historial de Spotify, al desnudo.**

Visualiza anos de escuchas sin logins, sin servidores, sin que tus datos salgan del navegador.

[**Ver demo en vivo →**](https://spotify-rewind-pearl.vercel.app)

---

</div>

## Como funciona

Spotify guarda un historial extendido de todo lo que escuchaste. Rewind lo lee directamente en tu navegador y lo convierte en un dashboard completo. Cero backend. Cero subida de datos.

### 1. Descarga tu historial de Spotify

1. Abre [**Spotify** → Configuracion → Privacidad y datos](https://www.spotify.com/account/privacy/)
2. Buscá la seccion **"Descarga tus datos"**
3. Selecciona **"Historial extendido de reproduccion"** (no el basico - ese solo tiene 1 ano)
4. Hace click en **Solicitar datos**
5. Spotify te manda un email con un `.zip` en los proximos dias (puede tardar hasta 30 dias)

> **Alternativa inmediata:** en la pantalla de inicio hay un boton **"Ver demo con datos reales"** para explorar el dashboard sin necesidad de tu propio archivo.

### 2. Subir el archivo

Arrastra el `.zip` que te mando Spotify directo a la pantalla de inicio, o hace click para seleccionarlo. El app tambien acepta los archivos `.json` individuales si los querés subir por separado.

### 3. Explorar

El dashboard se arma instantaneamente en el navegador. No se sube nada a ningun servidor.

---

## Que vas a encontrar

| Seccion | Que muestra |
|---|---|
| **Overview** | Horas totales, tracks y artistas unicos, ratio de skips, mejor track y artista de todos los tiempos |
| **Top Tracks** | Ranking por plays o tiempo escuchado, con porcentaje de skip por cancion |
| **Top Artists** | Ranking con desglose de tracks y tiempo, detalle por artista con sus 5 canciones mas escuchadas |
| **Top Albums** | Ranking por plays o tiempo, con cantidad de tracks escuchados por album |
| **Podcasts** | Programas seguidos, episodios y tiempo total por show |
| **Plataformas** | Desde que dispositivos escuchaste mas: Android, iOS, Mac, Windows, Web Player |
| **Analisis temporal** | Hora pico, dia preferido, tendencia mensual (ultimos 24 meses), heatmap diario filtrable por ano |
| **Habitos** | Shuffle, skip rate, reproduccion offline, completion rate, y ranking de artistas mas skipeados |

Ademas, la **busqueda global** (`Ctrl+K`) te permite buscar cualquier cancion, artista o album y ver sus estadisticas detalladas con timeline y heatmap de actividad propios.

---

## Privacidad

Tu archivo de Spotify **nunca sale del navegador**. No hay servidor, no hay base de datos, no hay analytics, no se hace ninguna solicitud de red despues de cargar la pagina. Todo el procesamiento es local.

---

## Stack

- **React 19 + Vite** - framework y build
- **Recharts** - graficos
- **Framer Motion** - animaciones y transiciones
- **JSZip** - lectura del `.zip` en el navegador
- **CSS Modules** - estilos con variables personalizadas por componente

---

## Correr localmente

```bash
git clone https://github.com/bauzaballa/spotify-rewind-redesign.git
cd spotify-rewind-redesign
npm install
npm run dev
```

---

<div align="center">

Hecho por [Bautista Zaballa](https://github.com/bauzaballa)

</div>
