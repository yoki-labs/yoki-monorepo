import type { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, data: { message: "You must provide a valid authentication token." } });

    try {
        /**
         * Verify that the token was signed with our secret.
         * If it wasn't then it'll throw and that means they're unauthed.
         */
        verify(token, process.env.TOKEN_SECRET);
        return next();
    } catch {
        return res.status(401).json({ success: false, data: { message: "There was an issue parsing the provided token." } });
    }
}
