import countryData from "./countries.json";

export type Country = { code: string; name: string; flag: string };
export const countries = countryData as Country[];
