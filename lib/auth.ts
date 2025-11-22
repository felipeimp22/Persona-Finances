import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Hardcoded users with passwords from environment variables
const users = [
  {
    id: "1",
    username: "felipe",
    name: "Felipe",
    password: process.env.FELIPE_PASSWORD,
  },
  {
    id: "2",
    username: "carol",
    name: "Carol",
    password: process.env.CAROL_PASSWORD,
  },
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const { username, password } = credentials as {
          username: string;
          password: string;
        };

        // Find user by username
        const user = users.find((u) => u.username === username);

        if (!user) {
          throw new Error("Invalid username or password");
        }

        // Check password
        if (user.password !== password) {
          throw new Error("Invalid username or password");
        }

        // Return user object (without password)
        return {
          id: user.id,
          name: user.name,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add username to token
      if (user) {
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      // Add username to session
      if (session.user) {
        (session.user as any).username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
