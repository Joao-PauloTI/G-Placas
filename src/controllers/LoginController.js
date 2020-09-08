import { Notify } from "quasar";

const lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("src/database/gplacas.json");

const db = lowdb(adapter);

if (!db.has("Placa").value() && !db.has("Estacionamento").value()) {
  db.defaults({
    Placa: [],
    Estacionamento: [],
    Motorista: []
  }).write();
}

export function logar(dados) {
  db.read();
  let loginExistente = db
    .get("Estacionamento")
    .find({ login: dados.login })
    .value();

  if (loginExistente) {
    let senhaCorreta = db
      .get("Estacionamento")
      .find({ login: dados.login, senha: dados.senha })
      .value();
    if (senhaCorreta) {
      db.get("Estacionamento")
        .find({ login: dados.login, senha: dados.senha })
        .assign({ status: "on" })
        .write();
      return loginExistente;
    } else {
      Notify.create({
        html: true,
        message: `Senha Incorreta!`,
        color: "negative",
        position: "bottom",
        icon: "lock"
      });
    }
  } else {
    Notify.create({
      html: true,
      message: `O login ${dados.login} não está cadastrado no sistema!`,
      color: "negative",
      position: "bottom",
      icon: "keyboard"
    });
  }
}

export function deslogar(dados) {
  db.read();
  db.get("Estacionamento")
    .find({ login: dados.login, senha: dados.senha })
    .assign({ status: "off" })
    .write();

  return true;
}
