import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import AzureADProvider from "next-auth/providers/azure-ad";

// Extender los tipos de NextAuth
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    profile?: Record<string, unknown>;
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      city?: string;
      country?: string;
      state?: string;
      streetAddress?: string;
      family_name?: string;
      given_name?: string;
    }
  }
}

// Extender el tipo JWT
declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id?: string;
    email?: string;
    name?: string;
    city?: string;
    country?: string;
    state?: string;
    streetAddress?: string;
    family_name?: string;
    given_name?: string;
    profile?: Record<string, unknown>;
  }
}

// Extender el tipo de perfil para Azure B2C
interface AzureB2CProfile extends Record<string, unknown> {
  sub?: string;
  oid?: string;
  emails?: string[];
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  city?: string;
  country?: string;
  state?: string;
  streetAddress?: string;
}

// Configuración de Azure B2C
const AZURE_AD_B2C_TENANT_NAME = process.env.AZURE_AD_B2C_TENANT_NAME ?? "azurecnsum1";
const AZURE_AD_B2C_CLIENT_ID = process.env.AZURE_AD_B2C_CLIENT_ID ?? "";
const AZURE_AD_B2C_CLIENT_SECRET = process.env.AZURE_AD_B2C_CLIENT_SECRET ?? "";
const AZURE_AD_B2C_PRIMARY_USER_FLOW = process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW ?? "B2C_1_signupsignin";
const AZURE_AD_B2C_RESET_PASSWORD_FLOW = process.env.AZURE_AD_B2C_RESET_PASSWORD_FLOW ?? "B2C_1_passwordreset";

// URL directa para el flujo de restablecimiento de contraseña
const RESET_PASSWORD_URL = `https://${AZURE_AD_B2C_TENANT_NAME}.b2clogin.com/${AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com/${AZURE_AD_B2C_RESET_PASSWORD_FLOW}/oauth2/v2.0/authorize?client_id=${AZURE_AD_B2C_CLIENT_ID}&nonce=defaultNonce&redirect_uri=${encodeURIComponent(process.env.NEXTAUTH_URL ?? 'http://localhost:3000')}/api/auth/callback/azure-ad-reset&scope=openid&response_type=code&prompt=login`;

// Configuración de NextAuth
const authOptions: NextAuthOptions = {
  providers: [
    // Proveedor único para inicio de sesión y registro
    AzureADProvider({
      id: "azure-ad",
      name: "Azure AD B2C",
      clientId: AZURE_AD_B2C_CLIENT_ID,
      clientSecret: AZURE_AD_B2C_CLIENT_SECRET,
      tenantId: `${AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com`,
      wellKnown: `https://${AZURE_AD_B2C_TENANT_NAME}.b2clogin.com/${AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com/${AZURE_AD_B2C_PRIMARY_USER_FLOW}/v2.0/.well-known/openid-configuration`,
      authorization: {
        url: `https://${AZURE_AD_B2C_TENANT_NAME}.b2clogin.com/${AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com/oauth2/v2.0/authorize`,
        params: {
          p: AZURE_AD_B2C_PRIMARY_USER_FLOW,
          scope: "openid profile email",
          response_type: "code",
          response_mode: "query",
          ui_locales: "es",
          // Siempre forzar una nueva sesión para evitar inicios de sesión automáticos
          prompt: "login"
        }
      },
      idToken: true,
      checks: ["pkce", "state"],
      // Configuración para clientes públicos (SPA, aplicaciones móviles)
      client: {
        token_endpoint_auth_method: "none",
      },
      // Configuración para el token
      token: {
        url: `https://${AZURE_AD_B2C_TENANT_NAME}.b2clogin.com/${AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com/${AZURE_AD_B2C_PRIMARY_USER_FLOW}/oauth2/v2.0/token`,
      },
    }),
    // Proveedor para restablecimiento de contraseña - oculto en la página de inicio de sesión
    AzureADProvider({
      id: "azure-ad-reset",
      name: "Reset Password",
      clientId: AZURE_AD_B2C_CLIENT_ID,
      clientSecret: AZURE_AD_B2C_CLIENT_SECRET,
      tenantId: `${AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com`,
      wellKnown: `https://${AZURE_AD_B2C_TENANT_NAME}.b2clogin.com/${AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com/${AZURE_AD_B2C_RESET_PASSWORD_FLOW}/v2.0/.well-known/openid-configuration`,
      authorization: {
        url: RESET_PASSWORD_URL,
        params: {
          ui_locales: "es",
        }
      },
      idToken: true,
      checks: ["pkce", "state"],
      // Configuración para clientes públicos (SPA, aplicaciones móviles)
      client: {
        token_endpoint_auth_method: "none",
      },
      // Configuración para el token
      token: {
        url: `https://${AZURE_AD_B2C_TENANT_NAME}.b2clogin.com/${AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com/${AZURE_AD_B2C_RESET_PASSWORD_FLOW}/oauth2/v2.0/token`,
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.emails?.[0] ?? profile.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and user data to the token right after signin
      if (account && profile) {
        // Convertir el perfil a nuestro tipo personalizado
        const azureProfile = profile as unknown as AzureB2CProfile;
        
        // Guardar el token de acceso (usando id_token ya que es lo que proporciona Azure B2C)
        token.accessToken = account.id_token ?? account.access_token;
        token.id = azureProfile.sub ?? azureProfile.oid;
        
        // Guardar información adicional del perfil de Azure B2C
        if (azureProfile.emails && azureProfile.emails.length > 0) {
          token.email = azureProfile.emails[0];
        } else if (azureProfile.email) {
          token.email = azureProfile.email;
        }
        
        // Guardar datos adicionales del perfil
        token.name = azureProfile.name ?? azureProfile.given_name;
        token.city = azureProfile.city;
        token.country = azureProfile.country;
        token.state = azureProfile.state;
        token.streetAddress = azureProfile.streetAddress;
        token.family_name = azureProfile.family_name;
        token.given_name = azureProfile.given_name;
        
        // Guardar el perfil completo para acceso a todos los datos
        token.profile = azureProfile as unknown as Record<string, unknown>;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.accessToken = token.accessToken;
      
      // Asegurar que el objeto user existe
      if (!session.user) {
        session.user = {};
      }
      
      // Transferir datos del token a la sesión
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.city = token.city;
      session.user.country = token.country;
      session.user.state = token.state;
      session.user.streetAddress = token.streetAddress;
      session.user.family_name = token.family_name;
      session.user.given_name = token.given_name;
      
      // Añadir el perfil completo a la sesión
      session.profile = token.profile;
      
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Permite redirecciones a URLs internas
      if (url.startsWith(baseUrl)) return url;
      // Permite redirecciones a URLs relativas
      if (url.startsWith("/")) return new URL(url, baseUrl).toString();
      return baseUrl;
    },
    async signIn() {
      return true;
    },

  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET ?? "tu-secreto-secreto-que-debe-cambiarse",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export { authOptions };
