import { TimeStep } from "./form";

export const ascendingTimeUnits = ["sec", "min", "h", "d"];
export const unitToMs: Record<TimeStep, number> = {
    [TimeStep.Seconds]: 1000,
    [TimeStep.Minutes]: 60 * 1000,
    [TimeStep.Hours]: 60 * 60 * 1000,
    [TimeStep.Days]: 24 * 60 * 60 * 1000,
};
export const maxValues: Record<TimeStep, number> = {
    [TimeStep.Seconds]: 60,
    [TimeStep.Minutes]: 60,
    [TimeStep.Hours]: 24,
    [TimeStep.Days]: 15,
};

export function insertTime(time: number, timeStepValue: number, timeStep: TimeStep) {
    const stepInMs = unitToMs[timeStep];
    const newStepValue = timeStepValue * stepInMs;
    const stepAheadInMs = unitToMs[(timeStep + 1) as TimeStep];

    // Replaces hours, days or minutes (depending on what step was set to be replaced)
    return timeStep === TimeStep.Days ? (time % stepInMs) + newStepValue : (time % stepInMs) + newStepValue + Math.floor(time / stepAheadInMs) * stepAheadInMs;
}
