import { NextRequest, NextResponse } from "next/server";
import { getExecutionById } from "@/actions/execution";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getExecutionById(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "Unauthorized" ? 401 : 404 }
      );
    }

    return NextResponse.json({ execution: result.execution });
  } catch (error) {
    console.error("Error fetching execution:", error);
    return NextResponse.json(
      { error: "Failed to fetch execution" },
      { status: 500 }
    );
  }
}

