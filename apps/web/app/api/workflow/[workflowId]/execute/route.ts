import { NextRequest, NextResponse } from "next/server"

const getBackendBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured")
  }
  return baseUrl.replace(/\/+$/, "")
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  try {
    const { workflowId } = await params
    const authorization = request.headers.get("authorization")
    const requestBody = await request.json().catch(() => ({}))
    const targetNodeId =
      typeof requestBody?.targetNodeId === "string"
        ? requestBody.targetNodeId
        : undefined
    if (!authorization) {
      return NextResponse.json(
        { success: false, message: "Missing authorization header." },
        { status: 401 }
      )
    }

    const backendUrl = `${getBackendBaseUrl()}/workflow/${workflowId}/execute`
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        targetNodeId,
      }),
      cache: "no-store",
    })

    const body = await response.text()
    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/json",
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to proxy workflow execution.",
      },
      { status: 500 }
    )
  }
}
