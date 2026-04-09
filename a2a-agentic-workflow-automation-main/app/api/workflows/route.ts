import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getWorkflows, createWorkflow } from "@/actions/workflow";
import {
  getWorkflowsSchema,
  createWorkflowSchema,
} from "@/validators/workflow";

// GET /api/workflows - List workflows with pagination and search
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = {
      page: searchParams.get("page") || "1",
      search: searchParams.get("search") || "",
    };

    // Validate query parameters
    const validatedParams = getWorkflowsSchema.parse(params);

    // Call action
    const result = await getWorkflows(
      validatedParams.page,
      validatedParams.search
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch workflows" },
        { status: result.error === "Unauthorized" ? 401 : 500 }
      );
    }

    return NextResponse.json({
      workflows: result.workflows,
      pagination: {
        page: validatedParams.page,
        totalPages: result.totalPages,
        total: result.total,
        itemsPerPage: 10,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid query parameters" },
        { status: 400 }
      );
    }
    console.error("Error fetching workflows:", error);
    return NextResponse.json(
      { error: "Failed to fetch workflows" },
      { status: 500 }
    );
  }
}

// POST /api/workflows - Create a new workflow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = createWorkflowSchema.parse(body);

    // Call action
    const result = await createWorkflow(validatedData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create workflow" },
        { status: result.error === "Unauthorized" ? 401 : 400 }
      );
    }

    return NextResponse.json({ workflow: result.workflow }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    console.error("Error creating workflow:", error);
    return NextResponse.json(
      { error: "Failed to create workflow" },
      { status: 500 }
    );
  }
}
