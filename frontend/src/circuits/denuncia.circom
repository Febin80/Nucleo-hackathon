pragma circom 2.0.0;

include "circomlib/comparators.circom";
include "circomlib/poseidon.circom";

template Denuncia() {
    // Inputs privados
    signal private denunciante;
    signal private tipoAcoso;

    // Inputs públicos
    signal ipfsHash;
    signal timestamp;

    // Outputs
    signal output isValid;

    // Componentes
    component poseidon = Poseidon(2);
    component timestampCheck = LessThan(32);

    // Verificar que el timestamp sea válido (no en el futuro)
    timestampCheck.in[0] <== timestamp;
    timestampCheck.in[1] <== 1735689600; // 1 de enero de 2025

    // Calcular el hash de la denuncia
    poseidon.inputs[0] <== denunciante;
    poseidon.inputs[1] <== tipoAcoso;

    // Verificar que el hash IPFS coincida con el hash de la denuncia
    poseidon.out === ipfsHash;

    // La denuncia es válida si el timestamp es válido
    isValid <== timestampCheck.out;
}

component main = Denuncia(); 