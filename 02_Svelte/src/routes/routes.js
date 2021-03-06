import { user } from '../state/user.js';
import Login from '../views/login.svelte';
import Admin from '../views/authorized.svelte';
import AdminLayout from '../layouts/admin_layout.svelte';

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
    component: Admin,
    layout: AdminLayout,
    onlyIf: {
      guard: userIsAdmin,
      redirect: '/login'
    }
  }
];
export { routes };
