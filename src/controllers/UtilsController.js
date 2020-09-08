import { exportFile, Notify, Dialog } from "quasar";
const placaController = require("src/controllers/PlacaController");
const fs = require("fs");
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

export function exportarPlacas(idEstacionamento) {
  let dados = db
    .get("Placa")
    .filter({ id_estacionamento: idEstacionamento })
    .value();
  let json = JSON.stringify(dados, null, 2);

  exportFile("gplacas.json", json, "text/json");
}

export function importarPlacas(arquivo, idEstacionamento) {
  if (arquivo.type === "application/json" && arquivo.name === "gplacas.json") {
    fs.readFile(arquivo.path, (erro, dadosBinarios) => {
      if (erro) {
        Notify.create({
          html: true,
          message: `Ocorreu um erro interno ao tentar importar os registros deste arquivo!`,
          color: "negative",
          position: "bottom",
          icon: "storage"
        });
      } else {
        db.read();
        let dados = JSON.parse(dadosBinarios.toString());

        let veiculosNovos = [];
        dados.forEach(veiculo => {
          let veiculoExistente = placaController.buscarPlacas(
            veiculo.placa,
            idEstacionamento
          );
          if (!veiculoExistente[0]) {
            veiculosNovos.push(veiculo);
          }
        });

        if (veiculosNovos.length > 0) {
          let tbody = veiculosNovos
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
            title: `Importação de registros de veículos`,
            message: `
              Deseja importar os seguintes veículos para este estacionamento?
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
              let qtdVeiculos = 0;
              veiculosNovos.forEach(veiculo => {
                placaController.salvarPlaca(veiculo, idEstacionamento, true);
                qtdVeiculos = qtdVeiculos + 1;
              });

              Notify.create({
                html: true,
                message: `Importação finalizada! <strong>${qtdVeiculos} veículos novos</strong> foram registrados neste estacionamento. Clique no ícone "Recarregar Tabela" para atualizar a tabela.`,
                color: "green-9",
                position: "center",
                icon: "save"
              });
            })
            .onCancel(() => {
              return false;
            });
        } else {
          Notify.create({
            html: true,
            message: `Todos os veículos desta base de dados já estão registrados neste estacionamento!`,
            color: "negative",
            position: "bottom",
            icon: "storage"
          });
        }
      }
    });
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
