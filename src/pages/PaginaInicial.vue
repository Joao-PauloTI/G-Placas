<template>
  <q-layout class="bg-grey-10 text-white">
    <div class="q-pa-md" align="center">
      <q-input
        mask="XXXXXXX"
        label="Insira o número de uma placa ..."
        hint="Exemplo: ABC1234 ou ABC1D23"
        outlined
        style="width: 50%"
        dark
        color="amber-4"
        v-model="numeroPlaca"
      >
        <template v-slot:prepend>
          <q-icon
            name="cancel"
            @click="numeroPlaca = ''"
            class="cursor-pointer"
            color="red"
          />
        </template>
        <template v-slot:append>
          <q-btn @click="procurarPlaca" round color="primary" icon="search">
            <q-tooltip
              anchor="bottom middle"
              self="top middle"
              :offset="[10, 10]"
              content-style="font-size: 14px"
              content-class="bg-primary"
            >
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
        dark
        :data="dadosTabela"
        :columns="colunasTabela"
        :filter="inputFiltro"
        :grid="btnGrid"
        :selected.sync="linhasSelecionadas"
      >
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="id">
              <q-checkbox v-model="props.selected" dark />
            </q-td>
            <q-td key="placa" :props="props">
              {{ props.row.placa }}
            </q-td>
            <q-td key="modelo" :props="props">
              {{ props.row.modelo }}
              <q-popup-edit
                v-model="props.row.modelo"
                @save="
                  valor => {
                    editarCampoPlaca(valor, 'modelo', props.row);
                  }
                "
                dark
                buttons
                label-set="Salvar"
                label-cancel="Desfazer"
                color="amber"
              >
                <q-input
                  v-model="props.row.modelo"
                  :rules="[val => !!val || 'O campo não pode ficar vazio!']"
                  dense
                  dark
                  outlined
                  autofocus
                  color="amber"
                />
              </q-popup-edit>
            </q-td>
            <q-td key="cor" :props="props">
              {{ props.row.cor }}
              <q-popup-edit
                v-model="props.row.cor"
                @save="
                  valor => {
                    editarCampoPlaca(valor, 'cor', props.row);
                  }
                "
                dark
                buttons
                label-set="Salvar"
                label-cancel="Desfazer"
                color="amber"
              >
                <q-input
                  v-model="props.row.cor"
                  :rules="[val => !!val || 'O campo não pode ficar vazio!']"
                  dense
                  dark
                  outlined
                  autofocus
                  color="amber"
                />
              </q-popup-edit>
            </q-td>
            <q-td key="ano" :props="props">
              {{ props.row.ano }}
              <q-popup-edit
                v-model="props.row.ano"
                @save="
                  valor => {
                    editarCampoPlaca(valor, 'ano', props.row);
                  }
                "
                dark
                buttons
                label-set="Salvar"
                label-cancel="Desfazer"
                color="amber"
              >
                <q-input
                  v-model="props.row.ano"
                  :rules="[val => !!val || 'O campo não pode ficar vazio!']"
                  dense
                  dark
                  outlined
                  autofocus
                  color="amber"
                />
              </q-popup-edit>
            </q-td>
            <q-td key="uf" :props="props">
              {{ props.row.uf }}
              <q-popup-edit
                v-model="props.row.uf"
                @save="
                  valor => {
                    editarCampoPlaca(valor, 'uf', props.row);
                  }
                "
                dark
                buttons
                label-set="Salvar"
                label-cancel="Desfazer"
                color="amber"
              >
                <q-input
                  v-model="props.row.uf"
                  :rules="[val => !!val || 'O campo não pode ficar vazio!']"
                  dense
                  dark
                  outlined
                  autofocus
                  color="amber"
                />
              </q-popup-edit>
            </q-td>
            <q-td key="municipio" :props="props">
              {{ props.row.municipio }}
              <q-popup-edit
                v-model="props.row.municipio"
                @save="
                  valor => {
                    editarCampoPlaca(valor, 'municipio', props.row);
                  }
                "
                dark
                buttons
                label-set="Salvar"
                label-cancel="Desfazer"
                color="amber"
              >
                <q-input
                  v-model="props.row.municipio"
                  :rules="[val => !!val || 'O campo não pode ficar vazio!']"
                  dense
                  dark
                  outlined
                  autofocus
                  color="amber"
                />
              </q-popup-edit>
            </q-td>
            <q-td key="situacao" :props="props">
              {{ props.row.situacao }}
              <q-popup-edit
                v-model="props.row.situacao"
                @save="
                  valor => {
                    editarCampoPlaca(valor, 'situacao', props.row);
                  }
                "
                dark
                buttons
                label-set="Salvar"
                label-cancel="Desfazer"
                color="amber"
              >
                <q-input
                  v-model="props.row.situacao"
                  :rules="[val => !!val || 'O campo não pode ficar vazio!']"
                  dense
                  dark
                  outlined
                  autofocus
                  color="amber"
                />
              </q-popup-edit>
            </q-td>
          </q-tr>
        </template>
        <template v-slot:top-right>
          <q-btn
            @click="excluirPlacas"
            v-if="linhasSelecionadas.length > 0"
            color="negative"
            icon="delete"
            round
          >
            <q-tooltip
              anchor="top middle"
              self="bottom middle"
              :offset="[10, 10]"
              content-style="font-size: 14px"
              content-class="bg-negative"
            >
              Excluir linhas selecionadas
            </q-tooltip>
          </q-btn>
          <q-btn
            @click="buscarPlacas"
            color="primary"
            icon="refresh"
            round
            class="q-ml-xs"
          >
            <q-tooltip
              anchor="top middle"
              self="bottom middle"
              :offset="[10, 10]"
              content-style="font-size: 14px"
              content-class="bg-primary"
            >
              Recarregar Tabela
            </q-tooltip>
          </q-btn>
          <q-btn
            @click="exportarTabelaExcel"
            color="green"
            icon="archive"
            round
            class="q-ml-xs"
          >
            <q-tooltip
              anchor="top middle"
              self="bottom middle"
              :offset="[10, 10]"
              content-style="font-size: 14px"
              content-class="bg-green"
            >
              Exportar para Excel
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
                  btnGrid
                    ? (btnGridIcon = 'table_rows')
                    : (btnGridIcon = 'view_module');
                }
              }
            "
            v-bind:icon="btnGridIcon"
            round
            color="purple"
            class="q-ml-xs"
          >
            <q-tooltip
              v-if="btnGrid"
              anchor="top middle"
              self="bottom middle"
              :offset="[10, 10]"
              content-style="font-size: 14px"
              content-class="bg-purple"
            >
              Visualizar em Tabela
            </q-tooltip>
            <q-tooltip
              v-else
              anchor="top middle"
              self="bottom middle"
              :offset="[10, 10]"
              content-style="font-size: 14px"
              content-class="bg-purple"
            >
              Visualizar em Grid
            </q-tooltip>
          </q-btn>
          <q-input
            v-model="inputFiltro"
            dense
            outlined
            debounce="100"
            label="Procurar ..."
            class="q-ml-xs"
            dark
            color="amber-4"
          >
            <template v-slot:prepend>
              <q-icon
                name="cancel"
                @click="inputFiltro = ''"
                class="cursor-pointer"
                color="red"
              />
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
const controller = require("src/controllers/PlacaController");

export default {
  name: "PaginaInicial",
  data() {
    return {
      numeroPlaca: "",
      inputFiltro: "",
      btnGrid: false,
      btnGridIcon: "view_module",
      carregandoTabela: false,
      linhasSelecionadas: [],
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
      ]
    };
  },
  methods: {
    procurarPlaca: function() {
      if (controller.validarPlaca(this.numeroPlaca)) {
        controller.procurarPlaca(this.numeroPlaca);
      } else {
        this.$q.dialog({
          dark: true,
          html: true,
          title: `Placa ${this.numeroPlaca} invalida!`,
          message:
            "<p>O formato da placa precisa ter 7 digitos e estar dentro do padrão ABC1234 ou ABC1D23.</p>"
        });
      }
    },
    buscarPlacas: function() {
      this.dadosTabela = controller.buscarPlacas();
    },
    exportarTabelaExcel: function() {
      controller.exportarTabelaExcel(this.colunasTabela, this.dadosTabela);
    },
    excluirPlacas: function() {
      controller.excluirPlacas(this.linhasSelecionadas);
      this.linhasSelecionadas = [];
    },
    editarCampoPlaca: function(valor, coluna, placa) {
      controller.editarCampoPlaca(valor, coluna, placa);
    }
  },
  created: function() {
    this.buscarPlacas();
  }
};
</script>
