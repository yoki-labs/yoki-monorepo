import { getProviders, signIn } from "next-auth/react";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import LandingPage from "../../components/landing/LandingPage";
import { Button, Stack, Typography } from "@mui/joy";
import { faGuilded } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SignIn({ providers }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return <LandingPage>
        <Stack direction="column" alignItems="center" className="w-full px-4 pt-40">
            <Typography level="h1" gutterBottom>To continue, we require you to sign in.</Typography>
            <Typography level="body-lg" sx={{ mb: 3 }}>This is a required step for pages like dashboard.</Typography>
            <Stack direction="column" alignItems="center">
                {Object.values(providers).map((provider) =>
                    <div key={provider.name}>
                        <Button size="lg" startDecorator={<FontAwesomeIcon icon={faGuilded} />} variant="soft" color="primary" onClick={() => signIn(provider.id)}>Sign in with {provider.name}</Button>
                    </div>
                )}
            </Stack>
        </Stack>
    </LandingPage>;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerSession(context.req, context.res, authOptions);

    // Already logged in
    if (session)
        return { redirect: { destination: "/" } };

    const providers = await getProviders();

    return { props: { providers: providers ?? [] } };
}