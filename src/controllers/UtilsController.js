import { exportFile } from "quasar";
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

export function downloadDatabase() {
  let dados = db.getState();
  let json = JSON.stringify(dados, null, 2);

  exportFile("gplacas.json", json, "text/json");
}
