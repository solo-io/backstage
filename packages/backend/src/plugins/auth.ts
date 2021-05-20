/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  createGoogleProvider,
  createRouter,
} from '@backstage/plugin-auth-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin({
  logger,
  database,
  config,
  discovery,
}: PluginEnvironment): Promise<Router> {
  return await createRouter({
    logger,
    config,
    database,
    discovery,
    providerFactories: {
      google: createGoogleProvider({
        signIn: {
          // resolver: 'email',
          resolver: async ({ profile: { email } }, ctx) => {
            if (!email) {
              throw new Error('No email associated with user account');
            }
            const id = email.split('@')[0];
            const token = await ctx.tokenIssuer.issueToken({
              claims: { sub: id, ent: [`User:default/${id}`] },
            });
            return { id, token };
          },
        },
      }),
    },
  });
}
