export type ServiceArea = {
  name: string;
  region: string;
  responseTime: string;
  postcodes: string[];
};

export const SERVICE_AREAS: ServiceArea[] = [
  {
    name: "Downtown Metro",
    region: "Central",
    responseTime: "Same day",
    postcodes: ["10001", "10003", "10011", "10013"],
  },
  {
    name: "Midtown & Riverside",
    region: "Central North",
    responseTime: "Same day",
    postcodes: ["10017", "10019", "10022", "10036"],
  },
  {
    name: "Greenfield Suburbs",
    region: "West",
    responseTime: "Within 24h",
    postcodes: ["07030", "07086", "07087", "07093"],
  },
  {
    name: "Hilltop Estates",
    region: "North",
    responseTime: "Within 24h",
    postcodes: ["10583", "10605", "10707"],
  },
  {
    name: "Coastal District",
    region: "East",
    responseTime: "Within 48h",
    postcodes: ["11201", "11215", "11231"],
  },
  {
    name: "Tech Park & Industrial",
    region: "South",
    responseTime: "Same day",
    postcodes: ["07302", "07304", "07310"],
  },
];
