import { generateAuthExpressionForSubscriptions } from '../../resolvers/subscriptions';
import { AuthProvider, ConfiguredAuthProviders, RoleDefinition } from '../../utils';

const configFromPartial = (partialConfig: Partial<ConfiguredAuthProviders>): ConfiguredAuthProviders =>
  ({
    hasApiKey: false,
    hasUserPools: false,
    hasOIDC: false,
    hasIAM: false,
    hasLambda: false,
    hasAdminRolesEnabled: false,
    hasIdentityPoolId: true,
    ...partialConfig,
  } as unknown as ConfiguredAuthProviders);

const defaultRoleDefinitions: Record<AuthProvider, Array<RoleDefinition>> = {
  apiKey: [
    {
      provider: 'apiKey',
      strategy: 'public',
      static: true,
    },
  ],
  iam: [
    {
      provider: 'iam',
      strategy: 'public',
      static: true,
    },
    {
      provider: 'iam',
      strategy: 'private',
      static: true,
    },
  ],
  userPools: [
    {
      provider: 'userPools',
      strategy: 'owner',
      static: false,
      claim: 'username',
      entity: 'owner',
    },
    {
      provider: 'userPools',
      strategy: 'groups',
      static: false,
      claim: 'cognito:groups',
      entity: 'group',
    },
    {
      provider: 'userPools',
      strategy: 'groups',
      static: true,
      claim: 'cognito:groups',
      entity: 'Admin',
    },
  ],
  oidc: [
    {
      provider: 'oidc',
      strategy: 'owner',
      static: false,
      claim: 'custom:username',
      entity: 'owner',
    },
    {
      provider: 'oidc',
      strategy: 'groups',
      static: false,
      claim: 'custom:groups',
      entity: 'group',
    },
    {
      provider: 'oidc',
      strategy: 'groups',
      static: true,
      claim: 'custom:groups',
      entity: 'Admin',
    },
  ],
  function: [
    {
      provider: 'function',
      strategy: 'custom',
      static: false,
    },
  ],
};

describe('subscriptions', () => {
  describe('generateAuthExpressionForSubscriptions', () => {
    describe('apiKey', () => {
      it('renders for simple apiKey auth', () => {
        expect(
          generateAuthExpressionForSubscriptions(configFromPartial({ hasApiKey: true }), defaultRoleDefinitions.apiKey),
        ).toMatchSnapshot();
      });
    });

    describe('iam', () => {
      it('renders for simple iam auth', () => {
        expect(generateAuthExpressionForSubscriptions(configFromPartial({ hasIAM: true }), defaultRoleDefinitions.iam)).toMatchSnapshot();
      });

      it('renders for iam auth with no admin roles', () => {
        expect(
          generateAuthExpressionForSubscriptions(
            configFromPartial({
              hasIAM: true,
              hasAdminRolesEnabled: false,
            }),
            defaultRoleDefinitions.iam,
          ),
        ).toMatchSnapshot();
      });
    });

    describe('userPools', () => {
      it('renders for simple userPool auth', () => {
        expect(
          generateAuthExpressionForSubscriptions(configFromPartial({ hasUserPools: true }), defaultRoleDefinitions.userPools),
        ).toMatchSnapshot();
      });
    });

    describe('oidc', () => {
      it('renders for simple oidc auth', () => {
        expect(generateAuthExpressionForSubscriptions(configFromPartial({ hasOIDC: true }), defaultRoleDefinitions.oidc)).toMatchSnapshot();
      });
    });

    describe('lambda', () => {
      it('renders for simple lambda auth', () => {
        expect(
          generateAuthExpressionForSubscriptions(configFromPartial({ hasLambda: true }), defaultRoleDefinitions.function),
        ).toMatchSnapshot();
      });
    });
  });

  describe('multi-auth', () => {
    it('renders for apiKey + iam', () => {
      expect(
        generateAuthExpressionForSubscriptions(
          configFromPartial({
            hasApiKey: true,
            hasIAM: true,
          }),
          [...defaultRoleDefinitions.apiKey, ...defaultRoleDefinitions.iam],
        ),
      ).toMatchSnapshot();
    });

    it('renders for apiKey + iam + userPools', () => {
      expect(
        generateAuthExpressionForSubscriptions(
          configFromPartial({
            hasApiKey: true,
            hasIAM: true,
            hasUserPools: true,
          }),
          [...defaultRoleDefinitions.apiKey, ...defaultRoleDefinitions.iam, ...defaultRoleDefinitions.userPools],
        ),
      ).toMatchSnapshot();
    });

    it('renders for iam + userPools', () => {
      expect(
        generateAuthExpressionForSubscriptions(
          configFromPartial({
            hasIAM: true,
            hasUserPools: true,
          }),
          [...defaultRoleDefinitions.iam, ...defaultRoleDefinitions.userPools],
        ),
      ).toMatchSnapshot();
    });
  });
});
