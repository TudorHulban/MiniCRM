import { user } from '../state/user.js';
import Landing from '../views/landing.svelte';
import Login from '../views/login.svelte';
import Admin from '../views/authorized.svelte';
import AdminLayout from '../layouts/admin_layout.svelte';
import PublicLayout from '../layouts/public_layout.svelte';

let auth;
user.subscribe(u => {
  auth = u.isLogged;
});

function userIsAdmin() {
  return auth;
}

const routes = [
  {
    name: '/',
    component: Landing,
    layout: PublicLayout
  },
  {
    name: 'login',
    component: Login
  },
  {
    name: 'admin',
    component: Admin,
    layout: AdminLayout,
    onlyIf: {
      guard: userIsAdmin,
      redirect: '/login'
    }
  }
];
export { routes };
