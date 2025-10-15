import NextAuth from "next-auth";
import type { AuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { mapEmailToRole } from "@/lib/auth";
import { getUserByEmail } from "@/lib/services/users";
import { cookies } from "next/headers";

export const authOptions: AuthOptions = {
	providers: [
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
	],
	callbacks: {
    async jwt({ token, profile }) {
            const email = (profile as any)?.email || token.email;
            // Ưu tiên role do người dùng chọn nếu có
            const forced = (await cookies()).get("forced_role")?.value;
            const role = forced || mapEmailToRole(email);
            token.role = role;
            // Tra cứu active từ kho người dùng
            const user = email ? await getUserByEmail(email) : null;
            const isInternalDomain = !!email && (email.toLowerCase().endsWith("@fpt.edu.vn") || email.toLowerCase().endsWith("@fe.edu.vn"));
            token.active = user ? user.active : isInternalDomain;
            return token;
        },
        async session({ session, token }: any) {
            if (token) {
                session.user.id = token.sub;
                session.user.role = token.role;
                session.user.active = token.active;
            }
            return session;
        },
	},
    pages: {
        signIn: "/login",
    },
	secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
