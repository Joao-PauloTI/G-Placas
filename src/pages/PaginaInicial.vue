<template>
  <q-layout view="hHh Lpr lFf" class="bg-grey-10 text-white">
    <q-header class="bg-grey-10" elevated>
      <q-toolbar>
        <q-toolbar-title>
          <q-btn-dropdown flat size="lg" text-color="amber">
            <q-list class="bg-grey-10" bordered dark>
              <q-item clickable v-close-popup @click="deslogar">
                <q-item-section avatar>
                  <q-avatar icon="exit_to_app" color="negative" text-color="white" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Sair</q-item-label>
                  <q-item-label caption>@{{ dadosEstacionamento.login }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <span style="font-family: manjari; color: #FFC200" class="q-pl-xs">G-Placas</span><span style="font-family: manjari" class="q-pl-lg">{{ dadosEstacionamento.nome }}</span>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <div class="q-pa-md" style="padding-top: 5%" align="center">
      <q-input mask="XXXXXXX" label="Insira o número de uma placa ..." hint="Exemplo: ABC1234 ou ABC1D23" outlined style="width: 50%" dark color="amber-4" v-model="numeroPlaca">
        <template v-slot:prepend>
          <q-icon name="cancel" @click="numeroPlaca = ''" class="cursor-pointer" color="red" />
        </template>
        <template v-slot:append>
          <q-btn @click="procurarPlaca" round color="primary" icon="search">
            <q-tooltip anchor="bottom middle" self="top middle" :offset="[10, 10]" content-style="font-size: 14px" content-class="bg-primary">
              Pesquisar Placa
            </q-tooltip>
          </q-btn>
        </template>
      </q-input>
    </div>
    <div class="q-pa-md">
      <q-table
        title="Veículos Registrados"
        row-key="placa"
        selection="multiple"
        separator="cell"
        card-class="bg-grey-10"
        table-header-class="bg-grey-10"
        table-class="bg-grey-10"
        bordered
        dark
        :data="dadosTabela"
        :columns="colunasTabela"
        :filter="inputFiltro"
        :grid="btnGrid"
        :selected.sync="linhasSelecionadas"
        :pagination.sync="paginacao"
      >
        <template v-slot:header-cell-placa="props">
          <q-th :props="props" style="font-size: 110%">
            <q-icon color="info" name="lock" />
            {{ props.col.label }}
          </q-th>
        </template>
        <template v-slot:header-cell-data_cadastro="props">
          <q-th :props="props" style="font-size: 110%">
            <q-icon color="info" name="event_available" />
            {{ props.col.label }}
          </q-th>
        </template>
        <template v-slot:header-cell-modelo="props">
          <q-th :props="props" style="font-size: 110%">
            <q-icon color="info" name="directions_car" />
            {{ props.col.label }}
          </q-th>
        </template>
        <template v-slot:header-cell-cor="props">
          <q-th :props="props" style="font-size: 110%">
            <q-icon color="info" name="palette" />
            {{ props.col.label }}
          </q-th>
        </template>
        <template v-slot:header-cell-ano="props">
          <q-th :props="props" style="font-size: 110%">
            <q-icon color="info" name="date_range" />
            {{ props.col.label }}
          </q-th>
        </template>
        <template v-slot:header-cell-uf="props">
          <q-th :props="props" style="font-size: 110%">
            <q-icon color="info" name="location_city" />
            {{ props.col.label }}
          </q-th>
        </template>
        <template v-slot:header-cell-municipio="props">
          <q-th :props="props" style="font-size: 110%">
            <q-icon color="info" name="house" />
            {{ props.col.label }}
          </q-th>
        </template>
        <template v-slot:header-cell-situacao="props">
          <q-th :props="props" style="font-size: 110%">
            <q-icon color="info" name="assignment_late" />
            {{ props.col.label }}
          </q-th>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="id">
              <q-checkbox v-model="props.selected" dark>
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]" content-style="font-size: 14px" content-class="bg-primary">
                  Selecionar veículo
                </q-tooltip>
              </q-checkbox>
            </q-td>
            <q-td key="placa" :props="props">
              {{ props.row.placa.toUpperCase() }}
            </q-td>
            <q-td key="data_cadastro" :props="props">
              {{ props.row.data_cadastro.toUpperCase() }}
            </q-td>
            <q-td key="modelo" :props="props" :style="editarCampos ? 'border: 1px solid teal' : ''">
              {{ props.row.modelo.toUpperCase() }}
              <q-popup-edit
                v-if="editarCampos"
                @before-show="clonarLinhaTabela(props.row)"
                v-model="linhasClonadasTabela.modelo"
                @save="
                  valor => {
                    atualizarLinhaTabela(props.row, 'modelo', linhasClonadasTabela.modelo);
                    editarCampoPlaca(valor, 'modelo', props.row);
                  }
                "
                dark
                buttons
                label-set="Salvar"
                label-cancel="Desfazer"
                color="amber"
                title="Edite o modelo do veículo:"
              >
                <q-input v-model="linhasClonadasTabela.modelo" :rules="[val => !!val || 'O campo não pode ficar vazio!']" dense dark outlined autofocus color="amber" />
              </q-popup-edit>
            </q-td>
            <q-td key="cor" :props="props" :style="editarCampos ? 'border: 1px solid teal' : ''">
              {{ props.row.cor.toUpperCase() }}
              <q-popup-edit
                v-if="editarCampos"
                @before-show="clonarLinhaTabela(props.row)"
                v-model="linhasClonadasTabela.cor"
                @save="
                  valor => {
                    atualizarLinhaTabela(props.row, 'cor', linhasClonadasTabela.cor);
                    editarCampoPlaca(valor, 'cor', props.row);
                  }
                "
                dark
                buttons
                label-set="Salvar"
                label-cancel="Desfazer"
                color="amber"
                title="Edite a cor do veículo:"
              >
                <q-input v-model="linhasClonadasTabela.cor" :rules="[val => !!val || 'O campo não pode ficar vazio!']" dense dark outlined autofocus color="amber" />
              </q-popup-edit>
            </q-td>
            <q-td key="ano" :props="props" :style="editarCampos ? 'border: 1px solid teal' : ''">
              {{ props.row.ano.toUpperCase() }}
              <q-popup-edit
                v-if="editarCampos"
                @before-show="clonarLinhaTabela(props.row)"
                v-model="linhasClonadasTabela.ano"
                @save="
                  valor => {
                    atualizarLinhaTabela(props.row, 'ano', linhasClonadasTabela.ano);
                    editarCampoPlaca(valor, 'ano', props.row);
                  }
                "
                dark
                buttons
                label-set="Salvar"
                label-cancel="Desfazer"
                color="amber"
                title="Edite o ano do veículo:"
              >
                <q-input v-model="linhasClonadasTabela.ano" :rules="[val => !!val || 'O campo não pode ficar vazio!']" dense dark outlined autofocus color="amber" />
              </q-popup-edit>
            </q-td>
            <q-td key="uf" :props="props" :style="editarCampos ? 'border: 1px solid teal' : ''">
              {{ props.row.uf.toUpperCase() }}
              <q-popup-edit
                v-if="editarCampos"
                @before-show="clonarLinhaTabela(props.row)"
                v-model="linhasClonadasTabela.uf"
                @save="
                  valor => {
                    atualizarLinhaTabela(props.row, 'uf', linhasClonadasTabela.uf);
                    editarCampoPlaca(valor, 'uf', props.row);
                  }
                "
                dark
                buttons
                label-set="Salvar"
                label-cancel="Desfazer"
                color="amber"
                title="Edite o estado do veículo:"
              >
                <q-input v-model="linhasClonadasTabela.uf" :rules="[val => !!val || 'O campo não pode ficar vazio!']" dense dark outlined autofocus color="amber" />
              </q-popup-edit>
            </q-td>
            <q-td key="municipio" :props="props" :style="editarCampos ? 'border: 1px solid teal' : ''">
              {{ props.row.municipio.toUpperCase() }}
              <q-popup-edit
                v-if="editarCampos"
                @before-show="clonarLinhaTabela(props.row)"
                v-model="linhasClonadasTabela.municipio"
                @save="
                  valor => {
                    atualizarLinhaTabela(props.row, 'municipio', linhasClonadasTabela.municipio);
                    editarCampoPlaca(valor, 'municipio', props.row);
                  }
                "
                dark
                buttons
                label-set="Salvar"
                label-cancel="Desfazer"
                color="amber"
                title="Edite o município do veículo:"
              >
                <q-input v-model="linhasClonadasTabela.municipio" :rules="[val => !!val || 'O campo não pode ficar vazio!']" dense dark outlined autofocus color="amber" />
              </q-popup-edit>
            </q-td>
            <q-td key="situacao" :props="props" :style="editarCampos ? 'border: 1px solid teal' : ''">
              <div v-if="props.row.situacao.toUpperCase().includes('OK') || props.row.situacao.toUpperCase().includes('SEM RESTRIÇÃO')">
                <q-badge color="positive">
                  <q-icon name="verified_user" color="white" size="xs" class="q-mr-sm" />
                  <strong>{{ props.row.situacao.toUpperCase() }}</strong>
                </q-badge>
              </div>
              <div v-else-if="props.row.situacao.toUpperCase().includes('ROUBO') || props.row.situacao.toUpperCase().includes('FURTO')">
                <q-badge color="negative">
                  <q-icon name="warning" color="white" size="xs" class="q-mr-sm" />
                  <strong>{{ props.row.situacao.toUpperCase() }}</strong>
                </q-badge>
              </div>
              <div v-else>
                <q-badge color="brown-8">
                  <q-icon name="help" color="white" size="xs" class="q-mr-sm" />
                  <strong>{{ props.row.situacao.toUpperCase() }}</strong>
                </q-badge>
              </div>
              <q-popup-edit
                v-if="editarCampos"
                @before-show="clonarLinhaTabela(props.row)"
                v-model="linhasClonadasTabela.situacao"
                @save="
                  valor => {
                    atualizarLinhaTabela(props.row, 'situacao', linhasClonadasTabela.situacao);
                    editarCampoPlaca(valor, 'situacao', props.row);
                  }
                "
                dark
                buttons
                label-set="Salvar"
                label-cancel="Desfazer"
                color="amber"
                title="Edite a situação do veículo:"
              >
                <q-input v-model="linhasClonadasTabela.situacao" :rules="[val => !!val || 'O campo não pode ficar vazio!']" dense dark outlined autofocus color="amber" />
              </q-popup-edit>
            </q-td>
          </q-tr>
        </template>
        <template v-slot:top-right>
          <q-btn @click="excluirPlacas" v-if="linhasSelecionadas.length > 0" color="negative" icon="delete" round>
            <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]" content-style="font-size: 14px" content-class="bg-negative">
              Excluir linhas selecionadas
            </q-tooltip>
          </q-btn>
          <q-btn @click="adicionarPlacaManual" color="indigo-7" icon="add" round class="q-ml-xs">
            <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]" content-style="font-size: 14px" content-class="bg-indigo-7">
              Adicionar Novo Veículo Manualmente
            </q-tooltip>
          </q-btn>
          <q-btn @click="buscarPlacas" color="amber-10" icon="sync" round class="q-ml-xs">
            <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]" content-style="font-size: 14px" content-class="bg-amber-10">
              Recarregar Tabela
            </q-tooltip>
          </q-btn>
          <q-btn v-if="dadosTabela[0]" @click="liberarEdicaoCampos" color="teal-7" :icon="!editarCampos ? 'edit' : 'assignment_turned_in'" round class="q-ml-xs">
            <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]" content-style="font-size: 14px" content-class="bg-teal-7">
              {{ !editarCampos ? "Liberar edição de informações" : "Bloquear edição de informações" }}
            </q-tooltip>
          </q-btn>
          <q-btn v-if="dadosTabela[0]" @click="exportarTabelaExcel" color="green" icon="archive" round class="q-ml-xs">
            <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]" content-style="font-size: 14px" content-class="bg-green">
              Exportar para Excel
            </q-tooltip>
          </q-btn>
          <q-btn v-if="dadosTabela[0]" @click="exportarPlacas" color="grey-5" icon="get_app" text-color="black" round class="q-ml-xs">
            <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]" content-style="font-size: 14px; color: black" content-class="bg-grey-5">
              Exportar Registros
            </q-tooltip>
          </q-btn>
          <q-btn @click="importarPlacas" color="grey-5" icon="publish" text-color="black" round class="q-ml-xs">
            <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]" content-style="font-size: 14px; color: black" content-class="bg-grey-5">
              Importar Registros
            </q-tooltip>
          </q-btn>
          <q-btn
            @click="
              {
                {
                  btnGrid = !btnGrid;
                }
              }
              {
                {
                  btnGrid ? (btnGridIcon = 'table_rows') : (btnGridIcon = 'view_module');
                }
              }
            "
            v-bind:icon="btnGridIcon"
            round
            color="purple"
            class="q-ml-xs"
          >
            <q-tooltip v-if="btnGrid" anchor="top middle" self="bottom middle" :offset="[10, 10]" content-style="font-size: 14px" content-class="bg-purple">
              Visualizar em Tabela
            </q-tooltip>
            <q-tooltip v-else anchor="top middle" self="bottom middle" :offset="[10, 10]" content-style="font-size: 14px" content-class="bg-purple">
              Visualizar em Grid
            </q-tooltip>
          </q-btn>
          <q-input v-model="inputFiltro" dense outlined debounce="100" label="Procurar ..." class="q-ml-xs" dark color="amber-4">
            <template v-slot:prepend>
              <q-icon name="cancel" @click="inputFiltro = ''" class="cursor-pointer" color="red" />
            </template>
            <template v-slot:append>
              <q-icon name="search" color="white" />
            </template>
          </q-input>
        </template>
      </q-table>
    </div>
  </q-layout>
</template>

<script>
const placaController = require("src/controllers/PlacaController");
const estacionamentoController = require("src/controllers/EstacionamentoController");
const loginController = require("src/controllers/LoginController");
const utilsController = require("src/controllers/UtilsController");

export default {
  name: "PaginaInicial",
  data() {
    return {
      numeroPlaca: "",
      inputFiltro: "",
      btnGrid: false,
      btnGridIcon: "view_module",
      editarCampos: false,
      linhasSelecionadas: [],
      paginacao: {
        rowsPerPage: 10
      },
      dadosEstacionamento: null,
      dadosTabela: null,
      colunasTabela: [
        {
          name: "placa",
          label: "Placa",
          field: "placa",
          sortable: true,
          align: "left"
        },
        {
          name: "data_cadastro",
          label: "Data de Cadadstro",
          field: "data_cadastro",
          sortable: true,
          align: "left"
        },
        {
          name: "modelo",
          label: "Modelo",
          field: "modelo",
          sortable: true,
          align: "left"
        },
        {
          name: "cor",
          label: "Cor",
          field: "cor",
          sortable: true,
          align: "left"
        },
        {
          name: "ano",
          label: "Ano",
          field: "ano",
          sortable: true,
          align: "left"
        },
        {
          name: "uf",
          label: "Estado",
          field: "uf",
          sortable: true,
          align: "left"
        },
        {
          name: "municipio",
          label: "Município",
          field: "municipio",
          sortable: true,
          align: "left"
        },
        {
          name: "situacao",
          label: "Situação",
          field: "situacao",
          sortable: true,
          align: "left"
        }
      ],
      linhasClonadasTabela: {}
    };
  },
  methods: {
    adicionarPlacaManual: function() {
      this.$q
        .dialog({
          html: true,
          dark: true,
          ok: {
            label: "Salvar",
            color: "green-9",
            push: true
          },
          cancel: {
            label: "Desfazer",
            color: "negative",
            push: true
          },
          title: "Adicionar Novo Veículo Manualmente",
          message: "Insira a placa do veículo que deseja salvar:",
          prompt: {
            type: "text",
            model: "",
            isValid: val => utilsController.validarPlaca(val),
            maxlength: 7,
            outlined: true
          }
        })
        .onOk(numeroPlaca => {
          placaController.criarPlacaManual(numeroPlaca.toUpperCase());
        });
    },
    procurarPlaca: function() {
      if (utilsController.validarPlaca(this.numeroPlaca)) {
        placaController.procurarPlaca(this.numeroPlaca);
      } else {
        this.$q.dialog({
          dark: true,
          html: true,
          ok: {
            label: "Fechar",
            color: "indigo-10"
          },
          title: `Placa ${this.numeroPlaca} invalida!`,
          message: "<p>O formato da placa precisa ter 7 digitos e estar dentro do padrão ABC1234 ou ABC1D23.</p>"
        });
      }
    },
    buscarPlacas: function() {
      this.dadosTabela = placaController.buscarPlacas();
    },
    excluirPlacas: function() {
      placaController.excluirPlacas(this.linhasSelecionadas);
      this.linhasSelecionadas = [];
    },
    liberarEdicaoCampos: function() {
      this.editarCampos = !this.editarCampos;
      this.$q.notify({
        message: this.editarCampos ? "Para editar uma informação de um veículo, apenas clique no campo que deseja alterar." : "Edição de informações bloqueada.",
        color: "teal-7",
        position: "top-right",
        icon: this.editarCampos ? "edit" : "assignment_turned_in",
        timeout: this.editarCampos ? 7000 : 2500
      });
    },
    editarCampoPlaca: function(valor, coluna, placa) {
      placaController.editarCampoPlaca(valor, coluna, placa);
    },
    atualizarLinhaTabela: function(row, key, value) {
      row[key] = value;
    },
    clonarLinhaTabela: function(row) {
      this.linhasClonadasTabela = { ...row };
    },
    buscarEstacionamento: function() {
      this.dadosEstacionamento = loginController.buscarEstacionamentoLogado();
    },
    exportarTabelaExcel: function() {
      utilsController.exportarTabelaExcel(this.colunasTabela, this.dadosTabela);
    },
    importarPlacas: function() {
      let input = document.createElement("input");
      input.type = "file";

      let arquivo = null;
      input.onchange = e => {
        arquivo = e.target.files[0];
        utilsController.importarPlacas(arquivo);
      };

      input.click();
    },
    exportarPlacas: function() {
      utilsController.exportarPlacas();
    },
    deslogar: function() {
      let logoff = loginController.deslogar();
      if (logoff) {
        this.$router.push({ path: "/" });
      }
    }
  },
  created: function() {
    this.buscarEstacionamento();
    this.buscarPlacas();
  }
};
</script>
