const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DenunciaAnonima", function () {
  let denunciaAnonima;
  let owner;
  let denunciante;

  beforeEach(async function () {
    [owner, denunciante] = await ethers.getSigners();
    const DenunciaAnonima = await ethers.getContractFactory("DenunciaAnonima");
    denunciaAnonima = await DenunciaAnonima.deploy();
  });

  describe("Creación de Denuncia", function () {
    it("Debería crear una denuncia correctamente", async function () {
      const tipoAcoso = "laboral";
      const ipfsHash = "QmTest123";

      await expect(denunciaAnonima.connect(denunciante).crearDenuncia(tipoAcoso, ipfsHash))
        .to.emit(denunciaAnonima, "DenunciaCreada")
        .withArgs(1, denunciante.address, ipfsHash);

      const denuncia = await denunciaAnonima.obtenerDenuncia(1);
      expect(denuncia.tipoAcoso).to.equal(tipoAcoso);
      expect(denuncia.ipfsHash).to.equal(ipfsHash);
      expect(denuncia.denunciante).to.equal(denunciante.address);
      expect(denuncia.verificada).to.equal(false);
      expect(denuncia.estado).to.equal("pendiente");
    });
  });

  describe("Verificación de Denuncia", function () {
    it("Solo el owner puede verificar denuncias", async function () {
      const tipoAcoso = "laboral";
      const ipfsHash = "QmTest123";

      await denunciaAnonima.connect(denunciante).crearDenuncia(tipoAcoso, ipfsHash);

      await expect(denunciaAnonima.connect(denunciante).verificarDenuncia(1))
        .to.be.revertedWithCustomError(denunciaAnonima, "OwnableUnauthorizedAccount");

      await expect(denunciaAnonima.connect(owner).verificarDenuncia(1))
        .to.emit(denunciaAnonima, "DenunciaVerificada")
        .withArgs(1);

      const denuncia = await denunciaAnonima.obtenerDenuncia(1);
      expect(denuncia.verificada).to.equal(true);
    });
  });

  describe("Actualización de Estado", function () {
    it("Solo el owner puede actualizar el estado", async function () {
      const tipoAcoso = "laboral";
      const ipfsHash = "QmTest123";
      const nuevoEstado = "en investigacion";

      await denunciaAnonima.connect(denunciante).crearDenuncia(tipoAcoso, ipfsHash);

      await expect(denunciaAnonima.connect(denunciante).actualizarEstado(1, nuevoEstado))
        .to.be.revertedWithCustomError(denunciaAnonima, "OwnableUnauthorizedAccount");

      await expect(denunciaAnonima.connect(owner).actualizarEstado(1, nuevoEstado))
        .to.emit(denunciaAnonima, "EstadoActualizado")
        .withArgs(1, nuevoEstado);

      const denuncia = await denunciaAnonima.obtenerDenuncia(1);
      expect(denuncia.estado).to.equal(nuevoEstado);
    });
  });

  describe("Consulta de Denuncias", function () {
    it("Debería obtener las denuncias por denunciante", async function () {
      const tipoAcoso = "laboral";
      const ipfsHash = "QmTest123";

      await denunciaAnonima.connect(denunciante).crearDenuncia(tipoAcoso, ipfsHash);
      await denunciaAnonima.connect(denunciante).crearDenuncia(tipoAcoso, ipfsHash);

      const denuncias = await denunciaAnonima.obtenerDenunciasPorDenunciante(denunciante.address);
      expect(denuncias.length).to.equal(2);
      expect(denuncias[0]).to.equal(1);
      expect(denuncias[1]).to.equal(2);
    });

    it("Debería obtener el total de denuncias", async function () {
      const tipoAcoso = "laboral";
      const ipfsHash = "QmTest123";

      await denunciaAnonima.connect(denunciante).crearDenuncia(tipoAcoso, ipfsHash);
      await denunciaAnonima.connect(denunciante).crearDenuncia(tipoAcoso, ipfsHash);

      const total = await denunciaAnonima.obtenerTotalDenuncias();
      expect(total).to.equal(2);
    });
  });
}); 