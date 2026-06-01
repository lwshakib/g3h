import { NextRequest, NextResponse } from "next/server"

const getBackendBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured")
  }
  return baseUrl.replace(/\/+$/, "")
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  try {
    const { workflowId } = await params
    const token = request.nextUrl.searchParams.get("token")
    const targetNodeId = request.nextUrl.searchParams.get("targetNodeId")
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Missing token." },
        { status: 401 }
      )
    }

    const backendStreamUrl = new URL(
      `${getBackendBaseUrl()}/workflow/${workflowId}/execute/stream`
    )
    backendStreamUrl.searchParams.set("token", token)
    if (targetNodeId) {
      backendStreamUrl.searchParams.set("targetNodeId", targetNodeId)
    }
    const backendUrl = backendStreamUrl.toString()

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
      },
      cache: "no-store",
    })

    if (!response.ok || !response.body) {
      const fallback = await response.text()
      return new NextResponse(fallback || "Failed to open execution stream.", {
        status: response.status || 500,
      })
    }

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to proxy stream." },
      { status: 500 }
    )
  }
}
