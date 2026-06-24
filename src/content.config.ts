import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const gallery = defineCollection({
	loader: glob({ pattern: "**/*.yaml", base: "./src/content/gallery" }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		media: z.string(),
		type: z.enum(["image", "video"]),
		poster: z.string().optional(),
		alt: z.string(),
	}),
});

export const collections = { gallery };
