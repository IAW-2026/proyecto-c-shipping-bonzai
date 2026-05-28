export function getPoeticMessage(status: string): string {
  const messages: Record<string, string> = {
    'RECIBIDO_EN_ORIGEN': 'El espécimen ha comenzado su viaje desde el invernadero de origen',
    'EN_TRANSITO': 'El espécimen navega por los caminos verdes hacia su nuevo hogar',
    'ENTREGADO': 'El espécimen ha llegado a destino, completando su ciclo botánico',
  }

  return messages[status] || 'El espécimen registra un nuevo capítulo en su diario de tránsito'
}
