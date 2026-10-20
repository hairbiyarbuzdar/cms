"use server";

import { revalidatePath } from "next/cache";
import { AuthorizationError, requireRole } from "@/lib/authorization";
import {
  patientSchema,
  type PatientFieldErrors,
} from "@/lib/patient-validation";
import { prisma } from "@/lib/prisma";
import { insertPatient } from "@/services/patient-query";
import { Prisma } from "@/generated/prisma/client";

export type RegistrationResult =
  | { success: true; patientNumber: number }
  | { success: false; error: string; fields?: PatientFieldErrors };

export async function registerPatient(
  input: unknown,
): Promise<RegistrationResult> {
  try {
    await requireRole("USER");
    const parsed = patientSchema.safeParse(input);
    if (!parsed.success)
      return {
        success: false,
        error: "Please check the highlighted fields.",
        fields: parsed.error.flatten().fieldErrors,
      };
    const patient = await insertPatient(prisma, parsed.data);
    revalidatePath("/patients");
    revalidatePath("/dashboard");
    return { success: true, patientNumber: patient.patientNumber };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: "This identifier is already assigned to a patient.",
        fields: {
          externalId: ["Use a different identifier or leave this field blank."],
        },
      };
    }
    return {
      success: false,
      error:
        error instanceof AuthorizationError
          ? "Your session has expired or access was denied. Sign in again to continue."
          : "We couldn’t register the patient. Please try again.",
    };
  }
}

export async function setPatientStatus(
  id: string,
  isActive: boolean,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireRole("USER");
    if (
      typeof id !== "string" ||
      !id ||
      id.length > 100 ||
      typeof isActive !== "boolean"
    )
      return { success: false, error: "Invalid patient or status." };
    await prisma.patient.update({ where: { id }, data: { isActive } });
    revalidatePath("/patients");
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Couldn’t update this patient. Check your session and try again.",
    };
  }
}
