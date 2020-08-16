<template>
  <q-layout>
    <div class="q-pa-md" align="center">
      <q-input
        mask="XXXXXXX"
        v-model="numeroPlaca"
        label="Insira o número de uma placa ..."
        hint="Ex.: ABC1234"
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
        row-key="placa"
      />
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
      colunasTabela: [
        {
          name: "placa",
          label: "Placa",
          field: "placa",
          sortable: true,
          align: "left"
        },
        {
          name: "marca",
          label: "Marca",
          field: "marca",
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
      controller.procurarPlaca(this.numeroPlaca);
    },
    buscarPlacas: function() {
      this.dadosTabela = controller.buscarPlacas();
    }
  },
  created: function() {
    this.buscarPlacas();
  }
};
</script>
