# Plataforma de Denuncia Anónima

Una solución tecnológica diseñada para facilitar y proteger el proceso de reportar casos de acoso laboral, escolar, ciberacoso u otras formas de violencia, garantizando el anonimato del denunciante y la validez legal de las pruebas.

## Características Principales

- Interfaz intuitiva y fácil de usar
- Denuncias completamente anónimas
- Almacenamiento seguro de pruebas usando blockchain
- Validación de datos y formularios
- Soporte para múltiples tipos de archivos como pruebas
- Sistema de seguimiento de denuncias

## Tecnologías Utilizadas
- Frontend: React + TypeScript + Vite
- Smart Contracts: Solidity + Hardhat
- Zero-Knowledge Proofs: Circom
- Almacenamiento: IPFS
- Blockchain: Ethereum

## Requisitos Previos
- Node.js (v16 o superior)
- npm o yarn
- MetaMask u otra wallet compatible con Ethereum
- Git

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/nucleo.git
cd nucleo
```

2. Instala las dependencias del proyecto principal:
```bash
npm install
```

3. Instala las dependencias del frontend:
```bash
cd frontend
npm install
```

4. Configura las variables de entorno:
   - Crea un archivo `.env` en la raíz del proyecto
   - Crea un archivo `.env` en el directorio `frontend`
   - Consulta la sección de configuración para más detalles

## Configuración

### Variables de Entorno
En la raíz del proyecto (`/.env`):
```
PRIVATE_KEY=tu_clave_privada
INFURA_API_KEY=tu_api_key_de_infura
```

En el frontend (`/frontend/.env`):
```
VITE_CONTRACT_ADDRESS=dirección_del_contrato
VITE_INFURA_API_KEY=tu_api_key_de_infura
```

## Uso

1. Despliega los smart contracts:
```bash
npx hardhat run scripts/deploy.ts --network <red>
```

2. Inicia el frontend en modo desarrollo:
```bash
cd frontend
npm run dev
```

3. Abre tu navegador en `http://localhost:5173`

## Estructura del Proyecto
```
nucleo/
├── contracts/           # Smart contracts
├── frontend/           # Aplicación React
├── scripts/            # Scripts de despliegue
├── test/              # Tests
└── src/               # Código fuente principal
```

## Contribuir
1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia
Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

