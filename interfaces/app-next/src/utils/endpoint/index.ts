import { accountsEndpoint } from './accountEndpoints';
import { threadsEndpoint } from './threadEndpoints';
import { createEndpointsNodes } from '@/utils/createEndpointNode';
import { feedsEndpoint } from './feedsEndpoint';
import { usersEndpoint } from './usersEndpoint';
import { authEndpoint } from './authEndpoint';
import { creditsEndpoint } from './creditEndpoints';
import { savingsrateEndpoint } from './savingsrateEndpoints';
import { formuleEndpoint } from './formuleEndpoints';
import { actionsEndpoint } from './actionsEndpoints';
import { ordersEndpoint } from './orderEndpoints';
import { currenciesEndpoint } from './currenciesEndpoint';

export const endpoints = createEndpointsNodes({
  accounts: accountsEndpoint,
  actions: actionsEndpoint,
  threads: threadsEndpoint,
  feeds: feedsEndpoint,
  users: usersEndpoint,
  auth: authEndpoint,
  credits: creditsEndpoint,
  savingsRates: savingsrateEndpoint,
  formules: formuleEndpoint,
  orders: ordersEndpoint,
  currencies: currenciesEndpoint,
});
