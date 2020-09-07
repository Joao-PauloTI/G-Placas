import { exportFile, Notify } from "quasar";
const fs = require('fs')
const lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("src/database/gplacas.json");

const db = lowdb(adapter);

if (!db.has("Placa").value() && !db.has("Estacionamento").value()) {
  db.defaults({
    Placa: [],
    Estacionamento: [],
    Estacionamento_Placa: [],
    Motorista: []
  }).write();
}

export function exportarDatabase() {
  let dados = db.getState();
  let json = JSON.stringify(dados, null, 2);

  exportFile("gplacas.json", json, "text/json");
}

export function importarDatabase(arquivo) {
  if (arquivo.type === "application/json" && arquivo.name === "gplacas.json") {
    console.log(arquivo)
  } else {
    Notify.create({
      html: true,
      message: `O arquivo de registros invalido!`,
      color: "negative",
      position: "bottom",
      icon: "storage"
    });
  }
}
