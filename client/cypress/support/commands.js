// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/firestore";
import { attachCustomCommands } from "cypress-firebase";

const firebaseConfig = {
  apiKey: "AIzaSyA0jvNv65AL5O-IFu4og9ISNSy59VPp7u0",
  authDomain: "mpc-web-design-2023.firebaseapp.com",
  projectId: "mpc-web-design-2023",
  storageBucket: "mpc-web-design-2023.appspot.com",
  messagingSenderId: "176654305386",
  appId: "1:176654305386:web:6e7f639791f06c31bba213",
  measurementId: "G-HBR1SXXHT4",
  databaseURL: "https://mpc-web-design-2023-default-rtdb.asia-southeast1.firebasedatabase.app"
};

firebase.initializeApp(firebaseConfig);

attachCustomCommands({ Cypress, cy, firebase });
