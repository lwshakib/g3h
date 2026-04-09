"use server";

import prisma from "@/lib/prisma";
import { encryptCredential, decryptCredential } from "@/lib/crypto";
import { currentUser } from "@/actions/user";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { NodeType } from "@/generated/prisma/enums";
import { Prisma } from "@/generated/prisma/client";

const createCredentialSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  nodeType: z.nativeEnum(NodeType),
  apiKey: z.string().min(1, "API key is required"),
});

const updateCredentialSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters").optional(),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  apiKey: z.string().min(1, "API key is required").optional(),
});

export async function getCredentials(nodeType?: NodeType) {
  const user = await currentUser();
  if (!user) {
    return {
      success: false,
      error: "Unauthorized",
      credentials: [],
    };
  }

  try {
    const where: { userId: string; nodeType?: NodeType } = {
      userId: user.id,
    };

    if (nodeType) {
      where.nodeType = nodeType;
    }

    const credentials = await prisma.credential.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      credentials,
    };
  } catch (error) {
    console.error("Error fetching credentials:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch credentials",
      credentials: [],
    };
  }
}

export async function getCredentialById(credentialId: string, userId?: string) {
  // If userId is provided (e.g., from Inngest context), use it directly
  // Otherwise, get it from current user (for API routes)
  let userIdToUse: string;
  
  if (userId) {
    userIdToUse = userId;
  } else {
    const user = await currentUser();
    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
        credential: null,
      };
    }
    userIdToUse = user.id;
  }

  try {
    const credential = await prisma.credential.findFirst({
      where: {
        id: credentialId,
        userId: userIdToUse,
      },
    });

    if (!credential) {
      return {
        success: false,
        error: "Credential not found",
        credential: null,
      };
    }

    // Decrypt the API key before returning
    const decryptedCredential = {
      ...credential,
      apiKey: decryptCredential(credential.apiKey),
    };

    return {
      success: true,
      credential: decryptedCredential,
    };
  } catch (error) {
    console.error("Error fetching credential:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch credential",
      credential: null,
    };
  }
}

export async function createCredential(data: z.infer<typeof createCredentialSchema>) {
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "Unauthorized", credential: null };
  }

  try {
    const validatedData = createCredentialSchema.parse(data);

    // Check if name already exists for this user
    const existing = await prisma.credential.findUnique({
      where: {
        userId_name: {
          userId: user.id,
          name: validatedData.name,
        },
      },
    });

    if (existing) {
      return {
        success: false,
        error: "A credential with this name already exists",
        credential: null,
      };
    }

    // Encrypt the API key before storing in database
    const encryptedApiKey = encryptCredential(validatedData.apiKey);

    const credential = await prisma.credential.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        description: validatedData.description || null,
        nodeType: validatedData.nodeType,
        apiKey: encryptedApiKey,
      },
    });

    revalidatePath("/credentials");
    return { success: true, credential };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed",
        credential: null,
      };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        success: false,
        error: "A credential with this name already exists",
        credential: null,
      };
    }
    console.error("Error creating credential:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create credential",
      credential: null,
    };
  }
}

export async function updateCredential(
  credentialId: string,
  data: z.infer<typeof updateCredentialSchema>
) {
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "Unauthorized", credential: null };
  }

  try {
    const validatedData = updateCredentialSchema.parse(data);

    // Check if credential exists and belongs to user
    const existing = await prisma.credential.findFirst({
      where: {
        id: credentialId,
        userId: user.id,
      },
    });

    if (!existing) {
      return { success: false, error: "Credential not found", credential: null };
    }

    // If name is being updated, check if new name conflicts
    if (validatedData.name && validatedData.name !== existing.name) {
      const nameConflict = await prisma.credential.findUnique({
        where: {
          userId_name: {
            userId: user.id,
            name: validatedData.name,
          },
        },
      });

      if (nameConflict) {
        return {
          success: false,
          error: "A credential with this name already exists",
          credential: null,
        };
      }
    }

    // Encrypt the API key if it's being updated
    const updateData: { name?: string; description?: string; apiKey?: string; updatedAt: Date } = {
      ...validatedData,
      updatedAt: new Date(),
    };
    if (validatedData.apiKey) {
      updateData.apiKey = encryptCredential(validatedData.apiKey);
    }

    const credential = await prisma.credential.update({
      where: {
        id: credentialId,
      },
      data: updateData,
    });

    revalidatePath("/credentials");
    return { success: true, credential };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation failed",
        credential: null,
      };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { success: false, error: "Credential not found", credential: null };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        success: false,
        error: "A credential with this name already exists",
        credential: null,
      };
    }
    console.error("Error updating credential:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update credential",
      credential: null,
    };
  }
}

export async function deleteCredential(credentialId: string) {
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const credential = await prisma.credential.findFirst({
      where: {
        id: credentialId,
        userId: user.id,
      },
    });

    if (!credential) {
      return { success: false, error: "Credential not found" };
    }

    await prisma.credential.delete({
      where: {
        id: credentialId,
      },
    });

    revalidatePath("/credentials");
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { success: false, error: "Credential not found" };
    }
    console.error("Error deleting credential:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete credential",
    };
  }
}

