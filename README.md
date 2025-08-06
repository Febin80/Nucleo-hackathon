# DenunciaChain - Sistema de Denuncias Anónimas con Zero-Knowledge Proofs

## Descripción
DenunciaChain es una plataforma descentralizada que permite realizar denuncias anónimas de manera segura utilizando tecnología blockchain y zero-knowledge proofs. El sistema garantiza la privacidad de los denunciantes mientras mantiene la integridad y verificabilidad de las denuncias.

## Características Principales
- 🔒 Denuncias completamente anónimas
- 🔐 Verificación mediante zero-knowledge proofs
- 📱 Interfaz de usuario moderna y responsive
- 🌐 Integración con IPFS para almacenamiento descentralizado
- ⛓️ Smart contracts en Ethereum para la gestión de denuncias

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

## Contacto
Tu Nombre - [@tu_twitter](https://twitter.com/tu_twitter)

Link del Proyecto: [https://github.com/tu-usuario/nucleo](https://github.com/tu-usuario/nucleo)
