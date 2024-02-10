import { ChannelIgnoreType, Severity } from "@prisma/client";
import { isHashId } from "@yokilabs/utils";
import { NextApiResponse } from "next";

import { channelExistsInServer } from "./route";

export const availableSeverityValues = Object.keys(Severity);
export const availableIgnoreTypeValues = Object.keys(ChannelIgnoreType);

export const getBodyErrorResponse = (res: NextApiResponse, name: string, type: string) => res.status(400).json({ error: true, message: `Invalid ${name}. Expected ${type}` });

type AllowedValues = "string" | "number" | "boolean" | "object";

// Can only be set; no default
export function isBodyPropertyTypeInvalid<T>(value: T, expectedType: AllowedValues) {
    const valueType = typeof value;

    return valueType !== "undefined" && valueType !== expectedType;
}

// Null is set back to default
export const isRemovableBodyPropertyTypeInvalid = <T>(value: T, expectedType: AllowedValues) => value !== null && isBodyPropertyTypeInvalid(value, expectedType);

export const isBodyEnumPropertyInvalid = <T extends string>(value: unknown, expectedValues: T[]) =>
    value !== null && typeof value !== "undefined" && !expectedValues.includes(value as T);

export const isBodyChannelPropertyValid = async <T>(channelId: T) =>
    typeof channelId === "undefined" || channelId === null || (typeof channelId === "string" && channelExistsInServer(channelId));

export const queryUserIsIncorrect = (userId: string | string[] | undefined) => userId && (typeof userId !== "string" || !isHashId(userId as string));

export const querySeverityIsIncorrect = (severity: string | string[] | undefined) =>
    severity && (typeof severity !== "string" || !availableSeverityValues.includes(severity as string));

export const queryChannelIgnoreTypeIsIncorrect = (ignoreType: string | string[] | undefined) =>
    ignoreType && (typeof ignoreType !== "string" || !availableIgnoreTypeValues.includes(ignoreType as string));
