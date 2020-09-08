import { Notify } from "quasar";
import { Date } from "core-js";

const lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("src/database/gplacas.json");

const db = lowdb(adapter);
const loginController = require("src/controllers/LoginController");

if (!db.has("Placa").value() && !db.has("Estacionamento").value()) {
  db.defaults({
    Placa: [],
    Estacionamento: [],
    Motorista: []
  }).write();
}

export function buscarEstacionamentos(login = null) {
  db.read();
  let estacionamentoLogado = loginController.buscarEstacionamentoLogado();
  if (login) {
    let dados = [];
    dados.push(
      db
        .get("Estacionamento")
        .find({ login: login })
        .value()
    );
    return dados;
  } else {
    let query = db.get("Estacionamento").value();
    let dados = _.orderBy(query, "id", "desc");
    return dados;
  }
}

export function criarEstacionamento(estacionamento) {
  db.read();
  let estacionamentoLogado = loginController.buscarEstacionamentoLogado();
  let loginExistente = db
    .get("Estacionamento")
    .find({ login: estacionamento.login })
    .value();

  if (loginExistente) {
    Notify.create({
      html: true,
      message: `O login ${estacionamento.login} já existe na base de dados!`,
      color: "negative",
      position: "bottom",
      icon: "keyboard"
    });
  } else {
    let date = new Date();
    let dia = date.getDate();
    let mes = date.getMonth() < 10 ? `0${date.getMonth()}` : date.getMonth();
    let ano = date.getFullYear();
    let dataCadastro = `${dia}/${mes}/${ano}`;

    let estacionamentos = buscarEstacionamentos();
    let novoId = null;
    if (estacionamentos.length === 0) {
      novoId = 1;
    } else {
      novoId =
        Math.max.apply(
          Math,
          estacionamentos.map(function(estacionamento) {
            return estacionamento.id;
          })
        ) + 1;
    }

    estacionamento["id"] = novoId;
    estacionamento["data_cadastro"] = dataCadastro;
    estacionamento["status"] = "off";

    db.get("Estacionamento")
      .push(estacionamento)
      .write();

    Notify.create({
      html: true,
      message: `O estacionamento ${estacionamento.nome} foi criado com sucesso!`,
      color: "green-9",
      position: "bottom",
      icon: "save"
    });

    return estacionamento;
  }
}
