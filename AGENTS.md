# Instrucciones para Claude Code

## Modo de trabajo
Trabajás de forma autónoma. Cuando recibís una tarea:
1. Leés CLAUDE.md completo
2. Revisás los archivos existentes relevantes antes de crear nada
3. Ejecutás los cambios necesarios
4. Corres `npm run build` para verificar que no hay errores de compilación
5. Reportás brevemente qué hiciste y si hay algo que el usuario deba revisar visualmente

## Nunca preguntes si podés
- Elegir entre opciones de implementación → tomá la que mejor respeta CLAUDE.md
- Crear archivos nuevos que estén en la estructura de CLAUDE.md → creálos
- Instalar dependencias que ya están en package.json → usálas directamente

## Sí preguntá si
- Hay un error de build que no podés resolver solo
- Una funcionalidad no está especificada y hay múltiples interpretaciones con impacto visual importante

## Al terminar cada tarea
Ejecutá siempre: `npm run build`
Si hay errores → intentá resolverlos antes de reportar.
Si los resolvés → mencionalo en el reporte final.
Reportá en formato:
✅ Completado: [lista breve de lo que hiciste]
👀 Revisar visualmente: [qué debería ver el usuario]
⚠️ Pendiente: [si hay algo que depende de otra fase]