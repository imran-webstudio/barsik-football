import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { positions } from "~/lib/tournament";
import { registrations } from "~/server/db/schema";
import { adminProcedure, createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const mobileSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ""))
  .refine((value) => /^(\+?88)?01\d{9}$/.test(value), {
    message: "Enter a valid mobile number, for example 01712345678.",
  })
  .transform((value) => value.replace(/^\+?88/, ""));

const optionalText = z
  .string()
  .trim()
  .max(64)
  .optional()
  .transform((value) => (value == null || value.length === 0 ? null : value));

export const registrationRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().trim().min(2).max(120),
        father: z.string().trim().min(2).max(120),
        age: z.number().int().min(10).max(60),
        village: z.string().trim().min(2).max(160),
        location: z.string().trim().min(2).max(160),
        mobile: mobileSchema,
        position: z.enum(positions),
        payer: optionalText,
        trxid: optionalText,
        website: z.string().max(200).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.website) return { ok: true as const };

      await ctx.db.insert(registrations).values({
        name: input.name,
        father: input.father,
        age: input.age,
        village: input.village,
        location: input.location,
        mobile: input.mobile,
        position: input.position,
        payer: input.payer,
        trxid: input.trxid,
      });

      return { ok: true as const };
    }),

  list: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.query.registrations.findMany({
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      limit: 500,
    });
  }),

  remove: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const deleted = await ctx.db
        .delete(registrations)
        .where(eq(registrations.id, input.id))
        .returning({ id: registrations.id });

      if (deleted.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "That registration is already gone.",
        });
      }

      return { ok: true as const };
    }),
});
