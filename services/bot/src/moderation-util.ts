export function getInfractionsFrom(args: Record<string, any>): [string | null, number] {
    const reasonArg = args.reason as string | null;
    const infractionPointsArg = Number(args.infractionPoints);

    const reason = Number.isNaN(infractionPointsArg) && args.infractionPoints ? `${args.infractionPoints as string} ${reasonArg ?? ""}`.trimEnd() : reasonArg;
    const infractionPoints = infractionPointsArg || 10;

    return [reason, infractionPoints];
}
