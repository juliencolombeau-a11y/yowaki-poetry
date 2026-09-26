<template>
  <v-app theme="light">
    <v-app-bar color="primary" elevation="2">
      <v-container class="d-flex align-center px-3 px-sm-4 navigation-content">
        <v-toolbar-title class="font-weight-bold navigation-title">Yowaki - créations diverses</v-toolbar-title>
        <v-btn to="/" icon="mdi-home" aria-label="Accueil" variant="text" class="d-sm-none" />
        <v-btn to="/" variant="text" prepend-icon="mdi-home" class="d-none d-sm-flex">Accueil</v-btn>
      </v-container>
    </v-app-bar>

    <v-main>
      <v-container class="py-6 py-sm-10 px-3 px-sm-6">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.navigation-content {
  min-width: 0;
}

.navigation-title {
  min-width: 0;
  overflow: hidden;
  font-size: 0.9rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (min-width: 600px) {
  .navigation-title {
    font-size: 1.25rem;
  }
}
</style>
