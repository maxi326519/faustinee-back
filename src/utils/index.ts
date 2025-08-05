// Función para limpiar datos eliminando valores vacíos o nulos
const cleanObject = (obj: Record<string, any>) => {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, value]) => {
        return value !== null && value !== undefined && !(typeof value === "string" && value.trim() === "");
      })
    );
  };

export {cleanObject}