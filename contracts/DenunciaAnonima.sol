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
        uint256[] memory _publicSignals
    ) public {
        // Crear la nueva denuncia
        uint256 denunciaId = _denunciaIds;
        denuncias[denunciaId] = Denuncia({
            denunciante: msg.sender,
            tipoAcoso: _tipoAcoso,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            proof: _proof,
            publicSignals: _publicSignals
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

    // Función para obtener los detalles de una denuncia
    function obtenerDenuncia(
        uint256 _denunciaId
    ) public view returns (Denuncia memory) {
        require(_denunciaId < _denunciaIds, "Denuncia no existe");
        return denuncias[_denunciaId];
    }

    // Función para obtener el total de denuncias
    function totalDenuncias() public view returns (uint256) {
        return _denunciaIds;
    }
} 