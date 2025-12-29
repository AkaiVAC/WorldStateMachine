import type { Relationship } from "../../world-state/relationship/relationship";

export const excelsiaRelationships: Relationship[] = [
	// Sunnaria Royal Family
	{ worldId: "excelsia", from: "30", type: "rules", to: "1" }, // Alaric rules Sunnaria
	{ worldId: "excelsia", from: "31", type: "spouse-of", to: "30" }, // Elara married to Alaric
	{ worldId: "excelsia", from: "32", type: "daughter-of", to: "30" }, // Aradia daughter of Alaric
	{ worldId: "excelsia", from: "32", type: "daughter-of", to: "31" }, // Aradia daughter of Elara
	{ worldId: "excelsia", from: "30", type: "member-of", to: "1" }, // Alaric member of Sunnaria
	{ worldId: "excelsia", from: "31", type: "member-of", to: "1" }, // Elara member of Sunnaria
	{ worldId: "excelsia", from: "32", type: "member-of", to: "1" }, // Aradia member of Sunnaria

	// Lunaria Royal Family (uid 2 = Lunaria kingdom)
	{ worldId: "excelsia", from: "43", type: "rules", to: "2" }, // Cedric rules Lunaria
	{ worldId: "excelsia", from: "44", type: "spouse-of", to: "43" }, // Emelda married to Cedric
	{ worldId: "excelsia", from: "45", type: "daughter-of", to: "43" }, // Isabella daughter of Cedric
	{ worldId: "excelsia", from: "45", type: "daughter-of", to: "44" }, // Isabella daughter of Emelda
	{ worldId: "excelsia", from: "43", type: "member-of", to: "2" },
	{ worldId: "excelsia", from: "44", type: "member-of", to: "2" },
	{ worldId: "excelsia", from: "45", type: "member-of", to: "2" },

	// Ilaria Royal Family (uid 3 = Ilaria kingdom)
	{ worldId: "excelsia", from: "46", type: "rules", to: "3" }, // Alerin rules Ilaria
	{ worldId: "excelsia", from: "47", type: "spouse-of", to: "46" }, // Seraphina married to Alerin
	{ worldId: "excelsia", from: "48", type: "daughter-of", to: "46" }, // Elestria daughter of Alerin
	{ worldId: "excelsia", from: "48", type: "daughter-of", to: "47" }, // Elestria daughter of Seraphina
	{ worldId: "excelsia", from: "46", type: "member-of", to: "3" },
	{ worldId: "excelsia", from: "47", type: "member-of", to: "3" },
	{ worldId: "excelsia", from: "48", type: "member-of", to: "3" },

	// Limaria Royal Family (uid 4 = Limaria kingdom)
	{ worldId: "excelsia", from: "36", type: "rules", to: "4" }, // Patrick rules Limaria
	{ worldId: "excelsia", from: "37", type: "spouse-of", to: "36" }, // Elizabeth married to Patrick
	{ worldId: "excelsia", from: "38", type: "daughter-of", to: "36" }, // Evelyne daughter of Patrick
	{ worldId: "excelsia", from: "38", type: "daughter-of", to: "37" }, // Evelyne daughter of Elizabeth
	{ worldId: "excelsia", from: "36", type: "member-of", to: "4" },
	{ worldId: "excelsia", from: "37", type: "member-of", to: "4" },
	{ worldId: "excelsia", from: "38", type: "member-of", to: "4" },

	// Lindward Royal Family (uid 5 = Lindward kingdom)
	{ worldId: "excelsia", from: "39", type: "rules", to: "5" }, // Michael rules Lindward
	{ worldId: "excelsia", from: "40", type: "daughter-of", to: "41" }, // Eleanor daughter of Edmund
	{ worldId: "excelsia", from: "40", type: "daughter-of", to: "42" }, // Eleanor daughter of Emily
	{ worldId: "excelsia", from: "39", type: "member-of", to: "5" },
	{ worldId: "excelsia", from: "40", type: "member-of", to: "5" },

	// Stuttgart Royal Family (uid 6 = Stuttgart kingdom)
	{ worldId: "excelsia", from: "49", type: "rules", to: "6" }, // Reinhardt rules Stuttgart
	{ worldId: "excelsia", from: "50", type: "spouse-of", to: "49" }, // Hildegard married to Reinhardt
	{ worldId: "excelsia", from: "49", type: "member-of", to: "6" },
	{ worldId: "excelsia", from: "50", type: "member-of", to: "6" },
	{ worldId: "excelsia", from: "51", type: "member-of", to: "6" }, // Emelda Voss member of Stuttgart

	// Kingdom borders (Sunnaria borders many kingdoms)
	{ worldId: "excelsia", from: "1", type: "borders", to: "2" }, // Sunnaria borders Lunaria
	{ worldId: "excelsia", from: "1", type: "borders", to: "3" }, // Sunnaria borders Ilaria
	{ worldId: "excelsia", from: "1", type: "borders", to: "4" }, // Sunnaria borders Limaria
	{ worldId: "excelsia", from: "1", type: "borders", to: "5" }, // Sunnaria borders Lindward
	{ worldId: "excelsia", from: "1", type: "borders", to: "6" }, // Sunnaria borders Stuttgart

	// Ria works for Elara
	{ worldId: "excelsia", from: "33", type: "works-for", to: "31" }, // Ria works for Elara
	{ worldId: "excelsia", from: "33", type: "member-of", to: "1" }, // Ria member of Sunnaria
];

export const excelsiaKingdoms = [
	"Sunnaria",
	"Lunaria",
	"Ilaria",
	"Limaria",
	"Lindward",
	"Stuttgart",
	"Aeldrin",
	"Ironforge",
	"Zyronia",
];

export const worldSummary = `The continent of Excelsia contains exactly these kingdoms: ${excelsiaKingdoms.join(", ")}. Do not invent or reference any other kingdoms.`;
