<template>
  <v-app theme="light">
    <v-app-bar color="primary" elevation="2">
      <v-container class="d-flex align-center px-3 px-sm-4">
        <v-toolbar-title class="font-weight-bold">Yowaki - créations diverses</v-toolbar-title>
        <v-spacer />
        <v-btn to="/" variant="text" prepend-icon="mdi-home">Accueil</v-btn>
      </v-container>
    </v-app-bar>

    <v-main>
      <v-container class="py-6 py-sm-10 px-3 px-sm-6">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>
