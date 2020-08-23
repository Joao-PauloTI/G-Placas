import { LoadingBar, Dialog, Notify, exportFile, QMarkupTable } from "quasar";
import { Date } from "core-js";

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
  LoadingBar.start();
  api
    .search(numeroPlaca)
    .then(veiculo => {
      let veiculoExistente = buscarPlacas(veiculo.placa);
      if (veiculoExistente[0]) {
        LoadingBar.stop();
        Dialog.create({
          dark: true,
          title: "Veículo já registrado!",
          message: `O veículo ${veiculoExistente[0].modelo} de placa ${veiculoExistente[0].placa} já está registrado no sistema.`
        });
      } else {
        LoadingBar.stop();
        Dialog.create({
          cancel: true,
          persistent: true,
          html: true,
          fullWidth: true,
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
            salvarPlaca(veiculo);
          })
          .onCancel(() => {
            return false;
          });
      }
    })
    .catch(error => {
      if (
        error.message ===
          `Nenhum veículo foi encontrado para a placa ${numeroPlaca}` ||
        error.message === "Sem erros." ||
        error.message === ""
      ) {
        LoadingBar.stop();
        Dialog.create({
          html: true,
          dark: true,
          title: `Veículo não encontrado!`,
          message: `<p>Nenhum veículo com a placa ${numeroPlaca} foi encontrado na base de dados da SINESP.<br/><br/>
                    As vezes isto pode ser apenas uma instabilidade no serviço da SINESP. Se você tem certeza que está procurando por uma placa existente, tente novamente.
                    </p>`
        });
      } else {
        console.log(error);
        LoadingBar.stop();
        procurarPlaca(numeroPlaca);
      }
    });
}

export function buscarPlacas(numeroPlaca = null) {
  if (numeroPlaca) {
    let dados = [];
    dados.push(
      db
        .get("Placa")
        .find({ placa: numeroPlaca })
        .value()
    );
    return dados;
  } else {
    let query = db.get("Placa").value();
    let dados = _.orderBy(query, "id", "desc");
    return dados;
  }
}

export function salvarPlaca(placa) {
  LoadingBar.start();

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
  placa["data_cadastro"] = dataCadastro;

  db.get("Placa")
    .push(placa)
    .write();

  LoadingBar.stop();
  Notify.create({
    html: true,
    message: `O veículo <strong>${placa.modelo}</strong> foi registrado no sistema. Clique no ícone "Recarregar Tabela" para atualizar a tabela.`,
    color: "positive",
    position: "center",
    icon: "save"
  });
}

export function editarCampoPlaca(valor, coluna, veiculo) {
  db.get("Placa")
    .find({ placa: veiculo.placa })
    .assign({ [coluna]: valor })
    .write();

  Notify.create({
    html: true,
    message: `Campo alterado com sucesso.`,
    color: "primary",
    position: "bottom",
    icon: "save"
  });
}

export function excluirPlacas(placas) {
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
          .remove({ placa: veiculo.placa })
          .write();
      });

      Notify.create({
        message: `Veículos excluidos do sistema com sucesso. Clique no ícone "Recarregar Tabela" para atualizar a tabela.`,
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

export function validarPlaca(numeroPlaca) {
  if (numeroPlaca.length === 7) {
    if (
      /^[a-zA-Z]+$/.test(numeroPlaca.slice(0, 3)) &&
      /^-?\d+$/.test(numeroPlaca.slice(3, 7))
    ) {
      return true;
    } else if (
      /^[a-zA-Z]+$/.test(numeroPlaca.slice(0, 2)) &&
      /^-?\d+$/.test(numeroPlaca[3]) &&
      /^[a-zA-Z]+$/.test(numeroPlaca[4]) &&
      /^-?\d+$/.test(numeroPlaca.slice(5, 7))
    ) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

export function exportarTabelaExcel(colunas, dados) {
  function wrapCsvValue(val, formatFn) {
    let formatted = formatFn !== void 0 ? formatFn(val) : val;

    formatted =
      formatted === void 0 || formatted === null ? "" : String(formatted);

    formatted = formatted.split('"').join('""');
    /**
     * Excel accepts \n and \r in strings, but some other CSV parsers do not
     * Uncomment the next two lines to escape new lines
     */
    // .split('\n').join('\\n')
    // .split('\r').join('\\r')

    return `"${formatted}"`;
  }

  const content = [colunas.map(col => wrapCsvValue(col.label))]
    .concat(
      dados.map(row =>
        colunas
          .map(col =>
            wrapCsvValue(
              typeof col.field === "function"
                ? col.field(row)
                : row[col.field === void 0 ? col.name : col.field],
              col.format
            )
          )
          .join(",")
      )
    )
    .join("\r\n");

  const status = exportFile(
    "G-Placas_Tabela_Veiculos.csv",
    content,
    "text/csv"
  );

  if (status !== true) {
    Notify.create({
      message: "Não foi possível exportar a tabela para CSV.",
      color: "negative",
      icon: "warning",
      position: "top-right"
    });
  }
}
