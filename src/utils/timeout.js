export const delay = async ms =>
  // return await for better async stack trace support in case of errors.
  await new Promise(resolve => setTimeout(resolve, ms));
