import { Dialog, Notify, exportFile, Loading } from "quasar";
import { Date } from "core-js";

const lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("src/database/gplacas.json");

const db = lowdb(adapter);
const api = require("sinesp-api");
const loginController = require("src/controllers/LoginController");

var tentativasProcura = 0;

if (!db.has("Placa").value() && !db.has("Estacionamento").value()) {
  db.defaults({
    Placa: [],
    Estacionamento: [],
    Motorista: [],
    Usuario: []
  }).write();
}

export function procurarPlaca(numeroPlaca) {
  db.read();
  let estacionamentoLogado = loginController.buscarEstacionamentoLogado();
  if (!Loading.isActive) {
    Loading.show({
      spinnerColor: "amber",
      message: `Pesquisando pela placa ${numeroPlaca} ...`
    });
  }
  let veiculoExistente = buscarPlacas(numeroPlaca);
  if (veiculoExistente[0]) {
    Loading.hide();
    Dialog.create({
      dark: true,
      ok: {
        label: "Fechar",
        color: "indigo-10",
        push: true
      },
      title: "Veículo já registrado!",
      message: `O veículo ${veiculoExistente[0].modelo} de placa ${veiculoExistente[0].placa} já está registrado neste estacionamento.`
    });
  } else {
    api
      .search(numeroPlaca)
      .then(veiculo => {
        Loading.hide();
        Dialog.create({
          cancel: true,
          persistent: true,
          html: true,
          fullWidth: true,
          ok: {
            label: "Sim",
            color: "green-9",
            push: true
          },
          cancel: {
            label: "Não",
            color: "negative",
            push: true
          },
          dark: true,
          title: `Veículo encontrado!`,
          message: `
            Um veículo com a placa ${numeroPlaca} foi encontrado na base de dados da SINESP. Deseja registrá-lo no sistema?
            <hr/>
            <table style='width: 100%; text-align: left'>
              <theader>
                <tr>
                  <th>Placa</th>
                  <th>Modelo</th>
                  <th>Cor</th>
                  <th>Ano</th>
                  <th>Estado</th>
                  <th>Município</th>
                  <th>Situação</th>
                </tr>
              </theader>
              <tbody>
                <tr>
                  <td>${numeroPlaca}</td>
                  <td>${veiculo.modelo}</td>
                  <td>${veiculo.cor}</td>
                  <td>${veiculo.ano}</td>
                  <td>${veiculo.uf}</td>
                  <td>${veiculo.municipio}</td>
                  <td>${veiculo.situacao}</td>
                </tr>
              </tbody>
            </table>`
        })
          .onOk(() => {
            return salvarPlaca(veiculo);
          })
          .onCancel(() => {
            return false;
          });
      })
      .catch(error => {
        if (tentativasProcura === 20) {
          tentativasProcura = 0;
          Loading.hide();
          Dialog.create({
            html: true,
            dark: true,
            ok: {
              label: "Fechar",
              color: "indigo-10",
              push: true
            },
            title: `Veículo não encontrado!`,
            message: `<p>Nenhum veículo com a placa ${numeroPlaca} foi encontrado na base de dados da SINESP.<br/><br/>
                    As vezes isto pode ser apenas uma instabilidade no serviço da SINESP. Se você tem certeza que está procurando por uma placa existente, tente novamente.
                    </p>`
          });
          return false;
        } else if (error.message === "Error: getaddrinfo EAI_AGAIN apicarros.com") {
          tentativasProcura = 0;
          Loading.hide();
          Dialog.create({
            html: true,
            dark: true,
            ok: {
              label: "Fechar",
              color: "indigo-10",
              push: true
            },
            title: `Sem conexão!`,
            message: `<p>Não foi possível estabelecer conexão com a base de dados da SINESP.</p>`
          });
          return false;
        } else {
          tentativasProcura = tentativasProcura + 1;
          procurarPlaca(numeroPlaca);
        }
      });
  }
}

export function buscarPlacas(numeroPlaca = null) {
  db.read();
  let estacionamentoLogado = loginController.buscarEstacionamentoLogado();
  if (numeroPlaca) {
    let dados = [];
    dados.push(
      db
        .get("Placa")
        .find({
          placa: numeroPlaca,
          id_estacionamento: estacionamentoLogado.id
        })
        .value()
    );
    return dados;
  } else {
    let query = db
      .get("Placa")
      .filter({ id_estacionamento: estacionamentoLogado.id })
      .value();
    let dados = _.orderBy(query, "id", "desc");
    return dados;
  }
}

export function salvarPlaca(placa, importar = null) {
  db.read();
  let estacionamentoLogado = loginController.buscarEstacionamentoLogado();
  let date = new Date();
  let dia = date.getDate();
  let mes = date.getMonth() < 10 ? `0${date.getMonth()}` : date.getMonth();
  let ano = date.getFullYear();
  let dataCadastro = `${dia}/${mes}/${ano}`;

  let placas = buscarPlacas();
  let novoId = null;
  if (placas.length === 0) {
    novoId = 1;
  } else {
    novoId =
      Math.max.apply(
        Math,
        placas.map(function(placa) {
          return placa.id;
        })
      ) + 1;
  }

  placa["id"] = novoId;
  placa["id_estacionamento"] = estacionamentoLogado.id;
  placa["data_cadastro"] = dataCadastro;

  db.get("Placa")
    .push(placa)
    .write();

  if (!importar) {
    Notify.create({
      html: true,
      message:
        placa.modelo !== "N/A"
          ? `O veículo <strong>${placa.modelo}</strong> foi registrado neste estacionamento. Clique no ícone "Recarregar Tabela" para atualizar a tabela.`
          : `A placa <strong>${placa.placa}</strong> foi registrada neste estacionamento. Clique no ícone "Recarregar Tabela" para atualizar a tabela e complemente as informações do veículo.`,
      color: "green-9",
      position: "center",
      icon: "save"
    });
  }

  return placa;
}

export function criarPlacaManual(numeroPlaca) {
  db.read();
  let estacionamentoLogado = loginController.buscarEstacionamentoLogado();
  let novaPlaca = {
    ano: "N/A",
    anoModelo: "",
    chassi: "",
    codigoRetorno: "",
    codigoSituacao: "",
    cor: "N/A",
    data: "",
    dataAtualizacaoAlarme: "",
    dataAtualizacaoCaracteristicasVeiculo: "",
    dataAtualizacaoRouboFurto: "",
    marca: "",
    mensagemRetorno: "",
    modelo: "N/A",
    municipio: "N/A",
    placa: `${numeroPlaca}`,
    situacao: "N/A",
    uf: "N/A"
  };

  salvarPlaca(novaPlaca);
}

export function editarCampoPlaca(valor, coluna, veiculo) {
  db.read();
  let estacionamentoLogado = loginController.buscarEstacionamentoLogado();
  db.get("Placa")
    .find({ placa: veiculo.placa, id_estacionamento: estacionamentoLogado.id })
    .assign({ [coluna]: valor })
    .write();

  Notify.create({
    html: true,
    message: `Campo editado com sucesso.`,
    color: "indigo-10",
    position: "bottom",
    icon: "edit"
  });
}

export function excluirPlacas(placas) {
  db.read();
  let estacionamentoLogado = loginController.buscarEstacionamentoLogado();
  let tbody = placas
    .map(veiculo => {
      return `<tr>
        <td>${veiculo.placa}</td>
        <td>${veiculo.modelo}</td>
        <td>${veiculo.cor}</td>
        <td>${veiculo.ano}</td>
        <td>${veiculo.uf}</td>
        <td>${veiculo.municipio}</td>
        <td>${veiculo.situacao}</td>
      </tr>`;
    })
    .join("");

  Dialog.create({
    cancel: true,
    persistent: true,
    html: true,
    fullWidth: true,
    dark: true,
    ok: {
      label: "Sim",
      color: "green-9",
      push: true
    },
    cancel: {
      label: "Não",
      color: "negative",
      push: true
    },
    title: "Exclusão de veículos",
    message: `
      Deseja realmente excluir o(s) seguinte(s) veículo(s)?
      <hr/>
      <table style='width: 100%; text-align: left'>
        <theader>
          <tr>
            <th>Placa</th>
            <th>Modelo</th>
            <th>Cor</th>
            <th>Ano</th>
            <th>Estado</th>
            <th>Município</th>
            <th>Situação</th>
          </tr>
        </theader>
        <tbody>
          ${tbody}
        </tbody>
      </table>`
  })
    .onOk(() => {
      placas.forEach(veiculo => {
        db.get("Placa")
          .remove({
            placa: veiculo.placa,
            id_estacionamento: estacionamentoLogado.id
          })
          .write();
      });

      Notify.create({
        message: `Veículo(s) excluido(s) do sistema com sucesso. Clique no ícone "Recarregar Tabela" para atualizar a tabela.`,
        color: "negative",
        position: "center",
        icon: "delete"
      });

      return true;
    })
    .onCancel(() => {
      return false;
    });
}
