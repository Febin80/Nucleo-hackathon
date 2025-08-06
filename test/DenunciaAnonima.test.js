const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DenunciaAnonima", function () {
  let denunciaAnonima;
  let owner;
  let denunciante;
  // Datos de prueba para proof y publicSignals
  const proof = ethers.randomBytes(32);
  const publicSignals = [1, 2, 3];

  beforeEach(async function () {
    [owner, denunciante] = await ethers.getSigners();
    const DenunciaAnonima = await ethers.getContractFactory("DenunciaAnonima");
    denunciaAnonima = await DenunciaAnonima.deploy();
  });

  describe("Creación de Denuncia", function () {
    it("Debería crear una denuncia pública correctamente", async function () {
      const tipoAcoso = "laboral";
      const ipfsHash = "QmTest123";
      const esPublica = true;

      await denunciaAnonima.connect(denunciante).crearDenuncia(tipoAcoso, ipfsHash, proof, publicSignals, esPublica);

      const denuncia = await denunciaAnonima.obtenerDenuncia(0);
      expect(denuncia.tipoAcoso).to.equal(tipoAcoso);
      expect(denuncia.ipfsHash).to.equal(ipfsHash);
      expect(denuncia.denunciante).to.equal(denunciante.address);
      expect(denuncia.proof).to.equal(ethers.hexlify(proof));
      expect(denuncia.publicSignals.map(n => Number(n))).to.deep.equal(publicSignals);
      expect(denuncia.esPublica).to.equal(true);
    });

    it("Debería crear una denuncia privada correctamente", async function () {
      const tipoAcoso = "sexual";
      const ipfsHash = "QmTest456";
      const esPublica = false;

      await denunciaAnonima.connect(denunciante).crearDenuncia(tipoAcoso, ipfsHash, proof, publicSignals, esPublica);

      const denuncia = await denunciaAnonima.obtenerDenuncia(0);
      expect(denuncia.tipoAcoso).to.equal(tipoAcoso);
      expect(denuncia.ipfsHash).to.equal(ipfsHash);
      expect(denuncia.denunciante).to.equal(denunciante.address);
      expect(denuncia.esPublica).to.equal(false);
    });
  });

  describe("Verificación de Denuncia", function () {
    it("Solo el owner puede verificar denuncias (no implementado en contrato actual)", async function () {
      // Esta función ya no existe en el contrato, así que solo comprobamos que no está
      expect(denunciaAnonima.verificarDenuncia).to.be.undefined;
    });
  });

  describe("Actualización de Estado", function () {
    it("Solo el owner puede actualizar el estado (no implementado en contrato actual)", async function () {
      // Esta función ya no existe en el contrato, así que solo comprobamos que no está
      expect(denunciaAnonima.actualizarEstado).to.be.undefined;
    });
  });

  describe("Control de Privacidad", function () {
    it("Debería ocultar descripción de denuncias privadas a usuarios no autorizados", async function () {
      const tipoAcoso = "sexual";
      const ipfsHash = "QmPrivateDescription123";
      const esPublica = false;

      // Crear denuncia privada
      await denunciaAnonima.connect(denunciante).crearDenuncia(tipoAcoso, ipfsHash, proof, publicSignals, esPublica);

      // Obtener otro usuario para probar acceso
      const [, , otroUsuario] = await ethers.getSigners();

      // El otro usuario no debería ver la descripción
      const denunciaVistaPorOtro = await denunciaAnonima.connect(otroUsuario).obtenerDenuncia(0);
      expect(denunciaVistaPorOtro.ipfsHash).to.equal(""); // Descripción oculta
      expect(denunciaVistaPorOtro.tipoAcoso).to.equal(tipoAcoso); // Tipo sí es visible
      expect(denunciaVistaPorOtro.esPublica).to.equal(false);
    });

    it("El denunciante debería ver su propia denuncia privada completa", async function () {
      const tipoAcoso = "sexual";
      const ipfsHash = "QmPrivateDescription123";
      const esPublica = false;

      await denunciaAnonima.connect(denunciante).crearDenuncia(tipoAcoso, ipfsHash, proof, publicSignals, esPublica);

      // El denunciante sí debería ver toda la información
      const denunciaVistaPorDenunciante = await denunciaAnonima.connect(denunciante).obtenerDenuncia(0);
      expect(denunciaVistaPorDenunciante.ipfsHash).to.equal(ipfsHash); // Descripción visible
      expect(denunciaVistaPorDenunciante.tipoAcoso).to.equal(tipoAcoso);
      expect(denunciaVistaPorDenunciante.esPublica).to.equal(false);
    });

    it("El owner debería ver todas las denuncias completas", async function () {
      const tipoAcoso = "sexual";
      const ipfsHash = "QmPrivateDescription123";
      const esPublica = false;

      await denunciaAnonima.connect(denunciante).crearDenuncia(tipoAcoso, ipfsHash, proof, publicSignals, esPublica);

      // El owner sí debería ver toda la información
      const denunciaVistaPorOwner = await denunciaAnonima.connect(owner).obtenerDenuncia(0);
      expect(denunciaVistaPorOwner.ipfsHash).to.equal(ipfsHash); // Descripción visible
      expect(denunciaVistaPorOwner.tipoAcoso).to.equal(tipoAcoso);
      expect(denunciaVistaPorOwner.esPublica).to.equal(false);
    });
  });

  describe("Consulta de Denuncias", function () {
    it("Debería obtener solo denuncias públicas en la lista general", async function () {
      // Crear una denuncia pública y una privada
      await denunciaAnonima.connect(denunciante).crearDenuncia("laboral", "QmPublic123", proof, publicSignals, true);
      await denunciaAnonima.connect(denunciante).crearDenuncia("sexual", "QmPrivate456", proof, publicSignals, false);

      const denunciasPublicas = await denunciaAnonima.obtenerDenunciasPublicas();
      expect(denunciasPublicas.length).to.equal(1);
      expect(Number(denunciasPublicas[0])).to.equal(0); // Solo la primera (pública)
    });

    it("El denunciante debería ver todas sus denuncias", async function () {
      // Crear una denuncia pública y una privada
      await denunciaAnonima.connect(denunciante).crearDenuncia("laboral", "QmPublic123", proof, publicSignals, true);
      await denunciaAnonima.connect(denunciante).crearDenuncia("sexual", "QmPrivate456", proof, publicSignals, false);

      const misDenuncias = await denunciaAnonima.connect(denunciante).obtenerMisDenuncias();
      expect(misDenuncias.length).to.equal(2);
      expect(misDenuncias.map(d => Number(d))).to.deep.equal([0, 1]);
    });

    it("El owner debería ver todas las denuncias", async function () {
      // Crear una denuncia pública y una privada
      await denunciaAnonima.connect(denunciante).crearDenuncia("laboral", "QmPublic123", proof, publicSignals, true);
      await denunciaAnonima.connect(denunciante).crearDenuncia("sexual", "QmPrivate456", proof, publicSignals, false);

      const todasLasDenuncias = await denunciaAnonima.connect(owner).obtenerTodasLasDenuncias();
      expect(todasLasDenuncias.length).to.equal(2);
      expect(todasLasDenuncias.map(d => Number(d))).to.deep.equal([0, 1]);
    });

    it("Debería obtener las denuncias por denunciante", async function () {
      const tipoAcoso = "laboral";
      const ipfsHash = "QmTest123";

      await denunciaAnonima.connect(denunciante).crearDenuncia(tipoAcoso, ipfsHash, proof, publicSignals, true);
      await denunciaAnonima.connect(denunciante).crearDenuncia(tipoAcoso, ipfsHash, proof, publicSignals, false);

      const denuncias = await denunciaAnonima.obtenerDenunciasPorDenunciante(denunciante.address);
      expect(denuncias.length).to.equal(2);
      expect(denuncias.map(d => Number(d))).to.deep.equal([0, 1]);
    });

    it("Debería obtener el total de denuncias", async function () {
      const tipoAcoso = "laboral";
      const ipfsHash = "QmTest123";

      await denunciaAnonima.connect(denunciante).crearDenuncia(tipoAcoso, ipfsHash, proof, publicSignals, true);
      await denunciaAnonima.connect(denunciante).crearDenuncia(tipoAcoso, ipfsHash, proof, publicSignals, false);

      const total = await denunciaAnonima.totalDenuncias();
      expect(total).to.equal(2);
    });

    it("Debería obtener el total de denuncias públicas", async function () {
      // Crear 2 públicas y 1 privada
      await denunciaAnonima.connect(denunciante).crearDenuncia("laboral", "QmTest1", proof, publicSignals, true);
      await denunciaAnonima.connect(denunciante).crearDenuncia("laboral", "QmTest2", proof, publicSignals, true);
      await denunciaAnonima.connect(denunciante).crearDenuncia("sexual", "QmTest3", proof, publicSignals, false);

      const totalPublicas = await denunciaAnonima.totalDenunciasPublicas();
      expect(totalPublicas).to.equal(2);
    });
  });
}); 