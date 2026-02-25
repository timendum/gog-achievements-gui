export let verbose = false;

export function setVerbose(value: boolean): void {
  verbose = value;
}

export function logf(format: string, ...args: any[]): void {
  if (verbose) {
    const message = format.replace(/%[sd]/g, () => String(args.shift() ?? ''));
    console.log(`[LOG] ${message}`);
  }
}
