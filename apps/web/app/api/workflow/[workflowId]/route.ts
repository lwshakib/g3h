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
    const backendUrl = `${getBackendBaseUrl()}/workflow/${workflowId}`
    const authHeader = request.headers.get("authorization") || ""

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
      cache: "no-store",
    })

    const payload = await response.text()
    return new NextResponse(payload, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Proxy request failed." },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  try {
    const { workflowId } = await params
    const backendUrl = `${getBackendBaseUrl()}/workflow/${workflowId}`
    const authHeader = request.headers.get("authorization") || ""
    const body = await request.text()

    const response = await fetch(backendUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body,
    })

    const payload = await response.text()
    return new NextResponse(payload, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Proxy request failed." },
      { status: 500 }
    )
  }
}
