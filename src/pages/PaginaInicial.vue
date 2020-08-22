<template>
  <q-layout>
    <div class="q-pa-md" align="center">
      <q-input
        mask="XXXXXXX"
        v-model="numeroPlaca"
        label="Insira o número de uma placa ..."
        hint="Exemplo: ABC1234 ou ABC1D23"
        outlined
        style="width: 50%"
      >
        <template v-slot:prepend>
          <q-icon
            name="close"
            @click="numeroPlaca = ''"
            class="cursor-pointer"
            color="red"
          />
        </template>
        <template v-slot:append>
          <q-btn @click="procurarPlaca" round color="primary" icon="search" />
        </template>
      </q-input>
    </div>
    <div class="q-pa-md">
      <q-table
        title="Veículos Registrados"
        :data="dadosTabela"
        :columns="colunasTabela"
        :filter="inputFiltro"
        :grid="toggleGrid"
        row-key="placa"
      >
        <template v-slot:top-right>
          <q-toggle
            v-model="toggleGrid"
            label="Visualização em Grid"
            left-label
            color="green"
          />
          <q-btn
            color="primary"
            icon-right="refresh"
            label="Recarregar"
            no-caps
            @click="buscarPlacas"
            class="q-ml-xs"
          />
          <q-btn
            color="green"
            icon-right="archive"
            label="Exportar CSV"
            no-caps
            @click="exportarTabelaExcel"
            class="q-ma-xs"
          />
          <q-input
            v-model="inputFiltro"
            dense
            outlined
            debounce="300"
            placeholder="Procurar"
          >
            <template v-slot:prepend>
              <q-icon
                name="close"
                @click="inputFiltro = ''"
                class="cursor-pointer"
                color="red"
              />
            </template>
            <template v-slot:append>
              <q-icon name="search" color="blue" />
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
      toggleGrid: false,
      carregandoTabela: false,
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
      ],
      dadosTabela: null
    };
  },
  methods: {
    procurarPlaca: function() {
      if (controller.validarPlaca(this.numeroPlaca)) {
        controller.procurarPlaca(this.numeroPlaca);
      } else {
        this.$q.dialog({
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
    }
  },
  created: function() {
    this.buscarPlacas();
  }
};
</script>
