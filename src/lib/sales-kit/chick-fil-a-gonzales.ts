/** Sample store for Chick-fil-A target sales kit — Gonzales, LA (Hwy 30). */
export const CHICK_FIL_A_GONZALES = {
  restaurantName: "Chick-fil-A — Gonzales (Hwy 30)",
  restaurantAddress: "2119 W Highway 30, Gonzales, LA 70737",
  restaurantSlug: "cfa-gonzales-hwy30",
  /** Example corporate delivery in the Gonzales / Ascension market. */
  sampleOffice: {
    name: "Ascension Parish Government Complex",
    streetAddress: "828 S Irma Blvd.",
    cityStateZip: "Gonzales, LA 70737",
    deliveryInstructions:
      "Check in at main reception; labeled meals to break room, catering to conference wing.",
    contactName: "Jordan Ellis",
    contactPhone: "(225) 555-0142",
  },
} as const;
