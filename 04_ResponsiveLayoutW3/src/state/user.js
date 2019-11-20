import { writable } from 'svelte/store';

let userstate = { isLogged: false, token: '', id: -1 };

function createUser() {
  const { subscribe, update } = writable(userstate);
  return {
    subscribe,
    updateLoggedUserState: (pNewIsLogged, pNewToken, pNewID) => {
      update(user => {
        user.isLogged = pNewIsLogged;
        user.token = pNewToken;
        user.id = pNewID;
        return user;
      });
    }
  };
}
export let user = createUser();
