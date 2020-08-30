<template>
  <q-layout class="bg-grey-10 text-white" style="padding: 3% 30%">
    <q-card align="center" dark bordered>
      <q-tabs
        v-model="aba"
        inline-label
        class="bg-grey-10 text-white"
        switch-indicator
        indicator-color="amber"
        active-bg-color="grey-9"
      >
        <q-tab name="login" icon="login" label="Login" />
        <q-tab
          name="cadastrar"
          icon="emoji_transportation"
          label="Novo Estacionamento"
        />
      </q-tabs>
      <h4 style="font-family: manjari; color: #FFC200">
        G-PLACAS
        <br />
        <span style="font-size: 40%; color: white"
          >Sistema de Gerenciamento de Placas Veículares</span
        >
      </h4>
      <div v-if="aba === 'login'" style="padding: 0 10% 5% 10%">
        <q-input
          label="Login"
          outlined
          dark
          color="amber"
          v-model="estacionamentoLogin"
          class="q-pb-md"
        >
          <template v-slot:prepend>
            <q-icon name="keyboard" color="info" />
          </template>
          <template v-slot:append>
            <q-icon
              name="cancel"
              @click="estacionamentoLogin = ''"
              class="cursor-pointer"
              color="red"
            />
          </template>
        </q-input>
        <q-input
          label="Senha"
          v-model="senhaLogin"
          :type="mostrarSenhaLogin ? 'password' : 'text'"
          outlined
          dark
          color="amber-4"
          class="q-py-md"
        >
          <template v-slot:prepend>
            <q-icon
              :name="mostrarSenhaLogin ? 'lock' : 'lock_open'"
              class="cursor-pointer"
              color="info"
              @click="mostrarSenhaLogin = !mostrarSenhaLogin"
            />
          </template>
          <template v-slot:append>
            <q-icon
              name="cancel"
              @click="senhaLogin = ''"
              class="cursor-pointer"
              color="red"
            />
          </template>
        </q-input>
        <q-btn label="Recuperar senha" no-caps color="red" flat />
        <br />
        <q-btn
          @click="logar"
          color="primary"
          class="q-my-lg"
          icon-right="login"
          label="Entrar"
        />
      </div>
      <div v-else style="padding: 0 10% 5% 10%">
        <q-input
          label="Login"
          outlined
          dark
          color="amber"
          v-model="estacionamentoLoginNovo"
          class="q-pb-md"
          :rules="[val => !val.includes(' ') || 'Não é permitido espaços!']"
        >
          <template v-slot:prepend>
            <q-icon name="keyboard" color="info" />
          </template>
          <template v-slot:append>
            <q-icon
              name="cancel"
              @click="estacionamentoLoginNovo = ''"
              class="cursor-pointer"
              color="red"
            />
          </template>
          <q-tooltip
            content-class="bg-purple"
            content-style="font-size: 13px"
            anchor="top middle"
            self="bottom middle"
            :offset="[10, 10]"
            >É obrigatório ser único e sem espaços.
            <br />
            Exemplos: estacionamento.do.fulano, estacionamento_do_fulano,
            estacionamento123 ...</q-tooltip
          >
        </q-input>
        <q-input
          label="Nome do estacionamento"
          outlined
          dark
          color="amber"
          v-model="estacionamentoNomeNovo"
          class="q-py-md"
        >
          <template v-slot:prepend>
            <q-icon name="emoji_transportation" color="info" />
          </template>
          <template v-slot:append>
            <q-icon
              name="cancel"
              @click="estacionamentoNomeNovo = ''"
              class="cursor-pointer"
              color="red"
            />
          </template>
        </q-input>
        <q-input
          label="Senha"
          v-model="senhaNova"
          :type="mostrarSenhaNova ? 'password' : 'text'"
          outlined
          dark
          color="amber-4"
          class="q-py-md"
        >
          <template v-slot:prepend>
            <q-icon
              :name="mostrarSenhaNova ? 'lock' : 'lock_open'"
              class="cursor-pointer"
              color="info"
              @click="mostrarSenhaNova = !mostrarSenhaNova"
            />
          </template>
          <template v-slot:append>
            <q-icon
              name="cancel"
              @click="senhaNova = ''"
              class="cursor-pointer"
              color="red"
            />
          </template>
        </q-input>
        <q-input
          label="Pergunta"
          outlined
          dark
          color="amber"
          v-model="perguntaNovo"
          class="q-py-md"
        >
          <template v-slot:prepend>
            <q-icon name="contact_support" color="info" />
          </template>
          <template v-slot:append>
            <q-icon
              name="cancel"
              @click="perguntaNovo = ''"
              class="cursor-pointer"
              color="red"
            />
          </template>
          <q-tooltip
            content-class="bg-purple"
            content-style="font-size: 13px"
            anchor="top middle"
            self="bottom middle"
            :offset="[10, 10]"
            >Esta pergunta será feita caso você precise recuperar a senha de sua
            conta. <br />Pense numa pergunta que só você saberá
            responder.</q-tooltip
          >
        </q-input>
        <q-input
          label="Resposta"
          v-model="respostaNova"
          :type="mostrarRespostaNova ? 'password' : 'text'"
          outlined
          dark
          color="amber-4"
          class="q-py-md"
        >
          <template v-slot:prepend>
            <q-icon
              :name="mostrarRespostaNova ? 'chat_bubble' : 'chat'"
              class="cursor-pointer"
              color="info"
              @click="mostrarRespostaNova = !mostrarRespostaNova"
            />
          </template>
          <template v-slot:append>
            <q-icon
              name="cancel"
              @click="respostaNova = ''"
              class="cursor-pointer"
              color="red"
            />
          </template>
          <q-tooltip
            content-class="bg-purple"
            content-style="font-size: 13px"
            anchor="top middle"
            self="bottom middle"
            :offset="[10, 10]"
            >Esta será a resposta da pergunta acima para poder prosseguir com a
            recuperação de senha.</q-tooltip
          >
        </q-input>
        <q-btn
          @click="criarEstacionamento"
          color="primary"
          class="q-my-lg"
          icon-right="emoji_transportation"
          label="Criar Estacionamento"
        />
      </div>
    </q-card>
  </q-layout>
</template>

<script>
const loginController = require("src/controllers/LoginController");
const estacionamentoController = require("src/controllers/EstacionamentoController");

export default {
  name: "Login",
  data() {
    return {
      aba: "login",
      //-----------------------------------
      estacionamentoLogin: "",
      senhaLogin: "",
      mostrarSenhaLogin: true,
      //-----------------------------------
      estacionamentoLoginNovo: "",
      estacionamentoNomeNovo: "",
      senhaNova: "",
      perguntaNovo: "",
      respostaNova: "",
      mostrarSenhaNova: true,
      mostrarRespostaNova: true
    };
  },
  methods: {
    logar: function() {
      if (this.validarCamposLogin()) {
        let dados = {
          login: this.estacionamentoLogin,
          senha: this.senhaLogin
        };
        let resultado = loginController.logar(dados);
        if (resultado) {
          this.$router.push({
            path: `/pagina-inicial/${resultado.login}`
          });
        }
      } else {
        this.$q.notify({
          message: `Todos os campos de login precisam estar preenchidos!`,
          color: "negative",
          position: "bottom",
          icon: "warning"
        });
      }
    },
    criarEstacionamento: function() {
      if (this.validarCamposCriar()) {
        let dados = {
          login: this.estacionamentoLoginNovo,
          nome: this.estacionamentoNomeNovo,
          senha: this.senhaNova,
          pergunta: this.perguntaNovo,
          resposta: this.respostaNova
        };
        let resultado = estacionamentoController.criarEstacionamento(dados);
        if (resultado) {
          this.estacionamentoLoginNovo = "";
          this.estacionamentoNomeNovo = "";
          this.senhaNova = "";
          this.perguntaNovo = "";
          this.respostaNova = "";
          this.aba = "login";
          this.estacionamentoLogin = resultado.login;
        }
      } else {
        this.$q.notify({
          message: `Todos os campos de cadastro precisam estar preenchidos!`,
          color: "negative",
          position: "bottom",
          icon: "warning"
        });
      }
    },
    validarCamposLogin: function() {
      if (this.estacionamentoLogin !== "" && this.senhaLogin !== "") {
        return true;
      } else {
        return false;
      }
    },
    validarCamposCriar: function() {
      if (
        this.estacionamentoLoginNovo !== "" &&
        this.estacionamentoNomeNovo !== "" &&
        this.senhaNova !== "" &&
        this.perguntaNovo !== "" &&
        this.respostaNova !== ""
      ) {
        return true;
      } else {
        return false;
      }
    }
  }
};
</script>

<style></style>
