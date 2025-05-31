// Importaciones necesarias para extender los tipos
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extiende la interfaz Session para incluir el accessToken
   */
  interface Session {
    accessToken?: string;
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  /**
   * Extiende la interfaz JWT para incluir el accessToken
   */
  interface JWT {
    accessToken?: string;
  }
}
