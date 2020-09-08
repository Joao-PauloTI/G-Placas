import { exportFile, Notify, Dialog } from "quasar";

const fs = require("fs");
const lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("src/database/gplacas.json");

const db = lowdb(adapter);
const loginController = require("src/controllers/LoginController");
const placaController = require("src/controllers/PlacaController");

if (!db.has("Placa").value() && !db.has("Estacionamento").value()) {
  db.defaults({
    Placa: [],
    Estacionamento: [],
    Motorista: []
  }).write();
}

export function exportarTabelaExcel(colunas, dados) {
  function wrapCsvValue(val, formatFn) {
    let formatted = formatFn !== void 0 ? formatFn(val) : val;

    formatted = formatted === void 0 || formatted === null ? "" : String(formatted);

    formatted = formatted.split('"').join('""');
    /**
     * Excel accepts \n and \r in strings, but some other CSV parsers do not
     * Uncomment the next two lines to escape new lines
     */
    // .split('\n').join('\\n')
    // .split('\r').join('\\r')

    return `"${formatted}"`;
  }

  const content = [colunas.map(col => wrapCsvValue(col.label))].concat(dados.map(row => colunas.map(col => wrapCsvValue(typeof col.field === "function" ? col.field(row) : row[col.field === void 0 ? col.name : col.field], col.format)).join(","))).join("\r\n");

  const status = exportFile("G-Placas_Tabela_Veiculos.csv", content, "text/csv");

  if (status !== true) {
    Notify.create({
      message: "Não foi possível exportar a tabela para CSV.",
      color: "negative",
      icon: "warning",
      position: "top-right"
    });
  }
}

export function exportarPlacas() {
  db.read();
  let estacionamentoLogado = loginController.buscarEstacionamentoLogado();
  let dados = db
    .get("Placa")
    .filter({ id_estacionamento: estacionamentoLogado.id })
    .value();
  let json = JSON.stringify(dados, null, 2);

  exportFile("gplacas.json", json, "text/json");
}

export function importarPlacas(arquivo) {
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
          let veiculoExistente = placaController.buscarPlacas(veiculo.placa);
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
                placaController.salvarPlaca(veiculo, true);
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

export function validarPlaca(numeroPlaca) {
  if (numeroPlaca.length === 7) {
    if (/^[a-zA-Z]+$/.test(numeroPlaca.slice(0, 3)) && /^-?\d+$/.test(numeroPlaca.slice(3, 7))) {
      return true;
    } else if (/^[a-zA-Z]+$/.test(numeroPlaca.slice(0, 2)) && /^-?\d+$/.test(numeroPlaca[3]) && /^[a-zA-Z]+$/.test(numeroPlaca[4]) && /^-?\d+$/.test(numeroPlaca.slice(5, 7))) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}