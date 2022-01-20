export function log(message?: any, ...optionalParams: any[]) {
  console.log(`[${ new Date().toJSON() }]`, message, ...optionalParams);
}

export function error(message?: any, ...optionalParams: any[]) {
  log('[error]', message, ...optionalParams);
}
