// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DenunciaAnonima is Ownable {
    struct Denuncia {
        address denunciante;
        string tipoAcoso;
        string ipfsHash;
        uint256 timestamp;
        bytes proof;
        uint256[] publicSignals;
        bool esPublica; // true = descripción visible públicamente, false = solo para el denunciante y owner
    }

    // Mapping de denuncias por ID
    mapping(uint256 => Denuncia) public denuncias;
    
    // Mapping de denuncias por denunciante
    mapping(address => uint256[]) public denunciasPorDenunciante;

    // Contador de denuncias
    uint256 private _denunciaIds;

    // Evento emitido cuando se crea una nueva denuncia
    event DenunciaCreada(
        address indexed denunciante,
        string tipoAcoso,
        string ipfsHash,
        bytes proof,
        uint256[] publicSignals
    );

    constructor() Ownable(msg.sender) {}

    // Función para crear una nueva denuncia con prueba ZK
    function crearDenuncia(
        string memory _tipoAcoso,
        string memory _ipfsHash,
        bytes memory _proof,
        uint256[] memory _publicSignals,
        bool _esPublica
    ) public {
        // Crear la nueva denuncia
        uint256 denunciaId = _denunciaIds;
        denuncias[denunciaId] = Denuncia({
            denunciante: msg.sender,
            tipoAcoso: _tipoAcoso,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            proof: _proof,
            publicSignals: _publicSignals,
            esPublica: _esPublica
        });

        // Agregar la denuncia al mapping del denunciante
        denunciasPorDenunciante[msg.sender].push(denunciaId);

        // Incrementar el contador
        _denunciaIds++;

        // Emitir el evento
        emit DenunciaCreada(
            msg.sender,
            _tipoAcoso,
            _ipfsHash,
            _proof,
            _publicSignals
        );
    }

    // Función para obtener todas las denuncias de un denunciante
    function obtenerDenunciasPorDenunciante(
        address _denunciante
    ) public view returns (uint256[] memory) {
        return denunciasPorDenunciante[_denunciante];
    }

    // Función para obtener los detalles de una denuncia (con control de privacidad)
    function obtenerDenuncia(
        uint256 _denunciaId
    ) public view returns (Denuncia memory) {
        require(_denunciaId < _denunciaIds, "Denuncia no existe");
        
        Denuncia memory denuncia = denuncias[_denunciaId];
        
        // Si la denuncia es privada, solo el denunciante y el owner pueden ver la descripción completa
        if (!denuncia.esPublica && msg.sender != denuncia.denunciante && msg.sender != owner()) {
            // Devolver denuncia con información limitada
            return Denuncia({
                denunciante: denuncia.denunciante,
                tipoAcoso: denuncia.tipoAcoso,
                ipfsHash: "", // Ocultar descripción IPFS
                timestamp: denuncia.timestamp,
                proof: denuncia.proof,
                publicSignals: denuncia.publicSignals,
                esPublica: denuncia.esPublica
            });
        }
        
        return denuncia;
    }

    // Función para obtener solo denuncias públicas (para mostrar en lista general)
    function obtenerDenunciasPublicas() public view returns (uint256[] memory) {
        uint256[] memory denunciasPublicas = new uint256[](_denunciaIds);
        uint256 contador = 0;
        
        for (uint256 i = 0; i < _denunciaIds; i++) {
            if (denuncias[i].esPublica) {
                denunciasPublicas[contador] = i;
                contador++;
            }
        }
        
        // Crear array del tamaño correcto
        uint256[] memory resultado = new uint256[](contador);
        for (uint256 i = 0; i < contador; i++) {
            resultado[i] = denunciasPublicas[i];
        }
        
        return resultado;
    }

    // Función para que el denunciante vea todas sus denuncias (públicas y privadas)
    function obtenerMisDenuncias() public view returns (uint256[] memory) {
        return denunciasPorDenunciante[msg.sender];
    }

    // Función para que el owner vea todas las denuncias
    function obtenerTodasLasDenuncias() public view onlyOwner returns (uint256[] memory) {
        uint256[] memory todasLasDenuncias = new uint256[](_denunciaIds);
        for (uint256 i = 0; i < _denunciaIds; i++) {
            todasLasDenuncias[i] = i;
        }
        return todasLasDenuncias;
    }

    // Función para obtener el total de denuncias
    function totalDenuncias() public view returns (uint256) {
        return _denunciaIds;
    }

    // Función para obtener el total de denuncias públicas
    function totalDenunciasPublicas() public view returns (uint256) {
        uint256 contador = 0;
        for (uint256 i = 0; i < _denunciaIds; i++) {
            if (denuncias[i].esPublica) {
                contador++;
            }
        }
        return contador;
    }

    // Función para actualizar el hash IPFS de una denuncia (solo el denunciante puede hacerlo)
    function actualizarHashIPFS(uint256 _denunciaId, string memory _nuevoHashIPFS) public {
        require(_denunciaId < _denunciaIds, "Denuncia no existe");
        require(msg.sender == denuncias[_denunciaId].denunciante, "Solo el denunciante puede actualizar el hash");
        require(bytes(_nuevoHashIPFS).length > 0, "Hash IPFS no puede estar vacio");
        
        // Verificar que el hash actual sea temporal (contiene "Temporal")
        require(
            keccak256(abi.encodePacked(substring(denuncias[_denunciaId].ipfsHash, 0, 9))) == 
            keccak256(abi.encodePacked("QmTemporal")), 
            "Solo se pueden actualizar hashes temporales"
        );
        
        denuncias[_denunciaId].ipfsHash = _nuevoHashIPFS;
        
        // Emitir evento de actualización
        emit HashIPFSActualizado(_denunciaId, _nuevoHashIPFS);
    }

    // Evento para actualización de hash IPFS
    event HashIPFSActualizado(uint256 indexed denunciaId, string nuevoHashIPFS);

    // Función auxiliar para obtener substring
    function substring(string memory str, uint startIndex, uint endIndex) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        require(startIndex < endIndex && endIndex <= strBytes.length, "Invalid substring indices");
        
        bytes memory result = new bytes(endIndex - startIndex);
        for (uint i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }
} 