import type { Request } from "express";

export function getParamString(req: Request, key: string): string {
    const val = req.params[key];
    if (typeof val !== "string") {
        throw new Error(`Invalid or missing parameter: ${key}`);
    }
    return val;
}
