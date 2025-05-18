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

- Next.js 14
- TypeScript
- Chakra UI
- Prisma
- PostgreSQL
- Blockchain (Ethereum)
- Zod para validación
- React Hook Form

## Requisitos Previos

- Node.js 18 o superior
- PostgreSQL
- Cuenta en Infura o similar para conexión a Ethereum

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/plataforma-denuncia-anonima.git
cd plataforma-denuncia-anonima
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
```

4. Configura la base de datos:
```bash
npx prisma migrate dev
```

5. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/denuncias"
NEXT_PUBLIC_INFURA_ID="tu-id-de-infura"
NEXT_PUBLIC_ETHEREUM_NETWORK="goerli"
```

## Estructura del Proyecto

```
src/
  ├── app/              # Páginas y layouts de Next.js
  ├── components/       # Componentes reutilizables
  ├── lib/             # Utilidades y configuraciones
  ├── types/           # Definiciones de TypeScript
  └── styles/          # Estilos globales
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

Tu Nombre - [@tutwitter](https://twitter.com/tutwitter)

Link del Proyecto: [https://github.com/tu-usuario/plataforma-denuncia-anonima](https://github.com/tu-usuario/plataforma-denuncia-anonima) 