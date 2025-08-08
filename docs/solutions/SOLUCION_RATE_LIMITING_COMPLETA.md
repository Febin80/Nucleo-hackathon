# Solución Completa para Rate Limiting - IPFS y RPC

## Problema Identificado
El sistema estaba experimentando errores 429 (Too Many Requests) tanto en:
1. **Gateways IPFS** - Bloqueando la obtención de contenido de denuncias
2. **RPC Endpoints de Mantle Sepolia** - Impidiendo la lectura de datos del blockchain

## Soluciones Implementadas

### 1. Sistema de Fallback IPFS Mejorado

#### Nuevos Gateways IPFS (10 total)
```javascript
const IPFS_GATEWAYS = [
  'https://dweb.link/ipfs/',                    // Gateway más confiable para CORS
  'https://cloudflare-ipfs.com/ipfs/',          // Cloudflare es muy confiable
  'https://4everland.io/ipfs/',                 // Gateway alternativo confiable
  'https://nftstorage.link/ipfs/',              // NFT.Storage gateway
  'https://w3s.link/ipfs/',                     // Web3.Storage gateway
  'https://ipfs.filebase.io/ipfs/',             // Filebase gateway
  'https://crustipfs.xyz/ipfs/',                // Crust Network gateway
  'https://ipfs.io/ipfs/',                      // Gateway oficial
  'https://gateway.ipfs.io/ipfs/',              // Gateway oficial alternativo
  'https://gateway.pinata.cloud/ipfs/',         // Pinata (puede tener rate limits)
];
```

#### Características del Sistema IPFS:
- **Rate Limiting Inteligente**: Tracking por gateway con ventanas de tiempo
- **Estrategia Paralela**: Primeros 3 gateways en paralelo para velocidad
- **Estrategia Secuencial**: Fallback secuencial con timeouts progresivos
- **Circuit Breaker**: Previene sobrecarga del sistema después de múltiples fallos
- **Cache Inteligente**: 5 minutos de cache con limpieza automática
- **Estrategias Alternativas**: Subdominios IPFS y APIs directas como último recurso
- **Manejo CORS Mejorado**: Múltiples estrategias para superar bloqueos CORS

### 2. Sistema de Fallback RPC Robusto

#### RPCs Optimizados para Mantle Sepolia (ordenados por velocidad)
```javascript
const MANTLE_SEPOLIA_RPCS = [
  'https://mantle-sepolia.drpc.org',                           // Más rápido: 204ms
  'https://mantle-sepolia.gateway.tenderly.co',                // 408ms
  'https://rpc.sepolia.mantle.xyz',                           // RPC oficial: 739ms
  'https://endpoints.omniatech.io/v1/mantle/sepolia/public',   // 761ms
  'https://mantle-sepolia-testnet.rpc.thirdweb.com',          // 820ms
  // RPCs de backup (pueden estar menos estables)
  'https://sepolia.mantlenetwork.io',
  'https://mantle-sepolia.publicnode.com',
];
```

#### Características del Sistema RPC:
- **Rate Limiting por Endpoint**: Tracking individual de cada RPC
- **Provider Híbrido**: MetaMask para transacciones, RPCs públicos para lectura
- **Fallback Automático**: Cambio transparente cuando MetaMask falla
- **Penalización Inteligente**: RPCs con rate limit son penalizados temporalmente
- **Reset Automático**: Limpieza de contadores después de ventanas de tiempo
- **Status Monitoring**: Indicador de estado para usuarios

### 3. Mejoras en Manejo de Errores

#### Circuit Breaker Pattern
```javascript
const circuitBreaker = {
  failures: 0,
  lastFailureTime: 0,
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN',
  failureThreshold: 5,
  recoveryTimeout: 30000, // 30 segundos
};
```

#### Estrategias de Retry
- **Backoff Exponencial**: Esperas progresivamente más largas
- **Retry Inteligente**: Diferentes estrategias según el tipo de error
- **Timeout Progresivo**: Más tiempo para gateways posteriores

### 4. Monitoreo y Diagnóstico

#### Logging Detallado
- Estado de cada gateway/RPC
- Tiempos de respuesta
- Tipos de errores
- Estadísticas de rate limiting

#### Status del Sistema
```javascript
networkStatus: {
  usingFallback: boolean;
  activeRpc?: string;
  message?: string;
}
```

## Resultados de Testing

### Test de RPCs Mantle Sepolia
```
✅ Completamente funcionales: 5/8 RPCs
🚀 RPCs más rápidos:
1. mantle-sepolia.drpc.org - 204ms
2. mantle-sepolia.gateway.tenderly.co - 408ms
3. rpc.sepolia.mantle.xyz - 739ms
```

### Beneficios Obtenidos
1. **Resistencia a Rate Limiting**: Sistema puede manejar múltiples fallos simultáneos
2. **Mejor Performance**: Gateways más rápidos priorizados
3. **Experiencia de Usuario**: Fallbacks transparentes sin interrupciones
4. **Monitoreo**: Visibilidad completa del estado del sistema
5. **Escalabilidad**: Fácil agregar nuevos gateways/RPCs

## Configuración de Producción

### Variables de Entorno Recomendadas
```env
# Rate Limiting
IPFS_RATE_LIMIT_WINDOW=60000
IPFS_MAX_REQUESTS_PER_WINDOW=10
RPC_RATE_LIMIT_WINDOW=60000
RPC_MAX_REQUESTS_PER_WINDOW=20

# Circuit Breaker
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_RECOVERY_TIMEOUT=30000

# Cache
IPFS_CACHE_DURATION=300000  # 5 minutos
```

### Monitoreo Recomendado
1. **Alertas**: Rate limiting excesivo en gateways principales
2. **Métricas**: Tiempos de respuesta por gateway/RPC
3. **Logs**: Fallos de circuit breaker
4. **Dashboard**: Estado en tiempo real de todos los endpoints

## Próximos Pasos

### Mejoras Futuras
1. **Load Balancing**: Distribución inteligente de carga
2. **Health Checks**: Verificación periódica de endpoints
3. **Métricas Avanzadas**: Análisis de patrones de uso
4. **Auto-scaling**: Ajuste dinámico de rate limits

### Mantenimiento
1. **Revisión Mensual**: Estado de gateways y RPCs
2. **Actualización de Endpoints**: Agregar nuevos, remover obsoletos
3. **Optimización**: Ajustar timeouts y rate limits según uso real
4. **Testing**: Verificación regular de todos los fallbacks

## Conclusión

El sistema ahora es altamente resistente a rate limiting con múltiples capas de fallback tanto para IPFS como para RPCs de Mantle Sepolia. Los usuarios experimentarán un servicio más confiable y rápido, incluso durante picos de tráfico o problemas con servicios individuales.