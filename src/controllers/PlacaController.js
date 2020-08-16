const lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("src/database/gplacas.json");

const db = lowdb(adapter);
const api = require("sinesp-api");

if (!db.has("Placa").value()) {
  db.defaults({
    Placa: [],
    Estacionamento: [],
    Estacionamento_Placa: [],
    Motorista: [],
    Usuario: []
  }).write();
}

export function procurarPlaca(numeroPlaca) {
  let placa = null;
  api
    .search(numeroPlaca)
    .then(res => {
      salvarPlaca(res);
    })
    .catch(error => {
      console.log(error);
    });
}

export function salvarPlaca(placa) {
  db.get("Placa")
    .push(placa)
    .write();
}

export function buscarPlacas() {
  let dados = db.get("Placa").value();
  return dados;
}
