import { getInitColorSchemeScript } from "@mui/joy/styles";
import Document, { Head, Html, Main, NextScript } from "next/document";

export default class DocLayout extends Document {
    render() {
        return (
            <Html>
                <Head />
                <body>
                    {getInitColorSchemeScript({ defaultMode: "dark" })}
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
