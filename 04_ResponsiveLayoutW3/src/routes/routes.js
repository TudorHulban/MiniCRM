import { user } from '../state/user.js';
import Login from '../components/login.svelte';
import ResponsiveLayout from '../layouts/responsivew3.svelte';

let auth;
user.subscribe(u => {
  auth = u.isLogged;
});

function userIsAdmin() {
  return auth;
}

const routes = [
  {
    name: 'login',
    component: Login
  },
  {
    name: '/',
    layout: ResponsiveLayout,
    onlyIf: {
      guard: userIsAdmin,
      redirect: '/login'
    }
  }
];
export { routes };
