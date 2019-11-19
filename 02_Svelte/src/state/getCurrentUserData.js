import { user } from './user.js';
import { urls } from '../routes/urls.js';

let token, id;

user.subscribe(u => {
  if (u.isLogged) {
    token = u.token;
    id = u.id;
  }
  console.log('subscribed:', u.isLogged, u.token, u.id);
});

async function fetchUserByID(pURL, pToken, pID) {
  const myHeaders = new Headers({
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + pToken
  });
  const resp = await fetch(pURL + '/' + pID, {
    headers: myHeaders
  });
  return await resp.json();
}

function userState() {
  return {
    getLoggedUserData: _ => {
      return fetchUserByID(urls.GetUserByPK, token, id);
    }
  };
}
export let loggedUserData = userState();
