import { NextRequest, NextResponse } from "next/server";
import { getCredentials } from "@/actions/credential";
import { NodeType } from "@/generated/prisma/enums";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nodeType = searchParams.get("nodeType") as NodeType | null;

    const result = await getCredentials(nodeType || undefined);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch credentials" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      credentials: result.credentials.map((cred) => ({
        id: cred.id,
        name: cred.name,
        description: cred.description,
        nodeType: cred.nodeType,
      })),
    });
  } catch (error) {
    console.error("Error fetching credentials:", error);
    return NextResponse.json(
      { error: "Failed to fetch credentials" },
      { status: 500 }
    );
  }
}

