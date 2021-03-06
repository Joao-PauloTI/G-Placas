const routes = [
  {
    path: "/",
    component: () => import("pages/Login.vue")
  },
  {
    path: "/pagina-inicial",
    component: () => import("pages/PaginaInicial.vue")
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "*",
    component: () => import("pages/Error404.vue")
  }
];

export default routes;
